# Correção - Atribuição de Fichas de Treino

## Problema Identificado

Erro ao tentar atribuir fichas de treino aos alunos:
```
Error: Could not find the table 'public.fichas_atribuicoes' in the schema cache
Hint: Perhaps you meant the table 'public.fichas_alunos'
```

## Causa Raiz

O código estava usando o nome de tabela **incorreto**:
- ❌ Código usava: `fichas_atribuicoes`
- ✅ Tabela real no banco: `fichas_alunos`

## Correções Aplicadas

### Arquivo: `client/src/hooks/useFichasTreino.ts`

Substituídas todas as referências de `fichas_atribuicoes` para `fichas_alunos`:

1. **useAtribuirFicha()** - Função para atribuir ficha ao aluno
2. **useFichaAtribuicoes()** - Buscar atribuições de uma ficha
3. **useRemoverAtribuicao()** - Remover atribuição
4. **useFichasStats()** - Estatísticas gerais

## Estrutura da Tabela Correta

```sql
CREATE TABLE fichas_alunos (
  id UUID PRIMARY KEY,
  ficha_id UUID REFERENCES fichas_treino(id),
  aluno_id UUID REFERENCES alunos(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT DEFAULT 'ativo', -- ativo, concluido, pausado
  observacoes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Validação no Supabase

Confirmado via MCP que a tabela `fichas_alunos` existe com:
- ✅ Políticas RLS ativas
- ✅ Foreign keys para `fichas_treino` e `alunos`
- ✅ Índices otimizados
- ✅ Triggers de updated_at

## Teste Recomendado

1. Acessar página de Fichas de Treino
2. Selecionar uma ficha
3. Clicar em "Atribuir a Aluno"
4. Selecionar aluno e data de início
5. Confirmar atribuição

Deve funcionar sem erros 404.

## Status

✅ **CORRIGIDO** - Todas as referências atualizadas para usar `fichas_alunos`
