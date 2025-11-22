# 🔧 Correção: Fichas de Treino não aparecem em Produção

## 🔍 Diagnóstico

### Problema
A página `/admin/fichas-treino` não está mostrando as fichas em produção.

### Possíveis Causas

1. **Variáveis de ambiente não configuradas**
   - `SUPABASE_URL` ou `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. **API retornando erro 500**
   - Falta de variáveis de ambiente
   - Erro na query do Supabase

3. **Tabelas não existem no banco**
   - `fichas_treino`
   - `exercicios_ficha`

4. **RLS bloqueando acesso**
   - Políticas muito restritivas

## ✅ Verificações

### 1. Verificar se as tabelas existem

Execute no SQL Editor do Supabase:

\`\`\`sql
-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('fichas_treino', 'exercicios_ficha');

-- Contar registros
SELECT COUNT(*) as total_fichas FROM fichas_treino;
SELECT COUNT(*) as total_exercicios FROM exercicios_ficha;
\`\`\`

### 2. Testar API diretamente

\`\`\`bash
# Testar em produção
curl https://seu-app.vercel.app/api/fichas-treino

# Deve retornar array de fichas ou []
\`\`\`

### 3. Verificar logs do Vercel

1. Acesse: https://vercel.com/seu-projeto
2. Vá em **Deployments** → Último deploy
3. Clique em **Functions**
4. Procure por `api/fichas-treino/index`
5. Veja os logs de erro

## 🔧 Correções

### Correção 1: Adicionar Logs de Debug

Vou atualizar a API para ter logs mais detalhados:

\`\`\`typescript
// api/fichas-treino/index.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('🔍 [Fichas API] Iniciando requisição:', req.method);
  console.log('🔍 [Fichas API] URL:', process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  console.log('🔍 [Fichas API] Service Key exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const supabase = getSupabaseAdmin();
    console.log('✅ [Fichas API] Supabase client criado');
    
    if (req.method === 'GET') {
      console.log('🔍 [Fichas API] Buscando fichas...');
      
      const { data: fichas, error } = await supabase
        .from('fichas_treino')
        .select(\`
          *,
          exercicios:exercicios_ficha(*)
        \`)
        .order('created_at', { ascending: false });

      console.log('🔍 [Fichas API] Resultado:', { 
        fichasCount: fichas?.length || 0, 
        error: error?.message 
      });

      if (error) {
        console.error('❌ [Fichas API] Erro ao buscar:', error);
        throw error;
      }
      
      return res.status(200).json(fichas || []);
    }
  } catch (error: any) {
    console.error('❌ [Fichas API] Erro geral:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null
    });
  }
}
\`\`\`

### Correção 2: Verificar Variáveis de Ambiente

No Vercel, certifique-se de que estas variáveis estão configuradas:

\`\`\`bash
# Opção 1: Usar VITE_SUPABASE_URL
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opção 2: Adicionar SUPABASE_URL também
SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

### Correção 3: Criar Fichas de Teste

Se não houver fichas no banco, crie algumas para teste:

\`\`\`sql
-- Criar ficha de teste
INSERT INTO fichas_treino (nome, descricao, objetivo, nivel, duracao_semanas, ativo)
VALUES 
  ('Treino A - Peito e Tríceps', 'Treino focado em peito e tríceps', 'Hipertrofia', 'intermediario', 8, 'true'),
  ('Treino B - Costas e Bíceps', 'Treino focado em costas e bíceps', 'Hipertrofia', 'intermediario', 8, 'true');

-- Adicionar exercícios
INSERT INTO exercicios_ficha (ficha_id, nome, grupo_muscular, ordem, series, repeticoes, descanso)
SELECT 
  id,
  'Supino Reto',
  'Peito',
  1,
  4,
  '8-12',
  90
FROM fichas_treino 
WHERE nome = 'Treino A - Peito e Tríceps'
LIMIT 1;
\`\`\`

### Correção 4: Simplificar Query (Fallback)

Se a query com join estiver falhando, simplifique:

\`\`\`typescript
// Buscar fichas sem exercícios primeiro
const { data: fichas, error } = await supabase
  .from('fichas_treino')
  .select('*')
  .order('created_at', { ascending: false });

if (error) throw error;

// Buscar exercícios separadamente se necessário
if (fichas && fichas.length > 0) {
  const fichasIds = fichas.map(f => f.id);
  const { data: exercicios } = await supabase
    .from('exercicios_ficha')
    .select('*')
    .in('ficha_id', fichasIds);
  
  // Combinar dados
  const fichasComExercicios = fichas.map(ficha => ({
    ...ficha,
    exercicios: exercicios?.filter(ex => ex.ficha_id === ficha.id) || []
  }));
  
  return res.status(200).json(fichasComExercicios);
}
\`\`\`

## 🧪 Testes

### Teste 1: API Local

\`\`\`bash
# Testar localmente
npm run dev

# Em outro terminal
curl http://localhost:3174/api/fichas-treino
\`\`\`

### Teste 2: API Produção

\`\`\`bash
# Testar em produção
curl https://seu-app.vercel.app/api/fichas-treino

# Com headers
curl -H "Content-Type: application/json" https://seu-app.vercel.app/api/fichas-treino
\`\`\`

### Teste 3: Frontend

Abra o console do navegador em produção e execute:

\`\`\`javascript
// Testar fetch direto
fetch('/api/fichas-treino')
  .then(r => r.json())
  .then(data => console.log('Fichas:', data))
  .catch(err => console.error('Erro:', err));
\`\`\`

## 📋 Checklist de Correção

- [ ] Verificar se tabelas existem no Supabase
- [ ] Verificar se há dados nas tabelas
- [ ] Verificar variáveis de ambiente no Vercel
- [ ] Adicionar logs de debug na API
- [ ] Testar API em produção
- [ ] Verificar logs do Vercel
- [ ] Verificar console do navegador
- [ ] Criar dados de teste se necessário

## 🎯 Próximos Passos

1. **Verificar logs do Vercel** para ver o erro exato
2. **Testar API diretamente** com curl
3. **Verificar banco de dados** se tem fichas
4. **Adicionar logs** para debug
5. **Aplicar correção** baseada no erro encontrado

---

**Aguardando**: Logs do Vercel ou resultado do teste da API para diagnóstico preciso
