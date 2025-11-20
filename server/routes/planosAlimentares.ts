import type { Express } from "express";
import { supabase } from "../supabase";

export function registerPlanosAlimentaresRoutes(app: Express) {
  
  // Criar plano alimentar
  app.post("/api/admin/planos-alimentares", async (req, res) => {
    try {
      const { alunoId, titulo, conteudoHtml, observacoes } = req.body;

      if (!alunoId || !titulo || !conteudoHtml) {
        return res.status(400).json({ error: 'alunoId, titulo e conteudoHtml são obrigatórios' });
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

      const { data: plano, error } = await supabase
        .from('planos_alimentares')
        .insert({
          aluno_id: alunoId,
          titulo,
          conteudo_html: conteudoHtml,
          observacoes: observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: plano.id,
        alunoId: plano.aluno_id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dataCriacao: plano.data_criacao,
        createdAt: plano.created_at,
        updatedAt: plano.updated_at
      });

    } catch (error: any) {
      console.error('Error creating plano alimentar:', error);
      res.status(500).json({ error: 'Falha ao criar plano alimentar' });
    }
  });

  // Listar todos os planos alimentares (Admin) - DEVE VIR ANTES DA ROTA COM :alunoId
  app.get("/api/admin/planos-alimentares/all", async (req, res) => {
    try {
      const { data: planos, error } = await supabase
        .from('planos_alimentares')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      const planosFormatted = planos.map(p => ({
        id: p.id,
        alunoId: p.aluno_id,
        titulo: p.titulo,
        conteudoHtml: p.conteudo_html,
        observacoes: p.observacoes,
        dataCriacao: p.data_criacao,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      res.json(planosFormatted);

    } catch (error: any) {
      console.error('Error fetching all planos alimentares:', error);
      res.status(500).json({ error: 'Falha ao buscar planos alimentares' });
    }
  });
  
  // Listar planos de um aluno (Admin)
  app.get("/api/admin/planos-alimentares/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;

      const { data: planos, error } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      const planosFormatted = planos.map(p => ({
        id: p.id,
        alunoId: p.aluno_id,
        titulo: p.titulo,
        conteudoHtml: p.conteudo_html,
        observacoes: p.observacoes,
        dataCriacao: p.data_criacao,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      res.json(planosFormatted);

    } catch (error: any) {
      console.error('Error fetching planos alimentares:', error);
      res.status(500).json({ error: 'Falha ao buscar planos alimentares' });
    }
  });

  // Obter plano alimentar atual do aluno
  app.get("/api/aluno/plano-alimentar", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: plano, error } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Nenhum plano alimentar encontrado' });
        }
        throw error;
      }

      res.json({
        id: plano.id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dataCriacao: plano.data_criacao
      });

    } catch (error: any) {
      console.error('Error fetching plano alimentar:', error);
      res.status(500).json({ error: 'Falha ao buscar plano alimentar' });
    }
  });

  // Obter plano específico
  app.get("/api/planos-alimentares/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: plano, error } = await supabase
        .from('planos_alimentares')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !plano) {
        return res.status(404).json({ error: 'Plano alimentar não encontrado' });
      }

      res.json({
        id: plano.id,
        alunoId: plano.aluno_id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dataCriacao: plano.data_criacao,
        updatedAt: plano.updated_at
      });

    } catch (error: any) {
      console.error('Error fetching plano alimentar:', error);
      res.status(500).json({ error: 'Falha ao buscar plano alimentar' });
    }
  });

  // Atualizar plano alimentar
  app.put("/api/admin/planos-alimentares/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { titulo, conteudoHtml, observacoes } = req.body;

      const updateData: any = {};
      if (titulo) updateData.titulo = titulo;
      if (conteudoHtml) updateData.conteudo_html = conteudoHtml;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data: plano, error } = await supabase
        .from('planos_alimentares')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: plano.id,
        alunoId: plano.aluno_id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        updatedAt: plano.updated_at
      });

    } catch (error: any) {
      console.error('Error updating plano alimentar:', error);
      res.status(500).json({ error: 'Falha ao atualizar plano alimentar' });
    }
  });

  // Deletar plano alimentar
  app.delete("/api/admin/planos-alimentares/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('planos_alimentares')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Plano alimentar deletado com sucesso' });

    } catch (error: any) {
      console.error('Error deleting plano alimentar:', error);
      res.status(500).json({ error: 'Falha ao deletar plano alimentar' });
    }
  });
}
