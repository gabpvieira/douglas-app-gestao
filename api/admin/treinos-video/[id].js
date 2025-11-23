const { getSupabaseAdmin } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;

    // GET - Buscar vídeo específico
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // PUT - Atualizar metadados do vídeo
    if (req.method === 'PUT') {
      const { nome, objetivo, descricao, duracao } = req.body;

      const { data, error } = await supabase
        .from('treinos_video')
        .update({
          nome,
          objetivo,
          descricao,
          duracao
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // DELETE - Remover vídeo
    if (req.method === 'DELETE') {
      const { data: video, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Delete video file from storage
      if (video.url_video) {
        const fileName = video.url_video.split('/').pop();
        await supabase.storage.from('videos').remove([fileName]);
      }

      // Delete thumbnail from storage
      if (video.thumbnail_url) {
        const thumbName = video.thumbnail_url.split('/').pop();
        await supabase.storage.from('thumbnails').remove([thumbName]);
      }

      // Delete database record
      const { error: deleteError } = await supabase
        .from('treinos_video')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      console.log('✅ [Admin Treinos Video API] Video deleted successfully');
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('❌ [Admin Treinos Video API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
};
