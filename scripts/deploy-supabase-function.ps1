# Script PowerShell para fazer deploy da função Supabase create-aluno

Write-Host "🚀 Fazendo deploy da função create-aluno..." -ForegroundColor Green

# Verificar se o Supabase CLI está instalado
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI não encontrado. Instalando..." -ForegroundColor Red
    npm install -g supabase
}

# Fazer login (se necessário)
Write-Host "📝 Verificando autenticação..." -ForegroundColor Yellow
supabase login

# Linkar projeto
Write-Host "🔗 Linkando projeto..." -ForegroundColor Yellow
supabase link --project-ref cbdonvzifbkayrvnlskp

# Deploy da função
Write-Host "📦 Fazendo deploy da função..." -ForegroundColor Yellow
supabase functions deploy create-aluno --no-verify-jwt

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🔍 Para testar a função:" -ForegroundColor Cyan
Write-Host "supabase functions logs create-aluno --follow" -ForegroundColor White
