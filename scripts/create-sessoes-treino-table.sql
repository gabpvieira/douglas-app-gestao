-- Tabela para sessões de treino em andamento
-- Permite que o aluno retome o treino de onde parou
-- NOTA: Esta migration já foi aplicada via MCP Supabase

CREATE TABLE IF NOT EXISTS sessoes_treino_andamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  ficha_aluno_id UUID NOT NULL REFERENCES fichas_alunos(id) ON DELETE CASCADE,
  nome_ficha TEXT NOT NULL,
  exercicios JSONB NOT NULL, -- Array de exercícios com progresso
  tempo_inicio TIMESTAMP NOT NULL,
  tempo_acumulado INTEGER DEFAULT 0, -- Tempo em segundos já acumulado (para pausas)
  pausado BOOLEAN DEFAULT false,
  ultima_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Apenas uma sessão ativa por aluno
  CONSTRAINT unique_sessao_ativa_aluno UNIQUE (aluno_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessoes_treino_aluno ON sessoes_treino_andamento(aluno_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_treino_ficha ON sessoes_treino_andamento(ficha_aluno_id);

-- RLS Policies
ALTER TABLE sessoes_treino_andamento ENABLE ROW LEVEL SECURITY;

-- Alunos podem ver e gerenciar suas próprias sessões
CREATE POLICY "Alunos podem ver suas sessoes" ON sessoes_treino_andamento
  FOR SELECT USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()::text
    )
  );

CREATE POLICY "Alunos podem inserir suas sessoes" ON sessoes_treino_andamento
  FOR INSERT WITH CHECK (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()::text
    )
  );

CREATE POLICY "Alunos podem atualizar suas sessoes" ON sessoes_treino_andamento
  FOR UPDATE USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()::text
    )
  );

CREATE POLICY "Alunos podem deletar suas sessoes" ON sessoes_treino_andamento
  FOR DELETE USING (
    aluno_id IN (
      SELECT a.id FROM alunos a
      JOIN users_profile up ON a.user_profile_id = up.id
      WHERE up.auth_uid = auth.uid()::text
    )
  );

-- Admin pode ver todas as sessões
CREATE POLICY "Admin pode ver todas sessoes" ON sessoes_treino_andamento
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_profile up
      WHERE up.auth_uid = auth.uid()::text AND up.tipo = 'admin'
    )
  );
