# 🗄️ Guia Completo: Banco de Dados Supabase - ZapCorte

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Configuração Inicial](#configuração-inicial)
3. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
4. [Autenticação e Segurança](#autenticação-e-segurança)
5. [Migrações](#migrações)
6. [Ambiente Local vs Produção](#ambiente-local-vs-produção)
7. [Políticas RLS](#políticas-rls)
8. [Triggers e Funções](#triggers-e-funções)
9. [Integração com Vercel](#integração-com-vercel)
10. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

O ZapCorte utiliza **Supabase** como banco de dados PostgreSQL gerenciado, com autenticação integrada, Row Level Security (RLS) e APIs REST/Realtime automáticas.

### Características Principais

- **PostgreSQL 15+** com extensões habilitadas
- **Autenticação JWT** integrada
- **Row Level Security (RLS)** para segurança em nível de linha
- **APIs REST e Realtime** geradas automaticamente
- **Storage** para arquivos (logos, banners, fotos)
- **Edge Functions** para lógica serverless

---

## ⚙️ Configuração Inicial

### 1. Variáveis de Ambiente

O sistema utiliza diferentes variáveis para frontend e backend:

#### Frontend (Vite/React)
```env
# .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publica
```

#### Backend (Vercel Serverless Functions)
```env
# Vercel Environment Variables
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
```


### 2. Cliente Supabase

#### Frontend (`src/lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce' // Mais seguro que implicit
  }
})
```

#### Backend (Vercel Functions)
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

**⚠️ IMPORTANTE:**
- **ANON_KEY**: Usada no frontend, limitada por RLS
- **SERVICE_ROLE_KEY**: Usada no backend, **bypassa RLS** - nunca expor no frontend!

---

## 🗂️ Estrutura do Banco de Dados

### Tabelas Principais

#### 1. `auth.users` (Gerenciada pelo Supabase)
```sql
-- Tabela nativa do Supabase Auth
-- Não modificar diretamente
id UUID PRIMARY KEY
email TEXT UNIQUE
encrypted_password TEXT
email_confirmed_at TIMESTAMPTZ
created_at TIMESTAMPTZ
```

#### 2. `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  plan_type TEXT DEFAULT 'freemium' CHECK (plan_type IN ('freemium', 'starter', 'pro')),
  subscription_status TEXT DEFAULT 'inactive',
  last_payment_date TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relacionamento:** 1 user → 1 profile


#### 3. `barbershops`
```sql
CREATE TABLE barbershops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  banner_url TEXT,
  subtitle TEXT,
  instagram_url TEXT,
  whatsapp_number TEXT,
  maps_url TEXT,
  opening_hours JSONB, -- { "0": { "start": "09:00", "end": "18:00" }, ... }
  lunch_break JSONB,   -- { "start": "12:00", "end": "13:00", "enabled": true }
  is_active BOOLEAN DEFAULT true,
  plan_type TEXT DEFAULT 'freemium',
  monthly_appointment_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_barbershops_user_id ON barbershops(user_id);
CREATE INDEX idx_barbershops_slug ON barbershops(slug);
CREATE INDEX idx_barbershops_plan_type ON barbershops(plan_type);
```

**Relacionamento:** 1 user → 1 barbershop

**Campos JSONB:**
- `opening_hours`: Horários de funcionamento por dia da semana (0=Domingo, 6=Sábado)
- `lunch_break`: Intervalo de almoço aplicado a todos os dias

#### 4. `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- URL amigável GLOBAL
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL, -- minutos
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_barbershop ON services(barbershop_id);
CREATE INDEX idx_services_slug ON services(slug);
```

**Relacionamento:** 1 barbershop → N services

**⚠️ IMPORTANTE:** O `slug` é **ÚNICO GLOBALMENTE** para SEO e URLs amigáveis.


#### 5. `barbers` (Plano PRO)
```sql
CREATE TABLE barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  bio TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX idx_barbers_active ON barbers(is_active);
```

**Relacionamento:** 1 barbershop → N barbers (apenas Plano PRO)

#### 6. `barber_availability` (Plano PRO)
```sql
CREATE TABLE barber_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barber_availability_barber ON barber_availability(barber_id);
CREATE INDEX idx_barber_availability_day ON barber_availability(day_of_week);
```

**Relacionamento:** 1 barber → N availability (um por dia da semana)

**⚠️ IMPORTANTE:** No Plano PRO, os horários dos barbeiros **sobrescrevem** os horários da barbearia.

#### 7. `barber_services` (Plano PRO)
```sql
CREATE TABLE barber_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  custom_duration INTEGER, -- Duração customizada (opcional)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barber_id, service_id)
);

CREATE INDEX idx_barber_services_barber ON barber_services(barber_id);
CREATE INDEX idx_barber_services_service ON barber_services(service_id);
```

**Relacionamento:** N barbers ↔ N services (muitos para muitos)


#### 8. `customers`
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barbershop_id, phone)
);

CREATE INDEX idx_customers_barbershop ON customers(barbershop_id);
CREATE INDEX idx_customers_phone ON customers(phone);
```

**Relacionamento:** 1 barbershop → N customers

#### 9. `appointments`
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL, -- Plano PRO
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  recurring_appointment_id UUID REFERENCES recurring_appointments(id) ON DELETE SET NULL,
  is_fit_in BOOLEAN DEFAULT false, -- Modo encaixe
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX idx_appointments_barber ON appointments(barber_id);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**Relacionamento:** 
- 1 barbershop → N appointments
- 1 service → N appointments
- 1 barber → N appointments (Plano PRO)


#### 10. `recurring_appointments`
```sql
CREATE TABLE recurring_appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL, -- Plano PRO
  frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
  time_of_day TIME NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  last_generated_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_recurring_barbershop ON recurring_appointments(barbershop_id);
CREATE INDEX idx_recurring_active ON recurring_appointments(is_active);
CREATE INDEX idx_recurring_day ON recurring_appointments(day_of_week);
```

**Relacionamento:** 1 recurring → N appointments (gerados automaticamente)

#### 11. `notifications`
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('new_appointment', 'cancelled', 'confirmed', 'reminder')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_barbershop ON notifications(barbershop_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```


#### 12. `payment_history`
```sql
CREATE TABLE payment_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method TEXT,
  plan_type TEXT,
  cakto_data JSONB, -- Dados completos do webhook Cakto
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_user ON payment_history(user_id);
CREATE INDEX idx_payment_status ON payment_history(status);
CREATE INDEX idx_payment_created ON payment_history(created_at DESC);
```

#### 13. `webhook_logs`
```sql
CREATE TABLE webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT CHECK (status IN ('success', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_event ON webhook_logs(event_type);
CREATE INDEX idx_webhook_status ON webhook_logs(status);
CREATE INDEX idx_webhook_created ON webhook_logs(created_at DESC);
```

---

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação

```
1. Usuário se registra → auth.users criado
2. Trigger automático → profile criado
3. Trigger automático → barbershop criado (com slug único)
4. Login → JWT token gerado
5. Requests → Token validado + RLS aplicado
```

### Configuração de Email

No painel do Supabase (**Authentication → Email Templates**):

#### Confirmação de Email
```html
<h2>Confirme seu email</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token={{ .Token }}">Confirmar Email</a></p>
```

#### Redefinição de Senha
```html
<h2>Redefinir sua senha</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token={{ .Token }}&type=recovery">Redefinir Senha</a></p>
```

### Site URL Configuration

**Authentication → URL Configuration:**
- **Site URL:** `https://seu-dominio.com` (produção) ou `http://localhost:5173` (dev)
- **Redirect URLs:**
  - `https://seu-dominio.com/auth/confirm`
  - `https://seu-dominio.com/auth/reset-password`
  - `http://localhost:5173/auth/confirm`
  - `http://localhost:5173/auth/reset-password`


---

## 🛡️ Políticas RLS (Row Level Security)

### O que é RLS?

Row Level Security permite controlar quem pode acessar quais linhas em uma tabela, baseado no usuário autenticado.

### Exemplo: Tabela `barbershops`

```sql
-- Habilitar RLS
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário vê apenas sua barbearia
CREATE POLICY "Usuário vê sua barbearia"
  ON barbershops FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Usuário atualiza apenas sua barbearia
CREATE POLICY "Usuário atualiza sua barbearia"
  ON barbershops FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Qualquer um pode ver barbearias ativas (página pública)
CREATE POLICY "Público vê barbearias ativas"
  ON barbershops FOR SELECT
  USING (is_active = true);
```

### Exemplo: Tabela `appointments`

```sql
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Barbeiro vê agendamentos da sua barbearia
CREATE POLICY "Barbeiro vê seus agendamentos"
  ON appointments FOR SELECT
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

-- Policy: Barbeiro gerencia agendamentos da sua barbearia
CREATE POLICY "Barbeiro gerencia agendamentos"
  ON appointments FOR ALL
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

-- Policy: Público pode criar agendamentos (página de booking)
CREATE POLICY "Público cria agendamentos"
  ON appointments FOR INSERT
  WITH CHECK (true);
```

### Funções Úteis

- `auth.uid()`: Retorna o UUID do usuário autenticado
- `auth.jwt()`: Retorna o JWT completo
- `auth.email()`: Retorna o email do usuário


---

## ⚡ Triggers e Funções

### 1. Trigger: Criar Profile Automaticamente

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $
BEGIN
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 2. Trigger: Criar Barbershop Automaticamente

```sql
CREATE OR REPLACE FUNCTION handle_new_profile()
RETURNS TRIGGER AS $
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Gerar slug base do email
  base_slug := LOWER(REGEXP_REPLACE(
    SPLIT_PART(NEW.email, '@', 1),
    '[^a-z0-9]+', '-', 'g'
  ));
  
  final_slug := base_slug;
  
  -- Garantir slug único
  WHILE EXISTS (SELECT 1 FROM barbershops WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  -- Criar barbearia
  INSERT INTO barbershops (
    user_id,
    name,
    slug,
    plan_type,
    is_active
  ) VALUES (
    NEW.user_id,
    COALESCE(NEW.full_name, 'Minha Barbearia'),
    final_slug,
    'freemium',
    true
  );
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_profile();
```

### 3. Trigger: Atualizar `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Aplicar em várias tabelas
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_barbershops_updated_at
  BEFORE UPDATE ON barbershops
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```


### 4. Trigger: Criar Notificações Automaticamente

```sql
CREATE OR REPLACE FUNCTION create_appointment_notification()
RETURNS TRIGGER AS $
DECLARE
  notification_type TEXT;
  notification_title TEXT;
  notification_message TEXT;
  service_name TEXT;
BEGIN
  -- Buscar nome do serviço
  SELECT name INTO service_name FROM services WHERE id = NEW.service_id;
  
  -- Determinar tipo de notificação
  IF TG_OP = 'INSERT' THEN
    notification_type := 'new_appointment';
    notification_title := 'Novo Agendamento';
    notification_message := NEW.customer_name || ' agendou ' || service_name;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    IF NEW.status = 'cancelled' THEN
      notification_type := 'cancelled';
      notification_title := 'Agendamento Cancelado';
      notification_message := NEW.customer_name || ' cancelou o agendamento';
    ELSIF NEW.status = 'confirmed' THEN
      notification_type := 'confirmed';
      notification_title := 'Agendamento Confirmado';
      notification_message := NEW.customer_name || ' confirmou o agendamento';
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  
  -- Inserir notificação
  INSERT INTO notifications (
    barbershop_id, type, title, message, appointment_id
  ) VALUES (
    NEW.barbershop_id, notification_type, notification_title, 
    notification_message, NEW.id
  );
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER appointment_notification_trigger
  AFTER INSERT OR UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_notification();
```

---

## 🔄 Migrações

### Estrutura de Migrações

```
migrations/
├── create_recurring_appointments.sql
├── create_barbeiros_table.sql
├── create_notifications_table.sql
├── add_service_slug.sql
├── add_whatsapp_settings.sql
└── migration_webpush_nativo.sql
```

### Como Aplicar Migrações

#### Método 1: SQL Editor (Supabase Dashboard)

1. Acesse **SQL Editor** no painel do Supabase
2. Cole o conteúdo da migração
3. Clique em **Run**
4. Verifique se não há erros

#### Método 2: Supabase CLI (Recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-projeto-ref

# Criar nova migração
supabase migration new nome_da_migracao

# Aplicar migrações
supabase db push

# Ver status
supabase migration list
```


### Exemplo de Migração Completa

```sql
-- migrations/add_barber_system.sql

-- 1. Criar tabela de barbeiros
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  bio TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX idx_barbers_active ON barbers(is_active);

-- 3. Habilitar RLS
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas
CREATE POLICY "Barbeiro vê barbeiros da sua barbearia"
  ON barbers FOR SELECT
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Barbeiro gerencia barbeiros"
  ON barbers FOR ALL
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

-- 5. Criar trigger
CREATE TRIGGER update_barbers_updated_at
  BEFORE UPDATE ON barbers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. Comentários
COMMENT ON TABLE barbers IS 'Barbeiros/profissionais do Plano PRO';
COMMENT ON COLUMN barbers.specialties IS 'Array de especialidades do barbeiro';
```

---

## 🌍 Ambiente Local vs Produção

### Desenvolvimento Local

#### Opção 1: Usar Projeto Supabase de Desenvolvimento

```env
# .env.local
VITE_SUPABASE_URL=https://dev-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=dev-anon-key
```

**Vantagens:**
- Dados isolados de produção
- Pode testar migrações sem risco
- Gratuito (até limites do plano free)

**Desvantagens:**
- Precisa sincronizar schema manualmente
- Dados não são os mesmos de produção


#### Opção 2: Supabase Local (Docker)

```bash
# Instalar CLI
npm install -g supabase

# Iniciar Supabase local
supabase init
supabase start

# URLs geradas:
# API URL: http://localhost:54321
# Studio URL: http://localhost:54323
# Anon key: eyJhbGc...
```

```env
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Vantagens:**
- Totalmente offline
- Controle total do ambiente
- Migrações versionadas automaticamente

**Desvantagens:**
- Requer Docker instalado
- Mais complexo de configurar

#### Opção 3: Usar Produção com Cuidado

```env
# .env.local
VITE_SUPABASE_URL=https://prod-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=prod-anon-key
```

**⚠️ CUIDADO:**
- Dados reais de produção
- Risco de corromper dados
- **NÃO RECOMENDADO** para desenvolvimento ativo

### Produção (Vercel)

#### Configurar Variáveis de Ambiente

No painel da Vercel (**Settings → Environment Variables**):

```
# Frontend
VITE_SUPABASE_URL = https://prod-projeto.supabase.co
VITE_SUPABASE_ANON_KEY = prod-anon-key

# Backend (Serverless Functions)
SUPABASE_URL = https://prod-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY = prod-service-role-key

# Outros
CAKTO_WEBHOOK_SECRET = seu-secret
CAKTO_PRODUCT_ID_STARTER = 3th8tvh
CAKTO_PRODUCT_ID_PRO = 9jk3ref
```

**⚠️ IMPORTANTE:**
- Marcar `SUPABASE_SERVICE_ROLE_KEY` como **sensível**
- Nunca commitar chaves no Git
- Usar diferentes projetos Supabase para dev/prod


---

## 🔗 Integração com Vercel

### Serverless Functions

As funções serverless da Vercel podem acessar o Supabase usando a **SERVICE_ROLE_KEY**.

#### Exemplo: Webhook Cakto (`api/webhooks/cakto.js`)

```javascript
import { createClient } from '@supabase/supabase-js'

// Cliente com SERVICE_ROLE_KEY (bypassa RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const webhookData = req.body
    
    // Validar secret
    if (webhookData.secret !== process.env.CAKTO_WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Invalid secret' })
    }

    // Processar pagamento
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', webhookData.data.customer.email)
      .single()

    if (!profile) {
      throw new Error('User not found')
    }

    // Atualizar plano
    await supabase
      .from('profiles')
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
        last_payment_date: new Date().toISOString()
      })
      .eq('id', profile.id)

    // Atualizar barbershop
    await supabase
      .from('barbershops')
      .update({ plan_type: 'pro' })
      .eq('user_id', profile.user_id)

    // Registrar no histórico
    await supabase
      .from('payment_history')
      .insert({
        user_id: profile.id,
        transaction_id: webhookData.data.id,
        amount: webhookData.data.amount,
        status: 'completed',
        payment_method: webhookData.data.paymentMethod,
        plan_type: 'pro',
        cakto_data: webhookData.data
      })

    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return res.status(500).json({ error: error.message })
  }
}
```


### Configuração do Vercel

#### `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

## 📊 Queries Otimizadas

### 1. Buscar Horários Disponíveis

```typescript
export async function getAvailableTimeSlots(
  barbershopId: string,
  serviceId: string,
  date: string
): Promise<{ time: string; available: boolean }[]> {
  // 1. Buscar horários de funcionamento
  const { data: barbershop } = await supabase
    .from('barbershops')
    .select('opening_hours, lunch_break')
    .eq('id', barbershopId)
    .single()

  // 2. Buscar duração do serviço
  const { data: service } = await supabase
    .from('services')
    .select('duration')
    .eq('id', serviceId)
    .single()

  // 3. Buscar agendamentos do dia
  const { data: appointments } = await supabase
    .from('appointments')
    .select('scheduled_at, services(duration)')
    .eq('barbershop_id', barbershopId)
    .gte('scheduled_at', `${date}T00:00:00`)
    .lte('scheduled_at', `${date}T23:59:59`)
    .neq('status', 'cancelled')

  // 4. Calcular slots disponíveis
  // ... lógica de cálculo
  
  return slots
}
```

### 2. Buscar Agendamentos com Joins

```typescript
const { data: appointments } = await supabase
  .from('appointments')
  .select(`
    *,
    services (
      name,
      price,
      duration
    ),
    barbers (
      name,
      photo_url
    )
  `)
  .eq('barbershop_id', barbershopId)
  .order('scheduled_at')
```


### 3. Buscar com Filtros Complexos

```typescript
const { data } = await supabase
  .from('appointments')
  .select('*')
  .eq('barbershop_id', barbershopId)
  .in('status', ['pending', 'confirmed'])
  .gte('scheduled_at', startDate)
  .lte('scheduled_at', endDate)
  .order('scheduled_at', { ascending: true })
  .limit(50)
```

### 4. Upsert (Insert ou Update)

```typescript
const { data, error } = await supabase
  .from('customers')
  .upsert(
    {
      barbershop_id: barbershopId,
      phone: customerPhone,
      name: customerName
    },
    {
      onConflict: 'barbershop_id,phone',
      ignoreDuplicates: false
    }
  )
  .select()
  .single()
```

### 5. Transações com RPC

```sql
-- Criar função no Supabase
CREATE OR REPLACE FUNCTION create_appointment_with_customer(
  p_barbershop_id UUID,
  p_service_id UUID,
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_scheduled_at TIMESTAMPTZ
)
RETURNS UUID AS $
DECLARE
  v_customer_id UUID;
  v_appointment_id UUID;
BEGIN
  -- Criar ou buscar cliente
  INSERT INTO customers (barbershop_id, name, phone)
  VALUES (p_barbershop_id, p_customer_name, p_customer_phone)
  ON CONFLICT (barbershop_id, phone) 
  DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_customer_id;
  
  -- Criar agendamento
  INSERT INTO appointments (
    barbershop_id, service_id, customer_name, 
    customer_phone, scheduled_at
  )
  VALUES (
    p_barbershop_id, p_service_id, p_customer_name,
    p_customer_phone, p_scheduled_at
  )
  RETURNING id INTO v_appointment_id;
  
  RETURN v_appointment_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
```

```typescript
// Chamar do frontend
const { data, error } = await supabase.rpc(
  'create_appointment_with_customer',
  {
    p_barbershop_id: barbershopId,
    p_service_id: serviceId,
    p_customer_name: customerName,
    p_customer_phone: customerPhone,
    p_scheduled_at: scheduledAt
  }
)
```


---

## 🎯 Boas Práticas

### 1. Segurança

#### ✅ FAZER

- Sempre usar RLS em tabelas com dados sensíveis
- Usar `SECURITY DEFINER` em funções que precisam de privilégios elevados
- Validar dados no backend (Vercel Functions) antes de inserir
- Usar `SERVICE_ROLE_KEY` apenas no backend
- Nunca expor `SERVICE_ROLE_KEY` no frontend
- Validar tokens JWT em webhooks

#### ❌ NÃO FAZER

- Desabilitar RLS em produção
- Usar `SERVICE_ROLE_KEY` no frontend
- Confiar apenas em validação do frontend
- Commitar chaves no Git
- Usar mesma chave para dev e prod

### 2. Performance

#### Índices

```sql
-- Criar índices para queries frequentes
CREATE INDEX idx_appointments_barbershop_date 
  ON appointments(barbershop_id, scheduled_at);

CREATE INDEX idx_appointments_status_date 
  ON appointments(status, scheduled_at) 
  WHERE status IN ('pending', 'confirmed');
```

#### Paginação

```typescript
const PAGE_SIZE = 20

const { data, error, count } = await supabase
  .from('appointments')
  .select('*', { count: 'exact' })
  .eq('barbershop_id', barbershopId)
  .order('scheduled_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
```

#### Caching

```typescript
// Usar React Query para cache automático
import { useQuery } from '@tanstack/react-query'

const { data: barbershop } = useQuery({
  queryKey: ['barbershop', slug],
  queryFn: () => getBarbershopBySlug(slug),
  staleTime: 5 * 60 * 1000, // 5 minutos
  cacheTime: 10 * 60 * 1000 // 10 minutos
})
```

### 3. Migrações

#### ✅ FAZER

- Versionar migrações com timestamps
- Testar em ambiente de desenvolvimento primeiro
- Fazer backup antes de aplicar em produção
- Usar transações quando possível
- Documentar mudanças no schema

#### ❌ NÃO FAZER

- Modificar migrações já aplicadas
- Deletar colunas sem verificar dependências
- Aplicar migrações diretamente em produção sem testar


### 4. Backup e Recuperação

#### Backup Automático (Supabase)

- Supabase faz backup diário automaticamente (planos pagos)
- Backups mantidos por 7 dias (Pro) ou 30 dias (Team/Enterprise)
- Acesse em **Database → Backups**

#### Backup Manual

```bash
# Usando pg_dump via Supabase CLI
supabase db dump -f backup.sql

# Restaurar
supabase db reset
psql -h db.xxx.supabase.co -U postgres -d postgres -f backup.sql
```

#### Backup de Dados Específicos

```sql
-- Exportar dados de uma tabela
COPY (SELECT * FROM appointments WHERE created_at >= '2024-01-01') 
TO '/tmp/appointments_backup.csv' CSV HEADER;
```

### 5. Monitoramento

#### Logs do Supabase

- **Database → Logs**: Ver queries lentas
- **API → Logs**: Ver requisições da API
- **Auth → Logs**: Ver tentativas de login

#### Métricas Importantes

```sql
-- Queries lentas (> 1 segundo)
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE mean_time > 1000
ORDER BY mean_time DESC
LIMIT 10;

-- Tamanho das tabelas
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
  AND indexname NOT LIKE '%_pkey';
```


---

## 🚀 Checklist de Deploy

### Antes do Deploy

- [ ] Todas as migrações aplicadas em produção
- [ ] RLS habilitado em todas as tabelas sensíveis
- [ ] Políticas RLS testadas
- [ ] Triggers funcionando corretamente
- [ ] Índices criados para queries frequentes
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Site URL configurado no Supabase
- [ ] Templates de email configurados
- [ ] Backup do banco de dados realizado

### Após o Deploy

- [ ] Testar autenticação (login/registro)
- [ ] Testar confirmação de email
- [ ] Testar redefinição de senha
- [ ] Testar criação de agendamentos
- [ ] Testar webhook de pagamento
- [ ] Verificar logs de erro
- [ ] Monitorar performance das queries
- [ ] Verificar notificações push

---

## 📚 Recursos Adicionais

### Documentação Oficial

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase CLI](https://supabase.com/docs/guides/cli)

### Ferramentas Úteis

- **Supabase Studio**: Interface visual para gerenciar banco de dados
- **pgAdmin**: Cliente PostgreSQL desktop
- **DBeaver**: Cliente SQL universal
- **Postico**: Cliente PostgreSQL para macOS

### Comandos Úteis

```bash
# Supabase CLI
supabase init                    # Inicializar projeto
supabase start                   # Iniciar local
supabase stop                    # Parar local
supabase db reset                # Resetar banco local
supabase db push                 # Aplicar migrações
supabase db pull                 # Baixar schema remoto
supabase migration new <name>    # Criar nova migração
supabase gen types typescript    # Gerar tipos TypeScript

# PostgreSQL
\dt                              # Listar tabelas
\d+ table_name                   # Descrever tabela
\di                              # Listar índices
\df                              # Listar funções
```


---

## 🔧 Troubleshooting

### Problema: RLS bloqueando queries

**Sintoma:** Queries retornam vazio mesmo com dados no banco

**Solução:**
```sql
-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Ver políticas da tabela
SELECT * FROM pg_policies WHERE tablename = 'sua_tabela';

-- Testar query como usuário específico
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-uuid-aqui';
SELECT * FROM sua_tabela;
```

### Problema: Trigger não está executando

**Sintoma:** Dados não são criados automaticamente

**Solução:**
```sql
-- Verificar se trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'nome_do_trigger';

-- Ver função do trigger
\df+ nome_da_funcao

-- Testar função manualmente
SELECT nome_da_funcao();

-- Ver logs de erro
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction (aborted)';
```

### Problema: Query lenta

**Sintoma:** Requisições demoram muito

**Solução:**
```sql
-- Analisar query
EXPLAIN ANALYZE
SELECT * FROM appointments 
WHERE barbershop_id = 'uuid' 
  AND scheduled_at >= NOW();

-- Verificar índices
SELECT * FROM pg_indexes WHERE tablename = 'appointments';

-- Criar índice se necessário
CREATE INDEX idx_appointments_barbershop_date 
  ON appointments(barbershop_id, scheduled_at);
```

### Problema: Erro de autenticação

**Sintoma:** "Invalid JWT" ou "User not found"

**Solução:**
```typescript
// Verificar se token está válido
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Forçar refresh do token
const { data: { session } } = await supabase.auth.refreshSession()

// Verificar se usuário existe
const { data: { user } } = await supabase.auth.getUser()
console.log('User:', user)
```


### Problema: Webhook não está funcionando

**Sintoma:** Pagamentos não atualizam plano

**Solução:**
```javascript
// Verificar logs do webhook
const { data: logs } = await supabase
  .from('webhook_logs')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10)

// Testar webhook localmente com ngrok
// 1. Instalar ngrok: npm install -g ngrok
// 2. Expor porta local: ngrok http 3000
// 3. Configurar URL no Cakto: https://xxx.ngrok.io/api/webhooks/cakto

// Validar secret
console.log('Expected:', process.env.CAKTO_WEBHOOK_SECRET)
console.log('Received:', req.body.secret)
```

---

## 📊 Diagrama de Relacionamentos

```
auth.users (Supabase Auth)
    ↓ (1:1)
profiles
    ↓ (1:1)
barbershops ──────┐
    ↓ (1:N)       │
services          │
    ↓ (1:N)       │
appointments ←────┘
    ↑ (N:1)
recurring_appointments

barbershops (Plano PRO)
    ↓ (1:N)
barbers
    ↓ (1:N)
barber_availability
    ↓ (N:M)
barber_services ← services

barbershops
    ↓ (1:N)
customers
    ↓ (1:N)
recurring_appointments

barbershops
    ↓ (1:N)
notifications

profiles
    ↓ (1:N)
payment_history
```

---

## 🎓 Exemplo Completo: Criar Nova Feature

### Cenário: Adicionar Sistema de Avaliações

#### 1. Criar Migração

```sql
-- migrations/add_reviews_system.sql

-- Tabela de avaliações
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_reviews_barbershop ON reviews(barbershop_id);
CREATE INDEX idx_reviews_approved ON reviews(is_approved);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Público pode ver avaliações aprovadas
CREATE POLICY "Público vê avaliações aprovadas"
  ON reviews FOR SELECT
  USING (is_approved = true);

-- Barbeiro vê todas as avaliações da sua barbearia
CREATE POLICY "Barbeiro vê suas avaliações"
  ON reviews FOR SELECT
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

-- Barbeiro pode aprovar/reprovar avaliações
CREATE POLICY "Barbeiro gerencia avaliações"
  ON reviews FOR UPDATE
  USING (
    barbershop_id IN (
      SELECT id FROM barbershops WHERE user_id = auth.uid()
    )
  );

-- Qualquer um pode criar avaliação (será moderada)
CREATE POLICY "Público cria avaliações"
  ON reviews FOR INSERT
  WITH CHECK (true);
```


#### 2. Adicionar Tipos TypeScript

```typescript
// src/lib/supabase.ts

export interface Review {
  id: string
  barbershop_id: string
  appointment_id: string
  customer_name: string
  rating: number
  comment?: string
  is_approved: boolean
  created_at: string
}
```

#### 3. Criar Queries

```typescript
// src/lib/supabase-queries.ts

export async function getBarbershopReviews(barbershopId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('barbershop_id', barbershopId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Review[]
}

export async function createReview(review: Omit<Review, 'id' | 'created_at' | 'is_approved'>) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review])
    .select()
    .single()

  if (error) throw error
  return data as Review
}

export async function approveReview(reviewId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data as Review
}
```

#### 4. Criar Componente React

```typescript
// src/components/ReviewsList.tsx

import { useQuery } from '@tanstack/react-query'
import { getBarbershopReviews } from '@/lib/supabase-queries'

export function ReviewsList({ barbershopId }: { barbershopId: string }) {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', barbershopId],
    queryFn: () => getBarbershopReviews(barbershopId)
  })

  if (isLoading) return <div>Carregando...</div>

  return (
    <div className="space-y-4">
      {reviews?.map(review => (
        <div key={review.id} className="border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{review.customer_name}</span>
            <span className="text-yellow-500">
              {'⭐'.repeat(review.rating)}
            </span>
          </div>
          {review.comment && (
            <p className="mt-2 text-gray-600">{review.comment}</p>
          )}
          <span className="text-sm text-gray-400">
            {new Date(review.created_at).toLocaleDateString()}
          </span>
        </div>
      ))}
    </div>
  )
}
```

#### 5. Testar

```typescript
// Criar avaliação de teste
const review = await createReview({
  barbershop_id: 'uuid-da-barbearia',
  appointment_id: 'uuid-do-agendamento',
  customer_name: 'João Silva',
  rating: 5,
  comment: 'Excelente atendimento!'
})

// Aprovar avaliação (como barbeiro)
await approveReview(review.id)

// Buscar avaliações
const reviews = await getBarbershopReviews('uuid-da-barbearia')
console.log(reviews)
```

---

## ✅ Conclusão

Este guia cobre todos os aspectos essenciais do banco de dados Supabase no ZapCorte:

- ✅ Estrutura completa das tabelas
- ✅ Configuração de autenticação
- ✅ Políticas RLS para segurança
- ✅ Triggers e funções automáticas
- ✅ Integração com Vercel
- ✅ Diferenças entre local e produção
- ✅ Boas práticas e otimizações
- ✅ Troubleshooting comum
- ✅ Exemplo completo de nova feature

Use este documento como referência para criar novas aplicações ou adicionar features ao ZapCorte!

---

**Última atualização:** Novembro 2024  
**Versão:** 1.0  
**Autor:** ZapCorte Team
