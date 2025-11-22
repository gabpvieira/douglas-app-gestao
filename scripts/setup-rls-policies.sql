-- ============================================
-- CONFIGURAÇÃO COMPLETA: RLS, TRIGGERS E ÍNDICES
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- ============================================
-- PARTE 1: HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE excecoes_disponibilidade ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_treino ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercicios_ficha ENABLE ROW LEVEL SECURITY;
ALTER TABLE fichas_alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE treinos_realizados ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_realizadas ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PARTE 2: REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
-- ============================================

DROP POLICY IF EXISTS "Admin vê todos os perfis" ON users_profile;
DROP POLICY IF EXISTS "Usuário vê seu perfil" ON users_profile;
DROP POLICY IF EXISTS "Admin atualiza perfis" ON users_profile;
DROP POLICY IF EXISTS "Usuário atualiza seu perfil" ON users_profile;
DROP POLICY IF EXISTS "Permitir criação de perfis" ON users_profile;

DROP POLICY IF EXISTS "Admin vê todos os alunos" ON alunos;
DROP POLICY IF EXISTS "Aluno vê seu registro" ON alunos;
DROP POLICY IF EXISTS "Admin gerencia alunos" ON alunos;

DROP POLICY IF EXISTS "Admin gerencia blocos" ON blocos_horarios;
DROP POLICY IF EXISTS "Alunos veem blocos ativos" ON blocos_horarios;

DROP POLICY IF EXISTS "Admin vê agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Aluno vê seus agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Admin gerencia agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Aluno cria agendamentos" ON agendamentos;

DROP POLICY IF EXISTS "Admin gerencia fichas" ON fichas_treino;
DROP POLICY IF EXISTS "Alunos veem fichas ativas" ON fichas_treino;

DROP POLICY IF EXISTS "Admin gerencia exercícios" ON exercicios_ficha;
DROP POLICY IF EXISTS "Alunos veem exercícios" ON exercicios_ficha;

DROP POLICY IF EXISTS "Admin gerencia atribuições" ON fichas_alunos;
DROP POLICY IF EXISTS "Aluno vê suas fichas" ON fichas_alunos;

DROP POLICY IF EXISTS "Admin vê treinos realizados" ON treinos_realizados;
DROP POLICY IF EXISTS "Aluno vê seus treinos" ON treinos_realizados;
DROP POLICY IF EXISTS "Aluno registra treinos" ON treinos_realizados;

DROP POLICY IF EXISTS "Admin vê séries" ON series_realizadas;
DROP POLICY IF EXISTS "Aluno vê suas séries" ON series_realizadas;
DROP POLICY IF EXISTS "Aluno registra séries" ON series_realizadas;

DROP POLICY IF EXISTS "Admin gerencia exceções" ON excecoes_disponibilidade;
DROP POLICY IF EXISTS "Alunos veem exceções" ON excecoes_disponibilidade;

-- ============================================
-- PARTE 3: POLÍTICAS PARA users_profile
-- ============================================

-- Admin vê todos os perfis
CREATE POLICY "Admin vê todos os perfis"
  ON users_profile FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Usuário vê seu próprio perfil
CREATE POLICY "Usuário vê seu perfil"
  ON users_profile FOR SELECT
  USING (auth_uid = auth.uid());

-- Admin atualiza qualquer perfil
CREATE POLICY "Admin atualiza perfis"
  ON users_profile FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Usuário atualiza seu próprio perfil
CREATE POLICY "Usuário atualiza seu perfil"
  ON users_profile FOR UPDATE
  USING (auth_uid = auth.uid());

-- Permitir inserção de novos perfis (para registro)
CREATE POLICY "Permitir criação de perfis"
  ON users_profile FOR INSERT
  WITH CHECK (true);

-- ============================================
-- PARTE 4: POLÍTICAS PARA alunos
-- ============================================

-- Admin vê todos os alunos
CREATE POLICY "Admin vê todos os alunos"
  ON alunos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê apenas seu próprio registro
CREATE POLICY "Aluno vê seu registro"
  ON alunos FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM users_profile WHERE auth_uid = auth.uid()
    )
  );

-- Admin gerencia alunos
CREATE POLICY "Admin gerencia alunos"
  ON alunos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- ============================================
-- PARTE 5: POLÍTICAS PARA blocos_horarios
-- ============================================

-- Admin gerencia blocos de horários
CREATE POLICY "Admin gerencia blocos"
  ON blocos_horarios FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos podem ver blocos ativos
CREATE POLICY "Alunos veem blocos ativos"
  ON blocos_horarios FOR SELECT
  USING (ativo = 'true');

-- ============================================
-- PARTE 6: POLÍTICAS PARA agendamentos
-- ============================================

-- Admin vê todos os agendamentos
CREATE POLICY "Admin vê agendamentos"
  ON agendamentos FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê seus agendamentos
CREATE POLICY "Aluno vê seus agendamentos"
  ON agendamentos FOR SELECT
  USING (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- Admin gerencia agendamentos
CREATE POLICY "Admin gerencia agendamentos"
  ON agendamentos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno pode criar agendamentos
CREATE POLICY "Aluno cria agendamentos"
  ON agendamentos FOR INSERT
  WITH CHECK (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- ============================================
-- PARTE 7: POLÍTICAS PARA fichas_treino
-- ============================================

-- Admin gerencia fichas
CREATE POLICY "Admin gerencia fichas"
  ON fichas_treino FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem fichas ativas
CREATE POLICY "Alunos veem fichas ativas"
  ON fichas_treino FOR SELECT
  USING (ativo = 'true');

-- ============================================
-- PARTE 8: POLÍTICAS PARA exercicios_ficha
-- ============================================

-- Admin gerencia exercícios
CREATE POLICY "Admin gerencia exercícios"
  ON exercicios_ficha FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem exercícios de fichas ativas
CREATE POLICY "Alunos veem exercícios"
  ON exercicios_ficha FOR SELECT
  USING (
    ficha_id IN (
      SELECT id FROM fichas_treino WHERE ativo = 'true'
    )
  );

-- ============================================
-- PARTE 9: POLÍTICAS PARA fichas_alunos
-- ============================================

-- Admin gerencia atribuições
CREATE POLICY "Admin gerencia atribuições"
  ON fichas_alunos FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê suas fichas atribuídas
CREATE POLICY "Aluno vê suas fichas"
  ON fichas_alunos FOR SELECT
  USING (
    aluno_id IN (
      SELECT id FROM alunos WHERE user_profile_id IN (
        SELECT id FROM users_profile WHERE auth_uid = auth.uid()
      )
    )
  );

-- ============================================
-- PARTE 10: POLÍTICAS PARA treinos_realizados
-- ============================================

-- Admin vê todos os treinos
CREATE POLICY "Admin vê treinos realizados"
  ON treinos_realizados FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê seus treinos
CREATE POLICY "Aluno vê seus treinos"
  ON treinos_realizados FOR SELECT
  USING (
    ficha_aluno_id IN (
      SELECT id FROM fichas_alunos WHERE aluno_id IN (
        SELECT id FROM alunos WHERE user_profile_id IN (
          SELECT id FROM users_profile WHERE auth_uid = auth.uid()
        )
      )
    )
  );

-- Aluno registra seus treinos
CREATE POLICY "Aluno registra treinos"
  ON treinos_realizados FOR INSERT
  WITH CHECK (
    ficha_aluno_id IN (
      SELECT id FROM fichas_alunos WHERE aluno_id IN (
        SELECT id FROM alunos WHERE user_profile_id IN (
          SELECT id FROM users_profile WHERE auth_uid = auth.uid()
        )
      )
    )
  );

-- ============================================
-- PARTE 11: POLÍTICAS PARA series_realizadas
-- ============================================

-- Admin vê todas as séries
CREATE POLICY "Admin vê séries"
  ON series_realizadas FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Aluno vê suas séries
CREATE POLICY "Aluno vê suas séries"
  ON series_realizadas FOR SELECT
  USING (
    treino_realizado_id IN (
      SELECT id FROM treinos_realizados WHERE ficha_aluno_id IN (
        SELECT id FROM fichas_alunos WHERE aluno_id IN (
          SELECT id FROM alunos WHERE user_profile_id IN (
            SELECT id FROM users_profile WHERE auth_uid = auth.uid()
          )
        )
      )
    )
  );

-- Aluno registra suas séries
CREATE POLICY "Aluno registra séries"
  ON series_realizadas FOR INSERT
  WITH CHECK (
    treino_realizado_id IN (
      SELECT id FROM treinos_realizados WHERE ficha_aluno_id IN (
        SELECT id FROM fichas_alunos WHERE aluno_id IN (
          SELECT id FROM alunos WHERE user_profile_id IN (
            SELECT id FROM users_profile WHERE auth_uid = auth.uid()
          )
        )
      )
    )
  );

-- ============================================
-- PARTE 12: POLÍTICAS PARA excecoes_disponibilidade
-- ============================================

-- Admin gerencia exceções
CREATE POLICY "Admin gerencia exceções"
  ON excecoes_disponibilidade FOR ALL
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM users_profile WHERE tipo = 'admin'
    )
  );

-- Alunos veem exceções ativas
CREATE POLICY "Alunos veem exceções"
  ON excecoes_disponibilidade FOR SELECT
  USING (ativo = 'true');

-- ============================================
-- PARTE 13: TRIGGERS AUTOMÁTICOS
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS update_users_profile_updated_at ON users_profile;
DROP TRIGGER IF EXISTS update_alunos_updated_at ON alunos;
DROP TRIGGER IF EXISTS update_blocos_horarios_updated_at ON blocos_horarios;
DROP TRIGGER IF EXISTS update_agendamentos_updated_at ON agendamentos;
DROP TRIGGER IF EXISTS update_excecoes_updated_at ON excecoes_disponibilidade;
DROP TRIGGER IF EXISTS update_fichas_treino_updated_at ON fichas_treino;
DROP TRIGGER IF EXISTS update_exercicios_ficha_updated_at ON exercicios_ficha;
DROP TRIGGER IF EXISTS update_fichas_alunos_updated_at ON fichas_alunos;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_users_profile_updated_at
  BEFORE UPDATE ON users_profile
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alunos_updated_at
  BEFORE UPDATE ON alunos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocos_horarios_updated_at
  BEFORE UPDATE ON blocos_horarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_excecoes_updated_at
  BEFORE UPDATE ON excecoes_disponibilidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_treino_updated_at
  BEFORE UPDATE ON fichas_treino
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercicios_ficha_updated_at
  BEFORE UPDATE ON exercicios_ficha
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fichas_alunos_updated_at
  BEFORE UPDATE ON fichas_alunos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para criar perfil automaticamente após registro
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users_profile (auth_uid, email, nome, tipo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'aluno')
  )
  ON CONFLICT (auth_uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PARTE 14: ÍNDICES PARA PERFORMANCE
-- ============================================

-- users_profile
CREATE INDEX IF NOT EXISTS idx_users_profile_auth_uid ON users_profile(auth_uid);
CREATE INDEX IF NOT EXISTS idx_users_profile_email ON users_profile(email);
CREATE INDEX IF NOT EXISTS idx_users_profile_tipo ON users_profile(tipo);

-- alunos
CREATE INDEX IF NOT EXISTS idx_alunos_user_profile_id ON alunos(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_alunos_status ON alunos(status);

-- blocos_horarios
CREATE INDEX IF NOT EXISTS idx_blocos_dia_semana ON blocos_horarios(dia_semana);
CREATE INDEX IF NOT EXISTS idx_blocos_ativo ON blocos_horarios(ativo);

-- agendamentos
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno ON agendamentos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_bloco ON agendamentos(bloco_horario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON agendamentos(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_aluno_data ON agendamentos(aluno_id, data_agendamento);

-- fichas_treino
CREATE INDEX IF NOT EXISTS idx_fichas_ativo ON fichas_treino(ativo);
CREATE INDEX IF NOT EXISTS idx_fichas_nivel ON fichas_treino(nivel);

-- exercicios_ficha
CREATE INDEX IF NOT EXISTS idx_exercicios_ficha_id ON exercicios_ficha(ficha_id);
CREATE INDEX IF NOT EXISTS idx_exercicios_ordem ON exercicios_ficha(ficha_id, ordem);
CREATE INDEX IF NOT EXISTS idx_exercicios_video ON exercicios_ficha(video_id);

-- fichas_alunos
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_ficha ON fichas_alunos(ficha_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_aluno ON fichas_alunos(aluno_id);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_status ON fichas_alunos(status);
CREATE INDEX IF NOT EXISTS idx_fichas_alunos_datas ON fichas_alunos(data_inicio, data_fim);

-- treinos_realizados
CREATE INDEX IF NOT EXISTS idx_treinos_ficha_aluno ON treinos_realizados(ficha_aluno_id);
CREATE INDEX IF NOT EXISTS idx_treinos_exercicio ON treinos_realizados(exercicio_id);
CREATE INDEX IF NOT EXISTS idx_treinos_data ON treinos_realizados(data_realizacao);

-- series_realizadas
CREATE INDEX IF NOT EXISTS idx_series_treino ON series_realizadas(treino_realizado_id);

-- excecoes_disponibilidade
CREATE INDEX IF NOT EXISTS idx_excecoes_datas ON excecoes_disponibilidade(data_inicio, data_fim);
CREATE INDEX IF NOT EXISTS idx_excecoes_ativo ON excecoes_disponibilidade(ativo);

-- ============================================
-- CONCLUÍDO!
-- ============================================

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar triggers criados
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Verificar índices criados
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
