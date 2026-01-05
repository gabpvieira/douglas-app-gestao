-- Script para criar tabela de relacionamento N:N entre planos alimentares e alunos
-- Isso permite que um plano seja atribuído a múltiplos alunos
-- EXECUTE ESTE SCRIPT NO SUPABASE SQL EDITOR

-- 1. Verificar se a coluna aluno_id existe e torná-la opcional
DO $$
BEGIN
  -- Verificar se a constraint NOT NULL existe e removê-la
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'planos_alimentares' 
    AND column_name = 'aluno_id' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE planos_alimentares ALTER COLUMN aluno_id DROP NOT NULL;
    RAISE NOTICE 'Coluna aluno_id agora é opcional';
  END IF;
END $$;

-- 2. Criar tabela de relacionamento N:N (se não existir)
CREATE TABLE IF NOT EXISTS planos_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES planos_alimentares(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_atribuicao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que não haja duplicatas
  UNIQUE(plano_id, aluno_id)
);

-- 3. Criar índices para performance (se não existirem)
CREATE INDEX IF NOT EXISTS idx_planos_alunos_plano_id ON planos_alunos(plano_id);
CREATE INDEX IF NOT EXISTS idx_planos_alunos_aluno_id ON planos_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_planos_alunos_status ON planos_alunos(status);

-- 4. Habilitar RLS
ALTER TABLE planos_alunos ENABLE ROW LEVEL SECURITY;

-- 5. Remover políticas existentes (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir leitura de planos_alunos para autenticados" ON planos_alunos;
DROP POLICY IF EXISTS "Permitir inserção de planos_alunos para autenticados" ON planos_alunos;
DROP POLICY IF EXISTS "Permitir atualização de planos_alunos para autenticados" ON planos_alunos;
DROP POLICY IF EXISTS "Permitir deleção de planos_alunos para autenticados" ON planos_alunos;

-- 6. Criar políticas RLS para planos_alunos
CREATE POLICY "Permitir leitura de planos_alunos para autenticados"
ON planos_alunos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Permitir inserção de planos_alunos para autenticados"
ON planos_alunos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Permitir atualização de planos_alunos para autenticados"
ON planos_alunos FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir deleção de planos_alunos para autenticados"
ON planos_alunos FOR DELETE
TO authenticated
USING (true);

-- 7. Migrar dados existentes (se houver planos com aluno_id)
INSERT INTO planos_alunos (plano_id, aluno_id, status, data_atribuicao)
SELECT id, aluno_id, 'ativo', COALESCE(data_criacao::date, CURRENT_DATE)
FROM planos_alimentares
WHERE aluno_id IS NOT NULL
ON CONFLICT (plano_id, aluno_id) DO NOTHING;

-- 8. Verificar se a tabela foi criada corretamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'planos_alunos') THEN
    RAISE NOTICE '✅ Tabela planos_alunos criada/verificada com sucesso!';
  ELSE
    RAISE EXCEPTION '❌ Falha ao criar tabela planos_alunos';
  END IF;
END $$;

-- 9. Comentário explicativo
COMMENT ON TABLE planos_alunos IS 'Tabela de relacionamento N:N entre planos alimentares e alunos. Permite que um plano seja atribuído a múltiplos alunos.';
