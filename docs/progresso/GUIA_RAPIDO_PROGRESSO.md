# Guia Rápido: Sistema de Progresso de Treinos

## 🎯 Para Desenvolvedores

### Como Usar no Frontend

#### 1. Buscar Dias Treinados (Calendário)

```typescript
import { useMonthlyTrainingDays } from '@/hooks/useWorkoutProgress';

function MeuComponente() {
  const alunoId = "uuid-do-aluno";
  const ano = 2025;
  const mes = 1; // Janeiro (1-12)
  
  const { data: diasTreinados, isLoading } = useMonthlyTrainingDays(
    alunoId,
    ano,
    mes
  );
  
  // diasTreinados é um Set<number> com os dias do mês
  // Exemplo: Set(5) { 1, 5, 10, 15, 20 }
  
  return (
    <div>
      {Array.from(diasTreinados).map(dia => (
        <div key={dia}>Treinou no dia {dia}</div>
      ))}
    </div>
  );
}
```

#### 2. Buscar Progresso Completo do Mês

```typescript
import { useMonthlyWorkoutProgress } from '@/hooks/useWorkoutProgress';

function ProgressoMensal() {
  const { data: progresso } = useMonthlyWorkoutProgress(alunoId, 2025, 1);
  
  return (
    <div>
      {progresso?.map(dia => (
        <div key={dia.id}>
          <h3>{dia.workoutDate}</h3>
          <p>Exercícios: {dia.completedExercises}/{dia.totalExercises}</p>
          <pre>{JSON.stringify(dia.workoutSnapshot, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}
```

#### 3. Buscar Estatísticas de Período

```typescript
import { useWorkoutStats } from '@/hooks/useWorkoutProgress';

function Estatisticas() {
  const inicio = new Date(2025, 0, 1); // 1 de janeiro
  const fim = new Date(2025, 0, 31);   // 31 de janeiro
  
  const { data: stats } = useWorkoutStats(alunoId, inicio, fim);
  
  return (
    <div>
      <p>Dias treinados: {stats?.totalWorkoutDays}</p>
      <p>Total de exercícios: {stats?.totalExercises}</p>
      <p>Exercícios concluídos: {stats?.totalCompletedExercises}</p>
      <p>Taxa de conclusão: {stats?.completionRate}%</p>
    </div>
  );
}
```

#### 4. Buscar Progresso de Data Específica

```typescript
import { useWorkoutProgressByDate } from '@/hooks/useWorkoutProgress';

function ProgressoDoDia() {
  const data = new Date(2025, 0, 12); // 12 de janeiro
  
  const { data: progresso } = useWorkoutProgressByDate(alunoId, data);
  
  if (!progresso) {
    return <p>Não treinou neste dia</p>;
  }
  
  return (
    <div>
      <h3>Treino de {progresso.workoutDate}</h3>
      <p>Ficha: {progresso.workoutSnapshot.ficha_nome}</p>
      <ul>
        {progresso.workoutSnapshot.exercicios.map(ex => (
          <li key={ex.exercicio_id}>
            {ex.nome} - {ex.series}x{ex.repeticoes}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Como Funciona o Snapshot Automático

Quando um aluno registra um treino:

```typescript
// 1. Aluno marca exercícios como concluídos
await supabase.from('treinos_realizados').insert({
  ficha_aluno_id: 'uuid',
  exercicio_id: 'uuid',
  data_realizacao: new Date(),
  series_realizadas: 4
});

// 2. Trigger automático cria snapshot em workout_progress_backup
// 3. Snapshot fica bloqueado (locked = true)
// 4. Progresso está salvo permanentemente
```

**Você não precisa fazer nada!** O trigger cuida de tudo automaticamente.

## 🔧 Para Administradores

### Queries Úteis

#### Ver Progresso de um Aluno

```sql
SELECT 
  workout_date,
  total_exercises,
  completed_exercises,
  workout_snapshot->>'ficha_nome' as ficha
FROM workout_progress_backup
WHERE user_id = 'uuid-do-aluno'
ORDER BY workout_date DESC
LIMIT 30;
```

#### Estatísticas Gerais

```sql
SELECT 
  COUNT(DISTINCT user_id) as total_alunos,
  COUNT(*) as total_dias_treinados,
  SUM(total_exercises) as total_exercicios,
  SUM(completed_exercises) as total_concluidos,
  ROUND(AVG(completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as taxa_conclusao_media
FROM workout_progress_backup;
```

#### Alunos Mais Consistentes

```sql
SELECT 
  a.id,
  up.nome,
  COUNT(DISTINCT wpb.workout_date) as dias_treinados,
  MIN(wpb.workout_date) as primeiro_treino,
  MAX(wpb.workout_date) as ultimo_treino
FROM workout_progress_backup wpb
INNER JOIN alunos a ON wpb.user_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
GROUP BY a.id, up.nome
ORDER BY dias_treinados DESC
LIMIT 10;
```

### Criar Snapshot Manualmente (Correção)

Se precisar criar um snapshot manualmente:

```sql
SELECT create_workout_snapshot(
  p_user_id := 'uuid-do-aluno'::uuid,
  p_workout_date := '2025-01-12'::date,
  p_ficha_aluno_id := 'uuid-da-ficha-aluno'::uuid,
  p_exercicios_realizados := '{
    "ficha_id": "uuid",
    "ficha_nome": "Treino A",
    "exercicios": [
      {
        "exercicio_id": "uuid",
        "nome": "Supino",
        "grupo_muscular": "Peito",
        "series": 4,
        "repeticoes": "10",
        "descanso": 90,
        "ordem": 1,
        "concluido": true
      }
    ]
  }'::jsonb
);
```

### Desbloquear Registro (Emergência)

⚠️ **Use com cuidado!** Isso permite editar um registro histórico.

```sql
-- Desbloquear
UPDATE workout_progress_backup
SET locked = false
WHERE id = 'uuid-do-registro';

-- Fazer alteração necessária
UPDATE workout_progress_backup
SET workout_snapshot = '...'::jsonb
WHERE id = 'uuid-do-registro';

-- Bloquear novamente
UPDATE workout_progress_backup
SET locked = true
WHERE id = 'uuid-do-registro';
```

## 🚨 Troubleshooting

### Problema: Calendário não mostra dias treinados

**Causa**: Dados não foram migrados ou trigger não está funcionando

**Solução**:
```sql
-- Verificar se há dados
SELECT COUNT(*) FROM workout_progress_backup WHERE user_id = 'uuid-do-aluno';

-- Verificar se trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_create_workout_snapshot';

-- Re-executar migration se necessário
-- (ver arquivo: migrate_historical_workout_data.sql)
```

### Problema: Snapshot não está sendo criado automaticamente

**Causa**: Trigger pode estar desabilitado

**Solução**:
```sql
-- Verificar status do trigger
SELECT tgenabled FROM pg_trigger 
WHERE tgname = 'trigger_auto_create_workout_snapshot';

-- Recriar trigger se necessário
DROP TRIGGER IF EXISTS trigger_auto_create_workout_snapshot ON treinos_realizados;
CREATE TRIGGER trigger_auto_create_workout_snapshot
AFTER INSERT ON treinos_realizados
FOR EACH ROW
EXECUTE FUNCTION auto_create_workout_snapshot();
```

### Problema: Performance lenta em queries mensais

**Causa**: Índices podem estar faltando

**Solução**:
```sql
-- Verificar índices
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'workout_progress_backup';

-- Recriar índices se necessário
CREATE INDEX IF NOT EXISTS idx_workout_progress_user_date 
ON workout_progress_backup(user_id, workout_date DESC);

CREATE INDEX IF NOT EXISTS idx_workout_progress_user_month 
ON workout_progress_backup(user_id, EXTRACT(YEAR FROM workout_date), EXTRACT(MONTH FROM workout_date));
```

## 📊 Monitoramento

### Dashboard de Saúde do Sistema

```sql
-- Registros por mês
SELECT 
  TO_CHAR(workout_date, 'YYYY-MM') as mes,
  COUNT(*) as total_registros,
  COUNT(DISTINCT user_id) as alunos_ativos
FROM workout_progress_backup
GROUP BY TO_CHAR(workout_date, 'YYYY-MM')
ORDER BY mes DESC;

-- Tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('workout_progress_backup')) as tamanho_total,
  pg_size_pretty(pg_relation_size('workout_progress_backup')) as tamanho_dados,
  pg_size_pretty(pg_indexes_size('workout_progress_backup')) as tamanho_indices;

-- Registros bloqueados vs desbloqueados
SELECT 
  locked,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM workout_progress_backup
GROUP BY locked;
```

## 🎓 Boas Práticas

### ✅ Fazer

- Usar hooks `useWorkoutProgress` para buscar dados
- Confiar no trigger automático para criar snapshots
- Manter registros bloqueados (`locked = true`)
- Fazer backup regular da tabela
- Monitorar tamanho e performance

### ❌ Não Fazer

- Não deletar registros de `workout_progress_backup`
- Não alterar registros bloqueados sem motivo
- Não criar snapshots manualmente (deixar o trigger fazer)
- Não usar `treinos_realizados` para calcular progresso
- Não depender de `fichas_alunos` para histórico

## 📞 Suporte

Se encontrar problemas:

1. Verificar logs do Supabase
2. Executar queries de troubleshooting acima
3. Verificar políticas RLS
4. Consultar documentação completa em `SOLUCAO_BACKUP_PROGRESSO.md`

---

**Última atualização**: 2025-01-12  
**Versão**: 1.0
