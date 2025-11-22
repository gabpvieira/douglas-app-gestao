-- Criar tabela de fichas de treino
CREATE TABLE IF NOT EXISTS fichas_treino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  objetivo TEXT,
  nivel TEXT NOT NULL CHECK (nivel IN ('iniciante', 'intermediario', 'avancado')),
  duracao_semanas INTEGER NOT NULL DEFAULT 4,
  ativo TEXT NOT NULL DEFAULT 'true' CHECK (ativo IN ('true', 'false')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de exercícios da ficha
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de atribuição de fichas aos alunos
CREATE TABLE IF NOT EXISTS fichas_alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_id UUID NOT NULL REFERENCES fichas_treino(id) ON DELETE CASCADE,
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'pausado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de treinos realizados
CREATE TABLE IF NOT EXISTS treinos_realizados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ficha_aluno_id UUID NOT NULL REFERENCES fichas_alunos(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES exercicios_ficha(id),
  data_realizacao TIMESTAMP WITH TIME ZONE NOT NULL,
  series_realizadas INTEGER NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela de séries realizadas
CREATE TABLE IF NOT EXISTS series_realizadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treino_realizado_id UUID NOT NULL REFERENCES treinos_realizados(id) ON DELETE CASCADE,
  numero_serie INTEGER NOT NULL,
  carga TEXT NOT NULL,
  repeticoes INTEGER NOT NULL,
  concluida TEXT NOT NULL DEFAULT 'true' CHECK (concluida IN ('true', 'false')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_ficha_id ON exercicios_ficha(ficha_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_ordem ON exercicios_ficha(ficha_id, ordem);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_aluno_id ON fichas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_ficha_id ON fichas_alunos(ficha_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_status ON fichas_alunos(status);
CREATE INDEX IF NOT EXISTS idx_treinos_realizados_ficha_aluno_id ON treinos_realizados(ficha_aluno_id);
CREATE INDEX IF NOT EXISTS idx_treinos_realizados_data ON treinos_realizados(data_realizacao);
CREATE INDEX IF NOT EXISTS idx_series_realizadas_treino_id ON series_realizadas(treino_realizado_id);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para atualizar updated_at
DROP TRIGGER IF EXISTS update_fichas_treino_updated_at ON fichas_treino;
CREATE TRIGGER update_fichas_treino_updated_at
  BEFORE UPDATE ON fichas_treino
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exercicios_ficha_updated_at ON exercicios_ficha;
CREATE TRIGGER update_exercicios_ficha_updated_at
  BEFORE UPDATE ON exercicios_ficha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fichas_alunos_updated_at ON fichas_alunos;
CREATE TRIGGER update_fichas_alunos_updated_at
  BEFORE UPDATE ON fichas_alunos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE fichas_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_ficha ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_realizadas ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo por enquanto - ajustar conforme necessário)
CREATE POLICY "Permitir tudo em fichas_treino" ON fichas_treino FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em exercicios_ficha" ON exercicios_ficha FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em fichas_alunos" ON fichas_alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em treinos_realizados" ON treinos_realizados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo em series_realizadas" ON series_realizadas FOR ALL USING (true) WITH CHECK (true);

-- Inserir dados de exemplo
INSERT INTO fichas_treino (nome, descricao, objetivo, nivel, duracao_semanas) VALUES
('Treino ABC - Hipertrofia', 'Treino dividido em 3 dias focado em hipertrofia muscular', 'hipertrofia', 'intermediario', 8),
('Full Body Iniciante', 'Treino de corpo inteiro para iniciantes', 'condicionamento', 'iniciante', 4),
('Push Pull Legs', 'Divisão clássica de empurrar, puxar e pernas', 'hipertrofia', 'avancado', 12);

-- Inserir exercícios de exemplo para a primeira ficha
INSERT INTO exercicios_ficha (ficha_id, nome, grupo_muscular, ordem, series, repeticoes, descanso, observacoes) 
SELECT 
  id,
  'Supino Reto',
  'Peito',
  1,
  4,
  '8-12',
  90,
  'Manter escápulas retraídas'
FROM fichas_treino WHERE nome = 'Treino ABC - Hipertrofia' LIMIT 1;

INSERT INTO exercicios_ficha (ficha_id, nome, grupo_muscular, ordem, series, repeticoes, descanso, observacoes) 
SELECT 
  id,
  'Supino Inclinado',
  'Peito',
  2,
  3,
  '10-12',
  75,
  'Foco na porção superior do peitoral'
FROM fichas_treino WHERE nome = 'Treino ABC - Hipertrofia' LIMIT 1;

INSERT INTO exercicios_ficha (ficha_id, nome, grupo_muscular, ordem, series, repeticoes, descanso, observacoes) 
SELECT 
  id,
  'Crucifixo',
  'Peito',
  3,
  3,
  '12-15',
  60,
  'Amplitude completa do movimento'
FROM fichas_treino WHERE nome = 'Treino ABC - Hipertrofia' LIMIT 1;

INSERT INTO exercicios_ficha (ficha_id, nome, grupo_muscular, ordem, series, repeticoes, descanso, observacoes) 
SELECT 
  id,
  'Tríceps Testa',
  'Tríceps',
  4,
  3,
  '10-12',
  60,
  'Manter cotovelos fixos'
FROM fichas_treino WHERE nome = 'Treino ABC - Hipertrofia' LIMIT 1;

COMMENT ON TABLE fichas_treino IS 'Armazena as fichas de treino criadas pelo profissional';
COMMENT ON TABLE exercicios_ficha IS 'Armazena os exercícios de cada ficha de treino';
COMMENT ON TABLE fichas_alunos IS 'Relaciona fichas de treino com alunos';
COMMENT ON TABLE treinos_realizados IS 'Registra os treinos realizados pelos alunos';
COMMENT ON TABLE series_realizadas IS 'Registra cada série realizada em um treino';
