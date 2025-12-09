#!/bin/bash

# Script para fazer deploy da função Supabase create-aluno

echo "🚀 Fazendo deploy da função create-aluno..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Fazer login (se necessário)
echo "📝 Verificando autenticação..."
supabase login

# Linkar projeto
echo "🔗 Linkando projeto..."
supabase link --project-ref cbdonvzifbkayrvnlskp

# Deploy da função
echo "📦 Fazendo deploy da função..."
supabase functions deploy create-aluno --no-verify-jwt

echo "✅ Deploy concluído!"
echo ""
echo "🔍 Para testar a função:"
echo "supabase functions logs create-aluno --follow"
