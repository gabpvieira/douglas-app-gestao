# Nova Arquitetura de Autenticação

## Mudança Implementada

Migração de autenticação mista (localStorage para alunos + Supabase Auth para admin) para **Supabase Auth unificado** para todos os usuários.

## Arquitetura Anterior ❌

**Admin:**
- Supabase Auth completo
- Sessão gerenciada pelo Supabase

**Aluno:**
- Login simples com email/senha
- Senha em texto plano na tabela `alunos`
- Dados salvos no localStorage
- `auth_uid` mock (`mock_${timestamp}`)

**Problemas:**
- Senhas em texto plano (inseguro)
- Lógica duplicada de autenticação
- Complexidade no código
- Sem recursos do Supabase Auth (reset senha, 2FA, etc.)

## Arquitetura Nova ✅

**Todos os Usuários (Admin + Aluno):**
- Supabase Auth unificado
- Senhas hasheadas automaticamente
- Sessão gerenciada pelo Supabase
- `auth_uid` real do Supabase Auth
- Sem localStorage

## Fluxo de Cadastro de Aluno

### 1. Admin cadastra aluno no painel

```typescript
// Frontend: client/src/hooks/useAlunos.ts
const { mutate } = useCreateAluno();

mutate({
  nome: "João Silva",
  email: "joao@email.com",
  senha: "senha123",
  dataNascimento: "1990-01-01",
  altura: 175,
  genero: "masculino",
  status: "ativo"
});
```

### 2. Edge Function cria usuário Auth

```typescript
// Supabase Edge Function: supabase/functions/create-aluno/index.ts

// 1. Criar usuário no Supabase Auth
const { data: authUser } = await supabaseAdmin.auth.admin.createUser({
  email: "joao@email.com",
  password: "senha123",
  email_confirm: true, // ✅ Confirmar email automaticamente
  user_metadata: {
    nome: "João Silva",
    tipo: "aluno"
  }
});

// 2. Criar user_profile
await supabaseAdmin.from('users_profile').insert({
  auth_uid: authUser.user.id, // ✅ Auth UID real
  nome: "João Silva",
  email: "joao@email.com",
  tipo: "aluno"
});

// 3. Criar aluno (sem senha)
await supabaseAdmin.from('alunos').insert({
  user_profile_id: profileId,
  data_nascimento: "1990-01-01",
  altura: 175,
  genero: "masculino",
  status: "ativo"
  // ✅ Sem campo senha
});
```

## Fluxo de Login

### Aluno e Admin usam o mesmo fluxo

```typescript
// client/src/pages/Login.tsx

// 1. Login com Supabase Auth
const { data: authData } = await supabase.auth.signInWithPassword({
  email: "joao@email.com",
  password: "senha123"
});

// 2. Buscar perfil para determinar tipo
const { data: profile } = await supabase
  .from("users_profile")
  .select("nome, tipo")
  .eq("auth_uid", authData.user.id)
  .single();

// 3. Redirecionar baseado no tipo
if (profile.tipo === "admin") {
  window.location.href = "/admin";
} else {
  window.location.href = "/aluno";
}
```

## Fluxo de Acesso aos Dados

```typescript
// client/src/hooks/useAlunoData.ts

export function useAlunoProfile() {
  return useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      // 1. Buscar usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      
      // 2. Buscar perfil e dados do aluno
      const { data } = await supabase
        .from("users_profile")
        .select(`
          *,
          alunos(*)
        `)
        .eq("auth_uid", user.id)
        .single();
      
      return data;
    }
  });
}
```

## Estrutura de Dados

### Tabela `users_profile`
```sql
CREATE TABLE users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid TEXT UNIQUE NOT NULL, -- ✅ Supabase Auth UID real
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  tipo TEXT CHECK (tipo IN ('admin', 'aluno')),
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Tabela `alunos`
```sql
CREATE TABLE alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID UNIQUE REFERENCES users_profile(id),
  data_nascimento DATE,
  altura INTEGER,
  genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro')),
  status TEXT CHECK (status IN ('ativo', 'inativo', 'pendente')),
  -- ✅ Sem campo senha (usa Supabase Auth)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Benefícios da Nova Arquitetura

### Segurança
✅ Senhas hasheadas automaticamente pelo Supabase
✅ Sem senhas em texto plano no banco
✅ Proteção contra ataques de força bruta
✅ Rate limiting automático

### Funcionalidades
✅ Reset de senha via email
✅ Possibilidade de 2FA no futuro
✅ Sessões gerenciadas automaticamente
✅ Refresh tokens automáticos

### Código
✅ Lógica unificada de autenticação
✅ Menos código para manter
✅ Sem localStorage
✅ Mais simples e limpo

### UX
✅ Alunos podem resetar senha
✅ Experiência consistente
✅ Mais profissional

## Deploy da Edge Function

### 1. Instalar Supabase CLI
```bash
npm install -g supabase
```

### 2. Login no Supabase
```bash
supabase login
```

### 3. Link ao projeto
```bash
supabase link --project-ref cbdonvzifbkayrvnlskp
```

### 4. Deploy da função
```bash
supabase functions deploy create-aluno
```

### 5. Configurar variáveis de ambiente
No painel do Supabase:
- Settings → Edge Functions
- Adicionar `SUPABASE_SERVICE_ROLE_KEY`

## Migração de Alunos Existentes

Para alunos já cadastrados com o sistema antigo:

```sql
-- Script para migrar alunos existentes (executar manualmente)
-- Este script cria usuários Auth para alunos que têm auth_uid mock

-- Nota: Precisa ser executado via Supabase Admin API ou manualmente
-- pois requer criação de usuários Auth
```

## Testando

### 1. Cadastrar novo aluno
- Acessar painel admin
- Ir em "Alunos" → "Novo Aluno"
- Preencher dados e senha
- Salvar

### 2. Fazer login como aluno
- Acessar `/login`
- Usar email e senha cadastrados
- Verificar redirecionamento para `/aluno`

### 3. Verificar dados
- Acessar `/aluno/perfil`
- Verificar nome, email e dados pessoais
- Acessar `/aluno/treinos`
- Verificar fichas de treino

## Arquivos Modificados

- ✅ `supabase/functions/create-aluno/index.ts` - Edge Function criada
- ✅ `client/src/hooks/useAlunos.ts` - Usa Edge Function
- ✅ `client/src/hooks/useAlunoData.ts` - Usa Auth em vez de localStorage
- ✅ `client/src/pages/Login.tsx` - Login unificado
- ✅ `client/src/App.tsx` - Remove lógica de localStorage
- ✅ Migração SQL - Remove campo `senha` da tabela `alunos`

## Próximos Passos (Opcional)

1. **Implementar reset de senha**
   - Usar `supabase.auth.resetPasswordForEmail()`
   - Criar página de reset

2. **Adicionar 2FA**
   - Configurar no Supabase Dashboard
   - Implementar UI de configuração

3. **Melhorar onboarding**
   - Email de boas-vindas
   - Tutorial para primeiro acesso

4. **Logs de auditoria**
   - Registrar logins
   - Monitorar acessos
