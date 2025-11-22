# 🔧 Correção Completa: Supabase RLS e Integração Vercel

## 🎯 Problema Identificado

Após análise do sistema ZapCorte e comparação com nosso projeto, identificamos que faltam:

1. **Políticas RLS (Row Level Security)** - Dados não aparecem porque RLS está bloqueando
2. **Triggers automáticos** - Perfis não são criados automaticamente
3. **Índices de performance** - Queries lentas
4. **Configuração adequada das serverless functions** - Service role key não está sendo usada corretamente

---

## 📋 Checklist de Correção

- [ ] Habilitar RLS em todas as tabelas
- [ ] Criar políticas RLS adequadas
- [ ] Criar triggers automáticos
- [ ] Adicionar índices de performance
- [ ] Atualizar cliente Supabase nas serverless functions
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Testar autenticação e queries

---

## 🗄️ PARTE 1: Configuração do Banco de Dados

### 1.1 - Habilitar RLS e Criar Políticas

Execute este SQL no **SQL Editor** do Supabase:

```sql
-- ============================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE excecoes_disponibilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_ficha ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_realizadas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 2: POLÍTICAS PARA users_profile
-- ============================================

-- Admin vê todos os perfis
CREATE POLICY "Admin vê todos os perfis"
  ON users_profile FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Usuário vê seu próprio perfil
CREATE POLICY "Usuário vê seu perfil"
  ON users_profile FOR SELECT
  USING (auth_uid = auth.uid());

-- Admin atualiza qualquer perfil
CREATE POLICY "Admin atualiza perfis"
  ON users_profile FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Usuário atualiza seu próprio perfil
CREATE POLICY "Usuário atualiza seu perfil"
  ON users_profile FOR UPDATE
  USING (auth_uid = auth.uid());

-- Permitir inserção de novos perfis (para registro)
CREATE POLICY "Permitir criação de perfis"
  ON users_profile FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PARTE 3: POLÍTICAS PARA alunos
-- ============================================

-- Admin vê todos os alunos
CREATE POLICY "Admin vê todos os alunos"
  ON alunos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê apenas seu próprio registro
CREATE POLICY "Aluno vê seu registro"
  ON alunos FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM users_profile WHERE auth_uid = auth.uid()
    )
  );

-- Admin gerencia alunos
CREATE POLICY "Admin gerencia alunos"
  ON alunos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- ============================================
-- PARTE 4: POLÍTICAS PARA blocos_horarios
-- ============================================

-- Admin gerencia blocos de horários
CREATE POLICY "Admin gerencia blocos"
  ON blocos_horarios FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos podem ver blocos ativos
CREATE POLICY "Alunos veem blocos ativos"
  ON blocos_horarios FOR SELECT
  USING (ativo = 'true');

-- ============================================
-- PARTE 5: POLÍTICAS PARA agendamentos
-- ============================================

-- Admin vê todos os agendamentos
CREATE POLICY "Admin vê agendamentos"
  ON agendamentos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê seus agendamentos
CREATE POLICY "Aluno vê seus agendamentos"
  ON agendamentos FOR SELECT
  USING (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- Admin gerencia agendamentos
CREATE POLICY "Admin gerencia agendamentos"
  ON agendamentos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno pode criar agendamentos
CREATE POLICY "Aluno cria agendamentos"
  ON agendamentos FOR INSERT
  WITH CHECK (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- ============================================
-- PARTE 6: POLÍTICAS PARA fichas_treino
-- ============================================

-- Admin gerencia fichas
CREATE POLICY "Admin gerencia fichas"
  ON fichas_treino FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem fichas ativas
CREATE POLICY "Alunos veem fichas ativas"
  ON fichas_treino FOR SELECT
  USING (ativo = 'true');

-- ============================================
-- PARTE 7: POLÍTICAS PARA exercicios_ficha
-- ============================================

-- Admin gerencia exercícios
CREATE POLICY "Admin gerencia exercícios"
  ON exercicios_ficha FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem exercícios de fichas ativas
CREATE POLICY "Alunos veem exercícios"
  ON exercicios_ficha FOR SELECT
  USING (
    ficha_id IN (
      SELECT id FROM fichas_treino WHERE ativo = 'true'
    )
  );

-- ============================================
-- PARTE 8: POLÍTICAS PARA fichas_alunos
-- ============================================

-- Admin gerencia atribuições
CREATE POLICY "Admin gerencia atribuições"
  ON fichas_alunos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê suas fichas atribuídas
CREATE POLICY "Aluno vê suas fichas"
  ON fichas_alunos FOR SELECT
  USING (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- ============================================
-- PARTE 9: POLÍTICAS PARA treinos_realizados
-- ============================================

-- Admin vê todos os treinos
CREATE POLICY "Admin vê treinos realizados"
  ON treinos_realizados FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê seus treinos
CREATE POLICY "Aluno vê seus treinos"
  ON treinos_realizados FOR SELECT
  USING (
    ficha_aluno_id IN (
      SELECT id FROM fichas_alunos WHERE aluno_id IN (
        SELECT id FROM alunos WHERE user_profile_id IN (
          SELECT id FROM users_profile WHERE auth_uid = auth.uid()
        )
      )
    )
  );

-- Aluno registra seus treinos
CREATE POLICY "Aluno registra treinos"
  ON treinos_realizados FOR INSERT
  WITH CHECK (
    ficha_aluno_id IN (
      SELECT id FROM fichas_alunos WHERE aluno_id IN (
        SELECT id FROM alunos WHERE user_profile_id IN (
          SELECT id FROM users_profile WHERE auth_uid = auth.uid()
        )
      )
    )
  );

-- ============================================
-- PARTE 10: POLÍTICAS PARA series_realizadas
-- ============================================

-- Admin vê todas as séries
CREATE POLICY "Admin vê séries"
  ON series_realizadas FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê suas séries
CREATE POLICY "Aluno vê suas séries"
  ON series_realizadas FOR SELECT
  USING (
    treino_realizado_id IN (
      SELECT id FROM treinos_realizados WHERE ficha_aluno_id IN (
        SELECT id FROM fichas_alunos WHERE aluno_id IN (
          SELECT id FROM alunos WHERE user_profile_id IN (
            SELECT id FROM users_profile WHERE auth_uid = auth.uid()
          )
        )
      )
    )
  );

-- Aluno registra suas séries
CREATE POLICY "Aluno registra séries"
  ON series_realizadas FOR INSERT
  WITH CHECK (
    treino_realizado_id IN (
      SELECT id FROM treinos_realizados WHERE ficha_aluno_id IN (
        SELECT id FROM fichas_alunos WHERE aluno_id IN (
          SELECT id FROM alunos WHERE user_profile_id IN (
            SELECT id FROM users_profile WHERE auth_uid = auth.uid()
          )
        )
      )
    )
  );

-- ============================================
-- PARTE 11: POLÍTICAS PARA excecoes_disponibilidade
-- ============================================

-- Admin gerencia exceções
CREATE POLICY "Admin gerencia exceções"
  ON excecoes_disponibilidade FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem exceções ativas
CREATE POLICY "Alunos veem exceções"
  ON excecoes_disponibilidade FOR SELECT
  USING (ativo = 'true');
```

### 1.2 - Criar Triggers Automáticos

```sql
-- ============================================
-- TRIGGERS AUTOMÁTICOS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON alunos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocos_horarios_updated_at
  BEFORE UPDATE ON blocos_horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excecoes_updated_at
  BEFORE UPDATE ON excecoes_disponibilidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_treino_updated_at
  BEFORE UPDATE ON fichas_treino
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercicios_ficha_updated_at
  BEFORE UPDATE ON exercicios_ficha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_alunos_updated_at
  BEFORE UPDATE ON fichas_alunos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_profile (auth_uid, email, nome, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'aluno')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 1.3 - Criar Índices de Performance

```sql
-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

-- users_profile
CREATE INDEX IF NOT EXISTS idx_users_profile_auth_uid ON users_profile(auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_tipo ON users_profile(tipo);

-- alunos
CREATE INDEX IF NOT EXISTS idx_alunos_user_profile_id ON alunos(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);

-- blocos_horarios
CREATE INDEX IF NOT EXISTS idx_blocos_dia_semana ON blocos_horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_blocos_ativo ON blocos_horarios(ativo);

-- agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_bloco ON agendamentos(bloco_horario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno_data ON agendamentos(aluno_id, data_agendamento);

-- fichas_treino
CREATE INDEX IF NOT EXISTS idx_fichas_ativo ON fichas_treino(ativo);
CREATE INDEX IF NOT EXISTS idx_fichas_nivel ON fichas_treino(nivel);

-- exercicios_ficha
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_id ON exercicios_ficha(ficha_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_ordem ON exercicios_ficha(ficha_id, ordem);
CREATE INDEX IF NOT EXISTS idx_exercicios_video ON exercicios_ficha(video_id);

-- fichas_alunos
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_ficha ON fichas_alunos(ficha_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_aluno ON fichas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_status ON fichas_alunos(status);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_datas ON fichas_alunos(data_inicio, data_fim);

-- treinos_realizados
CREATE INDEX IF NOT EXISTS idx_treinos_ficha_aluno ON treinos_realizados(ficha_aluno_id);
CREATE INDEX IF NOT EXISTS idx_treinos_exercicio ON treinos_realizados(exercicio_id);
CREATE INDEX IF NOT EXISTS idx_treinos_data ON treinos_realizados(data_realizacao);

-- series_realizadas
CREATE INDEX IF NOT EXISTS idx_series_treino ON series_realizadas(treino_realizado_id);

-- excecoes_disponibilidade
CREATE INDEX IF NOT EXISTS idx_excecoes_datas ON excecoes_disponibilidade(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_excecoes_ativo ON excecoes_disponibilidade(ativo);
```

---

## 🔧 PARTE 2: Atualizar Serverless Functions

### 2.1 - Criar Helper para Supabase (Backend)

Crie o arquivo `api/_lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para serverless functions
// Usa SERVICE_ROLE_KEY que bypassa RLS
export function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Cliente Supabase para operações com RLS
// Usa ANON_KEY e respeita políticas RLS
export function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase credentials');
  }

  return createClient(supabaseUrl, supabaseKey);
}
```

### 2.2 - Atualizar Rota de Fichas de Treino

Atualize `api/fichas-treino/index.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();

    // GET - Listar todas as fichas
    if (req.method === 'GET') {
      const { data: fichas, error } = await supabase
        .from('fichas_treino')
        .select(`
          *,
          exercicios:exercicios_ficha(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching fichas:', error);
        throw error;
      }
      
      return res.status(200).json(fichas || []);
    }

    // POST - Criar nova ficha
    if (req.method === 'POST') {
      const { exercicios, ...fichaData } = req.body;
      
      // Criar ficha
      const { data: novaFicha, error: fichaError } = await supabase
        .from('fichas_treino')
        .insert([fichaData])
        .select()
        .single();
      
      if (fichaError) {
        console.error('Error creating ficha:', fichaError);
        throw fichaError;
      }
      
      // Criar exercícios se fornecidos
      let exerciciosCriados = [];
      if (exercicios && exercicios.length > 0) {
        const exerciciosComFichaId = exercicios.map((ex: any, index: number) => ({
          ...ex,
          ficha_id: novaFicha.id,
          ordem: ex.ordem || index + 1
        }));
        
        const { data: exData, error: exError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId)
          .select();
        
        if (exError) {
          console.error('Error creating exercicios:', exError);
          throw exError;
        }
        exerciciosCriados = exData || [];
      }
      
      return res.status(201).json({ ...novaFicha, exercicios: exerciciosCriados });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in fichas-treino API:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null
    });
  }
}
```

---

## ⚙️ PARTE 3: Configurar Variáveis de Ambiente no Vercel

### 3.1 - Variáveis Necessárias

No painel da Vercel (**Settings → Environment Variables**), adicione:

```
# Frontend (Build Time)
VITE_SUPABASE_URL = https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend (Runtime - Serverless Functions)
SUPABASE_URL = https://cbdonvzifbkayrvnlskp.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (SERVICE ROLE KEY)
```

**⚠️ IMPORTANTE:**
- Marque `SUPABASE_SERVICE_ROLE_KEY` como **sensível**
- Aplique para **Production**, **Preview** e **Development**
- Após adicionar, faça um novo deploy

### 3.2 - Verificar Configuração

Crie um endpoint de teste `api/test-supabase.ts`:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from './_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseAdmin();
    
    // Testar conexão
    const { data, error } = await supabase
      .from('users_profile')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return res.status(200).json({
      success: true,
      message: 'Supabase connection OK',
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message,
      env: {
        hasUrl: !!process.env.SUPABASE_URL,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.VITE_SUPABASE_ANON_KEY
      }
    });
  }
}
```

Acesse: `https://seu-dominio.vercel.app/api/test-supabase`

---

## 🧪 PARTE 4: Testar a Integração

### 4.1 - Testar Autenticação

```typescript
// No console do navegador
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'sua-senha'
});

console.log('Auth result:', { data, error });
```

### 4.2 - Testar Queries

```typescript
// Buscar perfil do usuário
const { data: profile } = await supabase
  .from('users_profile')
  .select('*')
  .eq('auth_uid', (await supabase.auth.getUser()).data.user?.id)
  .single();

console.log('Profile:', profile);

// Buscar fichas de treino
const { data: fichas } = await supabase
  .from('fichas_treino')
  .select('*');

console.log('Fichas:', fichas);
```

### 4.3 - Testar API Serverless

```bash
# Testar endpoint de fichas
curl https://seu-dominio.vercel.app/api/fichas-treino

# Testar endpoint de teste
curl https://seu-dominio.vercel.app/api/test-supabase
```

---

## 🔍 PARTE 5: Troubleshooting

### Problema: "Row Level Security policy violation"

**Causa:** RLS está bloqueando a query

**Solução:**
1. Verifique se o usuário está autenticado
2. Verifique se as políticas RLS estão corretas
3. Use SERVICE_ROLE_KEY nas serverless functions para bypassar RLS

### Problema: "Missing Supabase credentials"

**Causa:** Variáveis de ambiente não configuradas

**Solução:**
1. Verifique variáveis no Vercel
2. Faça redeploy após adicionar variáveis
3. Verifique se está usando os nomes corretos

### Problema: Dados não aparecem no frontend

**Causa:** RLS bloqueando ou usuário não autenticado

**Solução:**
```typescript
// Verificar autenticação
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user);

// Verificar se query está funcionando
const { data, error } = await supabase
  .from('sua_tabela')
  .select('*');
console.log('Data:', data, 'Error:', error);
```

### Problema: Updates não salvam

**Causa:** Política RLS de UPDATE não permite

**Solução:**
1. Verifique políticas de UPDATE
2. Certifique-se que o usuário tem permissão
3. Use SERVICE_ROLE_KEY no backend para operações admin

---

## ✅ Checklist Final

- [ ] SQL de RLS executado no Supabase
- [ ] Triggers criados
- [ ] Índices criados
- [ ] Helper `api/_lib/supabase.ts` criado
- [ ] Rotas serverless atualizadas
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Deploy realizado
- [ ] Teste de autenticação OK
- [ ] Teste de queries OK
- [ ] Teste de API serverless OK
- [ ] Dados aparecem no painel admin
- [ ] Updates funcionando

---

## 📚 Próximos Passos

1. Aplicar mesma estrutura para outras rotas da API
2. Adicionar logs de erro detalhados
3. Implementar cache com React Query
4. Adicionar testes automatizados
5. Monitorar performance das queries

---

**Última atualização:** Novembro 2024  
**Status:** Pronto para aplicação
