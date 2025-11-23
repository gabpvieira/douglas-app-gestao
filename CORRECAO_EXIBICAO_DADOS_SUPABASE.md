# Correção de Exibição de Dados do Supabase em Produção

## Problema Identificado

As páginas `/admin/planos`, `/admin/fichas-treino` e `/admin/treinos-video` não estavam exibindo dados corretamente em produção (Vercel) porque:

1. **Rotas API faltando**: As páginas faziam requisições para rotas que não existiam no Vercel:
   - `/api/admin/planos-alimentares/all`
   - `/api/admin/treinos-video/upload`
   - `/api/admin/treinos-video/:id/stream`
   - `/api/admin/treinos-video/:id/replace`
   - `/api/fichas-treino/stats/geral`
   - `/api/fichas-treino/:id/atribuir`
   - `/api/fichas-treino/:id/atribuicoes`

2. **Roteamento incorreto**: O `vercel.json` não tinha as regras de rewrite necessárias para essas rotas

## Solução Implementada

### 1. Criadas Novas Rotas Serverless

#### `api/admin/planos-alimentares.js`
- `GET /api/admin/planos-alimentares/all` - Lista todos os planos com refeições
- `GET /api/admin/planos-alimentares?id=xxx` - Busca plano específico
- `POST /api/admin/planos-alimentares` - Cria novo plano
- `PUT /api/admin/planos-alimentares?id=xxx` - Atualiza plano
- `DELETE /api/admin/planos-alimentares?id=xxx` - Remove plano

#### `api/admin/treinos-video.js`
- `GET /api/admin/treinos-video` - Lista todos os vídeos
- `GET /api/admin/treinos-video?id=xxx` - Busca vídeo específico
- `GET /api/admin/treinos-video?id=xxx&action=stream` - Gera URL de streaming
- `POST /api/admin/treinos-video?action=upload` - Upload de novo vídeo
- `POST /api/admin/treinos-video?id=xxx&action=replace` - Substitui arquivo de vídeo
- `PUT /api/admin/treinos-video?id=xxx` - Atualiza metadados
- `DELETE /api/admin/treinos-video?id=xxx` - Remove vídeo

### 2. Atualizada Rota de Fichas de Treino

#### `api/fichas-treino/index.js`
Adicionadas novas ações:
- `GET /api/fichas-treino?action=stats` - Estatísticas gerais
- `POST /api/fichas-treino?id=xxx&action=atribuir` - Atribui ficha a aluno
- `GET /api/fichas-treino?id=xxx&action=atribuicoes` - Lista atribuições
- `DELETE /api/fichas-treino?id=xxx&atribuicaoId=yyy` - Remove atribuição

### 3. Atualizado `vercel.json`

Adicionadas regras de rewrite para todas as novas rotas:

```json
{
  "rewrites": [
    {
      "source": "/api/fichas-treino/stats/geral",
      "destination": "/api/fichas-treino?action=stats"
    },
    {
      "source": "/api/fichas-treino/:id/atribuir",
      "destination": "/api/fichas-treino?id=:id&action=atribuir"
    },
    {
      "source": "/api/fichas-treino/:id/atribuicoes/:atribuicaoId",
      "destination": "/api/fichas-treino?id=:id&atribuicaoId=:atribuicaoId"
    },
    {
      "source": "/api/fichas-treino/:id/atribuicoes",
      "destination": "/api/fichas-treino?id=:id&action=atribuicoes"
    },
    {
      "source": "/api/admin/planos-alimentares/all",
      "destination": "/api/admin/planos-alimentares?action=all"
    },
    {
      "source": "/api/admin/treinos-video/upload",
      "destination": "/api/admin/treinos-video?action=upload"
    },
    {
      "source": "/api/admin/treinos-video/:id/stream",
      "destination": "/api/admin/treinos-video?id=:id&action=stream"
    },
    {
      "source": "/api/admin/treinos-video/:id/replace",
      "destination": "/api/admin/treinos-video?id=:id&action=replace"
    }
  ]
}
```

## Funcionalidades Implementadas

### Planos Alimentares
✅ Listagem de todos os planos com refeições
✅ Criação de novos planos
✅ Edição de planos existentes
✅ Exclusão de planos
✅ Relacionamento com refeições (cascade)

### Fichas de Treino
✅ Listagem de fichas com exercícios
✅ Estatísticas gerais (total, ativos, exercícios, alunos)
✅ Atribuição de fichas a alunos
✅ Gerenciamento de atribuições
✅ CRUD completo de fichas

### Treinos em Vídeo
✅ Listagem de vídeos
✅ Upload de novos vídeos com thumbnail
✅ Substituição de arquivos de vídeo
✅ Atualização de metadados
✅ Geração de URLs de streaming
✅ Exclusão de vídeos (com limpeza de storage)

## Variáveis de Ambiente Necessárias no Vercel

Certifique-se de que estas variáveis estão configuradas:

```
SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Como Testar

1. **Fazer commit e push das mudanças**:
```bash
git add .
git commit -m "fix: adicionar rotas API faltantes para produção"
git push
```

2. **Aguardar deploy no Vercel** (aproximadamente 2-3 minutos)

3. **Testar as páginas**:
   - https://douglaspersonal-three.vercel.app/admin/planos
   - https://douglaspersonal-three.vercel.app/admin/fichas-treino
   - https://douglaspersonal-three.vercel.app/admin/treinos-video

4. **Verificar console do navegador** para logs de requisições

## Logs e Debugging

Todas as rotas incluem logs detalhados:
- 🔵 Início de requisição
- ✅ Operações bem-sucedidas
- ❌ Erros com detalhes
- 📊 Estatísticas e contagens

Para ver logs em produção, acesse:
- Vercel Dashboard → Seu Projeto → Functions → Logs

## Próximos Passos

Após o deploy, se ainda houver problemas:

1. Verificar logs no Vercel Dashboard
2. Verificar Network tab no DevTools do navegador
3. Confirmar que as variáveis de ambiente estão corretas
4. Verificar políticas RLS no Supabase (se necessário)

## Arquivos Modificados

- ✅ `api/admin/planos-alimentares.js` (criado)
- ✅ `api/admin/treinos-video.js` (criado)
- ✅ `api/fichas-treino/index.js` (atualizado)
- ✅ `vercel.json` (atualizado)
- ✅ `CORRECAO_EXIBICAO_DADOS_SUPABASE.md` (criado)
