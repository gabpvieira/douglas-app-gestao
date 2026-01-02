-- Tabela para armazenar inscrições de push notifications
-- Suporta múltiplos dispositivos por aluno

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  
  -- Dados da inscrição (Push API)
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  
  -- Metadados do dispositivo
  user_agent TEXT,
  device_name TEXT,
  device_type TEXT, -- 'mobile', 'desktop', 'tablet'
  browser TEXT, -- 'chrome', 'firefox', 'safari', 'edge'
  os TEXT, -- 'android', 'ios', 'windows', 'macos', 'linux'
  
  -- Preferências de notificação
  enabled BOOLEAN NOT NULL DEFAULT true,
  notifications_treino BOOLEAN NOT NULL DEFAULT true,
  notifications_descanso BOOLEAN NOT NULL DEFAULT true,
  notifications_agenda BOOLEAN NOT NULL DEFAULT true,
  notifications_mensagens BOOLEAN NOT NULL DEFAULT false,
  
  -- Controle
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_aluno_id ON push_subscriptions(aluno_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_enabled ON push_subscriptions(enabled);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_used ON push_subscriptions(last_used_at);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Alunos podem ver e gerenciar apenas suas próprias inscrições
CREATE POLICY "Alunos podem ver suas próprias inscrições"
  ON push_subscriptions FOR SELECT
  USING (
    aluno_id IN (
      SELECT id FROM alunos 
      WHERE user_profile_id IN (
        SELECT id FROM users_profile 
        WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY "Alunos podem criar suas próprias inscrições"
  ON push_subscriptions FOR INSERT
  WITH CHECK (
    aluno_id IN (
      SELECT id FROM alunos 
      WHERE user_profile_id IN (
        SELECT id FROM users_profile 
        WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY "Alunos podem atualizar suas próprias inscrições"
  ON push_subscriptions FOR UPDATE
  USING (
    aluno_id IN (
      SELECT id FROM alunos 
      WHERE user_profile_id IN (
        SELECT id FROM users_profile 
        WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY "Alunos podem deletar suas próprias inscrições"
  ON push_subscriptions FOR DELETE
  USING (
    aluno_id IN (
      SELECT id FROM alunos 
      WHERE user_profile_id IN (
        SELECT id FROM users_profile 
        WHERE auth_uid = auth.uid()
      )
    )
  );

-- Política: Admins podem ver e gerenciar todas as inscrições
CREATE POLICY "Admins podem gerenciar todas as inscrições"
  ON push_subscriptions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users_profile 
      WHERE auth_uid = auth.uid() 
      AND tipo = 'admin'
    )
  );

-- Função para limpar inscrições antigas (não usadas há mais de 90 dias)
CREATE OR REPLACE FUNCTION cleanup_old_push_subscriptions()
RETURNS void AS $$
BEGIN
  DELETE FROM push_subscriptions
  WHERE last_used_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Comentários
COMMENT ON TABLE push_subscriptions IS 'Armazena inscrições de push notifications para múltiplos dispositivos por aluno';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL única do endpoint de push notification';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Chave pública do cliente (base64)';
COMMENT ON COLUMN push_subscriptions.auth IS 'Segredo de autenticação (base64)';
COMMENT ON COLUMN push_subscriptions.enabled IS 'Se as notificações estão habilitadas para este dispositivo';
COMMENT ON COLUMN push_subscriptions.last_used_at IS 'Última vez que este dispositivo foi usado (para limpeza)';
