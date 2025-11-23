const { getSupabaseAdmin } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  console.log('🔵 [Treinos Video API] Request received:', {
    method: req.method,
    url: req.url
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log('✅ [Treinos Video API] OPTIONS request handled');
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log('✅ [Treinos Video API] Supabase client created');

    if (req.method === 'GET') {
      console.log('📥 [Treinos Video API] Fetching videos...');
      const { objetivo } = req.query;

      let query = supabase
        .from('treinos_video')
        .select('*')
        .order('createdAt', { ascending: false });

      if (objetivo) {
        query = query.eq('objetivo', objetivo);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [Treinos Video API] Supabase error:', error);
        throw error;
      }

      console.log(`✅ [Treinos Video API] Found ${data?.length || 0} videos`);
      return res.status(200).json(data || []);
    }

    console.log('⚠️ [Treinos Video API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [Treinos Video API] Fatal error:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });

    return res.status(500).json({
      error: error.message || 'Internal server error',
      code: error.code,
      details: error.details,
      hint: error.hint
    });
  }
};
