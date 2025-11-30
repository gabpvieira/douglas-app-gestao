-- =====================================================
-- Atualização dos tipos de plano na tabela assinaturas
-- =====================================================
-- Data: 2025-11-26
-- Descrição: Adiciona novos tipos de plano (online e presencial)
-- =====================================================

-- Remover a constraint antiga que só aceitava: mensal, trimestral, familia
ALTER TABLE assinaturas DROP CONSTRAINT IF EXISTS assinaturas_plano_tipo_check;

-- Criar nova constraint com todos os tipos de plano
ALTER TABLE assinaturas ADD CONSTRAINT assinaturas_plano_tipo_check 
CHECK (plano_tipo = ANY (ARRAY[
  -- Planos antigos (manter compatibilidade)
  'mensal'::text, 
  'trimestral'::text, 
  'familia'::text,
  
  -- Novos planos online
  'online_mensal'::text,
  'online_trimestral'::text,
  'online_familia'::text,
  
  -- Novos planos presenciais
  'presencial_3x'::text,
  'presencial_4x'::text,
  'presencial_5x'::text,
  
  -- Plano personalizado
  'personalizado'::text
]));

-- Verificar a constraint
SELECT conname, pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'assinaturas'::regclass
AND conname = 'assinaturas_plano_tipo_check';

-- =====================================================
-- Valores dos planos (referência)
-- =====================================================
-- Online:
--   - Mensal: R$ 100,00 (10000 centavos)
--   - Trimestral: R$ 250,00 (25000 centavos) - Economize R$ 50
--   - Família: R$ 90,00/pessoa (9000 centavos) - Mínimo 2 pessoas
--
-- Presencial:
--   - 3x/semana: R$ 450,00 (45000 centavos)
--   - 4x/semana: R$ 550,00 (55000 centavos)
--   - 5x/semana: R$ 700,00 (70000 centavos)
--
-- Personalizado: Valor definido pelo admin
-- =====================================================
