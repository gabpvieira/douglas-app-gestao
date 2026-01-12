# Solução: Sistema de Backup Imutável de Progresso de Treinos

## 📋 Problema Identificado

O sistema de progresso do aluno dependia diretamente da tabela `treinos_realizados`, que está vinculada a `fichas_alunos` com `ON DELETE CASCADE`. Isso causava:

- ❌ Perda de histórico quando fichas eram removidas
- ❌ Perda de progresso quando fichas eram alteradas
- ❌ Quebra de métricas semanais e mensais
- ❌ Calendário de progresso inconsistente

## ✅ Solução Implementada

### 1. Nova Tabela: `workout_progress_backup`

Tabela imutável que serve como **fonte única da verdade** para histórico de treinos.

#### Estrutura:
```sql
CREATE TABLE workout_progress_backup (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES alunos(id),
  workout_date DATE NOT NULL,
  workout_snapshot JSONB NOT NULL,
  total_exercises INTEGER NOT NULL DEFAULT 0,
  completed_exercises INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER,
  source_workout_id UUID,
  source_ficha_aluno_id UUID,
  locked BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### Características:

- **Imutabilidade**: Campo `locked = true` impede alterações
- **Snapshot JSONB**: Cópia completa do treino no momento da execução
- **Independência**: Não depende de foreign keys para fichas (apenas referência histórica)
- **Unicidade**: Um registro por aluno por dia (índice único)

### 2. Índices para Performance

```sql
-- Busca por aluno e data
CREATE INDEX idx_workout_progress_user_date 
ON workout_progress_backup(user_id, workout_date DESC);

-- Queries mensais otimizadas
CREATE INDEX idx_workout_progress_user_month 
ON workout_progress_backup(user_id, EXTRACT(YEAR FROM workout_date), EXTRACT(MONTH FROM workout_date));

-- Busca no snapshot JSONB
CREATE INDEX idx_workout_progress_snapshot 
ON workout_progress_backup USING GIN (workout_snapshot);
```

### 3. Políticas de Segurança (RLS)

```sql
-- Alunos veem apenas seu progresso
CREATE POLICY "Alunos podem ver seu próprio progresso"
ON workout_progress_backup FOR SELECT
USING (user_id IN (SELECT id FROM alunos WHERE ...));

-- Impedir deleções (histórico imutável)
CREATE POLICY "Progresso não pode ser deletado"
ON workout_progress_backup FOR DELETE
USING (false);

-- Impedir alterações se locked = true
CREATE POLICY "Progresso bloqueado não pode ser alterado"
ON workout_progress_backup FOR UPDATE
USING (locked = false);
```

### 4. Trigger Automático

Criado trigger que automaticamente cria snapshot quando um treino é registrado:

```sql
CREATE TRIGGER trigger_auto_create_workout_snapshot
AFTER INSERT ON treinos_realizados
FOR EACH ROW
EXECUTE FUNCTION auto_create_workout_snapshot();
```

**Fluxo:**
1. Aluno marca exercícios como concluídos
2. Sistema insere em `treinos_realizados`
3. Trigger captura inserção
4. Cria snapshot completo em `workout_progress_backup`
5. Snapshot fica bloqueado (`locked = true`)

### 5. Funções Auxiliares

#### `create_workout_snapshot()`
Cria snapshot manualmente (para migrações ou correções):
```sql
SELECT create_workout_snapshot(
  p_user_id := 'uuid-do-aluno',
  p_workout_date := '2025-01-12',
  p_ficha_aluno_id := 'uuid-da-ficha',
  p_exercicios_realizados := '{"exercicios": [...]}'::jsonb
);
```

#### `get_monthly_workout_progress()`
Busca progresso de um mês específico:
```sql
SELECT * FROM get_monthly_workout_progress(
  'uuid-do-aluno',
  2025,
  1
);
```

#### `get_workout_stats()`
Estatísticas agregadas de um período:
```sql
SELECT * FROM get_workout_stats(
  'uuid-do-aluno',
  '2025-01-01',
  '2025-01-31'
);
```

## 🔄 Migração de Dados Históricos

A migration `migrate_historical_workout_data` populou automaticamente a nova tabela com todos os dados históricos existentes em `treinos_realizados`.

**Resultado:**
- ✅ Todo histórico preservado
- ✅ Snapshots criados retroativamente
- ✅ Métricas recalculadas corretamente

## 💻 Implementação Frontend

### Hook: `useWorkoutProgress.ts`

Criado hook especializado para acessar a nova tabela:

```typescript
// Buscar dias treinados no mês (para calendário)
const { data: diasTreinados } = useMonthlyTrainingDays(alunoId, ano, mes);

// Buscar progresso completo do mês
const { data: progressoMensal } = useMonthlyWorkoutProgress(alunoId, ano, mes);

// Estatísticas de período
const { data: stats } = useWorkoutStats(alunoId, dataInicio, dataFim);

// Progresso de data específica
const { data: progressoDia } = useWorkoutProgressByDate(alunoId, data);
```

### Componente Atualizado: `MonthlyTrainingCalendar.tsx`

Substituída lógica antiga que buscava de `treinos_realizados` para usar `workout_progress_backup`:

**Antes:**
```typescript
// Buscava fichas_alunos → treinos_realizados
const { data: fichasAluno } = await supabase.from("fichas_alunos")...
const { data: treinos } = await supabase.from("treinos_realizados")...
```

**Depois:**
```typescript
// Busca diretamente da fonte única da verdade
const { data: diasTreinados } = useMonthlyTrainingDays(alunoId, ano, mes);
```

## 🎯 Benefícios da Solução

### 1. Imutabilidade Garantida
- ✅ Histórico nunca é perdido
- ✅ Alterações administrativas não afetam progresso passado
- ✅ Auditoria completa de treinos realizados

### 2. Performance Otimizada
- ✅ Índices especializados para queries mensais
- ✅ Métricas pré-calculadas (total_exercises, completed_exercises)
- ✅ Sem JOINs complexos para buscar progresso

### 3. Independência de Fichas
- ✅ Progresso existe independente da ficha original
- ✅ Fichas podem ser removidas sem afetar histórico
- ✅ Alterações em fichas não quebram métricas

### 4. Snapshot Completo
- ✅ Registro exato do que foi feito no dia
- ✅ Inclui exercícios, séries, cargas, observações
- ✅ Permite análise detalhada retroativa

### 5. Escalabilidade
- ✅ Um registro por dia por aluno (não cresce descontroladamente)
- ✅ JSONB permite flexibilidade sem alterar schema
- ✅ Índices GIN para queries eficientes no snapshot

## 🔒 Garantias de Segurança

### Imutabilidade
- Campo `locked = true` por padrão
- Política RLS impede UPDATE se locked
- Política RLS impede DELETE completamente

### Privacidade
- RLS garante que alunos vejam apenas seu progresso
- Queries filtradas automaticamente por `user_id`

### Integridade
- Índice único por `(user_id, workout_date)`
- Impede duplicatas
- UPSERT atualiza apenas se `locked = false`

## 📊 Estrutura do Snapshot JSONB

```json
{
  "ficha_id": "uuid-da-ficha",
  "ficha_nome": "Treino A - Peito e Tríceps",
  "exercicios": [
    {
      "exercicio_id": "uuid",
      "nome": "Supino Reto",
      "grupo_muscular": "Peito",
      "series": 4,
      "repeticoes": "8-12",
      "descanso": 90,
      "ordem": 1,
      "concluido": true,
      "series_realizadas": [
        {
          "numero_serie": 1,
          "carga": "80",
          "repeticoes": 12,
          "concluida": true
        },
        {
          "numero_serie": 2,
          "carga": "80",
          "repeticoes": 10,
          "concluida": true
        }
      ]
    }
  ]
}
```

## 🧪 Validação da Solução

### Checklist de Testes

- [x] Progresso não depende mais da ficha ativa
- [x] Histórico é imutável
- [x] Alterações administrativas não quebram métricas
- [x] Calendário reflete corretamente dias treinados
- [x] Sistema preparado para crescimento
- [x] Dados históricos migrados com sucesso
- [x] Trigger automático funcionando
- [x] Frontend atualizado e testado

### Cenários Testados

1. **Remoção de Ficha**: Progresso permanece intacto ✅
2. **Alteração de Ficha**: Histórico não é afetado ✅
3. **Múltiplos Treinos no Dia**: Consolidado por data ✅
4. **Navegação Mensal**: Performance otimizada ✅
5. **Estatísticas**: Cálculos corretos ✅

## 🚀 Próximos Passos (Opcional)

### Melhorias Futuras

1. **Dashboard de Progresso**
   - Gráficos de evolução semanal/mensal
   - Comparação de períodos
   - Análise de consistência

2. **Exportação de Dados**
   - PDF com histórico completo
   - CSV para análise externa
   - Relatórios personalizados

3. **Gamificação**
   - Badges por sequências (streaks)
   - Metas de frequência
   - Ranking de consistência

4. **Análise Avançada**
   - Padrões de treino
   - Dias mais produtivos
   - Correlação com resultados

## 📝 Manutenção

### Backup e Restore

A tabela `workout_progress_backup` deve ser incluída em:
- ✅ Backups regulares do banco
- ✅ Planos de disaster recovery
- ✅ Testes de restore

### Monitoramento

Queries úteis para monitoramento:

```sql
-- Total de registros por aluno
SELECT user_id, COUNT(*) as total_dias
FROM workout_progress_backup
GROUP BY user_id
ORDER BY total_dias DESC;

-- Registros bloqueados vs desbloqueados
SELECT locked, COUNT(*) 
FROM workout_progress_backup 
GROUP BY locked;

-- Tamanho médio dos snapshots
SELECT AVG(pg_column_size(workout_snapshot)) as avg_size_bytes
FROM workout_progress_backup;
```

## 🎓 Lições Aprendidas

1. **Imutabilidade é Fundamental**: Histórico de usuário nunca deve depender de entidades mutáveis
2. **Snapshots > Foreign Keys**: Para dados históricos, copiar é melhor que referenciar
3. **Triggers Automáticos**: Reduzem erros humanos e garantem consistência
4. **RLS é Poderoso**: Segurança no nível do banco é mais confiável
5. **JSONB é Flexível**: Permite evolução do schema sem migrations complexas

---

**Autor**: Sistema de Backup de Progresso  
**Data**: 2025-01-12  
**Status**: ✅ Implementado e Testado  
**Versão**: 1.0
