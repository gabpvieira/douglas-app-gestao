# Configuração do Vercel - Douglas App Gestão

## Variáveis de Ambiente Necessárias

Para o deploy funcionar corretamente no Vercel, você precisa configurar as seguintes variáveis de ambiente:

### 1. Acesse as Configurações do Projeto no Vercel
1. Vá para o dashboard do Vercel
2. Selecione o projeto "douglas-app-gestao"
3. Clique em "Settings" (Configurações)
4. Clique em "Environment Variables" (Variáveis de Ambiente)

### 2. Adicione as Seguintes Variáveis

#### Variáveis do Supabase (OBRIGATÓRIAS)
```
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTg4MDAsImV4cCI6MjA3ODk5NDgwMH0.tydBDG5Ojgly6tPd4uPcG2fbtoaM26nUFK9NK2rw5V8
```

#### Variáveis do Backend (se necessário)
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiZG9udnppZmJrYXlydm5sc2twIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQxODgwMCwiZXhwIjoyMDc4OTk0ODAwfQ.giFCZ278wp_4sOopvpAmiNYauI0kNiF3yYpVcMZc2x4
NODE_ENV=production
```

### 3. Ambiente
Para cada variável, selecione os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

### 4. Redeploy
Após adicionar as variáveis:
1. Vá para a aba "Deployments"
2. Clique nos três pontos (...) do último deploy
3. Clique em "Redeploy"

## Verificação

Após o redeploy, a aplicação deve carregar corretamente sem erros de "supabaseKey is required".

## Troubleshooting

Se ainda houver problemas:
1. Verifique se todas as variáveis foram salvas corretamente
2. Certifique-se de que os nomes das variáveis começam com `VITE_` para serem acessíveis no frontend
3. Faça um novo deploy após adicionar as variáveis
