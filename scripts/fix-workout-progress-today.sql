-- ============================================
-- FIX: Criar Snapshots para Treinos de Hoje
-- Data: 2025-01-12
-- ============================================

-- DIAGNÓSTICO
DO $$
DECLARE
  treinos_hoje INTEGER;
  snapshots_hoje INTEGER;
  faltando INTEGER;
BEGIN
  -- Contar treinos realizados hoje
  SELECT COUNT(DISTINCT fa.aluno_id)
  INTO treinos_hoje
  FROM treinos_realizados tr
  INNER JOIN fichas_alunos fa ON tr.ficha_aluno_id = fa.id
  WHERE tr.data_realizacao::date = CURRENT_DATE;
  
  -- Contar snapshots de hoje
  SELECT COUNT(*)
  INTO snapshots_hoje
  FROM workout_progress_backup
  WHERE workout_date = CURRENT_DATE;
  
  faltando := treinos_hoje - snapshots_hoje;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'DIAGNÓSTICO - Treinos de Hoje';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Alunos que treinaram hoje: %', treinos_hoje;
  RAISE NOTICE 'Snapshots criados hoje: %', snapshots_hoje;
  RAISE NOTICE 'Snapshots faltando: %', GREATEST(faltando, 0);
  RAISE NOTICE '========================================';
END $$;

-- CORREÇÃO: Criar/Atualizar snapshots para hoje
INSERT INTO workout_progress_backup (
  user_id,
  workout_date,
  workout_snapshot,
  total_exercises,
  completed_exercises,
  duration_minutes,
  source_ficha_aluno_id,
  locked,
  created_at,
  updated_at
)
SELECT 
  fa.aluno_id as user_id,
  CURRENT_DATE as workout_date,
  jsonb_build_object(
    'ficha_id', f.id,
    'ficha_nome', f.nome,
    'data_treino', CURRENT_DATE,
    'exercicios', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'exercicio_id', ef.id,
            'nome', ef.nome,
            'grupo_muscular', ef.grupo_muscular,
            'series', ef.series,
            'repeticoes', ef.repeticoes,
            'descanso', ef.descanso,
            'ordem', ef.ordem,
            'concluido', true,
            'series_realizadas', COALESCE(
              (
                SELECT jsonb_agg(
                  jsonb_build_object(
                    'numero_serie', sr.numero_serie,
                    'carga', sr.carga,
                    'repeticoes', sr.repeticoes,
                    'concluida', sr.concluida::boolean
                  )
                  ORDER BY sr.numero_serie
                )
                FROM series_realizadas sr
                WHERE sr.treino_realizado_id = tr_inner.id
              ),
              '[]'::jsonb
            )
          )
          ORDER BY ef.ordem
        )
        FROM treinos_realizados tr_inner
        INNER JOIN exercicios_ficha ef ON tr_inner.exercicio_id = ef.id
        WHERE tr_inner.ficha_aluno_id = fa.id
          AND tr_inner.data_realizacao::date = CURRENT_DATE
      ),
      '[]'::jsonb
    )
  ) as workout_snapshot,
  COUNT(DISTINCT tr.exercicio_id) as total_exercises,
  COUNT(DISTINCT tr.exercicio_id) as completed_exercises,
  NULL as duration_minutes,
  fa.id as source_ficha_aluno_id,
  true as locked,
  NOW() as created_at,
  NOW() as updated_at
FROM treinos_realizados tr
INNER JOIN fichas_alunos fa ON tr.ficha_aluno_id = fa.id
INNER JOIN fichas_treino f ON fa.ficha_id = f.id
WHERE tr.data_realizacao::date = CURRENT_DATE
GROUP BY fa.aluno_id, fa.id, f.id, f.nome
ON CONFLICT (user_id, workout_date) 
DO UPDATE SET
  workout_snapshot = EXCLUDED.workout_snapshot,
  total_exercises = EXCLUDED.total_exercises,
  completed_exercises = EXCLUDED.completed_exercises,
  updated_at = NOW();

-- VERIFICAÇÃO FINAL
DO $$
DECLARE
  resultado INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO resultado
  FROM workout_progress_backup
  WHERE workout_date = CURRENT_DATE;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESULTADO';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total de snapshots para hoje: %', resultado;
  RAISE NOTICE '========================================';
END $$;

-- LISTAR ALUNOS COM TREINO HOJE
SELECT 
  wpb.user_id,
  up.nome as aluno_nome,
  wpb.workout_date,
  wpb.total_exercises as exercicios,
  wpb.completed_exercises as concluidos,
  jsonb_array_length(wpb.workout_snapshot->'exercicios') as exercicios_no_snapshot,
  wpb.created_at,
  wpb.updated_at
FROM workout_progress_backup wpb
INNER JOIN alunos a ON wpb.user_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
WHERE wpb.workout_date = CURRENT_DATE
ORDER BY up.nome;
