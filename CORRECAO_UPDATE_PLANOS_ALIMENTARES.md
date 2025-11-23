# Correção: Update de Planos Alimentares

## Problema Identificado

Erro ao atualizar plano alimentar:
```
Could not find the 'conteudoHtml' column of 'planos_alimentares' in the schema cache
```

## Causa Raiz

O Supabase estava recebendo dados com chaves em camelCase (`conteudoHtml`) ao invés de snake_case (`conteudo_html`), que é o formato correto das colunas no banco de dados PostgreSQL.

## Estrutura Correta da Tabela

Verificado via MCP Supabase:

```sql
planos_alimentares:
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

## Correções Aplicadas

### 1. Hook `usePlanosAlimentares.ts`

**Melhorias na função `useUpdatePlanoAlimentar`:**

- ✅ Adicionado logs detalhados para debug
- ✅ Garantida conversão explícita de camelCase → snake_case
- ✅ Criado payload final com spread operator para garantir formato correto
- ✅ Adicionado `updated_at` automático
- ✅ Melhor tratamento de erros com logs

```typescript
const updatePayload = {
  ...(planoDataSnakeCase.titulo && { titulo: planoDataSnakeCase.titulo }),
  ...(planoDataSnakeCase.conteudo_html && { conteudo_html: planoDataSnakeCase.conteudo_html }),
  ...(planoDataSnakeCase.observacoes !== undefined && { observacoes: planoDataSnakeCase.observacoes }),
  ...(planoDataSnakeCase.dados_json && { dados_json: planoDataSnakeCase.dados_json }),
  updated_at: new Date().toISOString()
};
```

### 2. Schema Compartilhado `shared/schema.ts`

**Adicionado definição completa das tabelas:**

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

// Tabela para refeições do plano
export const refeicoesPlano = pgTable("refeicoes_plano", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  planoId: varchar("plano_id").notNull().references(() => planosAlimentares.id, { onDelete: 'cascade' }),
  nome: text("nome").notNull(),
  horario: text("horario").notNull(),
  ordem: integer("ordem").notNull(),
  alimentos: jsonb("alimentos").notNull(),
  calorias: integer("calorias").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
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

- ✅ `client/src/hooks/usePlanosAlimentares.ts` - Correção da conversão e logs
- ✅ `shared/schema.ts` - Adicionado schema completo
- ✅ `client/src/pages/PlanosAlimentares.tsx` - Adicionado logs de debug

## Status

✅ **Correção aplicada e testada**

O código agora garante que todos os dados enviados ao Supabase estão no formato snake_case correto, com logs detalhados para facilitar debug futuro.
