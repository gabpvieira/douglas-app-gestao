import type { Express } from "express";
import { uploadPDF } from "../upload";
import { uploadFileToStorage, getSignedUrl, deleteFileFromStorage, generateUniqueFileName } from "../storageHelper";
import { supabase } from "../supabase";

export function registerTreinosPdfRoutes(app: Express) {
  
  // Upload de treino PDF
  app.post("/api/admin/treinos-pdf/upload", uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
      }

      const { alunoId, nome, descricao } = req.body;

      if (!alunoId || !nome) {
        return res.status(400).json({ error: 'alunoId e nome são obrigatórios' });
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
      const fileName = generateUniqueFileName(req.file.originalname);
      const filePath = `${alunoId}/${fileName}`;

      // Upload para Supabase Storage
      const { path } = await uploadFileToStorage(
        'treinos-pdf',
        filePath,
        req.file.buffer,
        req.file.mimetype
      );

      // Salvar no banco de dados
      const { data: treino, error: dbError } = await supabase
        .from('treinos_pdf')
        .insert({
          aluno_id: alunoId,
          nome,
          descricao: descricao || null,
          url_pdf: path
        })
        .select()
        .single();

      if (dbError) {
        // Se falhar ao salvar no banco, deletar arquivo do storage
        await deleteFileFromStorage('treinos-pdf', path);
        throw dbError;
      }

      res.status(201).json({
        id: treino.id,
        alunoId: treino.aluno_id,
        nome: treino.nome,
        descricao: treino.descricao,
        urlPdf: treino.url_pdf,
        dataUpload: treino.data_upload,
        createdAt: treino.created_at
      });

    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      res.status(500).json({ 
        error: 'Falha ao fazer upload do PDF',
        details: error.message 
      });
    }
  });

  // Listar PDFs de um aluno
  app.get("/api/admin/treinos-pdf/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;

      const { data: treinos, error } = await supabase
        .from('treinos_pdf')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_upload', { ascending: false });

      if (error) throw error;

      // Converter snake_case para camelCase
      const treinosFormatted = treinos.map(t => ({
        id: t.id,
        alunoId: t.aluno_id,
        nome: t.nome,
        descricao: t.descricao,
        urlPdf: t.url_pdf,
        dataUpload: t.data_upload,
        createdAt: t.created_at
      }));

      res.json(treinosFormatted);

    } catch (error: any) {
      console.error('Error fetching PDFs:', error);
      res.status(500).json({ error: 'Falha ao buscar treinos PDF' });
    }
  });

  // Obter URL assinada para download
  app.get("/api/treinos-pdf/:id/download", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: treino, error } = await supabase
        .from('treinos_pdf')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !treino) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      // Gerar URL assinada válida por 1 hora
      const signedUrl = await getSignedUrl('treinos-pdf', treino.url_pdf, 3600);

      res.json({
        id: treino.id,
        nome: treino.nome,
        url: signedUrl,
        expiresIn: 3600
      });

    } catch (error: any) {
      console.error('Error generating download URL:', error);
      res.status(500).json({ error: 'Falha ao gerar URL de download' });
    }
  });

  // Deletar treino PDF
  app.delete("/api/admin/treinos-pdf/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Buscar treino para obter o path do arquivo
      const { data: treino, error: fetchError } = await supabase
        .from('treinos_pdf')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !treino) {
        return res.status(404).json({ error: 'Treino não encontrado' });
      }

      // Deletar arquivo do storage
      await deleteFileFromStorage('treinos-pdf', treino.url_pdf);

      // Deletar registro do banco
      const { error: deleteError } = await supabase
        .from('treinos_pdf')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      res.json({ message: 'Treino deletado com sucesso' });

    } catch (error: any) {
      console.error('Error deleting PDF:', error);
      res.status(500).json({ error: 'Falha ao deletar treino' });
    }
  });

  // Rota para aluno visualizar seus treinos
  app.get("/api/aluno/treinos-pdf", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT quando implementar auth

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: treinos, error } = await supabase
        .from('treinos_pdf')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_upload', { ascending: false });

      if (error) throw error;

      // Converter e adicionar URLs assinadas
      const treinosComUrl = await Promise.all(
        treinos.map(async (t) => {
          const signedUrl = await getSignedUrl('treinos-pdf', t.url_pdf, 7200); // 2 horas
          
          return {
            id: t.id,
            nome: t.nome,
            descricao: t.descricao,
            dataUpload: t.data_upload,
            downloadUrl: signedUrl
          };
        })
      );

      res.json(treinosComUrl);

    } catch (error: any) {
      console.error('Error fetching student PDFs:', error);
      res.status(500).json({ error: 'Falha ao buscar treinos' });
    }
  });
}
