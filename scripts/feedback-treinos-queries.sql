-- ============================================
-- QUERIES ÚTEIS PARA FEEDBACK DE TREINOS
-- ============================================

-- 1. Ver todos os feedbacks com informações do aluno
SELECT 
  ft.id,
  ft.estrelas,
  ft.comentario,
  ft.created_at,
  up.nome as aluno_nome,
  up.email as aluno_email,
  ft.treino_id
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
ORDER BY ft.created_at DESC;

-- 2. Estatísticas gerais de feedbacks
SELECT 
  COUNT(*) as total_feedbacks,
  ROUND(AVG(estrelas), 2) as media_estrelas,
  COUNT(CASE WHEN estrelas = 5 THEN 1 END) as cinco_estrelas,
  COUNT(CASE WHEN estrelas = 4 THEN 1 END) as quatro_estrelas,
  COUNT(CASE WHEN estrelas = 3 THEN 1 END) as tres_estrelas,
  COUNT(CASE WHEN estrelas = 2 THEN 1 END) as duas_estrelas,
  COUNT(CASE WHEN estrelas = 1 THEN 1 END) as uma_estrela,
  COUNT(CASE WHEN comentario IS NOT NULL AND comentario != '' THEN 1 END) as com_comentario
FROM feedback_treinos;

-- 3. Feedbacks por aluno
SELECT 
  up.nome as aluno,
  COUNT(*) as total_feedbacks,
  ROUND(AVG(ft.estrelas), 2) as media_estrelas,
  COUNT(CASE WHEN ft.comentario IS NOT NULL THEN 1 END) as feedbacks_com_comentario
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
GROUP BY up.nome, a.id
ORDER BY total_feedbacks DESC;

-- 4. Feedbacks recentes (últimos 7 dias)
SELECT 
  up.nome as aluno,
  ft.estrelas,
  ft.comentario,
  ft.created_at
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
WHERE ft.created_at >= NOW() - INTERVAL '7 days'
ORDER BY ft.created_at DESC;

-- 5. Feedbacks negativos (1-2 estrelas)
SELECT 
  up.nome as aluno,
  up.email,
  ft.estrelas,
  ft.comentario,
  ft.created_at
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
WHERE ft.estrelas <= 2
ORDER BY ft.created_at DESC;

-- 6. Alunos que nunca deram feedback
SELECT 
  up.nome as aluno,
  up.email,
  a.created_at as cadastrado_em
FROM alunos a
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN feedback_treinos ft ON a.id = ft.aluno_id
WHERE ft.id IS NULL
  AND a.status = 'ativo'
ORDER BY a.created_at DESC;

-- 7. Evolução de feedbacks por mês
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as total_feedbacks,
  ROUND(AVG(estrelas), 2) as media_estrelas
FROM feedback_treinos
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- 8. Top 10 comentários mais recentes
SELECT 
  up.nome as aluno,
  ft.estrelas,
  ft.comentario,
  ft.created_at
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
WHERE ft.comentario IS NOT NULL 
  AND ft.comentario != ''
ORDER BY ft.created_at DESC
LIMIT 10;

-- 9. Verificar integridade dos dados
SELECT 
  'Total de feedbacks' as metrica,
  COUNT(*)::text as valor
FROM feedback_treinos
UNION ALL
SELECT 
  'Feedbacks com aluno_id inválido',
  COUNT(*)::text
FROM feedback_treinos ft
LEFT JOIN alunos a ON ft.aluno_id = a.id
WHERE a.id IS NULL
UNION ALL
SELECT 
  'Feedbacks com estrelas fora do range',
  COUNT(*)::text
FROM feedback_treinos
WHERE estrelas < 1 OR estrelas > 5
UNION ALL
SELECT 
  'Feedbacks órfãos (treino não existe)',
  COUNT(*)::text
FROM feedback_treinos ft
LEFT JOIN fichas_alunos fa ON ft.treino_id = fa.id
WHERE fa.id IS NULL;

-- 10. Limpar feedbacks de teste (CUIDADO!)
-- DELETE FROM feedback_treinos 
-- WHERE created_at < NOW() - INTERVAL '1 hour'
--   AND comentario LIKE '%teste%';

-- ============================================
-- MANUTENÇÃO E OTIMIZAÇÃO
-- ============================================

-- Verificar uso dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'feedback_treinos'
ORDER BY idx_scan DESC;

-- Verificar tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('feedback_treinos')) as tamanho_total,
  pg_size_pretty(pg_relation_size('feedback_treinos')) as tamanho_tabela,
  pg_size_pretty(pg_indexes_size('feedback_treinos')) as tamanho_indices;

-- Analisar performance da tabela
ANALYZE feedback_treinos;

-- Vacuum (limpeza)
VACUUM ANALYZE feedback_treinos;

-- ============================================
-- BACKUP E RESTORE
-- ============================================

-- Exportar feedbacks para backup (executar no psql)
-- \copy (SELECT * FROM feedback_treinos) TO 'feedback_treinos_backup.csv' CSV HEADER;

-- Importar feedbacks do backup (executar no psql)
-- \copy feedback_treinos FROM 'feedback_treinos_backup.csv' CSV HEADER;

-- ============================================
-- TESTES DE RLS (Row Level Security)
-- ============================================

-- Testar como aluno (substituir USER_AUTH_UID pelo auth.uid() do aluno)
-- SET LOCAL role authenticated;
-- SET LOCAL request.jwt.claims TO '{"sub": "USER_AUTH_UID"}';

-- Tentar ver feedbacks (deve ver apenas os próprios)
-- SELECT * FROM feedback_treinos;

-- Tentar deletar feedback (deve falhar)
-- DELETE FROM feedback_treinos WHERE id = 'FEEDBACK_ID';

-- Resetar role
-- RESET role;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View de feedbacks com informações completas
CREATE OR REPLACE VIEW vw_feedbacks_completos AS
SELECT 
  ft.id,
  ft.aluno_id,
  up.nome as aluno_nome,
  up.email as aluno_email,
  ft.treino_id,
  fa.data_inicio as treino_data_inicio,
  f.nome as ficha_nome,
  ft.estrelas,
  ft.comentario,
  ft.created_at
FROM feedback_treinos ft
INNER JOIN alunos a ON ft.aluno_id = a.id
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN fichas_alunos fa ON ft.treino_id = fa.id
LEFT JOIN fichas_treino f ON fa.ficha_id = f.id;

-- View de estatísticas por aluno
CREATE OR REPLACE VIEW vw_estatisticas_feedback_aluno AS
SELECT 
  a.id as aluno_id,
  up.nome as aluno_nome,
  COUNT(ft.id) as total_feedbacks,
  ROUND(AVG(ft.estrelas), 2) as media_estrelas,
  COUNT(CASE WHEN ft.estrelas = 5 THEN 1 END) as feedbacks_5_estrelas,
  COUNT(CASE WHEN ft.estrelas <= 2 THEN 1 END) as feedbacks_negativos,
  COUNT(CASE WHEN ft.comentario IS NOT NULL AND ft.comentario != '' THEN 1 END) as feedbacks_com_comentario,
  MAX(ft.created_at) as ultimo_feedback
FROM alunos a
INNER JOIN users_profile up ON a.user_profile_id = up.id
LEFT JOIN feedback_treinos ft ON a.id = ft.aluno_id
WHERE a.status = 'ativo'
GROUP BY a.id, up.nome;

-- Usar as views
-- SELECT * FROM vw_feedbacks_completos ORDER BY created_at DESC LIMIT 10;
-- SELECT * FROM vw_estatisticas_feedback_aluno ORDER BY media_estrelas DESC;
