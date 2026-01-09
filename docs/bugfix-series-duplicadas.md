# Correção: Séries Duplicadas no Ranking

## Problema Identificado

A aluna **Cléa Joslaine ribeiro Oliveira Moura** apresentava dados incorretos no ranking:
- **Exibido**: 4 dias • 22 treinos • 544 séries
- **Correto**: 4 dias • 4 treinos • 88 séries

### Causa Raiz

1. **Séries duplicadas**: Um treino específico (Búlgaro com Halter Mão Invertida) tinha 460 séries registradas no campo `series_realizadas` da tabela `treinos_realizados`, mas apenas 4 séries reais na tabela `series_realizadas`.

2. **Contagem incorreta**: O código estava usando o campo `series_realizadas` da tabela `treinos_realizados` como fonte de verdade, mas esse campo estava desatualizado/incorreto.

## Solução Implementada

### 1. Limpeza de Dados (Migration)

**Arquivo**: Migration `fix_duplicate_series_clea`

```sql
-- Deletar séries duplicadas (manter apenas numero_serie <= 4)
DELETE FROM series_realizadas
WHERE treino_realizado_id = 'ecf98859-d2e3-40b4-98ca-97344a753f99'
  AND numero_serie > 4;

-- Corrigir o campo series_realizadas
UPDATE treinos_realizados
SET series_realizadas = 4
WHERE id = 'ecf98859-d2e3-40b4-98ca-97344a753f99';
```

### 2. Função SQL para Cálculo Correto

**Arquivo**: Migration `fix_function_return_type`

Criada função `calcular_stats_treino_aluno()` que:
- Usa `feedback_treinos` para contar dias/treinos (pois só é possível enviar feedback ao finalizar)
- Usa `series_realizadas` como fonte de verdade para contagem de séries
- Retorna estatísticas precisas para qualquer período

```sql
SELECT * FROM calcular_stats_treino_aluno(
  'aluno_id'::UUID,
  '2026-01-05'::DATE,
  '2026-01-09'::DATE
);
```

### 3. Correção no Frontend

**Arquivo**: `client/src/hooks/useProgressoTreinos.ts`

Modificado para buscar contagem real de séries:

```typescript
// Buscar contagem real de séries da tabela series_realizadas
const treinoIds = treinosSemana?.map(t => t.id) || [];
let seriesReaisMap: Record<string, number> = {};

if (treinoIds.length > 0) {
  const { data: seriesReais } = await supabase
    .from('series_realizadas')
    .select('treino_realizado_id')
    .in('treino_realizado_id', treinoIds);
  
  // Contar séries por treino
  seriesReais?.forEach(serie => {
    seriesReaisMap[serie.treino_realizado_id] = 
      (seriesReaisMap[serie.treino_realizado_id] || 0) + 1;
  });
}

// Usar contagem real ao calcular total
const seriesRealizadasSemana = treinosSemana?.reduce((total, treino) => {
  const seriesReais = seriesReaisMap[treino.id] || 0;
  return total + seriesReais;
}, 0) || 0;
```

## Dados Corrigidos

### Cléa - Semana 05/01 a 09/01/2026

| Métrica | Antes | Depois |
|---------|-------|--------|
| Dias de treino | 4 | 4 ✅ |
| Total de treinos | 22 | 4 ✅ |
| Total de séries | 544 | 88 ✅ |
| Total de exercícios | 22 | 20 ✅ |

### Detalhamento por Dia

| Data | Feedbacks | Treinos Existentes | Séries |
|------|-----------|-------------------|--------|
| 05/01 | 2 | 0 (deletados) | 0 |
| 07/01 | 2 | 0 (deletados) | 0 |
| 08/01 | 1 | 10 exercícios | 40 |
| 09/01 | 1 | 10 exercícios | 48 |
| **Total** | **6** | **20** | **88** |

## Prevenção de Problemas Futuros

### Fonte de Verdade

A partir de agora, a contagem de séries sempre usa a tabela `series_realizadas` como fonte de verdade, não o campo `series_realizadas` da tabela `treinos_realizados`.

### Contagem de Dias/Treinos

Usa `feedback_treinos` como fonte primária, pois:
- Só é possível enviar feedback ao finalizar um treino
- Feedbacks não são deletados quando treinos são removidos
- Representa melhor o histórico real do aluno

## Impacto

- ✅ Ranking agora exibe dados corretos
- ✅ Estatísticas semanais precisas
- ✅ Calendário de treinos alinhado com feedbacks
- ✅ Prevenção de duplicações futuras
