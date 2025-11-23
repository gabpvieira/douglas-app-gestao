const { getSupabaseAdmin } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  console.log('🔍 [Fichas API] Iniciando requisição:', req.method);

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Usar helper centralizado
    const supabase = getSupabaseAdmin();
    console.log('✅ [Fichas API] Supabase client criado');

    const { id, action, atribuicaoId } = req.query;
    const idParam = Array.isArray(id) ? id[0] : id;

    // GET /api/fichas-treino/stats/geral - Estatísticas gerais
    if (req.method === 'GET' && action === 'stats') {
      console.log('📊 [Fichas API] Buscando estatísticas...');

      const { data: fichas } = await supabase
        .from('fichas_treino')
        .select('id, ativo, exercicios:exercicios_ficha(id)');

      const { data: atribuicoes } = await supabase
        .from('fichas_atribuicoes')
        .select('aluno_id')
        .eq('status', 'ativo');

      const totalFichas = fichas?.length || 0;
      const fichasAtivas = fichas?.filter(f => f.ativo === 'true').length || 0;
      const totalExercicios = fichas?.reduce((acc, f) => acc + (f.exercicios?.length || 0), 0) || 0;
      const alunosComFichas = new Set(atribuicoes?.map(a => a.aluno_id) || []).size;

      return res.status(200).json({
        totalFichas,
        fichasAtivas,
        totalExercicios,
        alunosComFichas
      });
    }

    // POST /api/fichas-treino/:id/atribuir - Atribuir ficha a aluno
    if (req.method === 'POST' && idParam && action === 'atribuir') {
      console.log('👤 [Fichas API] Atribuindo ficha...');

      const { data, error } = await supabase
        .from('fichas_atribuicoes')
        .insert({
          ficha_id: idParam,
          ...req.body
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(data);
    }

    // GET /api/fichas-treino/:id/atribuicoes - Buscar atribuições de uma ficha
    if (req.method === 'GET' && idParam && action === 'atribuicoes') {
      console.log('📋 [Fichas API] Buscando atribuições...');

      const { data, error } = await supabase
        .from('fichas_atribuicoes')
        .select(`
          *,
          aluno:alunos(id, nome, email)
        `)
        .eq('ficha_id', idParam)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json(data || []);
    }

    // DELETE /api/fichas-treino/:id/atribuicoes/:atribuicaoId - Remover atribuição
    if (req.method === 'DELETE' && idParam && atribuicaoId) {
      console.log('🗑️ [Fichas API] Removendo atribuição...');

      const { error } = await supabase
        .from('fichas_atribuicoes')
        .delete()
        .eq('id', atribuicaoId)
        .eq('ficha_id', idParam);

      if (error) throw error;
      return res.status(204).end();
    }

    // Roteamento para operações com ID (GET single, PUT, DELETE)
    if (idParam) {
      // GET - Buscar ficha específica
      if (req.method === 'GET') {
        const { data: ficha, error: fichaError } = await supabase
          .from('fichas_treino')
          .select(`
            *,
            exercicios:exercicios_ficha(*)
          `)
          .eq('id', idParam)
          .single();

        if (fichaError || !ficha) {
          console.error('Error fetching ficha:', fichaError);
          return res.status(404).json({ error: 'Ficha não encontrada' });
        }

        return res.status(200).json(ficha);
      }

      // PUT - Atualizar ficha
      if (req.method === 'PUT') {
        const { exercicios, ...fichaData } = req.body;

        // Atualizar ficha
        const { data: fichaAtualizada, error: fichaError } = await supabase
          .from('fichas_treino')
          .update({ ...fichaData, updated_at: new Date().toISOString() })
          .eq('id', idParam)
          .select()
          .single();

        if (fichaError || !fichaAtualizada) {
          return res.status(404).json({ error: 'Ficha não encontrada' });
        }

        // Se exercícios foram fornecidos, atualizar
        if (exercicios && exercicios.length > 0) {
          // Remover exercícios antigos
          await supabase.from('exercicios_ficha').delete().eq('ficha_id', idParam);

          // Inserir novos exercícios
          const exerciciosComFichaId = exercicios.map((ex, index) => ({
            ...ex,
            ficha_id: idParam,
            ordem: index
          }));

          const { error: exerciciosError } = await supabase
            .from('exercicios_ficha')
            .insert(exerciciosComFichaId);

          if (exerciciosError) throw exerciciosError;
        }

        // Buscar ficha atualizada com exercícios
        const { data: exerciciosAtualizados } = await supabase
          .from('exercicios_ficha')
          .select('*')
          .eq('ficha_id', idParam)
          .order('ordem', { ascending: true });

        return res.status(200).json({
          ...fichaAtualizada,
          exercicios: exerciciosAtualizados || []
        });
      }

      // DELETE - Remover ficha
      if (req.method === 'DELETE') {
        // Remover exercícios primeiro
        await supabase.from('exercicios_ficha').delete().eq('ficha_id', idParam);

        // Remover ficha
        const { error } = await supabase
          .from('fichas_treino')
          .delete()
          .eq('id', idParam);

        if (error) throw error;

        return res.status(204).end();
      }
    }

    // GET - Listar todas as fichas
    if (req.method === 'GET') {
      console.log('🔍 [Fichas API] Buscando fichas...');

      const { data: fichas, error } = await supabase
        .from('fichas_treino')
        .select(`
          *,
          exercicios:exercicios_ficha(*)
        `)
        .order('created_at', { ascending: false });

      console.log('🔍 [Fichas API] Resultado:', {
        fichasCount: fichas?.length || 0,
        hasError: !!error,
        errorMessage: error?.message,
        errorDetails: error?.details
      });

      if (error) {
        console.error('❌ [Fichas API] Erro ao buscar fichas:', error);
        throw error;
      }

      console.log('✅ [Fichas API] Retornando', fichas?.length || 0, 'fichas');
      return res.status(200).json(fichas || []);
    }

    // POST - Criar nova ficha
    if (req.method === 'POST') {
      const { exercicios, ...fichaData } = req.body;

      // Criar ficha
      const { data: novaFicha, error: fichaError } = await supabase
        .from('fichas_treino')
        .insert([fichaData])
        .select()
        .single();

      if (fichaError) {
        console.error('Error creating ficha:', fichaError);
        throw fichaError;
      }

      // Criar exercícios se fornecidos
      let exerciciosCriados = [];
      if (exercicios && exercicios.length > 0) {
        const exerciciosComFichaId = exercicios.map((ex, index) => ({
          ...ex,
          ficha_id: novaFicha.id,
          ordem: ex.ordem || index + 1
        }));

        const { data: exData, error: exError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId)
          .select();

        if (exError) {
          console.error('Error creating exercicios:', exError);
          throw exError;
        }
        exerciciosCriados = exData || [];
      }

      return res.status(201).json({ ...novaFicha, exercicios: exerciciosCriados });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in fichas-treino API:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
};
