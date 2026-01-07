-- Migration: Adicionar suporte a Bi-Set
-- Data: 2026-01-07
-- Descrição: Adiciona campo biset_grupo_id para agrupar exercícios em Bi-sets

-- Adicionar coluna biset_grupo_id na tabela exercicios_ficha
ALTER TABLE exercicios_ficha 
ADD COLUMN IF NOT EXISTS biset_grupo_id UUID DEFAULT NULL;

-- Criar índice para consultas de agrupamento (apenas para registros não-nulos)
CREATE INDEX IF NOT EXISTS idx_exercicios_biset_grupo 
ON exercicios_ficha(biset_grupo_id) 
WHERE biset_grupo_id IS NOT NULL;

-- Comentário explicativo na coluna
COMMENT ON COLUMN exercicios_ficha.biset_grupo_id IS 
'UUID compartilhado entre exercícios do mesmo Bi-set. NULL = exercício individual.';

-- Função para validar Bi-sets de uma ficha
CREATE OR REPLACE FUNCTION validar_bisets_ficha(p_ficha_id UUID)
RETURNS TABLE (
  biset_grupo_id UUID,
  total_exercicios INTEGER,
  series_distintas INTEGER,
  is_valid BOOLEAN,
  erro TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.biset_grupo_id,
    COUNT(*)::INTEGER as total_exercicios,
    COUNT(DISTINCT e.series)::INTEGER as series_distintas,
    (COUNT(*) = 2 AND COUNT(DISTINCT e.series) = 1) as is_valid,
    CASE 
      WHEN COUNT(*) != 2 THEN 'Bi-set deve ter exatamente 2 exercícios'
      WHEN COUNT(DISTINCT e.series) > 1 THEN 'Exercícios do Bi-set devem ter o mesmo número de séries'
      ELSE NULL
    END as erro
  FROM exercicios_ficha e
  WHERE e.ficha_id = p_ficha_id 
    AND e.biset_grupo_id IS NOT NULL
  GROUP BY e.biset_grupo_id;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar exercícios com informações de Bi-set
CREATE OR REPLACE FUNCTION buscar_exercicios_com_biset(p_ficha_id UUID)
RETURNS TABLE (
  id UUID,
  ficha_id UUID,
  video_id UUID,
  nome TEXT,
  grupo_muscular TEXT,
  ordem INTEGER,
  series INTEGER,
  repeticoes TEXT,
  descanso INTEGER,
  observacoes TEXT,
  tecnica TEXT,
  biset_grupo_id UUID,
  biset_posicao INTEGER,
  biset_parceiro_id UUID,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id::UUID,
    e.ficha_id::UUID,
    e.video_id::UUID,
    e.nome,
    e.grupo_muscular,
    e.ordem,
    e.series,
    e.repeticoes,
    e.descanso,
    e.observacoes,
    e.tecnica,
    e.biset_grupo_id,
    CASE 
      WHEN e.biset_grupo_id IS NOT NULL THEN 
        ROW_NUMBER() OVER (
          PARTITION BY e.biset_grupo_id 
          ORDER BY e.ordem
        )::INTEGER
      ELSE NULL 
    END as biset_posicao,
    CASE 
      WHEN e.biset_grupo_id IS NOT NULL THEN 
        (SELECT e2.id::UUID 
         FROM exercicios_ficha e2 
         WHERE e2.biset_grupo_id = e.biset_grupo_id 
           AND e2.id != e.id 
         LIMIT 1)
      ELSE NULL 
    END as biset_parceiro_id,
    e.created_at,
    e.updated_at
  FROM exercicios_ficha e
  WHERE e.ficha_id = p_ficha_id
  ORDER BY e.ordem;
END;
$$ LANGUAGE plpgsql;

-- Verificar se a migration foi aplicada com sucesso
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exercicios_ficha' 
      AND column_name = 'biset_grupo_id'
  ) THEN
    RAISE NOTICE 'Migration aplicada com sucesso: coluna biset_grupo_id criada';
  ELSE
    RAISE EXCEPTION 'Falha na migration: coluna biset_grupo_id não foi criada';
  END IF;
END $$;
