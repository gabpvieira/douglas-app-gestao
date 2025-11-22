# 🚀 Correção Deploy Vercel - Problemas Resolvidos

## 🔍 Problemas Identificados

### 1. Tabela `agendamentos` não existe
- ❌ **Erro**: Código usava `agendamentos_presenciais` mas schema definia `agendamentos`
- ✅ **Solução**: Schema atualizado para usar `agendamentos_presenciais`

### 2. Erro 500 nas APIs
- ❌ **Erro**: Variáveis de ambiente não configuradas no Vercel
- ✅ **Solução**: Instruções abaixo para configurar

### 3. FUNCTION_INVOCATION_FAILED
- ❌ **Erro**: Serverless functions falhando por falta de variáveis
- ✅ **Solução**: Configuração completa das env vars

## 📋 Estrutura do Banco Corrigida

### Tabelas Principais

```
✅ users_profile              - Perfis de usuários
✅ alunos                      - Dados dos alunos
✅ treinos_video               - Biblioteca de vídeos
✅ planos_alimentares          - Planos nutricionais
✅ refeicoes_plano             - Refeições dos planos
✅ alimentos_refeicao          - Alimentos das refeições
✅ assinaturas                 - Assinaturas dos alunos
✅ pagamentos                  - Histórico de pagamentos
✅ disponibilidade_semanal     - Disponibilidade do profissional
✅ agendamentos_presenciais    - Agendamentos (NOVA ESTRUTURA)
✅ blocos_horarios             - Blocos de horário (DEPRECATED)
✅ excecoes_disponibilidade    - Feriados e férias
✅ evolucoes                   - Evolução física
✅ fotos_progresso             - Fotos de progresso
✅ fichas_treino               - Fichas de treino
✅ exercicios_ficha            - Exercícios das fichas
✅ fichas_alunos               - Atribuição de fichas
✅ treinos_realizados          - Registro de treinos
✅ series_realizadas           - Séries executadas
```

## 🔧 Correções Aplicadas

### 1. Schema TypeScript Atualizado

**Arquivo**: `shared/schema.ts`

```typescript
// ANTES (ERRADO)
export const agendamentos = pgTable("agendamentos", {
  blocoHorarioId: varchar("bloco_horario_id").notNull()...
});

// DEPOIS (CORRETO)
export const agendamentosPresenciais = pgTable("agendamentos_presenciais", {
  horaInicio: text("hora_inicio").notNull(),
  horaFim: text("hora_fim").notNull(),
  tipo: text("tipo").notNull().default("presencial"),
});

export const disponibilidadeSemanal = pgTable("disponibilidade_semanal", {
  duracaoAtendimento: integer("duracao_atendimento").notNull(),
});
```

### 2. Script SQL Completo

**Arquivo**: `scripts/criar-todas-tabelas.sql`

- ✅ Todas as tabelas definidas
- ✅ Índices otimizados
- ✅ Foreign keys corretas
- ✅ RLS policies configuradas
- ✅ Triggers de updated_at

## 🌐 Configuração Vercel

### Passo 1: Acessar Configurações

1. Acesse: https://vercel.com/seu-projeto
2. Vá em **Settings** → **Environment Variables**

### Passo 2: Adicionar Variáveis de Ambiente

Configure as seguintes variáveis para **Production**, **Preview** e **Development**:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTg4MDAsImV4cCI6MjA3ODk5NDgwMH0.tydBDG5Ojgly6tPd4uPcG2fbtoaM26nUFK9NK2rw5V8

# Supabase Service Role (Backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxODgwMCwiZXhwIjoyMDc4OTk0ODAwfQ.giFCZ278wp_4sOopvpAmiNYauI0kNiF3yYpVcMZc2x4

# App Configuration
PORT=3174
NODE_ENV=production
```

### Passo 3: Redeploy

Após adicionar as variáveis:

```bash
# Via CLI
vercel --prod

# Ou via Dashboard
# Vá em Deployments → Redeploy
```

## 🔍 Verificação das APIs

### Testar Endpoints

```bash
# 1. Listar agendamentos
curl https://seu-app.vercel.app/api/admin/agendamentos

# 2. Listar fichas de treino
curl https://seu-app.vercel.app/api/fichas-treino

# 3. Listar alunos
curl https://seu-app.vercel.app/api/admin/alunos

# 4. Listar vídeos
curl https://seu-app.vercel.app/api/treinos-video
```

### Respostas Esperadas

✅ **Sucesso**: Status 200 com dados JSON
❌ **Erro 500**: Variáveis de ambiente faltando
❌ **Erro 404**: Rota não encontrada

## 📊 Estrutura de Agendamentos

### Nova Estrutura (agendamentos_presenciais)

```sql
CREATE TABLE agendamentos_presenciais (
  id UUID PRIMARY KEY,
  aluno_id UUID NOT NULL,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,      -- ✅ Horário flexível
  hora_fim TIME NOT NULL,          -- ✅ Horário flexível
  status TEXT DEFAULT 'agendado',
  tipo TEXT DEFAULT 'presencial',  -- ✅ presencial ou online
  observacoes TEXT,
  UNIQUE(data_agendamento, hora_inicio) -- ✅ Evita conflitos
);
```

### Estrutura Antiga (DEPRECATED)

```sql
-- ❌ NÃO USAR MAIS
CREATE TABLE agendamentos (
  bloco_horario_id UUID NOT NULL  -- Dependia de blocos fixos
);
```

## 🎯 Vantagens da Nova Estrutura

### Antes (Blocos Fixos)
- ❌ Criar bloco por bloco manualmente
- ❌ Inflexível para mudanças
- ❌ Difícil gerenciar exceções

### Depois (Horários Flexíveis)
- ✅ Horários livres e flexíveis
- ✅ Suporte a presencial e online
- ✅ Fácil criar exceções
- ✅ Validação automática de conflitos

## 🔄 Migração de Dados (Se Necessário)

Se você tinha dados na tabela antiga `agendamentos`:

```sql
-- Migrar dados antigos para nova estrutura
INSERT INTO agendamentos_presenciais (
  aluno_id,
  data_agendamento,
  hora_inicio,
  hora_fim,
  status,
  tipo,
  observacoes
)
SELECT 
  a.aluno_id,
  a.data_agendamento,
  b.hora_inicio,
  b.hora_fim,
  a.status,
  'presencial' as tipo,
  a.observacoes
FROM agendamentos a
JOIN blocos_horarios b ON a.bloco_horario_id = b.id;
```

## 📝 Checklist de Deploy

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Schema TypeScript atualizado (`shared/schema.ts`)
- [ ] Banco de dados com tabela `agendamentos_presenciais`
- [ ] APIs testadas localmente
- [ ] Build local funcionando (`npm run build`)
- [ ] Deploy no Vercel realizado
- [ ] APIs testadas em produção
- [ ] Logs do Vercel verificados

## 🐛 Troubleshooting

### Erro: "relation agendamentos does not exist"

```bash
# Solução: Atualizar código para usar agendamentos_presenciais
# Verificar: server/routes/agenda.ts e api/admin/agendamentos.ts
```

### Erro: "SUPABASE_SERVICE_ROLE_KEY is not defined"

```bash
# Solução: Adicionar variável no Vercel
# Settings → Environment Variables → Add
```

### Erro: "Cannot find module '@supabase/supabase-js'"

```bash
# Solução: Verificar package.json e reinstalar
npm install @supabase/supabase-js
```

## 📚 Arquivos Modificados

```
✅ shared/schema.ts                    - Schema atualizado
✅ scripts/criar-todas-tabelas.sql     - Script SQL completo
✅ CORRECAO_DEPLOY_VERCEL.md           - Este documento
```

## 🎉 Resultado Esperado

Após aplicar todas as correções:

- ✅ Deploy no Vercel sem erros
- ✅ APIs respondendo corretamente
- ✅ Agendamentos funcionando
- ✅ Fichas de treino acessíveis
- ✅ Planos alimentares disponíveis
- ✅ Upload de vídeos operacional

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Supabase](https://supabase.com/docs)

---

**Status**: ✅ Correções aplicadas e documentadas
**Data**: 22/11/2025
**Próximo passo**: Configurar variáveis no Vercel e fazer redeploy
