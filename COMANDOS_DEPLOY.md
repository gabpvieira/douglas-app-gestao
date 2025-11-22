# 🚀 Comandos para Deploy - Correção Supabase

## 📋 Checklist Rápido

- [ ] Código atualizado localmente
- [ ] SQL executado no Supabase
- [ ] Variáveis configuradas no Vercel
- [ ] Deploy realizado
- [ ] Testes executados

---

## 1️⃣ Commit e Push das Alterações

```bash
# Adicionar todos os arquivos
git add .

# Commit com mensagem descritiva
git commit -m "fix: integração completa Supabase com RLS e helper centralizado"

# Push para o repositório
git push origin main
```

**O que acontece:**
- Vercel detecta o push automaticamente
- Inicia build e deploy automático
- Em 2-3 minutos o site estará atualizado

---

## 2️⃣ Executar SQL no Supabase

### Passo a Passo:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Abra o arquivo `scripts/setup-rls-policies.sql`
6. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
7. Cole no SQL Editor do Supabase
8. Clique em **Run** (ou pressione Ctrl+Enter)
9. Aguarde 30-60 segundos
10. Verifique se não há erros na parte inferior

**Verificação:**
```sql
-- Execute esta query para verificar
SELECT COUNT(*) as total_policies 
FROM pg_policies 
WHERE schemaname = 'public';
```

Deve retornar `total_policies` > 20

---

## 3️⃣ Configurar Variáveis no Vercel

### Opção A: Via Interface Web

1. Acesse: https://vercel.com/seu-usuario/douglaspersonal-three/settings/environment-variables
2. Adicione cada variável:

```
Nome: VITE_SUPABASE_URL
Valor: https://cbdonvzifbkayrvnlskp.supabase.co
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: VITE_SUPABASE_ANON_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTg4MDAsImV4cCI6MjA3ODk5NDgwMH0.tydBDG5Ojgly6tPd4uPcG2fbtoaM26nUFK9NK2rw5V8
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SUPABASE_URL
Valor: https://cbdonvzifbkayrvnlskp.supabase.co
Ambientes: ✅ Production ✅ Preview ✅ Development

Nome: SUPABASE_SERVICE_ROLE_KEY
Valor: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxODgwMCwiZXhwIjoyMDc4OTk0ODAwfQ.giFCZ278wp_4sOopvpAmiNYauI0kNiF3yYpVcMZc2x4
Ambientes: ✅ Production ✅ Preview ✅ Development
⚠️ Marcar como SENSÍVEL
```

3. Clique em **Save** para cada variável

### Opção B: Via CLI (se tiver Vercel CLI instalado)

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Link do projeto
vercel link

# Adicionar variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 4️⃣ Forçar Redeploy (se necessário)

Se as variáveis já existiam e você só atualizou o código:

### Via Interface Web:
1. Acesse: https://vercel.com/seu-usuario/douglaspersonal-three
2. Vá na aba **Deployments**
3. Clique nos 3 pontinhos do último deploy
4. Clique em **Redeploy**

### Via CLI:
```bash
vercel --prod
```

---

## 5️⃣ Testar os Endpoints

### Teste Manual (Navegador):

Abra cada URL no navegador:

1. **Teste Supabase:**
   ```
   https://douglaspersonal-three.vercel.app/api/test-supabase
   ```
   Deve retornar: `{"success": true, ...}`

2. **Fichas de Treino:**
   ```
   https://douglaspersonal-three.vercel.app/api/fichas-treino
   ```
   Deve retornar: `[]` ou array com dados

3. **Students:**
   ```
   https://douglaspersonal-three.vercel.app/api/admin/students
   ```
   Deve retornar: `[]` ou array com dados

### Teste Automatizado (Node.js):

```bash
# Execute o script de teste
node scripts/test-api-endpoints.js
```

---

## 6️⃣ Verificar no Frontend

1. Acesse: https://douglaspersonal-three.vercel.app/admin
2. Faça login
3. Navegue pelas seções:
   - ✅ Alunos
   - ✅ Fichas de Treino
   - ✅ Agendamentos
   - ✅ Planos Alimentares

4. Abra o Console do Navegador (F12)
5. Vá na aba **Network**
6. Recarregue a página
7. Verifique se as requisições para `/api/*` retornam 200

---

## 🔍 Troubleshooting

### Erro: "Missing Supabase credentials"

**Solução:**
```bash
# Verificar variáveis no Vercel
vercel env ls

# Se não aparecerem, adicione novamente
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY

# Redeploy
vercel --prod
```

### Erro: "Row Level Security policy violation"

**Solução:**
1. Verifique se o SQL foi executado no Supabase
2. Execute a query de verificação:
   ```sql
   SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
   ```
3. Se retornar 0, execute o SQL novamente

### Erro: 404 nos endpoints

**Solução:**
1. Verifique se o deploy foi concluído
2. Verifique se os arquivos estão no repositório:
   ```bash
   git status
   git log --oneline -5
   ```
3. Force um redeploy

### Dados não aparecem no painel

**Solução:**
1. Abra o console (F12)
2. Veja se há erros JavaScript
3. Vá na aba Network
4. Veja se as requisições estão falhando
5. Verifique o status code (200 = OK, 401 = não autenticado, 500 = erro servidor)

---

## ✅ Verificação Final

Execute este checklist:

```bash
# 1. Código commitado?
git status
# Deve mostrar: "nothing to commit, working tree clean"

# 2. Push feito?
git log origin/main..HEAD
# Deve estar vazio (sem commits pendentes)

# 3. Deploy concluído?
# Acesse: https://vercel.com/seu-usuario/douglaspersonal-three
# Status deve ser: ✅ Ready

# 4. Endpoints funcionando?
node scripts/test-api-endpoints.js
# Todos devem retornar ✅

# 5. Frontend funcionando?
# Acesse: https://douglaspersonal-three.vercel.app/admin
# Dados devem aparecer
```

---

## 📊 Resumo dos Arquivos Modificados

### Criados:
- ✅ `api/_lib/supabase.ts`
- ✅ `api/test-supabase.ts`
- ✅ `api/admin/blocos-horarios.ts` (recriado)
- ✅ `scripts/setup-rls-policies.sql`
- ✅ `scripts/test-api-endpoints.js`
- ✅ `CORRECAO_SUPABASE_RLS_COMPLETA.md`
- ✅ `GUIA_RAPIDO_CORRECAO_SUPABASE.md`
- ✅ `CORRECOES_APLICADAS_SUPABASE.md`
- ✅ `COMANDOS_DEPLOY.md`

### Modificados:
- ✅ `api/fichas-treino/index.ts`
- ✅ `api/fichas-treino/[id].ts`
- ✅ `api/admin/students.ts`
- ✅ `api/admin/agendamentos.ts`
- ✅ `api/planos-alimentares/index.ts`
- ✅ `api/treinos-pdf/index.ts`

---

## 🎯 Ordem de Execução Recomendada

1. ✅ Commit e push (já feito pelo Kiro)
2. ⏳ Executar SQL no Supabase (VOCÊ PRECISA FAZER)
3. ⏳ Configurar variáveis no Vercel (VOCÊ PRECISA FAZER)
4. ⏳ Aguardar deploy (automático)
5. ⏳ Testar endpoints (VOCÊ PRECISA FAZER)
6. ✅ Usar o sistema!

---

**Tempo total estimado:** 10-15 minutos  
**Dificuldade:** Fácil  
**Impacto:** Alto 🚀
