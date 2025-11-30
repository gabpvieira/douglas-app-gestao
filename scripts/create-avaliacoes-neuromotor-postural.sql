-- =====================================================
-- FASE 5: MÓDULOS ADICIONAIS - AVALIAÇÕES FÍSICAS
-- Neuromotor, Postural e Anamnese
-- =====================================================

-- =====================================================
-- 1. AVALIAÇÃO NEUROMOTORA
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes_neuromotor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Força
  preensao_manual_direita DECIMAL(5,2), -- kg
  preensao_manual_esquerda DECIMAL(5,2), -- kg
  
  -- Resistência
  flexoes_1min INTEGER,
  abdominais_1min INTEGER,
  prancha_segundos INTEGER,
  
  -- Flexibilidade
  sentar_alcancar_cm DECIMAL(5,2), -- cm (positivo = passa dos pés)
  flexao_ombros_direito DECIMAL(5,2), -- graus
  flexao_ombros_esquerdo DECIMAL(5,2), -- graus
  
  -- Agilidade
  shuttle_run_segundos DECIMAL(5,2),
  teste_t_segundos DECIMAL(5,2),
  
  -- Equilíbrio
  equilibrio_olhos_abertos_segundos INTEGER,
  equilibrio_olhos_fechados_segundos INTEGER,
  equilibrio_unipodal_direito_segundos INTEGER,
  equilibrio_unipodal_esquerdo_segundos INTEGER,
  
  -- Potência
  salto_vertical_cm DECIMAL(5,2),
  salto_horizontal_cm DECIMAL(5,2),
  
  -- Observações
  observacoes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_neuromotor_avaliacao ON avaliacoes_neuromotor(avaliacao_id);
CREATE INDEX idx_neuromotor_aluno ON avaliacoes_neuromotor(aluno_id);

-- Trigger para updated_at
CREATE TRIGGER update_avaliacoes_neuromotor_updated_at
  BEFORE UPDATE ON avaliacoes_neuromotor
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE avaliacoes_neuromotor ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total
CREATE POLICY "Admins podem fazer tudo em neuromotor"
  ON avaliacoes_neuromotor
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alunos
      WHERE alunos.id = auth.uid()
      AND alunos.role = 'admin'
    )
  );

-- Aluno: apenas visualizar suas próprias avaliações
CREATE POLICY "Alunos podem ver suas avaliações neuromotor"
  ON avaliacoes_neuromotor
  FOR SELECT
  USING (aluno_id = auth.uid());

-- =====================================================
-- 2. AVALIAÇÃO POSTURAL
-- =====================================================

CREATE TABLE IF NOT EXISTS avaliacoes_postural (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID NOT NULL REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Fotos
  foto_frente_url TEXT,
  foto_lateral_direita_url TEXT,
  foto_lateral_esquerda_url TEXT,
  foto_costas_url TEXT,
  
  -- Análise Visual - Cabeça
  cabeca_alinhamento VARCHAR(50), -- 'normal', 'anteriorizada', 'lateralizada_direita', 'lateralizada_esquerda'
  cabeca_observacoes TEXT,
  
  -- Análise Visual - Ombros
  ombros_alinhamento VARCHAR(50), -- 'normal', 'elevado_direito', 'elevado_esquerdo', 'protraidos', 'retraidos'
  ombros_observacoes TEXT,
  
  -- Análise Visual - Coluna
  coluna_cervical VARCHAR(50), -- 'normal', 'hiperlordose', 'retificada'
  coluna_toracica VARCHAR(50), -- 'normal', 'hipercifose', 'retificada'
  coluna_lombar VARCHAR(50), -- 'normal', 'hiperlordose', 'retificada'
  coluna_escoliose VARCHAR(50), -- 'ausente', 'leve', 'moderada', 'severa'
  coluna_observacoes TEXT,
  
  -- Análise Visual - Pelve
  pelve_alinhamento VARCHAR(50), -- 'normal', 'anteversao', 'retroversao', 'rotacao_direita', 'rotacao_esquerda'
  pelve_observacoes TEXT,
  
  -- Análise Visual - Joelhos
  joelhos_alinhamento VARCHAR(50), -- 'normal', 'varo', 'valgo', 'recurvatum'
  joelhos_observacoes TEXT,
  
  -- Análise Visual - Pés
  pes_tipo VARCHAR(50), -- 'normal', 'plano', 'cavo'
  pes_observacoes TEXT,
  
  -- Observações Gerais
  observacoes_gerais TEXT,
  recomendacoes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_postural_avaliacao ON avaliacoes_postural(avaliacao_id);
CREATE INDEX idx_postural_aluno ON avaliacoes_postural(aluno_id);

-- Trigger para updated_at
CREATE TRIGGER update_avaliacoes_postural_updated_at
  BEFORE UPDATE ON avaliacoes_postural
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE avaliacoes_postural ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total
CREATE POLICY "Admins podem fazer tudo em postural"
  ON avaliacoes_postural
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alunos
      WHERE alunos.id = auth.uid()
      AND alunos.role = 'admin'
    )
  );

-- Aluno: apenas visualizar suas próprias avaliações
CREATE POLICY "Alunos podem ver suas avaliações postural"
  ON avaliacoes_postural
  FOR SELECT
  USING (aluno_id = auth.uid());

-- =====================================================
-- 3. ANAMNESE
-- =====================================================

CREATE TABLE IF NOT EXISTS anamnese (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  avaliacao_id UUID REFERENCES avaliacoes_fisicas(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Histórico de Saúde
  doencas_cronicas TEXT[], -- array de doenças
  cirurgias_previas TEXT,
  medicamentos_uso TEXT,
  alergias TEXT,
  lesoes_previas TEXT,
  dores_atuais TEXT,
  
  -- Hábitos de Vida
  fumante BOOLEAN DEFAULT FALSE,
  consumo_alcool VARCHAR(50), -- 'nao', 'social', 'moderado', 'frequente'
  horas_sono_noite DECIMAL(3,1),
  qualidade_sono VARCHAR(50), -- 'otima', 'boa', 'regular', 'ruim'
  nivel_stress VARCHAR(50), -- 'baixo', 'moderado', 'alto'
  
  -- Atividade Física
  pratica_atividade_fisica BOOLEAN DEFAULT FALSE,
  atividades_praticadas TEXT[],
  frequencia_semanal INTEGER,
  tempo_pratica_meses INTEGER,
  
  -- Alimentação
  refeicoes_por_dia INTEGER,
  consumo_agua_litros DECIMAL(3,1),
  restricoes_alimentares TEXT,
  suplementacao TEXT,
  
  -- Objetivos
  objetivo_principal TEXT,
  objetivos_secundarios TEXT[],
  prazo_objetivo_meses INTEGER,
  motivacao TEXT,
  
  -- Limitações e Restrições
  limitacoes_fisicas TEXT,
  restricoes_medicas TEXT,
  disponibilidade_treino TEXT, -- dias e horários
  
  -- Observações
  observacoes_gerais TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_anamnese_avaliacao ON anamnese(avaliacao_id);
CREATE INDEX idx_anamnese_aluno ON anamnese(aluno_id);

-- Trigger para updated_at
CREATE TRIGGER update_anamnese_updated_at
  BEFORE UPDATE ON anamnese
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE anamnese ENABLE ROW LEVEL SECURITY;

-- Admin: acesso total
CREATE POLICY "Admins podem fazer tudo em anamnese"
  ON anamnese
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM alunos
      WHERE alunos.id = auth.uid()
      AND alunos.role = 'admin'
    )
  );

-- Aluno: pode ver e editar sua própria anamnese
CREATE POLICY "Alunos podem ver sua anamnese"
  ON anamnese
  FOR SELECT
  USING (aluno_id = auth.uid());

CREATE POLICY "Alunos podem atualizar sua anamnese"
  ON anamnese
  FOR UPDATE
  USING (aluno_id = auth.uid());

-- =====================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE avaliacoes_neuromotor IS 'Avaliação neuromotora: força, resistência, flexibilidade, agilidade, equilíbrio e potência';
COMMENT ON TABLE avaliacoes_postural IS 'Avaliação postural com fotos e análise visual de alinhamentos';
COMMENT ON TABLE anamnese IS 'Anamnese completa: histórico de saúde, hábitos, objetivos e limitações';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
