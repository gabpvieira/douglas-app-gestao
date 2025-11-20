import type { Express } from "express";
import { supabase } from "../supabase";

export function registerAssinaturasRoutes(app: Express) {
  
  // Criar assinatura
  app.post("/api/admin/assinaturas", async (req, res) => {
    try {
      const { 
        alunoId, 
        planoTipo, 
        preco, 
        dataInicio, 
        dataFim,
        mercadoPagoSubscriptionId 
      } = req.body;

      if (!alunoId || !planoTipo || !preco || !dataInicio || !dataFim) {
        return res.status(400).json({ 
          error: 'alunoId, planoTipo, preco, dataInicio e dataFim são obrigatórios' 
        });
      }

      // Validar planoTipo
      if (!['mensal', 'trimestral', 'familia'].includes(planoTipo)) {
        return res.status(400).json({ 
          error: 'planoTipo deve ser: mensal, trimestral ou familia' 
        });
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

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .insert({
          aluno_id: alunoId,
          plano_tipo: planoTipo,
          preco,
          data_inicio: dataInicio,
          data_fim: dataFim,
          status: 'ativa',
          mercado_pago_subscription_id: mercadoPagoSubscriptionId || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: assinatura.id,
        alunoId: assinatura.aluno_id,
        planoTipo: assinatura.plano_tipo,
        preco: assinatura.preco,
        dataInicio: assinatura.data_inicio,
        dataFim: assinatura.data_fim,
        status: assinatura.status,
        mercadoPagoSubscriptionId: assinatura.mercado_pago_subscription_id,
        createdAt: assinatura.created_at,
        updatedAt: assinatura.updated_at
      });

    } catch (error: any) {
      console.error('Error creating assinatura:', error);
      res.status(500).json({ error: 'Falha ao criar assinatura' });
    }
  });

  // Listar todas as assinaturas (Admin)
  app.get("/api/admin/assinaturas", async (req, res) => {
    try {
      const { status, planoTipo } = req.query;

      let query = supabase
        .from('assinaturas')
        .select(`
          *,
          aluno:alunos(
            id,
            user_profile:users_profile(nome, email)
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (planoTipo) {
        query = query.eq('plano_tipo', planoTipo);
      }

      const { data: assinaturas, error } = await query;

      if (error) throw error;

      const assinaturasFormatted = assinaturas.map((a: any) => ({
        id: a.id,
        alunoId: a.aluno_id,
        alunoNome: a.aluno?.user_profile?.nome,
        alunoEmail: a.aluno?.user_profile?.email,
        planoTipo: a.plano_tipo,
        preco: a.preco,
        dataInicio: a.data_inicio,
        dataFim: a.data_fim,
        status: a.status,
        mercadoPagoSubscriptionId: a.mercado_pago_subscription_id,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));

      res.json(assinaturasFormatted);

    } catch (error: any) {
      console.error('Error fetching assinaturas:', error);
      res.status(500).json({ error: 'Falha ao buscar assinaturas' });
    }
  });

  // Obter assinatura de um aluno
  app.get("/api/admin/assinaturas/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;

      const { data: assinaturas, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assinaturasFormatted = assinaturas.map(a => ({
        id: a.id,
        alunoId: a.aluno_id,
        planoTipo: a.plano_tipo,
        preco: a.preco,
        dataInicio: a.data_inicio,
        dataFim: a.data_fim,
        status: a.status,
        mercadoPagoSubscriptionId: a.mercado_pago_subscription_id,
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }));

      res.json(assinaturasFormatted);

    } catch (error: any) {
      console.error('Error fetching student assinaturas:', error);
      res.status(500).json({ error: 'Falha ao buscar assinaturas' });
    }
  });

  // Obter assinatura ativa do aluno
  app.get("/api/aluno/assinatura", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('status', 'ativa')
        .order('data_inicio', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return res.status(404).json({ error: 'Nenhuma assinatura ativa encontrada' });
        }
        throw error;
      }

      res.json({
        id: assinatura.id,
        planoTipo: assinatura.plano_tipo,
        preco: assinatura.preco,
        dataInicio: assinatura.data_inicio,
        dataFim: assinatura.data_fim,
        status: assinatura.status
      });

    } catch (error: any) {
      console.error('Error fetching assinatura:', error);
      res.status(500).json({ error: 'Falha ao buscar assinatura' });
    }
  });

  // Atualizar assinatura
  app.put("/api/admin/assinaturas/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        planoTipo, 
        preco, 
        dataInicio, 
        dataFim, 
        status,
        mercadoPagoSubscriptionId 
      } = req.body;

      const updateData: any = {};
      if (planoTipo) updateData.plano_tipo = planoTipo;
      if (preco !== undefined) updateData.preco = preco;
      if (dataInicio) updateData.data_inicio = dataInicio;
      if (dataFim) updateData.data_fim = dataFim;
      if (status) updateData.status = status;
      if (mercadoPagoSubscriptionId !== undefined) {
        updateData.mercado_pago_subscription_id = mercadoPagoSubscriptionId;
      }

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: assinatura.id,
        alunoId: assinatura.aluno_id,
        planoTipo: assinatura.plano_tipo,
        preco: assinatura.preco,
        dataInicio: assinatura.data_inicio,
        dataFim: assinatura.data_fim,
        status: assinatura.status,
        mercadoPagoSubscriptionId: assinatura.mercado_pago_subscription_id,
        updatedAt: assinatura.updated_at
      });

    } catch (error: any) {
      console.error('Error updating assinatura:', error);
      res.status(500).json({ error: 'Falha ao atualizar assinatura' });
    }
  });

  // Cancelar assinatura
  app.post("/api/admin/assinaturas/:id/cancelar", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .update({ status: 'cancelada' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: assinatura.id,
        status: assinatura.status,
        message: 'Assinatura cancelada com sucesso'
      });

    } catch (error: any) {
      console.error('Error canceling assinatura:', error);
      res.status(500).json({ error: 'Falha ao cancelar assinatura' });
    }
  });

  // Reativar assinatura
  app.post("/api/admin/assinaturas/:id/reativar", async (req, res) => {
    try {
      const { id } = req.params;
      const { dataFim } = req.body;

      const updateData: any = { status: 'ativa' };
      if (dataFim) {
        updateData.data_fim = dataFim;
      }

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: assinatura.id,
        status: assinatura.status,
        dataFim: assinatura.data_fim,
        message: 'Assinatura reativada com sucesso'
      });

    } catch (error: any) {
      console.error('Error reactivating assinatura:', error);
      res.status(500).json({ error: 'Falha ao reativar assinatura' });
    }
  });

  // Deletar assinatura
  app.delete("/api/admin/assinaturas/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('assinaturas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Assinatura deletada com sucesso' });

    } catch (error: any) {
      console.error('Error deleting assinatura:', error);
      res.status(500).json({ error: 'Falha ao deletar assinatura' });
    }
  });

  // Verificar assinaturas vencidas (cron job)
  app.post("/api/admin/assinaturas/verificar-vencidas", async (req, res) => {
    try {
      const hoje = new Date().toISOString().split('T')[0];

      const { data: assinaturasVencidas, error } = await supabase
        .from('assinaturas')
        .update({ status: 'vencida' })
        .eq('status', 'ativa')
        .lt('data_fim', hoje)
        .select();

      if (error) throw error;

      res.json({
        message: 'Verificação concluída',
        assinaturasAtualizadas: assinaturasVencidas.length,
        assinaturas: assinaturasVencidas.map(a => ({
          id: a.id,
          alunoId: a.aluno_id,
          dataFim: a.data_fim
        }))
      });

    } catch (error: any) {
      console.error('Error checking expired assinaturas:', error);
      res.status(500).json({ error: 'Falha ao verificar assinaturas vencidas' });
    }
  });
}
