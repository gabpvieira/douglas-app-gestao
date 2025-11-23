const { getSupabaseAdmin } = require('../_lib/supabase');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

// Disable body parsing for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

module.exports = async function handler(req, res) {
  console.log('🔵 [Admin Treinos Video API] Request:', {
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

    // GET - Listar vídeos
    if (method === 'GET') {
      const { objetivo } = query;

      let queryBuilder = supabase
        .from('treinos_video')
        .select('*')
        .order('created_at', { ascending: false });

      if (objetivo) {
        queryBuilder = queryBuilder.eq('objetivo', objetivo);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error('❌ [Admin Treinos Video API] Error:', error);
        throw error;
      }

      console.log(`✅ [Admin Treinos Video API] Found ${data?.length || 0} videos`);
      return res.status(200).json(data || []);
    }

    // POST /api/admin/treinos-video/upload - Upload de vídeo
    if (method === 'POST' && action === 'upload') {
      console.log('📤 [Admin Treinos Video API] Processing upload...');

      // Parse multipart form data
      const form = formidable({
        maxFileSize: 500 * 1024 * 1024, // 500MB
        keepExtensions: true,
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const videoFile = files.file?.[0] || files.file;
      const thumbnailFile = files.thumbnail?.[0] || files.thumbnail;

      if (!videoFile) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Extract metadata
      const nome = fields.nome?.[0] || fields.nome || 'Novo Vídeo';
      const objetivo = fields.objetivo?.[0] || fields.objetivo;
      const descricao = fields.descricao?.[0] || fields.descricao;
      const duracao = parseInt(fields.duracao?.[0] || fields.duracao || '0');

      // Upload video to Supabase Storage
      const videoFileName = `${Date.now()}-${videoFile.originalFilename || 'video.mp4'}`;
      const videoBuffer = fs.readFileSync(videoFile.filepath);

      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoBuffer, {
          contentType: videoFile.mimetype || 'video/mp4',
          upsert: false
        });

      if (videoError) {
        console.error('❌ Video upload error:', videoError);
        throw videoError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);

      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}-${thumbnailFile.originalFilename || 'thumbnail.jpg'}`;
        const thumbnailBuffer = fs.readFileSync(thumbnailFile.filepath);

        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: thumbnailFile.mimetype || 'image/jpeg',
            upsert: false
          });

        if (!thumbError) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbUrl;
        }
      }

      // Save to database
      const { data: videoRecord, error: dbError } = await supabase
        .from('treinos_video')
        .insert({
          nome,
          objetivo,
          descricao,
          duracao,
          url_video: publicUrl,
          thumbnail_url: thumbnailUrl,
          data_upload: new Date().toISOString()
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }

      console.log('✅ [Admin Treinos Video API] Video uploaded successfully');
      return res.status(201).json(videoRecord);
    }

    // GET /api/admin/treinos-video/:id/stream - Gerar URL de streaming
    if (method === 'GET' && id && action === 'stream') {
      console.log('🎬 [Admin Treinos Video API] Generating stream URL...');

      const { data: video, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !video) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Generate signed URL for streaming (valid for 1 hour)
      const fileName = video.url_video.split('/').pop();
      const { data: signedData, error: signedError } = await supabase.storage
        .from('videos')
        .createSignedUrl(fileName, 3600); // 1 hour

      if (signedError) {
        console.error('❌ Error generating signed URL:', signedError);
        // Fallback to public URL
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
    }

    // GET /api/admin/treinos-video/:id - Buscar vídeo específico
    if (method === 'GET' && id) {
      const { data, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.status(200).json(data);
    }

    // PUT - Atualizar metadados do vídeo
    if (method === 'PUT' && id) {
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

    // POST /api/admin/treinos-video/:id/replace - Substituir arquivo de vídeo
    if (method === 'POST' && id && action === 'replace') {
      console.log('🔄 [Admin Treinos Video API] Replacing video file...');

      // Parse multipart form data
      const form = formidable({
        maxFileSize: 500 * 1024 * 1024,
        keepExtensions: true,
      });

      const [fields, files] = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          else resolve([fields, files]);
        });
      });

      const videoFile = files.file?.[0] || files.file;
      const thumbnailFile = files.thumbnail?.[0] || files.thumbnail;

      if (!videoFile) {
        return res.status(400).json({ error: 'No video file provided' });
      }

      // Get existing video record
      const { data: existingVideo, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !existingVideo) {
        return res.status(404).json({ error: 'Video not found' });
      }

      // Delete old video file from storage
      if (existingVideo.url_video) {
        const oldFileName = existingVideo.url_video.split('/').pop();
        await supabase.storage.from('videos').remove([oldFileName]);
      }

      // Upload new video
      const videoFileName = `${Date.now()}-${videoFile.originalFilename || 'video.mp4'}`;
      const videoBuffer = fs.readFileSync(videoFile.filepath);

      const { data: videoData, error: videoError } = await supabase.storage
        .from('videos')
        .upload(videoFileName, videoBuffer, {
          contentType: videoFile.mimetype || 'video/mp4',
          upsert: false
        });

      if (videoError) throw videoError;

      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(videoFileName);

      // Upload new thumbnail if provided
      let thumbnailUrl = existingVideo.thumbnail_url;
      if (thumbnailFile) {
        // Delete old thumbnail
        if (existingVideo.thumbnail_url) {
          const oldThumbName = existingVideo.thumbnail_url.split('/').pop();
          await supabase.storage.from('thumbnails').remove([oldThumbName]);
        }

        const thumbnailFileName = `${Date.now()}-${thumbnailFile.originalFilename || 'thumbnail.jpg'}`;
        const thumbnailBuffer = fs.readFileSync(thumbnailFile.filepath);

        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailFileName, thumbnailBuffer, {
            contentType: thumbnailFile.mimetype || 'image/jpeg',
            upsert: false
          });

        if (!thumbError) {
          const { data: { publicUrl: thumbUrl } } = supabase.storage
            .from('thumbnails')
            .getPublicUrl(thumbnailFileName);
          thumbnailUrl = thumbUrl;
        }
      }

      // Update database record
      const updateData = {
        url_video: publicUrl,
        thumbnail_url: thumbnailUrl,
        data_upload: new Date().toISOString()
      };

      // Include metadata if provided
      const nome = fields.nome?.[0] || fields.nome;
      const objetivo = fields.objetivo?.[0] || fields.objetivo;
      const descricao = fields.descricao?.[0] || fields.descricao;
      const duracao = fields.duracao?.[0] || fields.duracao;

      if (nome) updateData.nome = nome;
      if (objetivo) updateData.objetivo = objetivo;
      if (descricao) updateData.descricao = descricao;
      if (duracao) updateData.duracao = parseInt(duracao);

      const { data: updatedVideo, error: updateError } = await supabase
        .from('treinos_video')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;

      console.log('✅ [Admin Treinos Video API] Video replaced successfully');
      return res.status(200).json(updatedVideo);
    }

    // DELETE - Remover vídeo
    if (method === 'DELETE' && id) {
      // Get video record
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
    console.error('❌ [Admin Treinos Video API] Fatal error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
};
