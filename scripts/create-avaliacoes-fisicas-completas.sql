-- =====================================================
-- SISTEMA DE AVALIAÇÕES FÍSICAS COMPLETO
-- Complementa a tabela avaliacoes_fisicas existente
-- =====================================================

-- 1. ADICIONAR CAMPOS À TABELA EXISTENTE avaliacoes_fisicas
-- Campos para protocolos científicos e cálculos

ALTER TABLE avaliacoes_fisicas
ADD COLUMN IF NOT EXISTS protocolo VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS genero VARCHAR(20),
ADD COLUMN IF NOT EXISTS idade INTEGER,
ADD COLUMN IF NOT EXISTS densidade_corporal NUMERIC(10,4),
ADD COLUMN IF NOT EXISTS peso_ideal NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS classificacao_gordura VARCHAR(50),
ADD COLUMN IF NOT EXISTS massa_gorda NUMERIC(5,2),

-- Dobras cutâneas adicionais (Pollock 7 dobras)
ADD COLUMN IF NOT EXISTS dobra_triceps NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_subescapular NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_peitoral NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_axilar_media NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_suprailiaca NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_abdominal NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS dobra_coxa NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS soma_dobras NUMERIC(6,2),

-- Dados cardiovasculares
ADD COLUMN IF NOT EXISTS fc_repouso INTEGER,
ADD COLUMN IF NOT EXISTS fc_maxima INTEGER,
ADD COLUMN IF NOT EXISTS pressao_sistolica INTEGER,
ADD COLUMN IF NOT EXISTS pressao_diastolica INTEGER,
ADD COLUMN IF NOT EXISTS vo2_max NUMERIC(5,2);

-- Adicionar comentário
COMMENT ON COLUMN avaliacoes_fisicas.protocolo IS 'Protocolo usado: manual, pollock_7_dobras, pollock_3_dobras, bioimpedancia, online';
COMMENT ON COLUMN avaliacoes_fisicas.densidade_corporal IS 'Densidade corporal calculada (g/ml)';
COMMENT ON COLUMN avaliacoes_fisicas.soma_dobras IS 'Soma de todas as dobras cutâneas medidas (mm)';

-- =====================================================
-- 2. TABELA DE PERIMETRIA DETALHADA
-- =====================================================

CREATE TABLE IF NOT EXISTS perimetria_detalhada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  
  -- Cabeça e Pescoço (já existe circunferencia_pescoco na tabela principal)
  
  -- Tronco
  ombro NUMERIC(5,2),
  torax_inspirado NUMERIC(5,2),
  torax_expirado NUMERIC(5,2),
  
  -- Membros Superiores (complementa os existentes)
  punho_direito NUMERIC(5,2),
  punho_esquerdo NUMERIC(5,2),
  
  -- Membros Inferiores (complementa os existentes)
  coxa_proximal_direita NUMERIC(5,2),
  coxa_proximal_esquerda NUMERIC(5,2),
  coxa_medial_direita NUMERIC(5,2),
  coxa_medial_esquerda NUMERIC(5,2),
  tornozelo_direito NUMERIC(5,2),
  tornozelo_esquerdo NUMERIC(5,2),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE perimetria_detalhada IS 'Medidas de perimetria corporal detalhadas complementares';

-- =====================================================
-- 3. TABELA DE AVALIAÇÃO NEUROMOTORA
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes_neuromotoras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  
  -- Força
  forca_preensao_manual_dir NUMERIC(5,2), -- kg
  forca_preensao_manual_esq NUMERIC(5,2), -- kg
  
  -- Resistência Muscular
  flexao_braco INTEGER, -- repetições
  abdominal_1min INTEGER, -- repetições em 1 minuto
  agachamento INTEGER, -- repetições
  prancha_isometrica INTEGER, -- segundos
  
  -- Flexibilidade
  sentar_alcancar NUMERIC(5,2), -- cm (Banco de Wells)
  flexao_quadril_dir NUMERIC(5,2), -- graus
  flexao_quadril_esq NUMERIC(5,2), -- graus
  
  -- Agilidade
  shuttle_run NUMERIC(5,2), -- segundos
  teste_3_cones NUMERIC(5,2), -- segundos
  
  -- Equilíbrio
  apoio_unico_perna_dir INTEGER, -- segundos
  apoio_unico_perna_esq INTEGER, -- segundos
  
  -- Velocidade
  corrida_20m NUMERIC(5,2), -- segundos
  corrida_40m NUMERIC(5,2), -- segundos
  
  -- Potência
  salto_vertical NUMERIC(5,2), -- cm
  salto_horizontal NUMERIC(5,2), -- cm
  
  -- Coordenação
  arremesso_bola NUMERIC(5,2), -- metros
  
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE avaliacoes_neuromotoras IS 'Testes de capacidades físicas (força, resistência, flexibilidade, etc)';

-- =====================================================
-- 4. TABELA DE AVALIAÇÃO POSTURAL
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes_posturais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  
  -- Vista Anterior
  cabeca VARCHAR(50), -- 'alinhada', 'inclinada_direita', 'inclinada_esquerda'
  ombros VARCHAR(50), -- 'nivelados', 'elevado_direito', 'elevado_esquerdo'
  clavicula VARCHAR(50), -- 'niveladas', 'desnivel'
  quadril VARCHAR(50), -- 'nivelado', 'elevado_direito', 'elevado_esquerdo'
  
  -- Vista Lateral
  curvatura_lombar VARCHAR(50), -- 'normal', 'hiperlordose', 'retificada'
  curvatura_dorsal VARCHAR(50), -- 'normal', 'hipercifose', 'retificada'
  curvatura_cervical VARCHAR(50), -- 'normal', 'hiperlordose', 'retificada'
  
  -- Membros Inferiores
  joelhos VARCHAR(50), -- 'normal', 'varo', 'valgo'
  pes VARCHAR(50), -- 'normal', 'plano', 'cavo'
  
  -- Observações detalhadas
  observacoes TEXT,
  
  -- Fotos posturais (URLs do Supabase Storage)
  foto_frente_url TEXT,
  foto_costas_url TEXT,
  foto_lateral_dir_url TEXT,
  foto_lateral_esq_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE avaliacoes_posturais IS 'Avaliação de alinhamento e postura corporal';

-- =====================================================
-- 5. TABELA DE ANAMNESE
-- =====================================================

CREATE TABLE IF NOT EXISTS anamneses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  profissao TEXT,
  nivel_atividade VARCHAR(50), -- 'sedentario', 'leve', 'moderado', 'intenso', 'muito_intenso'
  
  -- Histórico de Saúde
  doencas_preexistentes TEXT[], -- array de doenças
  cirurgias TEXT,
  lesoes TEXT,
  medicamentos TEXT[], -- array de medicamentos
  
  -- Hábitos
  fumante BOOLEAN DEFAULT false,
  consumo_alcool VARCHAR(20), -- 'nao', 'social', 'regular', 'diario'
  horas_sono NUMERIC(3,1),
  qualidade_sono VARCHAR(20), -- 'ruim', 'regular', 'boa', 'excelente'
  
  -- Histórico de Atividade Física
  pratica_atividade BOOLEAN DEFAULT false,
  tipo_atividade TEXT[],
  frequencia_semanal INTEGER,
  tempo_sessao INTEGER, -- minutos
  
  -- Objetivos
  objetivo_principal TEXT,
  objetivos_secundarios TEXT[],
  
  -- Limitações
  restricoes_medicas TEXT,
  limitacoes_movimento TEXT,
  
  -- Observações
  observacoes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  -- Garantir apenas uma anamnese ativa por aluno
  UNIQUE(aluno_id)
);

COMMENT ON TABLE anamneses IS 'Histórico de saúde e hábitos de vida dos alunos';

-- =====================================================
-- 6. TABELA DE METAS DE AVALIAÇÃO
-- =====================================================

CREATE TABLE IF NOT EXISTS metas_avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Metas
  peso_alvo NUMERIC(5,2),
  percentual_gordura_alvo NUMERIC(5,2),
  massa_magra_alvo NUMERIC(5,2),
  
  -- Prazos
  data_inicio DATE NOT NULL,
  data_alvo DATE NOT NULL,
  prazo_semanas INTEGER,
  
  -- Status
  status VARCHAR(20) DEFAULT 'ativa', -- 'ativa', 'atingida', 'cancelada'
  data_atingida DATE,
  
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE metas_avaliacoes IS 'Metas de composição corporal definidas para os alunos';

-- =====================================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_avaliacoes_fisicas_aluno_data 
  ON avaliacoes_fisicas(aluno_id, data_avaliacao DESC);

CREATE INDEX IF NOT EXISTS idx_avaliacoes_fisicas_protocolo 
  ON avaliacoes_fisicas(protocolo);

CREATE INDEX IF NOT EXISTS idx_perimetria_avaliacao 
  ON perimetria_detalhada(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_neuromotora_avaliacao 
  ON avaliacoes_neuromotoras(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_postural_avaliacao 
  ON avaliacoes_posturais(avaliacao_id);

CREATE INDEX IF NOT EXISTS idx_anamnese_aluno 
  ON anamneses(aluno_id);

CREATE INDEX IF NOT EXISTS idx_metas_aluno_status 
  ON metas_avaliacoes(aluno_id, status);

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- Perimetria Detalhada
ALTER TABLE perimetria_detalhada ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access perimetria"
  ON perimetria_detalhada FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Aluno read own perimetria"
  ON perimetria_detalhada FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON af.aluno_id = a.id
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE af.id = perimetria_detalhada.avaliacao_id
        AND up.auth_uid = auth.uid()
    )
  );

-- Avaliações Neuromotoras
ALTER TABLE avaliacoes_neuromotoras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access neuromotora"
  ON avaliacoes_neuromotoras FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Aluno read own neuromotora"
  ON avaliacoes_neuromotoras FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON af.aluno_id = a.id
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE af.id = avaliacoes_neuromotoras.avaliacao_id
        AND up.auth_uid = auth.uid()
    )
  );

-- Avaliações Posturais
ALTER TABLE avaliacoes_posturais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access postural"
  ON avaliacoes_posturais FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Aluno read own postural"
  ON avaliacoes_posturais FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM avaliacoes_fisicas af
      JOIN alunos a ON af.aluno_id = a.id
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE af.id = avaliacoes_posturais.avaliacao_id
        AND up.auth_uid = auth.uid()
    )
  );

-- Anamneses
ALTER TABLE anamneses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access anamnese"
  ON anamneses FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Aluno read own anamnese"
  ON anamneses FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE a.id = anamneses.aluno_id
        AND up.auth_uid = auth.uid()
    )
  );

-- Metas
ALTER TABLE metas_avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access metas"
  ON metas_avaliacoes FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE auth_uid = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "Aluno read own metas"
  ON metas_avaliacoes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE a.id = metas_avaliacoes.aluno_id
        AND up.auth_uid = auth.uid()
    )
  );

-- =====================================================
-- 9. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_perimetria_updated_at
  BEFORE UPDATE ON perimetria_detalhada
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_neuromotora_updated_at
  BEFORE UPDATE ON avaliacoes_neuromotoras
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_postural_updated_at
  BEFORE UPDATE ON avaliacoes_posturais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamnese_updated_at
  BEFORE UPDATE ON anamneses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_updated_at
  BEFORE UPDATE ON metas_avaliacoes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
