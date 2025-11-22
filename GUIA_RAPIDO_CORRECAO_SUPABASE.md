# 🚀 Guia Rápido: Correção Supabase RLS

## ⚡ Passos para Implementação (15 minutos)

### 1️⃣ Aplicar SQL no Supabase (5 min)

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)
4. Copie todo o conteúdo de `scripts/setup-rls-policies.sql`
5. Cole no editor e clique em **Run**
6. Aguarde a execução (pode demorar 30-60 segundos)
7. Verifique se não há erros

### 2️⃣ Configurar Variáveis no Vercel (3 min)

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione estas variáveis:

```
# Frontend (Build Time)
VITE_SUPABASE_URL = https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTg4MDAsImV4cCI6MjA3ODk5NDgwMH0.tydBDG5Ojgly6tPd4uPcG2fbtoaM26nUFK9NK2rw5V8

# Backend (Runtime)
SUPABASE_URL = https://cbdonvzifbkayrvnlskp.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxODgwMCwiZXhwIjoyMDc4OTk0ODAwfQ.giFCZ278wp_4sOopvpAmiNYauI0kNiF3yYpVcMZc2x4
```

3. Marque `SUPABASE_SERVICE_ROLE_KEY` como **sensível**
4. Aplique para **Production**, **Preview** e **Development**

### 3️⃣ Fazer Deploy (2 min)

```bash
# Commit das mudanças
git add .
git commit -m "fix: adicionar RLS policies e helper Supabase"
git push origin main
```

Ou no painel da Vercel: **Deployments → Redeploy**

### 4️⃣ Testar (5 min)

#### Teste 1: Verificar Conexão
```
https://seu-dominio.vercel.app/api/test-supabase
```

Deve retornar:
```json
{
  "success": true,
  "message": "Supabase connection OK",
  "userProfileCount": 0,
  "env": {
    "hasUrl": true,
    "hasServiceKey": true,
    "hasAnonKey": true
  }
}
```

#### Teste 2: Verificar Fichas de Treino
```
https://seu-dominio.vercel.app/api/fichas-treino
```

Deve retornar array (vazio ou com dados):
```json
[]
```

#### Teste 3: Login no Frontend
1. Acesse o painel admin
2. Faça login
3. Verifique se os dados aparecem

---

## 🔍 Troubleshooting Rápido

### ❌ Erro: "Missing Supabase credentials"

**Solução:**
- Verifique se as variáveis estão no Vercel
- Faça redeploy após adicionar variáveis

### ❌ Erro: "Row Level Security policy violation"

**Solução:**
- Verifique se o SQL foi executado corretamente
- Verifique se o usuário está autenticado
- No backend, use `getSupabaseAdmin()` que bypassa RLS

### ❌ Dados não aparecem no painel

**Solução:**
1. Abra o console do navegador (F12)
2. Vá na aba Network
3. Recarregue a página
4. Verifique as requisições para `/api/*`
5. Veja se há erros 401, 403 ou 500

### ❌ Updates não salvam

**Solução:**
- Verifique se as políticas de UPDATE estão corretas
- Verifique se o usuário tem permissão (admin)
- Veja os logs no console do navegador

---

## 📊 Verificação Final

Execute no SQL Editor do Supabase:

```sql
-- Verificar políticas
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verificar triggers
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Verificar índices
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
```

Deve retornar várias linhas para cada query.

---

## ✅ Checklist

- [ ] SQL executado no Supabase sem erros
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy realizado
- [ ] `/api/test-supabase` retorna success
- [ ] `/api/fichas-treino` retorna array
- [ ] Login funciona no frontend
- [ ] Dados aparecem no painel admin
- [ ] Updates funcionam

---

## 📚 Arquivos Criados/Modificados

### Novos Arquivos:
- ✅ `api/_lib/supabase.ts` - Helper para cliente Supabase
- ✅ `api/test-supabase.ts` - Endpoint de teste
- ✅ `scripts/setup-rls-policies.sql` - SQL completo
- ✅ `CORRECAO_SUPABASE_RLS_COMPLETA.md` - Documentação detalhada

### Arquivos Modificados:
- ✅ `api/fichas-treino/index.ts` - Usa novo helper
- ✅ `api/fichas-treino/[id].ts` - Usa novo helper

### Próximos Arquivos a Atualizar:
- `api/admin/students.ts`
- `api/admin/agendamentos.ts`
- `api/admin/blocos-horarios.ts`
- `api/planos-alimentares/index.ts`
- `api/treinos-pdf/index.ts`

---

## 🎯 Resultado Esperado

Após seguir todos os passos:

1. ✅ Dados aparecem no painel admin
2. ✅ Updates salvam corretamente
3. ✅ Autenticação funciona
4. ✅ RLS protege os dados
5. ✅ Performance melhorada com índices
6. ✅ Triggers automáticos funcionando

---

**Tempo total estimado:** 15 minutos  
**Dificuldade:** Fácil  
**Impacto:** Alto 🚀
