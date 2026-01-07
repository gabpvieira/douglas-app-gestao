-- Migration: Adicionar tabela de última carga por exercício/aluno
-- Esta tabela serve como cache de referência rápida para pré-preencher
-- os campos de peso ao iniciar um novo treino

-- Criar tabela ultima_carga_exercicio
CREATE TABLE IF NOT EXISTS ultima_carga_exercicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES exercicios_ficha(id) ON DELETE CASCADE,
  
  -- Última carga registrada (por série) em formato JSONB
  -- Exemplo: [{"serie": 1, "carga": "40", "repeticoes": 12}, {"serie": 2, "carga": "42.5", "repeticoes": 10}]
  cargas_por_serie JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadados
  ultima_atualizacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  treino_referencia_id UUID REFERENCES treinos_realizados(id) ON DELETE SET NULL,
  
  -- Timestamps padrão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint única: um registro por aluno/exercício
  CONSTRAINT unique_aluno_exercicio UNIQUE(aluno_id, exercicio_id)
);

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_ultima_carga_aluno ON ultima_carga_exercicio(aluno_id);
CREATE INDEX IF NOT EXISTS idx_ultima_carga_exercicio ON ultima_carga_exercicio(exercicio_id);
CREATE INDEX IF NOT EXISTS idx_ultima_carga_aluno_exercicio ON ultima_carga_exercicio(aluno_id, exercicio_id);

-- Comentários explicativos
COMMENT ON TABLE ultima_carga_exercicio IS 'Cache de última carga utilizada por aluno/exercício para pré-preenchimento em novos treinos';
COMMENT ON COLUMN ultima_carga_exercicio.cargas_por_serie IS 'Array JSONB com carga por série: [{serie: 1, carga: "40", repeticoes: 12}, ...]';
COMMENT ON COLUMN ultima_carga_exercicio.treino_referencia_id IS 'ID do treino que gerou esta referência de carga';

-- RLS Policies
ALTER TABLE ultima_carga_exercicio ENABLE ROW LEVEL SECURITY;

-- Policy: Alunos podem ver apenas suas próprias cargas
CREATE POLICY "Alunos podem ver suas cargas" ON ultima_carga_exercicio
  FOR SELECT
  USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()
    )
  );

-- Policy: Alunos podem inserir/atualizar suas próprias cargas
CREATE POLICY "Alunos podem gerenciar suas cargas" ON ultima_carga_exercicio
  FOR ALL
  USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()
    )
  );

-- Policy: Admin pode ver todas as cargas
CREATE POLICY "Admin pode ver todas cargas" ON ultima_carga_exercicio
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.auth_uid = auth.uid() AND up.tipo = 'admin'
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ultima_carga_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_ultima_carga_updated_at ON ultima_carga_exercicio;
CREATE TRIGGER trigger_update_ultima_carga_updated_at
  BEFORE UPDATE ON ultima_carga_exercicio
  FOR EACH ROW
  EXECUTE FUNCTION update_ultima_carga_updated_at();
