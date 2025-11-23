const { getSupabaseAdmin } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  console.log('🔵 [Admin Planos API] Request:', {
    method: req.method,
    url: req.url,
    query: req.query
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { method, query } = req;
    const { id, action } = query;

    // GET /api/admin/planos-alimentares/all - Listar todos os planos
    if (method === 'GET' && action === 'all') {
      console.log('📥 [Admin Planos API] Fetching all planos...');
      
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [Admin Planos API] Error:', error);
        throw error;
      }

      console.log(`✅ [Admin Planos API] Found ${data?.length || 0} planos`);
      return res.status(200).json(data || []);
    }

    // GET /api/admin/planos-alimentares?id=xxx - Buscar plano específico
    if (method === 'GET' && id) {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - Criar novo plano
    if (method === 'POST') {
      const { refeicoes, ...planoData } = req.body;

      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .insert(planoData)
        .select()
        .single();

      if (planoError) throw planoError;

      if (refeicoes && refeicoes.length > 0) {
        const refeicoesComPlanoId = refeicoes.map((r) => ({
          ...r,
          plano_alimentar_id: plano.id
        }));

        const { error: refeicoesError } = await supabase
          .from('refeicoes_plano')
          .insert(refeicoesComPlanoId);

        if (refeicoesError) throw refeicoesError;
      }

      const { data: planoCompleto, error: fetchError } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', plano.id)
        .single();

      if (fetchError) throw fetchError;
      return res.status(201).json(planoCompleto);
    }

    // PUT - Atualizar plano
    if (method === 'PUT' && id) {
      const { refeicoes, ...planoData } = req.body;

      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .update(planoData)
        .eq('id', id)
        .select()
        .single();

      if (planoError) throw planoError;

      if (refeicoes) {
        await supabase
          .from('refeicoes_plano')
          .delete()
          .eq('plano_alimentar_id', id);

        if (refeicoes.length > 0) {
          const refeicoesComPlanoId = refeicoes.map((r) => ({
            ...r,
            plano_alimentar_id: id
          }));

          const { error: refeicoesError } = await supabase
            .from('refeicoes_plano')
            .insert(refeicoesComPlanoId);

          if (refeicoesError) throw refeicoesError;
        }
      }

      const { data: planoCompleto, error: fetchError } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return res.status(200).json(planoCompleto);
    }

    // DELETE - Remover plano
    if (method === 'DELETE' && id) {
      await supabase
        .from('refeicoes_plano')
        .delete()
        .eq('plano_alimentar_id', id);

      const { error } = await supabase
        .from('planos_alimentares')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [Admin Planos API] Fatal error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
};
