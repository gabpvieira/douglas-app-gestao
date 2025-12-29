-- =====================================================
-- FIX: Avaliações Posturais - RLS e Storage Policies
-- =====================================================

-- 1. Verificar e recriar RLS policies para avaliacoes_posturais
-- =====================================================

-- Remover policies existentes (se houver conflito)
DROP POLICY IF EXISTS "Admin pode gerenciar avaliacoes_posturais" ON avaliacoes_posturais;
DROP POLICY IF EXISTS "Aluno pode visualizar suas avaliacoes_posturais" ON avaliacoes_posturais;
DROP POLICY IF EXISTS "Admin full access postural" ON avaliacoes_posturais;
DROP POLICY IF EXISTS "Aluno read own postural" ON avaliacoes_posturais;

-- Garantir que RLS está habilitado
ALTER TABLE avaliacoes_posturais ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode fazer TUDO (INSERT, UPDATE, DELETE, SELECT)
CREATE POLICY "admin_full_access_avaliacoes_posturais"
  ON avaliacoes_posturais
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  );

-- Policy: Aluno pode apenas VER suas próprias avaliações
CREATE POLICY "aluno_read_own_avaliacoes_posturais"
  ON avaliacoes_posturais
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON a.id = af.aluno_id
      JOIN users_profile up ON up.id = a.user_profile_id
      WHERE af.id = avaliacoes_posturais.avaliacao_id
      AND up.auth_uid = auth.uid()
    )
  );

-- 2. Verificar e recriar RLS policies para avaliacoes_neuromotoras
-- =====================================================

DROP POLICY IF EXISTS "Admin pode gerenciar avaliacoes_neuromotoras" ON avaliacoes_neuromotoras;
DROP POLICY IF EXISTS "Aluno pode visualizar suas avaliacoes_neuromotoras" ON avaliacoes_neuromotoras;

ALTER TABLE avaliacoes_neuromotoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_avaliacoes_neuromotoras"
  ON avaliacoes_neuromotoras
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  );

CREATE POLICY "aluno_read_own_avaliacoes_neuromotoras"
  ON avaliacoes_neuromotoras
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON a.id = af.aluno_id
      JOIN users_profile up ON up.id = a.user_profile_id
      WHERE af.id = avaliacoes_neuromotoras.avaliacao_id
      AND up.auth_uid = auth.uid()
    )
  );

-- 3. Verificar e recriar RLS policies para anamneses
-- =====================================================

DROP POLICY IF EXISTS "Admin pode gerenciar anamneses" ON anamneses;
DROP POLICY IF EXISTS "Aluno pode visualizar sua anamnese" ON anamneses;

ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_full_access_anamneses"
  ON anamneses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  );

CREATE POLICY "aluno_read_own_anamnese"
  ON anamneses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN users_profile up ON up.id = a.user_profile_id
      WHERE a.id = anamneses.aluno_id
      AND up.auth_uid = auth.uid()
    )
  );

-- 4. Storage Policies para bucket fotos-progresso
-- =====================================================
-- NOTA: Execute estas policies no Supabase Dashboard > Storage > Policies

-- Policy para INSERT (upload):
-- CREATE POLICY "Admin pode fazer upload de fotos"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'fotos-progresso'
--   AND EXISTS (
--     SELECT 1 FROM users_profile
--     WHERE auth_uid = auth.uid()
--     AND tipo = 'admin'
--   )
-- );

-- Policy para SELECT (visualizar):
-- CREATE POLICY "Todos autenticados podem ver fotos"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (bucket_id = 'fotos-progresso');

-- Policy para DELETE:
-- CREATE POLICY "Admin pode deletar fotos"
-- ON storage.objects FOR DELETE
-- TO authenticated
-- USING (
--   bucket_id = 'fotos-progresso'
--   AND EXISTS (
--     SELECT 1 FROM users_profile
--     WHERE auth_uid = auth.uid()
--     AND tipo = 'admin'
--   )
-- );

-- 5. Verificação de dados
-- =====================================================

-- Verificar se existem avaliações posturais
SELECT 
  'avaliacoes_posturais' as tabela,
  COUNT(*) as total,
  COUNT(foto_frente_url) as com_foto_frente,
  COUNT(observacoes) as com_observacoes
FROM avaliacoes_posturais;

-- Verificar policies ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('avaliacoes_posturais', 'avaliacoes_neuromotoras', 'anamneses')
ORDER BY tablename, policyname;
