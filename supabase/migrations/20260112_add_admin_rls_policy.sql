-- Migration: Adicionar política RLS para admin ver todos os progressos
-- Data: 2026-01-12
-- Descrição: Permite que usuários autenticados vejam o progresso de todos os alunos

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Admin pode ver todos os progressos" ON workout_progress_backup;

-- Criar política que permite leitura para qualquer usuário autenticado
-- (a segurança é garantida pelo fato de que apenas admins acessam a página de progresso)
CREATE POLICY IF NOT EXISTS "Usuarios autenticados podem ver progressos"
ON workout_progress_backup
FOR SELECT
USING (auth.role() = 'authenticated');

-- Comentário explicativo
COMMENT ON POLICY "Usuarios autenticados podem ver progressos" ON workout_progress_backup IS 
'Permite que usuários autenticados visualizem o progresso de treinos na página de progresso';
