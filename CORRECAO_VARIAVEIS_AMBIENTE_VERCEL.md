# Correção: Variáveis de Ambiente no Vercel

## 🔴 Problema Identificado

Os dados do Supabase funcionavam no localhost mas não no Vercel após o deploy. O problema era que o **backend estava usando variáveis com prefixo `VITE_`**, que são apenas para o frontend (build time).

## ✅ Solução Aplicada

### 1. Variáveis de Ambiente Criadas no Vercel

Adicionada a variável `SUPABASE_URL` (sem prefixo VITE_) no projeto Vercel:
- ✅ `SUPABASE_URL` = https://cbdonvzifbkayrvnlskp.supabase.co
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (já existia)
- ✅ `VITE_SUPABASE_URL` (já existia - para frontend)
- ✅ `VITE_SUPABASE_ANON_KEY` (já existia - para frontend)

### 2. Código Backend Corrigido

#### `server/supabase.ts`
```typescript
// ANTES (❌ ERRADO)
const supabaseUrl = process.env.VITE_SUPABASE_URL || '...';

// DEPOIS (✅ CORRETO)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '...';
```

#### `server/routes/treinosVideo.ts`
```typescript
// Adicionado helper no início do arquivo
const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://cbdonvzifbkayrvnlskp.supabase.co';

// Substituído em todas as ocorrências
thumbnailUrl = getThumbnailUrl(thumbnailPath, getSupabaseUrl());
```

### 3. `.env.example` Atualizado

```env
# Supabase Configuration (Frontend - build time)
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=...

# Supabase Configuration (Backend - runtime)
SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=...
```

## 📋 Diferença entre Variáveis

| Variável | Uso | Quando é Lida |
|----------|-----|---------------|
| `VITE_*` | Frontend (client-side) | Build time (npm run build) |
| Sem prefixo | Backend (server-side) | Runtime (quando o servidor roda) |

## 🚀 Próximos Passos

1. **Fazer commit das alterações:**
```bash
git add .
git commit -m "fix: corrigir variáveis de ambiente para Vercel backend"
git push
```

2. **Aguardar deploy automático no Vercel**
   - O Vercel detectará o push e fará deploy automaticamente
   - As novas variáveis de ambiente já estão configuradas

3. **Verificar logs do deploy:**
   - Acesse: https://vercel.com/zkdigitalbusiness-2240s-projects/douglaspersonal
   - Vá em "Deployments" > último deploy > "View Function Logs"
   - Procure por mensagens de conexão com Supabase

## 🔍 Como Verificar se Funcionou

Após o deploy, teste:

1. **Abrir o app em produção**
2. **Fazer login**
3. **Navegar para páginas que usam dados do Supabase:**
   - Dashboard
   - Lista de Alunos
   - Agenda
   - Fichas de Treino
   - Planos Alimentares

4. **Verificar console do navegador:**
   - Não deve haver erros de conexão
   - Dados devem carregar normalmente

## 🐛 Debug (se ainda não funcionar)

Se ainda houver problemas, verifique:

1. **Logs do Vercel:**
```bash
vercel logs [deployment-url]
```

2. **Variáveis de ambiente no Vercel:**
   - Acesse: Settings > Environment Variables
   - Confirme que `SUPABASE_URL` está presente
   - Confirme que está habilitada para Production, Preview e Development

3. **RLS (Row Level Security) no Supabase:**
   - Verifique se as políticas de segurança estão corretas
   - Teste queries diretamente no Supabase Dashboard

## 📝 Resumo

O problema era simples mas crítico: **variáveis com prefixo `VITE_` só funcionam no frontend durante o build**. O backend precisa de variáveis sem esse prefixo para acessá-las em runtime no Vercel.

✅ Correção aplicada
✅ Variável criada no Vercel
✅ Código atualizado com fallback
✅ Pronto para deploy!
