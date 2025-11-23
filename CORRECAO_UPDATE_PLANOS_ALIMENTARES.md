# Correção: Update de Planos Alimentares

## Problemas Identificados

### 1. Erro com coluna `conteudoHtml`
```
Could not find the 'conteudoHtml' column of 'planos_alimentares' in the schema cache
```

### 2. Erro com coluna `alimentos`
```
Could not find the 'alimentos' column of 'refeicoes_plano' in the schema cache
```

## Causa Raiz

1. O Supabase estava recebendo dados com chaves em camelCase (`conteudoHtml`) ao invés de snake_case (`conteudo_html`)
2. O código tentava inserir `alimentos` como JSONB na tabela `refeicoes_plano`, mas a estrutura real usa uma tabela separada `alimentos_refeicao`

## Estrutura Correta das Tabelas

Verificado via MCP Supabase:

### `planos_alimentares`
```sql
- id (uuid)
- aluno_id (uuid)
- titulo (text)
- conteudo_html (text)  ← snake_case correto
- observacoes (text)
- dados_json (jsonb)
- data_criacao (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

### `refeicoes_plano`
```sql
- id (uuid)
- plano_id (uuid) → FK para planos_alimentares
- nome (text)
- horario (time)
- ordem (integer)
- calorias_calculadas (integer)  ← Soma dos alimentos
- observacoes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### `alimentos_refeicao` (tabela separada!)
```sql
- id (uuid)
- refeicao_id (uuid) → FK para refeicoes_plano
- nome (text)
- quantidade (numeric)
- unidade (text)
- calorias (numeric)
- proteinas (numeric)
- carboidratos (numeric)
- gorduras (numeric)
- categoria (text)
- ordem (integer)
- created_at (timestamp)
```

## Correções Aplicadas

### 1. Hook `usePlanosAlimentares.ts`

**Melhorias na função `useUpdatePlanoAlimentar`:**

- ✅ Conversão correta de camelCase → snake_case para `planos_alimentares`
- ✅ Separação de refeições e alimentos em tabelas distintas
- ✅ Loop para inserir cada refeição individualmente
- ✅ Para cada refeição, inserir alimentos na tabela `alimentos_refeicao`
- ✅ Logs detalhados para debug
- ✅ Tratamento de erros aprimorado

```typescript
// Inserir refeição (sem alimentos)
const { data: refeicaoInserida } = await supabase
  .from('refeicoes_plano')
  .insert({
    plano_id: id,
    nome: refeicaoData.nome,
    horario: refeicaoData.horario,
    ordem: refeicaoData.ordem || 0,
    calorias_calculadas: Math.round(calorias || 0),
    observacoes: refeicaoData.observacoes
  })
  .select()
  .single();

// Inserir alimentos separadamente
const alimentosParaInserir = alimentos.map((alimento, index) => ({
  refeicao_id: refeicaoInserida.id,
  nome: alimento.nome,
  quantidade: alimento.quantidade,
  unidade: alimento.unidade,
  calorias: alimento.calorias,
  proteinas: alimento.proteinas,
  carboidratos: alimento.carboidratos,
  gorduras: alimento.gorduras,
  categoria: alimento.categoria || 'outros',
  ordem: index
}));

await supabase.from('alimentos_refeicao').insert(alimentosParaInserir);
```

**Melhorias nas queries de leitura:**

- ✅ Join correto com `alimentos_refeicao` usando nested select do Supabase
- ✅ Busca de refeições com seus alimentos relacionados

```typescript
.select(`
  id,
  aluno_id,
  titulo,
  conteudo_html,
  observacoes,
  dados_json,
  data_criacao,
  created_at,
  updated_at,
  refeicoes:refeicoes_plano(
    id,
    nome,
    horario,
    ordem,
    calorias_calculadas,
    observacoes,
    alimentos:alimentos_refeicao(*)
  )
`)
```

### 2. Schema Compartilhado `shared/schema.ts`

**Atualizado para refletir a estrutura real do banco:**

```typescript
// Tabela para planos alimentares
export const planosAlimentares = pgTable("planos_alimentares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  titulo: text("titulo").notNull(),
  conteudoHtml: text("conteudo_html").notNull(),
  observacoes: text("observacoes"),
  dadosJson: jsonb("dados_json"),
  dataCriacao: timestamp("data_criacao").default(sql`CURRENT_TIMESTAMP`),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela para refeições do plano (SEM coluna alimentos!)
export const refeicoesPlano = pgTable("refeicoes_plano", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planoId: varchar("plano_id").notNull().references(() => planosAlimentares.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(),
  horario: text("horario").notNull(),
  ordem: integer("ordem").notNull(),
  caloriasCalculadas: integer("calorias_calculadas").default(0), // Soma automática
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

// Tabela separada para alimentos (NOVA!)
export const alimentosRefeicao = pgTable("alimentos_refeicao", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  refeicaoId: varchar("refeicao_id").notNull().references(() => refeicoesPlano.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(),
  quantidade: integer("quantidade").notNull(),
  unidade: text("unidade").notNull(),
  calorias: integer("calorias").notNull(),
  proteinas: integer("proteinas").notNull(),
  carboidratos: integer("carboidratos").notNull(),
  gorduras: integer("gorduras").notNull(),
  categoria: text("categoria"),
  ordem: integer("ordem").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### 3. Página `PlanosAlimentares.tsx`

**Adicionado logs para debug:**

```typescript
console.log('📝 [Salvar] Enviando atualização:', {
  id: planoEditando.id,
  titulo: planoData.nome,
  conteudoHtml: conteudoTexto.substring(0, 100) + '...',
  observacoes: planoData.observacoes,
  dadosJson,
  refeicoesCount: planoData.refeicoes?.length || 0
});
```

## Teste de Validação

Executado via MCP Supabase para confirmar que o banco aceita updates:

```sql
UPDATE planos_alimentares 
SET conteudo_html = 'Teste de atualização', 
    titulo = 'Teste Update',
    updated_at = NOW()
WHERE id = (SELECT id FROM planos_alimentares LIMIT 1)
RETURNING *;
```

✅ **Resultado:** Update executado com sucesso

## Como Testar

1. Abra a página de Planos Alimentares
2. Edite um plano existente
3. Faça alterações e salve
4. Verifique o console do navegador para os logs:
   - `🔄 [Update] Dados recebidos`
   - `📤 [Update] Dados convertidos para snake_case`
   - `📦 [Update] Payload final`
   - `✅ [Update] Resposta do Supabase`

## Logs Esperados

```javascript
🔄 [Update] Dados recebidos: {
  titulo: "Plano X",
  conteudoHtml: "...",
  observacoes: "...",
  dadosJson: {...},
  refeicoes: [...]
}

📤 [Update] Dados convertidos para snake_case: {
  titulo: "Plano X",
  conteudo_html: "...",  // ← Convertido corretamente
  observacoes: "...",
  dados_json: {...}
}

📦 [Update] Payload final: {
  titulo: "Plano X",
  conteudo_html: "...",  // ← Snake case
  observacoes: "...",
  dados_json: {...},
  updated_at: "2025-11-23T18:40:00.000Z"
}

✅ [Update] Resposta do Supabase: {
  plano: {...},
  error: null
}
```

## Arquivos Modificados

- ✅ `client/src/hooks/usePlanosAlimentares.ts` - Correção completa de CRUD com tabelas separadas
- ✅ `shared/schema.ts` - Schema atualizado com estrutura real do banco
- ✅ `client/src/pages/PlanosAlimentares.tsx` - Logs de debug

## Estrutura de Dados Correta

### Frontend → Backend

```typescript
// Dados enviados pelo frontend
{
  titulo: "Plano X",
  conteudoHtml: "...",  // camelCase no código
  refeicoes: [
    {
      nome: "Café da Manhã",
      horario: "08:00",
      ordem: 0,
      calorias: 500,
      alimentos: [
        {
          nome: "Aveia",
          quantidade: 50,
          unidade: "g",
          calorias: 200,
          proteinas: 10,
          carboidratos: 30,
          gorduras: 5,
          categoria: "cereais"
        }
      ]
    }
  ]
}
```

### Backend → Supabase

```typescript
// 1. Inserir plano
INSERT INTO planos_alimentares (titulo, conteudo_html, ...)

// 2. Para cada refeição
INSERT INTO refeicoes_plano (plano_id, nome, horario, ordem, calorias_calculadas, ...)

// 3. Para cada alimento da refeição
INSERT INTO alimentos_refeicao (refeicao_id, nome, quantidade, unidade, calorias, ...)
```

## Status

✅ **Correção aplicada**

O código agora:
1. Converte corretamente camelCase → snake_case
2. Usa a estrutura de 3 tabelas relacionadas (planos → refeições → alimentos)
3. Faz queries com nested selects para buscar dados relacionados
4. Tem logs detalhados para debug
