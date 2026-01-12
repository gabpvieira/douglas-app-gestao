-- Migration: Adicionar política RLS para admin ver todos os progressos
-- Data: 2026-01-12
-- Descrição: Permite que usuários com tipo 'admin' vejam o progresso de todos os alunos

-- Criar política para admin ver todos os progressos
CREATE POLICY IF NOT EXISTS "Admin pode ver todos os progressos"
ON workout_progress_backup
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users_profile up
    WHERE up.auth_uid = auth.uid()::text
    AND up.tipo = 'admin'
  )
);

-- Comentário explicativo
COMMENT ON POLICY "Admin pode ver todos os progressos" ON workout_progress_backup IS 
'Permite que administradores visualizem o progresso de treinos de todos os alunos na página de progresso';
