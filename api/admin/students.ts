const { getSupabaseAdmin } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  console.log('🔵 [Students API] Request received:', {
    method: req.method,
    url: req.url
  });

  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    console.log('✅ [Students API] OPTIONS request handled');
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log('✅ [Students API] Supabase client created');

    if (req.method === 'GET') {
      console.log('📥 [Students API] Fetching students...');

      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('tipo', 'aluno')
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('❌ [Students API] Supabase error:', error);
        throw error;
      }

      console.log(`✅ [Students API] Found ${data?.length || 0} students`);
      return res.status(200).json(data || []);
    }

    if (req.method === 'POST') {
      console.log('📤 [Students API] Creating student:', req.body);

      const { data, error } = await supabase
        .from('users_profile')
        .insert([{ ...req.body, tipo: 'aluno' }])
        .select()
        .single();

      if (error) {
        console.error('❌ [Students API] Supabase error:', error);
        throw error;
      }

      console.log('✅ [Students API] Student created:', data);
      return res.status(201).json(data);
    }

    console.log('⚠️ [Students API] Method not allowed:', req.method);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [Students API] Fatal error:', {
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
