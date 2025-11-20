import type { Express } from "express";
import { uploadImage } from "../upload";
import { uploadFileToStorage, getSignedUrl, deleteFileFromStorage, generateUniqueFileName } from "../storageHelper";
import { supabase } from "../supabase";

export function registerFotosProgressoRoutes(app: Express) {
  
  // Upload de foto de progresso
  app.post("/api/aluno/fotos-progresso/upload", uploadImage.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { alunoId, data, tipo } = req.body;

      if (!alunoId || !data || !tipo) {
        return res.status(400).json({ error: 'alunoId, data e tipo são obrigatórios' });
      }

      // Validar tipo
      if (!['front', 'side', 'back'].includes(tipo)) {
        return res.status(400).json({ error: 'tipo deve ser: front, side ou back' });
      }

      // Verificar se aluno existe
      const { data: aluno, error: alunoError } = await supabase
        .from('alunos')
        .select('id')
        .eq('id', alunoId)
        .single();

      if (alunoError || !aluno) {
        return res.status(404).json({ error: 'Aluno não encontrado' });
      }

      // Gerar nome único para o arquivo
      const fileName = generateUniqueFileName(`${tipo}_${req.file.originalname}`);
      const filePath = `${alunoId}/${fileName}`;

      // Upload para Supabase Storage
      const { path } = await uploadFileToStorage(
        'fotos-progresso',
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // Salvar no banco de dados
      const { data: foto, error: dbError } = await supabase
        .from('fotos_progresso')
        .insert({
          aluno_id: alunoId,
          data,
          tipo,
          url_foto: path
        })
        .select()
        .single();

      if (dbError) {
        // Se falhar ao salvar no banco, deletar arquivo do storage
        await deleteFileFromStorage('fotos-progresso', path);
        throw dbError;
      }

      // Gerar URL assinada
      const signedUrl = await getSignedUrl('fotos-progresso', path, 3600);

      res.status(201).json({
        id: foto.id,
        alunoId: foto.aluno_id,
        data: foto.data,
        tipo: foto.tipo,
        urlFoto: signedUrl,
        createdAt: foto.created_at
      });

    } catch (error: any) {
      console.error('Error uploading photo:', error);
      res.status(500).json({ 
        error: 'Falha ao fazer upload da foto',
        details: error.message 
      });
    }
  });

  // Listar fotos de progresso de um aluno
  app.get("/api/aluno/fotos-progresso", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: fotos, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });

      if (error) throw error;

      // Gerar URLs assinadas para todas as fotos
      const fotosComUrl = await Promise.all(
        fotos.map(async (f) => {
          const signedUrl = await getSignedUrl('fotos-progresso', f.url_foto, 3600);
          
          return {
            id: f.id,
            data: f.data,
            tipo: f.tipo,
            urlFoto: signedUrl,
            createdAt: f.created_at
          };
        })
      );

      res.json(fotosComUrl);

    } catch (error: any) {
      console.error('Error fetching photos:', error);
      res.status(500).json({ error: 'Falha ao buscar fotos' });
    }
  });

  // Listar fotos por data
  app.get("/api/aluno/fotos-progresso/data/:data", async (req, res) => {
    try {
      const { data } = req.params;
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: fotos, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('data', data)
        .order('tipo', { ascending: true });

      if (error) throw error;

      // Gerar URLs assinadas
      const fotosComUrl = await Promise.all(
        fotos.map(async (f) => {
          const signedUrl = await getSignedUrl('fotos-progresso', f.url_foto, 3600);
          
          return {
            id: f.id,
            tipo: f.tipo,
            urlFoto: signedUrl
          };
        })
      );

      res.json(fotosComUrl);

    } catch (error: any) {
      console.error('Error fetching photos by date:', error);
      res.status(500).json({ error: 'Falha ao buscar fotos' });
    }
  });

  // Deletar foto de progresso
  app.delete("/api/aluno/fotos-progresso/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { alunoId } = req.query; // TODO: Pegar do token JWT e validar

      // Buscar foto para obter o path do arquivo
      const { data: foto, error: fetchError } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !foto) {
        return res.status(404).json({ error: 'Foto não encontrada' });
      }

      // Validar que a foto pertence ao aluno (quando implementar auth)
      if (alunoId && foto.aluno_id !== alunoId) {
        return res.status(403).json({ error: 'Não autorizado' });
      }

      // Deletar arquivo do storage
      await deleteFileFromStorage('fotos-progresso', foto.url_foto);

      // Deletar registro do banco
      const { error: deleteError } = await supabase
        .from('fotos_progresso')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({ message: 'Foto deletada com sucesso' });

    } catch (error: any) {
      console.error('Error deleting photo:', error);
      res.status(500).json({ error: 'Falha ao deletar foto' });
    }
  });

  // Admin: Listar fotos de um aluno
  app.get("/api/admin/fotos-progresso/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;

      const { data: fotos, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });

      if (error) throw error;

      // Gerar URLs assinadas
      const fotosComUrl = await Promise.all(
        fotos.map(async (f) => {
          const signedUrl = await getSignedUrl('fotos-progresso', f.url_foto, 3600);
          
          return {
            id: f.id,
            alunoId: f.aluno_id,
            data: f.data,
            tipo: f.tipo,
            urlFoto: signedUrl,
            createdAt: f.created_at
          };
        })
      );

      res.json(fotosComUrl);

    } catch (error: any) {
      console.error('Error fetching student photos:', error);
      res.status(500).json({ error: 'Falha ao buscar fotos' });
    }
  });
}
