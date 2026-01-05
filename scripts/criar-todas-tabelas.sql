-- ============================================
-- SCRIPT COMPLETO DE CRIAÇÃO DO BANCO DE DADOS
-- Douglas Personal - Plataforma de Coaching
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- TABELA: users_profile
-- ============================================
CREATE TABLE IF NOT EXISTS users_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_uid TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL CHECK (tipo IN ('admin', 'aluno')),
  foto_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_profile_auth_uid ON users_profile(auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_tipo ON users_profile(tipo);

DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE users_profile IS 'Perfis de usuários do sistema (admin e alunos)';

-- ============================================
-- TABELA: alunos
-- ============================================
CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID NOT NULL UNIQUE REFERENCES users_profile(id) ON DELETE CASCADE,
  data_nascimento DATE,
  altura INTEGER,
  genero TEXT CHECK (genero IN ('masculino', 'feminino', 'outro')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'pendente')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alunos_user_profile_id ON alunos(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);

DROP TRIGGER IF EXISTS update_alunos_updated_at ON alunos;
CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE alunos IS 'Dados específicos dos alunos da consultoria';

-- ============================================
-- TABELA: treinos_video
-- ============================================
CREATE TABLE IF NOT EXISTS treinos_video (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  objetivo TEXT,
  descricao TEXT,
  url_video TEXT NOT NULL,
  thumbnail_url TEXT,
  duracao INTEGER,
  data_upload TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treinos_video_objetivo ON treinos_video(objetivo);
CREATE INDEX IF NOT EXISTS idx_treinos_video_data_upload ON treinos_video(data_upload DESC);

COMMENT ON TABLE treinos_video IS 'Biblioteca de vídeos de treino disponíveis para todos os alunos';

-- ============================================
-- TABELA: planos_alimentares
-- ============================================
CREATE TABLE IF NOT EXISTS planos_alimentares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID REFERENCES alunos(id) ON DELETE CASCADE, -- Opcional: relacionamento N:N via planos_alunos
  titulo TEXT NOT NULL,
  conteudo_html TEXT NOT NULL,
  dados_json JSONB,
  observacoes TEXT,
  data_criacao TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_planos_alimentares_aluno_id ON planos_alimentares(aluno_id);
CREATE INDEX IF NOT EXISTS idx_planos_alimentares_data_criacao ON planos_alimentares(data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_planos_alimentares_dados_json ON planos_alimentares USING GIN (dados_json);

DROP TRIGGER IF EXISTS update_planos_alimentares_updated_at ON planos_alimentares;
CREATE TRIGGER update_planos_alimentares_updated_at
  BEFORE UPDATE ON planos_alimentares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE planos_alimentares IS 'Planos alimentares personalizados para cada aluno';
COMMENT ON COLUMN planos_alimentares.dados_json IS 'Dados estruturados do plano: refeições, alimentos, macros, etc.';

-- ============================================
-- TABELA: planos_alunos (Relacionamento N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS planos_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES planos_alimentares(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  data_atribuicao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(plano_id, aluno_id)
);

CREATE INDEX IF NOT EXISTS idx_planos_alunos_plano_id ON planos_alunos(plano_id);
CREATE INDEX IF NOT EXISTS idx_planos_alunos_aluno_id ON planos_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_planos_alunos_status ON planos_alunos(status);

DROP TRIGGER IF EXISTS update_planos_alunos_updated_at ON planos_alunos;
CREATE TRIGGER update_planos_alunos_updated_at
  BEFORE UPDATE ON planos_alunos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE planos_alunos IS 'Relacionamento N:N entre planos alimentares e alunos';

-- ============================================
-- TABELA: refeicoes_plano
-- ============================================
CREATE TABLE IF NOT EXISTS refeicoes_plano (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID NOT NULL REFERENCES planos_alimentares(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  horario TIME NOT NULL,
  ordem INTEGER NOT NULL,
  calorias_calculadas INTEGER DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refeicoes_plano_id ON refeicoes_plano(plano_id);
CREATE INDEX IF NOT EXISTS idx_refeicoes_ordem ON refeicoes_plano(plano_id, ordem);

COMMENT ON TABLE refeicoes_plano IS 'Refeições dos planos alimentares';
COMMENT ON COLUMN refeicoes_plano.calorias_calculadas IS 'Soma automática das calorias dos alimentos';

-- ============================================
-- TABELA: alimentos_refeicao
-- ============================================
CREATE TABLE IF NOT EXISTS alimentos_refeicao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  refeicao_id UUID NOT NULL REFERENCES refeicoes_plano(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade NUMERIC(10,2) NOT NULL,
  unidade TEXT NOT NULL,
  calorias NUMERIC(10,2) NOT NULL,
  proteinas NUMERIC(10,2) NOT NULL,
  carboidratos NUMERIC(10,2) NOT NULL,
  gorduras NUMERIC(10,2) NOT NULL,
  categoria TEXT,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alimentos_refeicao_id ON alimentos_refeicao(refeicao_id);
CREATE INDEX IF NOT EXISTS idx_alimentos_ordem ON alimentos_refeicao(refeicao_id, ordem);

COMMENT ON TABLE alimentos_refeicao IS 'Alimentos de cada refeição';

-- ============================================
-- TABELA: assinaturas
-- ============================================
CREATE TABLE IF NOT EXISTS assinaturas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  plano_tipo TEXT NOT NULL CHECK (plano_tipo IN ('mensal', 'trimestral', 'familia')),
  preco INTEGER NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'cancelada', 'vencida')),
  mercado_pago_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assinaturas_aluno_id ON assinaturas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_status ON assinaturas(status);
CREATE INDEX IF NOT EXISTS idx_assinaturas_data_fim ON assinaturas(data_fim);
CREATE INDEX IF NOT EXISTS idx_assinaturas_mp_id ON assinaturas(mercado_pago_subscription_id);

DROP TRIGGER IF EXISTS update_assinaturas_updated_at ON assinaturas;
CREATE TRIGGER update_assinaturas_updated_at
  BEFORE UPDATE ON assinaturas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE assinaturas IS 'Assinaturas e planos dos alunos';

-- ============================================
-- TABELA: pagamentos
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assinatura_id UUID NOT NULL REFERENCES assinaturas(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'aprovado', 'recusado', 'cancelado', 'estornado')),
  valor INTEGER NOT NULL,
  metodo TEXT NOT NULL CHECK (metodo IN ('credit_card', 'debit_card', 'pix', 'boleto')),
  mercado_pago_payment_id TEXT,
  data_pagamento TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pagamentos_assinatura_id ON pagamentos(assinatura_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data ON pagamentos(data_pagamento DESC);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mp_id ON pagamentos(mercado_pago_payment_id);

COMMENT ON TABLE pagamentos IS 'Histórico de pagamentos das assinaturas';

-- ============================================
-- TABELA: disponibilidade_semanal
-- ============================================
CREATE TABLE IF NOT EXISTS disponibilidade_semanal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_atendimento INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  tipo TEXT DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_disponibilidade_dia_semana ON disponibilidade_semanal(dia_semana);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_ativo ON disponibilidade_semanal(ativo);
CREATE INDEX IF NOT EXISTS idx_disponibilidade_tipo ON disponibilidade_semanal(tipo);

DROP TRIGGER IF EXISTS update_disponibilidade_semanal_updated_at ON disponibilidade_semanal;
CREATE TRIGGER update_disponibilidade_semanal_updated_at
  BEFORE UPDATE ON disponibilidade_semanal
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE disponibilidade_semanal IS 'Configuração de disponibilidade semanal do profissional para atendimentos';

-- ============================================
-- TABELA: agendamentos_presenciais
-- ============================================
CREATE TABLE IF NOT EXISTS agendamentos_presenciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
  tipo TEXT DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_agendamento, hora_inicio)
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_presenciais_aluno ON agendamentos_presenciais(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_presenciais_data ON agendamentos_presenciais(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_presenciais_status ON agendamentos_presenciais(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_presenciais_tipo ON agendamentos_presenciais(tipo);
CREATE INDEX IF NOT EXISTS idx_agendamentos_presenciais_data_hora ON agendamentos_presenciais(data_agendamento, hora_inicio);

DROP TRIGGER IF EXISTS update_agendamentos_presenciais_updated_at ON agendamentos_presenciais;
CREATE TRIGGER update_agendamentos_presenciais_updated_at
  BEFORE UPDATE ON agendamentos_presenciais
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE agendamentos_presenciais IS 'Agendamentos de atendimentos presenciais e online com alunos';

-- ============================================
-- TABELA: blocos_horarios (DEPRECATED)
-- ============================================
CREATE TABLE IF NOT EXISTS blocos_horarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocos_horarios_dia_semana ON blocos_horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_blocos_horarios_ativo ON blocos_horarios(ativo);

COMMENT ON TABLE blocos_horarios IS 'Blocos de horários disponíveis para agendamento semanal';

-- ============================================
-- TABELA: excecoes_disponibilidade
-- ============================================
CREATE TABLE IF NOT EXISTS excecoes_disponibilidade (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  motivo TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_excecoes_data_inicio ON excecoes_disponibilidade(data_inicio);
CREATE INDEX IF NOT EXISTS idx_excecoes_data_fim ON excecoes_disponibilidade(data_fim);
CREATE INDEX IF NOT EXISTS idx_excecoes_ativo ON excecoes_disponibilidade(ativo);

DROP TRIGGER IF EXISTS update_excecoes_disponibilidade_updated_at ON excecoes_disponibilidade;
CREATE TRIGGER update_excecoes_disponibilidade_updated_at
  BEFORE UPDATE ON excecoes_disponibilidade
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE excecoes_disponibilidade IS 'Exceções de disponibilidade como feriados e férias';

-- ============================================
-- TABELA: evolucoes
-- ============================================
CREATE TABLE IF NOT EXISTS evolucoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  peso NUMERIC(5,2),
  gordura_corporal NUMERIC(4,2),
  massa_muscular NUMERIC(5,2),
  peito INTEGER,
  cintura INTEGER,
  quadril INTEGER,
  braco INTEGER,
  coxa INTEGER,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evolucoes_aluno_id ON evolucoes(aluno_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_data ON evolucoes(data DESC);
CREATE INDEX IF NOT EXISTS idx_evolucoes_aluno_data ON evolucoes(aluno_id, data DESC);

COMMENT ON TABLE evolucoes IS 'Histórico de evolução física dos alunos (peso, medidas, etc)';

-- ============================================
-- TABELA: fotos_progresso
-- ============================================
CREATE TABLE IF NOT EXISTS fotos_progresso (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('front', 'side', 'back')),
  url_foto TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fotos_progresso_aluno_id ON fotos_progresso(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fotos_progresso_data ON fotos_progresso(data DESC);
CREATE INDEX IF NOT EXISTS idx_fotos_progresso_tipo ON fotos_progresso(tipo);

COMMENT ON TABLE fotos_progresso IS 'Fotos de progresso dos alunos (frente, lateral, costas)';

-- ============================================
-- TABELA: fichas_treino
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_treino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  duracao_semanas INTEGER NOT NULL DEFAULT 4,
  ativo TEXT NOT NULL DEFAULT 'true' CHECK (ativo IN ('true', 'false')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA: exercicios_ficha
-- ============================================
CREATE TABLE IF NOT EXISTS exercicios_ficha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES fichas_treino(id) ON DELETE CASCADE,
  video_id UUID,
  nome TEXT NOT NULL,
  grupo_muscular TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  series INTEGER NOT NULL,
  repeticoes TEXT NOT NULL,
  descanso INTEGER NOT NULL,
  observacoes TEXT,
  tecnica TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_ficha_id ON exercicios_ficha(ficha_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_ordem ON exercicios_ficha(ficha_id, ordem);

-- ============================================
-- TABELA: fichas_alunos
-- ============================================
CREATE TABLE IF NOT EXISTS fichas_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES fichas_treino(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fichas_alunos_ficha_id ON fichas_alunos(ficha_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_aluno_id ON fichas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_status ON fichas_alunos(status);

-- ============================================
-- TABELA: treinos_realizados
-- ============================================
CREATE TABLE IF NOT EXISTS treinos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_aluno_id UUID NOT NULL REFERENCES fichas_alunos(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES exercicios_ficha(id),
  data_realizacao TIMESTAMPTZ NOT NULL,
  series_realizadas INTEGER NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_treinos_realizados_ficha_aluno_id ON treinos_realizados(ficha_aluno_id);
CREATE INDEX IF NOT EXISTS idx_treinos_realizados_data ON treinos_realizados(data_realizacao);

-- ============================================
-- TABELA: series_realizadas
-- ============================================
CREATE TABLE IF NOT EXISTS series_realizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_realizado_id UUID NOT NULL REFERENCES treinos_realizados(id) ON DELETE CASCADE,
  numero_serie INTEGER NOT NULL,
  carga TEXT NOT NULL,
  repeticoes INTEGER NOT NULL,
  concluida TEXT NOT NULL DEFAULT 'true' CHECK (concluida IN ('true', 'false')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_series_realizadas_treino_id ON series_realizadas(treino_realizado_id);

-- ============================================
-- RLS POLICIES (Row Level Security)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos_video ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_alimentares ENABLE ROW LEVEL SECURITY;
ALTER TABLE refeicoes_plano ENABLE ROW LEVEL SECURITY;
ALTER TABLE alimentos_refeicao ENABLE ROW LEVEL SECURITY;
ALTER TABLE assinaturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidade_semanal ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos_presenciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE excecoes_disponibilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_progresso ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_ficha ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_realizadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE planos_alunos ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas para desenvolvimento (SUBSTITUIR EM PRODUÇÃO)
CREATE POLICY IF NOT EXISTS "Allow all for development" ON users_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON treinos_video FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON planos_alimentares FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development on refeicoes_plano" ON refeicoes_plano FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development on alimentos_refeicao" ON alimentos_refeicao FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development on planos_alunos" ON planos_alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON assinaturas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON pagamentos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON disponibilidade_semanal FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON agendamentos_presenciais FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON blocos_horarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON excecoes_disponibilidade FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON evolucoes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Allow all for development" ON fotos_progresso FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Permitir tudo em fichas_treino" ON fichas_treino FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Permitir tudo em exercicios_ficha" ON exercicios_ficha FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Permitir tudo em fichas_alunos" ON fichas_alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Permitir tudo em treinos_realizados" ON treinos_realizados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Permitir tudo em series_realizadas" ON series_realizadas FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- FIM DO SCRIPT
-- ============================================
