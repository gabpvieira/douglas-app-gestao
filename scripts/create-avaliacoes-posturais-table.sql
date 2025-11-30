-- Tabela de Avaliações Posturais
-- Esta tabela já deve existir no schema, mas este script garante que está configurada corretamente

-- Verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS avaliacoes_posturais (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id VARCHAR NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  
  -- Vista Anterior
  cabeca TEXT,
  ombros TEXT,
  clavicula TEXT,
  quadril TEXT,
  
  -- Vista Lateral
  curvatura_lombar TEXT,
  curvatura_dorsal TEXT,
  curvatura_cervical TEXT,
  
  -- Membros Inferiores
  joelhos TEXT,
  pes TEXT,
  
  -- Observações
  observacoes TEXT,
  
  -- Fotos Posturais com Grade de Alinhamento
  foto_frente_url TEXT,
  foto_costas_url TEXT,
  foto_lateral_dir_url TEXT,
  foto_lateral_esq_url TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_posturais_avaliacao_id 
  ON avaliacoes_posturais(avaliacao_id);

-- RLS (Row Level Security) Policies
ALTER TABLE avaliacoes_posturais ENABLE ROW LEVEL SECURITY;

-- Policy: Admin pode fazer tudo
CREATE POLICY "Admin pode gerenciar avaliacoes_posturais"
  ON avaliacoes_posturais
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid()
      AND tipo = 'admin'
    )
  );

-- Policy: Aluno pode visualizar suas próprias avaliações
CREATE POLICY "Aluno pode visualizar suas avaliacoes_posturais"
  ON avaliacoes_posturais
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON a.id = af.aluno_id
      JOIN users_profile up ON up.id = a.user_profile_id
      WHERE af.id = avaliacoes_posturais.avaliacao_id
      AND up.auth_uid = auth.uid()
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_avaliacoes_posturais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_avaliacoes_posturais_updated_at ON avaliacoes_posturais;

CREATE TRIGGER trigger_update_avaliacoes_posturais_updated_at
  BEFORE UPDATE ON avaliacoes_posturais
  FOR EACH ROW
  EXECUTE FUNCTION update_avaliacoes_posturais_updated_at();

-- Comentários para documentação
COMMENT ON TABLE avaliacoes_posturais IS 'Avaliações posturais com fotos e grade de alinhamento';
COMMENT ON COLUMN avaliacoes_posturais.foto_frente_url IS 'URL da foto frontal com grade de alinhamento';
COMMENT ON COLUMN avaliacoes_posturais.foto_costas_url IS 'URL da foto de costas com grade de alinhamento';
COMMENT ON COLUMN avaliacoes_posturais.foto_lateral_dir_url IS 'URL da foto lateral direita com grade de alinhamento';
COMMENT ON COLUMN avaliacoes_posturais.foto_lateral_esq_url IS 'URL da foto lateral esquerda com grade de alinhamento';
