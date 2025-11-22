import type { Express } from "express";
import { uploadVideo, uploadVideoWithThumbnail } from "../upload";
import { uploadFileToStorage, getSignedUrl, deleteFileFromStorage, generateUniqueFileName } from "../storageHelper";
import { supabase } from "../supabase";
import { generateThumbnail, getThumbnailUrl } from "../thumbnailGenerator";

// Helper para obter URL do Supabase (backend usa SUPABASE_URL, fallback para VITE_SUPABASE_URL)
const getSupabaseUrl = () => process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://cbdonvzifbkayrvnlskp.supabase.co';

export function registerTreinosVideoRoutes(app: Express) {
  
  // Upload de vídeo de treino
  app.post("/api/admin/treinos-video/upload", uploadVideoWithThumbnail.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      console.log('📹 Iniciando upload de vídeo...');
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const videoFile = files?.['file']?.[0];
      const thumbnailFile = files?.['thumbnail']?.[0];
      
      console.log('Files:', {
        video: videoFile ? `${videoFile.originalname} (${videoFile.size} bytes)` : 'Nenhum',
        thumbnail: thumbnailFile ? `${thumbnailFile.originalname} (${thumbnailFile.size} bytes)` : 'Nenhum'
      });
      console.log('Body:', req.body);

      if (!videoFile) {
        return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
      }

      const { nome, objetivo, descricao, duracao } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'nome é obrigatório' });
      }

      // Gerar nome único para o arquivo
      const fileName = generateUniqueFileName(videoFile.originalname);
      console.log('📝 Nome do arquivo gerado:', fileName);

      // Upload para Supabase Storage
      console.log('☁️  Fazendo upload para Supabase Storage...');
      const { path } = await uploadFileToStorage(
        'treinos-video',
        fileName,
        videoFile.buffer,
        videoFile.mimetype
      );
      console.log('✅ Upload concluído. Path:', path);

      // Processar thumbnail
      let thumbnailUrl: string;
      const supabaseUrl = getSupabaseUrl();
      
      if (thumbnailFile) {
        // Usar thumbnail enviada pelo cliente
        console.log('🖼️  Usando thumbnail enviada pelo cliente...');
        const thumbnailFileName = generateUniqueFileName(thumbnailFile.originalname);
        const { path: thumbnailPath } = await uploadFileToStorage(
          'treinos-video',
          `thumbnails/${thumbnailFileName}`,
          thumbnailFile.buffer,
          thumbnailFile.mimetype
        );
        thumbnailUrl = getThumbnailUrl(thumbnailPath, supabaseUrl);
        console.log('✅ Thumbnail salva:', thumbnailUrl);
      } else {
        // Fallback: tentar gerar com FFmpeg
        try {
          console.log('🎬 Gerando thumbnail com FFmpeg...');
          const thumbnailPath = await generateThumbnail(videoFile.buffer, fileName);
          thumbnailUrl = getThumbnailUrl(thumbnailPath, supabaseUrl);
          console.log('✅ Thumbnail gerada:', thumbnailUrl);
        } catch (error) {
          console.warn('⚠️  Erro ao gerar thumbnail, usando fallback:', error);
          // Fallback final: usar URL do vídeo
          const { data: { publicUrl } } = supabase.storage
            .from('treinos-video')
            .getPublicUrl(path);
          thumbnailUrl = publicUrl;
        }
      }

      // Salvar no banco de dados
      console.log('💾 Salvando no banco de dados...');
      const { data: video, error: dbError } = await supabase
        .from('treinos_video')
        .insert({
          nome,
          objetivo: objetivo || null,
          descricao: descricao || null,
          url_video: path,
          thumbnail_url: thumbnailUrl,
          duracao: duracao ? parseInt(duracao) : null
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        // Se falhar ao salvar no banco, deletar arquivo do storage
        await deleteFileFromStorage('treinos-video', path);
        throw dbError;
      }

      console.log('✅ Vídeo salvo com sucesso:', video.id);

      res.status(201).json({
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        urlVideo: video.url_video,
        thumbnailUrl: video.thumbnail_url,
        duracao: video.duracao,
        dataUpload: video.data_upload,
        createdAt: video.created_at
      });

    } catch (error: any) {
      console.error('❌ Error uploading video:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({ 
        error: 'Falha ao fazer upload do vídeo',
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  });

  // Listar todos os vídeos
  app.get("/api/treinos-video", async (req, res) => {
    try {
      const { objetivo } = req.query;

      let query = supabase
        .from('treinos_video')
        .select('*')
        .order('data_upload', { ascending: false });

      if (objetivo) {
        query = query.eq('objetivo', objetivo);
      }

      const { data: videos, error } = await query;

      if (error) throw error;

      // Converter snake_case para camelCase
      const videosFormatted = videos.map(v => ({
        id: v.id,
        nome: v.nome,
        objetivo: v.objetivo,
        descricao: v.descricao,
        urlVideo: v.url_video,
        thumbnailUrl: v.thumbnail_url,
        duracao: v.duracao,
        dataUpload: v.data_upload,
        createdAt: v.created_at
      }));

      res.json(videosFormatted);

    } catch (error: any) {
      console.error('Error fetching videos:', error);
      res.status(500).json({ error: 'Falha ao buscar vídeos' });
    }
  });

  // Obter vídeo específico com URL de streaming
  app.get("/api/treinos-video/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: video, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !video) {
        return res.status(404).json({ error: 'Vídeo não encontrado' });
      }

      res.json({
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        thumbnailUrl: video.thumbnail_url,
        duracao: video.duracao,
        dataUpload: video.data_upload
      });

    } catch (error: any) {
      console.error('Error fetching video:', error);
      res.status(500).json({ error: 'Falha ao buscar vídeo' });
    }
  });

  // Obter URL de streaming do vídeo
  app.get("/api/treinos-video/:id/stream", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: video, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !video) {
        return res.status(404).json({ error: 'Vídeo não encontrado' });
      }

      // Gerar URL assinada válida por 2 horas
      const streamUrl = await getSignedUrl('treinos-video', video.url_video, 7200);

      res.json({
        id: video.id,
        nome: video.nome,
        streamUrl,
        duracao: video.duracao,
        expiresIn: 7200
      });

    } catch (error: any) {
      console.error('Error generating stream URL:', error);
      res.status(500).json({ error: 'Falha ao gerar URL de streaming' });
    }
  });

  // Deletar vídeo
  app.delete("/api/admin/treinos-video/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Buscar vídeo para obter o path do arquivo
      const { data: video, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !video) {
        return res.status(404).json({ error: 'Vídeo não encontrado' });
      }

      // Deletar arquivo do storage
      await deleteFileFromStorage('treinos-video', video.url_video);

      // Deletar thumbnail se existir
      if (video.thumbnail_url) {
        await deleteFileFromStorage('treinos-video', video.thumbnail_url);
      }

      // Deletar registro do banco
      const { error: deleteError } = await supabase
        .from('treinos_video')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({ message: 'Vídeo deletado com sucesso' });

    } catch (error: any) {
      console.error('Error deleting video:', error);
      res.status(500).json({ error: 'Falha ao deletar vídeo' });
    }
  });

  // Atualizar informações do vídeo (sem substituir arquivo)
  app.put("/api/admin/treinos-video/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { nome, objetivo, descricao, duracao } = req.body;

      const updateData: any = {};
      if (nome) updateData.nome = nome;
      if (objetivo !== undefined) updateData.objetivo = objetivo;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (duracao !== undefined) updateData.duracao = parseInt(duracao);

      const { data: video, error } = await supabase
        .from('treinos_video')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        duracao: video.duracao,
        updatedAt: video.updated_at
      });

    } catch (error: any) {
      console.error('Error updating video:', error);
      res.status(500).json({ error: 'Falha ao atualizar vídeo' });
    }
  });

  // Substituir arquivo de vídeo
  app.post("/api/admin/treinos-video/:id/replace", uploadVideoWithThumbnail.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), async (req, res) => {
    try {
      console.log('🔄 Iniciando substituição de vídeo...');
      const { id } = req.params;
      const { nome, objetivo, descricao, duracao } = req.body;
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const videoFile = files?.['file']?.[0];
      const thumbnailFile = files?.['thumbnail']?.[0];

      if (!videoFile) {
        return res.status(400).json({ error: 'Nenhum arquivo de vídeo enviado' });
      }

      // Buscar vídeo existente
      const { data: videoExistente, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !videoExistente) {
        return res.status(404).json({ error: 'Vídeo não encontrado' });
      }

      console.log('📹 Vídeo existente encontrado:', videoExistente.nome);

      // Gerar nome único para o novo arquivo
      const fileName = generateUniqueFileName(videoFile.originalname);
      console.log('📝 Nome do novo arquivo:', fileName);

      // Upload do novo vídeo
      console.log('☁️  Fazendo upload do novo vídeo...');
      const { path } = await uploadFileToStorage(
        'treinos-video',
        fileName,
        videoFile.buffer,
        videoFile.mimetype
      );
      console.log('✅ Upload concluído. Path:', path);

      // Processar thumbnail
      let thumbnailUrl: string;
      const supabaseUrl = getSupabaseUrl();
      
      if (thumbnailFile) {
        // Usar thumbnail enviada pelo cliente
        console.log('🖼️  Usando thumbnail enviada pelo cliente...');
        const thumbnailFileName = generateUniqueFileName(thumbnailFile.originalname);
        const { path: thumbnailPath } = await uploadFileToStorage(
          'treinos-video',
          `thumbnails/${thumbnailFileName}`,
          thumbnailFile.buffer,
          thumbnailFile.mimetype
        );
        thumbnailUrl = getThumbnailUrl(thumbnailPath, supabaseUrl);
        console.log('✅ Thumbnail salva:', thumbnailUrl);
      } else {
        // Fallback: tentar gerar com FFmpeg
        try {
          console.log('🎬 Gerando thumbnail com FFmpeg...');
          const thumbnailPath = await generateThumbnail(videoFile.buffer, fileName);
          thumbnailUrl = getThumbnailUrl(thumbnailPath, supabaseUrl);
          console.log('✅ Thumbnail gerada:', thumbnailUrl);
        } catch (error) {
          console.warn('⚠️  Erro ao gerar thumbnail, usando fallback:', error);
          const { data: { publicUrl } } = supabase.storage
            .from('treinos-video')
            .getPublicUrl(path);
          thumbnailUrl = publicUrl;
        }
      }

      // Atualizar registro no banco
      const updateData: any = {
        url_video: path,
        thumbnail_url: thumbnailUrl
      };
      
      if (nome) updateData.nome = nome;
      if (objetivo !== undefined) updateData.objetivo = objetivo;
      if (descricao !== undefined) updateData.descricao = descricao;
      if (duracao !== undefined) updateData.duracao = parseInt(duracao);

      console.log('💾 Atualizando registro no banco...');
      const { data: video, error: updateError } = await supabase
        .from('treinos_video')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Erro ao atualizar banco:', updateError);
        // Se falhar, deletar novo arquivo
        await deleteFileFromStorage('treinos-video', path);
        throw updateError;
      }

      // Deletar vídeo antigo do storage
      console.log('🗑️  Deletando vídeo antigo...');
      await deleteFileFromStorage('treinos-video', videoExistente.url_video);
      
      // Deletar thumbnail antiga se existir
      if (videoExistente.thumbnail_url && videoExistente.thumbnail_url !== videoExistente.url_video) {
        await deleteFileFromStorage('treinos-video', videoExistente.thumbnail_url);
      }

      console.log('✅ Vídeo substituído com sucesso!');

      res.json({
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        urlVideo: video.url_video,
        thumbnailUrl: video.thumbnail_url,
        duracao: video.duracao,
        dataUpload: video.data_upload,
        updatedAt: video.updated_at
      });

    } catch (error: any) {
      console.error('❌ Error replacing video:', error);
      res.status(500).json({ 
        error: 'Falha ao substituir vídeo',
        details: error.message
      });
    }
  });
}
