-- Tabela Simplificada de Avaliações Físicas (Foco em Musculação e Shape)
CREATE TABLE IF NOT EXISTS avaliacoes_fisicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_avaliacao DATE NOT NULL,
  
  -- Medidas Básicas
  peso DECIMAL(5,2),
  altura INTEGER,
  imc DECIMAL(4,2),
  
  -- Circunferências Principais (cm) - Shape e Músculos
  circunferencia_torax DECIMAL(5,2),
  circunferencia_cintura DECIMAL(5,2),
  circunferencia_abdomen DECIMAL(5,2),
  circunferencia_quadril DECIMAL(5,2),
  circunferencia_braco_direito DECIMAL(5,2),
  circunferencia_braco_esquerdo DECIMAL(5,2),
  circunferencia_coxa_direita DECIMAL(5,2),
  circunferencia_coxa_esquerda DECIMAL(5,2),
  circunferencia_panturrilha_direita DECIMAL(5,2),
  circunferencia_panturrilha_esquerda DECIMAL(5,2),
  
  -- Composição Corporal
  percentual_gordura DECIMAL(4,2),
  massa_magra DECIMAL(5,2),
  
  -- Fotos de Progresso
  foto_frente_url TEXT,
  foto_costas_url TEXT,
  foto_lateral_url TEXT,
  
  -- Observações
  observacoes TEXT,
  objetivos TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentário da tabela
COMMENT ON TABLE avaliacoes_fisicas IS 'Avaliações físicas focadas em shape, músculos e composição corporal';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_avaliacoes_fisicas_aluno_id ON avaliacoes_fisicas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_fisicas_data ON avaliacoes_fisicas(data_avaliacao DESC);

-- RLS Policies
ALTER TABLE avaliacoes_fisicas ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir tudo em desenvolvimento
CREATE POLICY "Allow all for development"
  ON avaliacoes_fisicas
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_avaliacoes_fisicas_updated_at
  BEFORE UPDATE ON avaliacoes_fisicas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
