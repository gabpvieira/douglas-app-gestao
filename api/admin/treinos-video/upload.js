const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    console.log('📤 [Admin Treinos Upload API] Processing upload...');

    // Para Vercel, o upload de arquivos grandes precisa ser tratado diferente
    // Por enquanto, retornar erro informativo
    return res.status(501).json({
      error: 'Upload de vídeos deve ser feito via desenvolvimento local',
      message: 'Vercel serverless functions têm limite de 4.5MB para body. Use ambiente de desenvolvimento para uploads.'
    });
  } catch (error) {
    console.error('❌ [Admin Treinos Upload API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
