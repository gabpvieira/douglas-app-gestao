import type { Express } from "express";
import { uploadVideo } from "../upload";
import { uploadFileToStorage, getSignedUrl, deleteFileFromStorage, generateUniqueFileName } from "../storageHelper";
import { supabase } from "../supabase";

export function registerTreinosVideoRoutes(app: Express) {
  
  // Upload de vídeo de treino
  app.post("/api/admin/treinos-video/upload", uploadVideo.single('file'), async (req, res) => {
    try {
      console.log('📹 Iniciando upload de vídeo...');
      console.log('File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'Nenhum arquivo');
      console.log('Body:', req.body);

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { nome, objetivo, descricao, duracao } = req.body;

      if (!nome) {
        return res.status(400).json({ error: 'nome é obrigatório' });
      }

      // Gerar nome único para o arquivo
      const fileName = generateUniqueFileName(req.file.originalname);
      console.log('📝 Nome do arquivo gerado:', fileName);

      // Upload para Supabase Storage
      console.log('☁️  Fazendo upload para Supabase Storage...');
      const { path } = await uploadFileToStorage(
        'treinos-video',
        fileName,
        req.file.buffer,
        req.file.mimetype
      );
      console.log('✅ Upload concluído. Path:', path);

      // Salvar no banco de dados
      console.log('💾 Salvando no banco de dados...');
      const { data: video, error: dbError } = await supabase
        .from('treinos_video')
        .insert({
          nome,
          objetivo: objetivo || null,
          descricao: descricao || null,
          url_video: path,
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

  // Atualizar informações do vídeo
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
}
