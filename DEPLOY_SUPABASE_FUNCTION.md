# Deploy da Supabase Edge Function

## Método Rápido (Recomendado)

Execute o script de deploy:

**Windows (PowerShell):**
```powershell
.\scripts\deploy-supabase-function.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-supabase-function.sh
./scripts/deploy-supabase-function.sh
```

## Método Manual

### Pré-requisitos

1. Instalar Supabase CLI:
```bash
npm install -g supabase
```

2. Fazer login no Supabase:
```bash
supabase login
```

### Deploy da função create-aluno

1. Linkar o projeto local com o projeto Supabase:
```bash
supabase link --project-ref cbdonvzifbkayrvnlskp
```

2. Fazer deploy da função:
```bash
supabase functions deploy create-aluno --no-verify-jwt
```

3. Verificar se a função foi deployada:
```bash
supabase functions list
```

## Testar a função

Você pode testar a função diretamente:

```bash
curl -i --location --request POST 'https://cbdonvzifbkayrvnlskp.supabase.co/functions/v1/create-aluno' \
  --header 'Authorization: Bearer SEU_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"nome":"Teste","email":"teste@example.com","senha":"senha123","dataNascimento":"1990-01-01","altura":175,"genero":"masculino","status":"ativo"}'
```

## Alternativa: Deploy via Dashboard

Se preferir, você pode fazer o deploy pelo dashboard do Supabase:

1. Acesse: https://supabase.com/dashboard/project/cbdonvzifbkayrvnlskp/functions
2. Clique em "Deploy new function"
3. Cole o código de `supabase/functions/create-aluno/index.ts`
4. Clique em "Deploy"

## Verificar logs

Para ver os logs da função em tempo real:

```bash
supabase functions logs create-aluno
```

Ou acesse o dashboard: https://supabase.com/dashboard/project/cbdonvzifbkayrvnlskp/logs/edge-functions

## Importante

A função já está configurada para usar as variáveis de ambiente do Supabase:
- `SUPABASE_URL` - Configurada automaticamente
- `SUPABASE_SERVICE_ROLE_KEY` - Configurada automaticamente

Não é necessário configurar nada adicional!
