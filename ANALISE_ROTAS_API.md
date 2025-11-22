# Análise de Rotas API - Problema e Solução

## Problema Identificado

Algumas páginas não mostram dados porque os hooks do frontend estão fazendo chamadas para rotas que não existem nas funções serverless da Vercel.

### Comparação com ZapCorte

O projeto ZapCorte usa:
- Funções serverless simples em `/api/*.js`
- Cada função é independente
- Frontend faz chamadas diretas para `/api/endpoint`
- Usa apenas Supabase client-side (sem backend API para dados)

### Projeto Atual (Douglas App)

Temos dois padrões misturados:

**1. Hooks que usam Supabase diretamente (FUNCIONAM):**
- `useAlunos.ts` - Usa `supabase.from('alunos')`
- `useFichasTreino.ts` - Usa `supabase.from('fichas_treino')`
- `useTreinosVideo.ts` - Usa `supabase.from('treinos_video')`

**2. Hooks que usam API routes (NÃO FUNCIONAM):**
- `useEvolucao.ts` - Chama `/api/aluno/evolucao`
- `usePagamentos.ts` - Chama `/api/admin/pagamentos`
- `useFotosProgresso.ts` - Chama `/api/aluno/fotos-progresso`
- `useAssinaturas.ts` - Chama `/api/admin/assinaturas`
- `useAgenda.ts` - Chama `/api/admin/agenda`

## Rotas Disponíveis vs Rotas Chamadas

### Funções Serverless Existentes:
```
api/
├── admin/
│   ├── agendamentos.ts
│   ├── blocos-horarios.ts
│   ├── pagamentos.ts
│   └── students.ts
├── data/index.ts (consolidada)
├── fichas-treino/
│   ├── index.ts
│   └── [id].ts
├── planos-alimentares/index.ts
├── treinos-pdf/index.ts
└── treinos-video.ts
```

### Rotas Chamadas pelos Hooks:
```
❌ /api/aluno/evolucao
❌ /api/aluno/evolucao/stats
❌ /api/aluno/fotos-progresso
❌ /api/admin/pagamentos
❌ /api/admin/assinaturas
❌ /api/admin/agenda
✅ /api/admin/students
✅ /api/fichas-treino
✅ /api/treinos-video
```

## Solução

### Opção 1: Migrar hooks para Supabase (RECOMENDADO)
Seguir o padrão do ZapCorte e `useAlunos.ts`:
- Remover chamadas de API
- Usar Supabase client diretamente
- Mais simples e direto
- Menos funções serverless (dentro do limite)

### Opção 2: Criar rotas faltantes
Criar funções serverless para cada rota:
- Mais complexo
- Pode exceder limite de 12 funções
- Duplica lógica (Supabase já faz isso)

## Recomendação

**Migrar todos os hooks para usar Supabase diretamente**, seguindo o padrão:
1. `useAlunos.ts` (já implementado)
2. `useFichasTreino.ts` (já implementado)
3. Migrar: `useEvolucao.ts`
4. Migrar: `usePagamentos.ts`
5. Migrar: `useFotosProgresso.ts`
6. Migrar: `useAssinaturas.ts`
7. Migrar: `useAgenda.ts`
8. Migrar: `usePlanosAlimentares.ts`

Manter funções serverless apenas para:
- Upload de arquivos
- Processamento complexo
- Integrações externas
- Webhooks
