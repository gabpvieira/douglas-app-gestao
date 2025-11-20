import type { Express } from "express";
import { supabase } from "../supabase";

export function registerPagamentosRoutes(app: Express) {
  
  // Criar pagamento
  app.post("/api/admin/pagamentos", async (req, res) => {
    try {
      const { 
        assinaturaId, 
        status, 
        valor, 
        metodo,
        mercadoPagoPaymentId,
        dataPagamento 
      } = req.body;

      if (!assinaturaId || !status || !valor || !metodo) {
        return res.status(400).json({ 
          error: 'assinaturaId, status, valor e metodo são obrigatórios' 
        });
      }

      // Validar status
      const statusValidos = ['pendente', 'aprovado', 'recusado', 'cancelado', 'estornado'];
      if (!statusValidos.includes(status)) {
        return res.status(400).json({ 
          error: `status deve ser: ${statusValidos.join(', ')}` 
        });
      }

      // Validar metodo
      const metodosValidos = ['credit_card', 'debit_card', 'pix', 'boleto'];
      if (!metodosValidos.includes(metodo)) {
        return res.status(400).json({ 
          error: `metodo deve ser: ${metodosValidos.join(', ')}` 
        });
      }

      // Verificar se assinatura existe
      const { data: assinatura, error: assinaturaError } = await supabase
        .from('assinaturas')
        .select('id')
        .eq('id', assinaturaId)
        .single();

      if (assinaturaError || !assinatura) {
        return res.status(404).json({ error: 'Assinatura não encontrada' });
      }

      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .insert({
          assinatura_id: assinaturaId,
          status,
          valor,
          metodo,
          mercado_pago_payment_id: mercadoPagoPaymentId || null,
          data_pagamento: dataPagamento || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: pagamento.id,
        assinaturaId: pagamento.assinatura_id,
        status: pagamento.status,
        valor: pagamento.valor,
        metodo: pagamento.metodo,
        mercadoPagoPaymentId: pagamento.mercado_pago_payment_id,
        dataPagamento: pagamento.data_pagamento,
        createdAt: pagamento.created_at
      });

    } catch (error: any) {
      console.error('Error creating pagamento:', error);
      res.status(500).json({ error: 'Falha ao criar pagamento' });
    }
  });

  // Listar todos os pagamentos (Admin)
  app.get("/api/admin/pagamentos", async (req, res) => {
    try {
      const { status, metodo, limit } = req.query;

      let query = supabase
        .from('pagamentos')
        .select(`
          *,
          assinatura:assinaturas(
            id,
            plano_tipo,
            aluno:alunos(
              id,
              user_profile:users_profile(nome, email)
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      if (metodo) {
        query = query.eq('metodo', metodo);
      }

      if (limit) {
        query = query.limit(parseInt(limit as string));
      }

      const { data: pagamentos, error } = await query;

      if (error) throw error;

      const pagamentosFormatted = pagamentos.map((p: any) => ({
        id: p.id,
        assinaturaId: p.assinatura_id,
        planoTipo: p.assinatura?.plano_tipo,
        alunoNome: p.assinatura?.aluno?.user_profile?.nome,
        alunoEmail: p.assinatura?.aluno?.user_profile?.email,
        status: p.status,
        valor: p.valor,
        metodo: p.metodo,
        mercadoPagoPaymentId: p.mercado_pago_payment_id,
        dataPagamento: p.data_pagamento,
        createdAt: p.created_at
      }));

      res.json(pagamentosFormatted);

    } catch (error: any) {
      console.error('Error fetching pagamentos:', error);
      res.status(500).json({ error: 'Falha ao buscar pagamentos' });
    }
  });

  // Listar pagamentos de uma assinatura
  app.get("/api/admin/pagamentos/assinatura/:assinaturaId", async (req, res) => {
    try {
      const { assinaturaId } = req.params;

      const { data: pagamentos, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('assinatura_id', assinaturaId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pagamentosFormatted = pagamentos.map(p => ({
        id: p.id,
        assinaturaId: p.assinatura_id,
        status: p.status,
        valor: p.valor,
        metodo: p.metodo,
        mercadoPagoPaymentId: p.mercado_pago_payment_id,
        dataPagamento: p.data_pagamento,
        createdAt: p.created_at
      }));

      res.json(pagamentosFormatted);

    } catch (error: any) {
      console.error('Error fetching assinatura pagamentos:', error);
      res.status(500).json({ error: 'Falha ao buscar pagamentos' });
    }
  });

  // Listar pagamentos de um aluno
  app.get("/api/admin/pagamentos/aluno/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;

      const { data: pagamentos, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          assinatura:assinaturas!inner(
            id,
            plano_tipo,
            aluno_id
          )
        `)
        .eq('assinatura.aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pagamentosFormatted = pagamentos.map((p: any) => ({
        id: p.id,
        assinaturaId: p.assinatura_id,
        planoTipo: p.assinatura?.plano_tipo,
        status: p.status,
        valor: p.valor,
        metodo: p.metodo,
        mercadoPagoPaymentId: p.mercado_pago_payment_id,
        dataPagamento: p.data_pagamento,
        createdAt: p.created_at
      }));

      res.json(pagamentosFormatted);

    } catch (error: any) {
      console.error('Error fetching student pagamentos:', error);
      res.status(500).json({ error: 'Falha ao buscar pagamentos' });
    }
  });

  // Aluno: Ver seus pagamentos
  app.get("/api/aluno/pagamentos", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: pagamentos, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          assinatura:assinaturas!inner(
            id,
            plano_tipo,
            aluno_id
          )
        `)
        .eq('assinatura.aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pagamentosFormatted = pagamentos.map((p: any) => ({
        id: p.id,
        planoTipo: p.assinatura?.plano_tipo,
        status: p.status,
        valor: p.valor,
        metodo: p.metodo,
        dataPagamento: p.data_pagamento,
        createdAt: p.created_at
      }));

      res.json(pagamentosFormatted);

    } catch (error: any) {
      console.error('Error fetching student pagamentos:', error);
      res.status(500).json({ error: 'Falha ao buscar pagamentos' });
    }
  });

  // Obter pagamento específico
  app.get("/api/pagamentos/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          assinatura:assinaturas(
            id,
            plano_tipo,
            aluno:alunos(
              id,
              user_profile:users_profile(nome, email)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error || !pagamento) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }

      res.json({
        id: pagamento.id,
        assinaturaId: pagamento.assinatura_id,
        planoTipo: (pagamento.assinatura as any)?.plano_tipo,
        alunoNome: (pagamento.assinatura as any)?.aluno?.user_profile?.nome,
        status: pagamento.status,
        valor: pagamento.valor,
        metodo: pagamento.metodo,
        mercadoPagoPaymentId: pagamento.mercado_pago_payment_id,
        dataPagamento: pagamento.data_pagamento,
        createdAt: pagamento.created_at
      });

    } catch (error: any) {
      console.error('Error fetching pagamento:', error);
      res.status(500).json({ error: 'Falha ao buscar pagamento' });
    }
  });

  // Atualizar status do pagamento
  app.put("/api/admin/pagamentos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, dataPagamento, mercadoPagoPaymentId } = req.body;

      const updateData: any = {};
      if (status) updateData.status = status;
      if (dataPagamento !== undefined) updateData.data_pagamento = dataPagamento;
      if (mercadoPagoPaymentId !== undefined) {
        updateData.mercado_pago_payment_id = mercadoPagoPaymentId;
      }

      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: pagamento.id,
        status: pagamento.status,
        dataPagamento: pagamento.data_pagamento,
        mercadoPagoPaymentId: pagamento.mercado_pago_payment_id
      });

    } catch (error: any) {
      console.error('Error updating pagamento:', error);
      res.status(500).json({ error: 'Falha ao atualizar pagamento' });
    }
  });

  // Webhook do Mercado Pago
  app.post("/api/webhook/mercadopago", async (req, res) => {
    try {
      const { type, data } = req.body;

      console.log('Mercado Pago Webhook:', { type, data });

      // TODO: Implementar lógica de webhook do Mercado Pago
      // - Verificar assinatura do webhook
      // - Atualizar status do pagamento
      // - Ativar/desativar assinatura conforme necessário

      if (type === 'payment') {
        const paymentId = data.id;
        
        // Buscar pagamento pelo mercado_pago_payment_id
        const { data: pagamento, error: fetchError } = await supabase
          .from('pagamentos')
          .select('*')
          .eq('mercado_pago_payment_id', paymentId)
          .single();

        if (fetchError || !pagamento) {
          console.log('Pagamento não encontrado:', paymentId);
          return res.status(200).json({ received: true });
        }

        // Atualizar status do pagamento
        // TODO: Buscar status real do Mercado Pago
        const novoStatus = 'aprovado'; // Exemplo

        await supabase
          .from('pagamentos')
          .update({ 
            status: novoStatus,
            data_pagamento: new Date().toISOString()
          })
          .eq('id', pagamento.id);

        // Se aprovado, garantir que assinatura está ativa
        if (novoStatus === 'aprovado') {
          await supabase
            .from('assinaturas')
            .update({ status: 'ativa' })
            .eq('id', pagamento.assinatura_id);
        }
      }

      res.status(200).json({ received: true });

    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).json({ error: 'Falha ao processar webhook' });
    }
  });

  // Estatísticas de pagamentos
  app.get("/api/admin/pagamentos/stats", async (req, res) => {
    try {
      const { dataInicio, dataFim } = req.query;

      let query = supabase
        .from('pagamentos')
        .select('*');

      if (dataInicio) {
        query = query.gte('created_at', dataInicio);
      }

      if (dataFim) {
        query = query.lte('created_at', dataFim);
      }

      const { data: pagamentos, error } = await query;

      if (error) throw error;

      const stats = {
        total: pagamentos.length,
        aprovados: pagamentos.filter(p => p.status === 'aprovado').length,
        pendentes: pagamentos.filter(p => p.status === 'pendente').length,
        recusados: pagamentos.filter(p => p.status === 'recusado').length,
        cancelados: pagamentos.filter(p => p.status === 'cancelado').length,
        estornados: pagamentos.filter(p => p.status === 'estornado').length,
        valorTotal: pagamentos
          .filter(p => p.status === 'aprovado')
          .reduce((sum, p) => sum + p.valor, 0),
        porMetodo: {
          credit_card: pagamentos.filter(p => p.metodo === 'credit_card').length,
          debit_card: pagamentos.filter(p => p.metodo === 'debit_card').length,
          pix: pagamentos.filter(p => p.metodo === 'pix').length,
          boleto: pagamentos.filter(p => p.metodo === 'boleto').length
        }
      };

      res.json(stats);

    } catch (error: any) {
      console.error('Error fetching pagamentos stats:', error);
      res.status(500).json({ error: 'Falha ao buscar estatísticas' });
    }
  });
}
