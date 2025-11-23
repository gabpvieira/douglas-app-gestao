const { getSupabaseAdmin } = require('../../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;
    
    console.log('🎬 [Admin Treinos Stream API] Generating stream URL for:', id);

    const { data: video, error: fetchError } = await supabase
      .from('treinos_video')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Generate signed URL for streaming (valid for 1 hour)
    const fileName = video.url_video?.split('/').pop();
    
    if (!fileName) {
      return res.status(200).json({
        id: video.id,
        nome: video.nome,
        streamUrl: video.url_video,
        duracao: video.duracao || 0,
        expiresIn: 3600
      });
    }

    const { data: signedData, error: signedError } = await supabase.storage
      .from('videos')
      .createSignedUrl(fileName, 3600);

    if (signedError) {
      console.error('❌ Error generating signed URL:', signedError);
      return res.status(200).json({
        id: video.id,
        nome: video.nome,
        streamUrl: video.url_video,
        duracao: video.duracao || 0,
        expiresIn: 3600
      });
    }

    return res.status(200).json({
      id: video.id,
      nome: video.nome,
      streamUrl: signedData.signedUrl,
      duracao: video.duracao || 0,
      expiresIn: 3600
    });
  } catch (error) {
    console.error('❌ [Admin Treinos Stream API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
