-- ============================================
-- QUERIES ÚTEIS - SISTEMA DE PROGRESSO
-- ============================================

-- ============================================
-- 1. CONSULTAS BÁSICAS
-- ============================================

-- Ver progresso de um aluno específico (últimos 30 dias)
SELECT 
  workout_date,
  total_exercises,
  completed_exercises,
  ROUND((completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as completion_rate,
  workout_snapshot->>'ficha_nome' as ficha_nome,
  locked
FROM workout_progress_backup
WHERE user_id = 'UUID_DO_ALUNO'
ORDER BY workout_date DESC
LIMIT 30;

-- Ver snapshot completo de um dia específico
SELECT 
  workout_date,
  workout_snapshot
FROM workout_progress_backup
WHERE user_id = 'UUID_DO_ALUNO'
  AND workout_date = '2025-01-12';

-- Contar dias treinados por aluno
SELECT 
  a.id,
  up.nome,
  COUNT(DISTINCT wpb.workout_date) as dias_treinados
FROM alunos a
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN workout_progress_backup wpb ON wpb.user_id = a.id
GROUP BY a.id, up.nome
ORDER BY dias_treinados DESC;

-- ============================================
-- 2. ESTATÍSTICAS GERAIS
-- ============================================

-- Estatísticas globais do sistema
SELECT 
  COUNT(DISTINCT user_id) as total_alunos_ativos,
  COUNT(*) as total_dias_treinados,
  SUM(total_exercises) as total_exercicios_realizados,
  SUM(completed_exercises) as total_exercicios_concluidos,
  ROUND(AVG(completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as taxa_conclusao_media,
  MIN(workout_date) as primeiro_treino_registrado,
  MAX(workout_date) as ultimo_treino_registrado
FROM workout_progress_backup;

-- Top 10 alunos mais consistentes (mais dias treinados)
SELECT 
  a.id,
  up.nome,
  up.email,
  COUNT(DISTINCT wpb.workout_date) as dias_treinados,
  MIN(wpb.workout_date) as primeiro_treino,
  MAX(wpb.workout_date) as ultimo_treino,
  ROUND(AVG(wpb.completed_exercises::numeric / NULLIF(wpb.total_exercises, 0) * 100), 2) as taxa_conclusao_media
FROM workout_progress_backup wpb
INNER JOIN alunos a ON wpb.user_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
GROUP BY a.id, up.nome, up.email
ORDER BY dias_treinados DESC
LIMIT 10;

-- Alunos que não treinam há mais de 7 dias
SELECT 
  a.id,
  up.nome,
  up.email,
  MAX(wpb.workout_date) as ultimo_treino,
  CURRENT_DATE - MAX(wpb.workout_date) as dias_sem_treinar
FROM alunos a
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN workout_progress_backup wpb ON wpb.user_id = a.id
GROUP BY a.id, up.nome, up.email
HAVING MAX(wpb.workout_date) < CURRENT_DATE - INTERVAL '7 days'
  OR MAX(wpb.workout_date) IS NULL
ORDER BY dias_sem_treinar DESC NULLS FIRST;

-- ============================================
-- 3. ANÁLISE TEMPORAL
-- ============================================

-- Treinos por mês (últimos 12 meses)
SELECT 
  TO_CHAR(workout_date, 'YYYY-MM') as mes,
  COUNT(*) as total_treinos,
  COUNT(DISTINCT user_id) as alunos_ativos,
  SUM(total_exercises) as total_exercicios,
  SUM(completed_exercises) as total_concluidos,
  ROUND(AVG(completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as taxa_conclusao
FROM workout_progress_backup
WHERE workout_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY TO_CHAR(workout_date, 'YYYY-MM')
ORDER BY mes DESC;

-- Treinos por dia da semana (padrão de comportamento)
SELECT 
  TO_CHAR(workout_date, 'Day') as dia_semana,
  EXTRACT(DOW FROM workout_date) as dia_numero,
  COUNT(*) as total_treinos,
  COUNT(DISTINCT user_id) as alunos_unicos,
  ROUND(AVG(completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as taxa_conclusao_media
FROM workout_progress_backup
WHERE workout_date >= CURRENT_DATE - INTERVAL '3 months'
GROUP BY TO_CHAR(workout_date, 'Day'), EXTRACT(DOW FROM workout_date)
ORDER BY dia_numero;

-- Progresso mensal de um aluno específico
SELECT 
  TO_CHAR(workout_date, 'YYYY-MM') as mes,
  COUNT(*) as dias_treinados,
  SUM(total_exercises) as total_exercicios,
  SUM(completed_exercises) as total_concluidos,
  ROUND(AVG(completed_exercises::numeric / NULLIF(total_exercises, 0) * 100), 2) as taxa_conclusao
FROM workout_progress_backup
WHERE user_id = 'UUID_DO_ALUNO'
GROUP BY TO_CHAR(workout_date, 'YYYY-MM')
ORDER BY mes DESC;

-- ============================================
-- 4. ANÁLISE DE PERFORMANCE
-- ============================================

-- Tamanho da tabela e índices
SELECT 
  pg_size_pretty(pg_total_relation_size('workout_progress_backup')) as tamanho_total,
  pg_size_pretty(pg_relation_size('workout_progress_backup')) as tamanho_dados,
  pg_size_pretty(pg_indexes_size('workout_progress_backup')) as tamanho_indices,
  (SELECT COUNT(*) FROM workout_progress_backup) as total_registros,
  pg_size_pretty(pg_total_relation_size('workout_progress_backup')::bigint / NULLIF((SELECT COUNT(*) FROM workout_progress_backup), 0)) as tamanho_medio_registro;

-- Verificar uso dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as vezes_usado,
  idx_tup_read as tuplas_lidas,
  idx_tup_fetch as tuplas_retornadas
FROM pg_stat_user_indexes
WHERE tablename = 'workout_progress_backup'
ORDER BY idx_scan DESC;

-- Registros bloqueados vs desbloqueados
SELECT 
  locked,
  COUNT(*) as total,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual,
  pg_size_pretty(SUM(pg_column_size(workout_snapshot))) as tamanho_snapshots
FROM workout_progress_backup
GROUP BY locked;

-- ============================================
-- 5. VALIDAÇÃO DE DADOS
-- ============================================

-- Verificar integridade: alunos sem progresso
SELECT 
  a.id,
  up.nome,
  up.email,
  a.status
FROM alunos a
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN workout_progress_backup wpb ON wpb.user_id = a.id
WHERE wpb.id IS NULL
  AND a.status = 'ativo';

-- Verificar snapshots com dados inválidos
SELECT 
  id,
  user_id,
  workout_date,
  total_exercises,
  completed_exercises
FROM workout_progress_backup
WHERE total_exercises = 0
   OR completed_exercises > total_exercises
   OR workout_snapshot IS NULL
   OR workout_snapshot = '{}'::jsonb;

-- Verificar duplicatas (não deveria existir)
SELECT 
  user_id,
  workout_date,
  COUNT(*) as duplicatas
FROM workout_progress_backup
GROUP BY user_id, workout_date
HAVING COUNT(*) > 1;

-- ============================================
-- 6. MANUTENÇÃO
-- ============================================

-- Reindexar tabela (executar em horário de baixo uso)
REINDEX TABLE workout_progress_backup;

-- Atualizar estatísticas da tabela
ANALYZE workout_progress_backup;

-- Vacuum para recuperar espaço
VACUUM ANALYZE workout_progress_backup;

-- Verificar bloat (inchaço) da tabela
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho,
  n_live_tup as tuplas_vivas,
  n_dead_tup as tuplas_mortas,
  ROUND(n_dead_tup * 100.0 / NULLIF(n_live_tup + n_dead_tup, 0), 2) as percentual_mortas
FROM pg_stat_user_tables
WHERE tablename = 'workout_progress_backup';

-- ============================================
-- 7. CORREÇÕES E AJUSTES
-- ============================================

-- Desbloquear registro específico (CUIDADO!)
UPDATE workout_progress_backup
SET locked = false
WHERE id = 'UUID_DO_REGISTRO';

-- Bloquear todos os registros desbloqueados
UPDATE workout_progress_backup
SET locked = true
WHERE locked = false;

-- Recalcular métricas de um registro
UPDATE workout_progress_backup
SET 
  total_exercises = jsonb_array_length(workout_snapshot->'exercicios'),
  completed_exercises = (
    SELECT COUNT(*)
    FROM jsonb_array_elements(workout_snapshot->'exercicios') AS ex
    WHERE (ex->>'concluido')::boolean = true
  )
WHERE id = 'UUID_DO_REGISTRO';

-- Deletar registros de teste (CUIDADO! Apenas em desenvolvimento)
-- DELETE FROM workout_progress_backup WHERE user_id = 'UUID_TESTE';

-- ============================================
-- 8. RELATÓRIOS AVANÇADOS
-- ============================================

-- Streak (sequência) de treinos de um aluno
WITH dias_consecutivos AS (
  SELECT 
    workout_date,
    workout_date - ROW_NUMBER() OVER (ORDER BY workout_date)::integer AS grupo
  FROM workout_progress_backup
  WHERE user_id = 'UUID_DO_ALUNO'
)
SELECT 
  MIN(workout_date) as inicio_streak,
  MAX(workout_date) as fim_streak,
  COUNT(*) as dias_consecutivos
FROM dias_consecutivos
GROUP BY grupo
ORDER BY dias_consecutivos DESC
LIMIT 1;

-- Comparação de períodos (mês atual vs mês anterior)
WITH mes_atual AS (
  SELECT 
    COUNT(*) as treinos,
    SUM(total_exercises) as exercicios,
    SUM(completed_exercises) as concluidos
  FROM workout_progress_backup
  WHERE user_id = 'UUID_DO_ALUNO'
    AND workout_date >= DATE_TRUNC('month', CURRENT_DATE)
),
mes_anterior AS (
  SELECT 
    COUNT(*) as treinos,
    SUM(total_exercises) as exercicios,
    SUM(completed_exercises) as concluidos
  FROM workout_progress_backup
  WHERE user_id = 'UUID_DO_ALUNO'
    AND workout_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    AND workout_date < DATE_TRUNC('month', CURRENT_DATE)
)
SELECT 
  ma.treinos as treinos_mes_atual,
  mp.treinos as treinos_mes_anterior,
  ma.treinos - mp.treinos as diferenca_treinos,
  ROUND((ma.treinos - mp.treinos) * 100.0 / NULLIF(mp.treinos, 0), 2) as percentual_mudanca
FROM mes_atual ma, mes_anterior mp;

-- Exercícios mais realizados (análise do snapshot)
SELECT 
  ex->>'nome' as exercicio,
  ex->>'grupo_muscular' as grupo_muscular,
  COUNT(*) as vezes_realizado,
  COUNT(DISTINCT user_id) as alunos_diferentes
FROM workout_progress_backup,
  jsonb_array_elements(workout_snapshot->'exercicios') AS ex
WHERE workout_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ex->>'nome', ex->>'grupo_muscular'
ORDER BY vezes_realizado DESC
LIMIT 20;

-- ============================================
-- 9. MONITORAMENTO EM TEMPO REAL
-- ============================================

-- Treinos de hoje
SELECT 
  a.id,
  up.nome,
  wpb.workout_date,
  wpb.total_exercises,
  wpb.completed_exercises,
  wpb.created_at
FROM workout_progress_backup wpb
INNER JOIN alunos a ON wpb.user_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
WHERE wpb.workout_date = CURRENT_DATE
ORDER BY wpb.created_at DESC;

-- Últimos 10 treinos registrados
SELECT 
  a.id,
  up.nome,
  wpb.workout_date,
  wpb.workout_snapshot->>'ficha_nome' as ficha,
  wpb.completed_exercises || '/' || wpb.total_exercises as progresso,
  wpb.created_at
FROM workout_progress_backup wpb
INNER JOIN alunos a ON wpb.user_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
ORDER BY wpb.created_at DESC
LIMIT 10;

-- ============================================
-- 10. BACKUP E EXPORTAÇÃO
-- ============================================

-- Exportar progresso de um aluno para JSON
SELECT jsonb_build_object(
  'aluno_id', user_id,
  'total_dias', COUNT(*),
  'primeiro_treino', MIN(workout_date),
  'ultimo_treino', MAX(workout_date),
  'treinos', jsonb_agg(
    jsonb_build_object(
      'data', workout_date,
      'exercicios', total_exercises,
      'concluidos', completed_exercises,
      'snapshot', workout_snapshot
    ) ORDER BY workout_date
  )
) as backup_completo
FROM workout_progress_backup
WHERE user_id = 'UUID_DO_ALUNO'
GROUP BY user_id;

-- Criar backup de segurança (copiar para outra tabela)
CREATE TABLE workout_progress_backup_archive AS
SELECT * FROM workout_progress_backup
WHERE workout_date < CURRENT_DATE - INTERVAL '1 year';

-- ============================================
-- FIM DAS QUERIES ÚTEIS
-- ============================================

-- NOTA: Substitua 'UUID_DO_ALUNO' pelo ID real do aluno
-- NOTA: Execute queries de UPDATE/DELETE com CUIDADO em produção
-- NOTA: Sempre faça backup antes de operações destrutivas
