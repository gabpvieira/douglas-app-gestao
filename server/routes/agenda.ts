import type { Express } from "express";
import { supabase } from "../supabase";

export function registerAgendaRoutes(app: Express) {
  
  // ============ BLOCOS DE HORÁRIOS ============
  
  // Listar blocos de horários
  app.get("/api/admin/blocos-horarios", async (req, res) => {
    try {
      const { data: blocos, error } = await supabase
        .from('blocos_horarios')
        .select('*')
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;

      const blocosFormatted = blocos.map((b: any) => ({
        id: b.id,
        diaSemana: b.dia_semana,
        horaInicio: b.hora_inicio,
        horaFim: b.hora_fim,
        duracao: b.duracao,
        ativo: b.ativo,
        createdAt: b.created_at,
        updatedAt: b.updated_at
      }));

      res.json(blocosFormatted);
    } catch (error: any) {
      console.error('Error fetching blocos horarios:', error);
      res.status(500).json({ error: 'Falha ao buscar blocos de horários' });
    }
  });

  // Criar bloco de horário
  app.post("/api/admin/blocos-horarios", async (req, res) => {
    try {
      const { diaSemana, horaInicio, horaFim, duracao, ativo } = req.body;

      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .insert({
          dia_semana: diaSemana,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          duracao,
          ativo: ativo !== undefined ? ativo : true
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: bloco.id,
        diaSemana: bloco.dia_semana,
        horaInicio: bloco.hora_inicio,
        horaFim: bloco.hora_fim,
        duracao: bloco.duracao,
        ativo: bloco.ativo,
        createdAt: bloco.created_at,
        updatedAt: bloco.updated_at
      });
    } catch (error: any) {
      console.error('Error creating bloco horario:', error);
      res.status(500).json({ error: 'Falha ao criar bloco de horário' });
    }
  });

  // Atualizar bloco de horário
  app.put("/api/admin/blocos-horarios/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { diaSemana, horaInicio, horaFim, duracao, ativo } = req.body;

      const updateData: any = {};
      if (diaSemana !== undefined) updateData.dia_semana = diaSemana;
      if (horaInicio !== undefined) updateData.hora_inicio = horaInicio;
      if (horaFim !== undefined) updateData.hora_fim = horaFim;
      if (duracao !== undefined) updateData.duracao = duracao;
      if (ativo !== undefined) updateData.ativo = ativo;

      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: bloco.id,
        diaSemana: bloco.dia_semana,
        horaInicio: bloco.hora_inicio,
        horaFim: bloco.hora_fim,
        duracao: bloco.duracao,
        ativo: bloco.ativo,
        updatedAt: bloco.updated_at
      });
    } catch (error: any) {
      console.error('Error updating bloco horario:', error);
      res.status(500).json({ error: 'Falha ao atualizar bloco de horário' });
    }
  });

  // Deletar bloco de horário
  app.delete("/api/admin/blocos-horarios/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar se existem agendamentos usando este bloco
      const { data: agendamentos } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('bloco_horario_id', id)
        .limit(1);

      if (agendamentos && agendamentos.length > 0) {
        return res.status(400).json({ 
          error: 'Não é possível deletar este horário pois existem agendamentos vinculados' 
        });
      }

      const { error } = await supabase
        .from('blocos_horarios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Bloco de horário deletado com sucesso' });
    } catch (error: any) {
      console.error('Error deleting bloco horario:', error);
      res.status(500).json({ error: 'Falha ao deletar bloco de horário' });
    }
  });

  // ============ AGENDAMENTOS ============
  
  // Listar agendamentos
  app.get("/api/admin/agendamentos", async (req, res) => {
    try {
      const { dataInicio, dataFim } = req.query;

      console.log('📅 Buscando agendamentos presenciais...', { dataInicio, dataFim });

      let query = supabase
        .from('agendamentos_presenciais')
        .select(`
          id,
          aluno_id,
          data_agendamento,
          hora_inicio,
          hora_fim,
          status,
          tipo,
          observacoes,
          created_at,
          updated_at,
          alunos (
            id,
            users_profile (
              nome,
              email
            )
          )
        `)
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (dataInicio) {
        query = query.gte('data_agendamento', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data_agendamento', dataFim);
      }

      const { data: agendamentos, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error);
        throw error;
      }

      console.log(`✅ ${agendamentos?.length || 0} agendamentos encontrados`);

      const agendamentosFormatted = agendamentos.map((a: any) => ({
        id: a.id,
        alunoId: a.aluno_id,
        blocoHorarioId: null, // agendamentos_presenciais não usa blocos
        dataAgendamento: a.data_agendamento,
        status: a.status,
        observacoes: a.observacoes,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
        aluno: a.alunos ? {
          id: a.alunos.id,
          nome: a.alunos.users_profile?.nome || 'N/A',
          email: a.alunos.users_profile?.email || 'N/A'
        } : undefined,
        blocoHorario: {
          id: null,
          diaSemana: new Date(a.data_agendamento).getDay(),
          horaInicio: a.hora_inicio,
          horaFim: a.hora_fim,
          duracao: 60,
          ativo: true
        }
      }));

      res.json(agendamentosFormatted);
    } catch (error: any) {
      console.error('❌ Error fetching agendamentos:', error);
      res.status(500).json({ error: 'Falha ao buscar agendamentos' });
    }
  });

  // Criar agendamento
  app.post("/api/admin/agendamentos", async (req, res) => {
    try {
      const { alunoId, blocoHorarioId, dataAgendamento, observacoes } = req.body;

      // Verificar se já existe agendamento para este bloco e data
      const { data: existente } = await supabase
        .from('agendamentos')
        .select('id')
        .eq('bloco_horario_id', blocoHorarioId)
        .eq('data_agendamento', dataAgendamento)
        .single();

      if (existente) {
        return res.status(400).json({ error: 'Já existe um agendamento para este horário' });
      }

      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .insert({
          aluno_id: alunoId,
          bloco_horario_id: blocoHorarioId,
          data_agendamento: dataAgendamento,
          status: 'agendado',
          observacoes
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: agendamento.id,
        alunoId: agendamento.aluno_id,
        blocoHorarioId: agendamento.bloco_horario_id,
        dataAgendamento: agendamento.data_agendamento,
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        createdAt: agendamento.created_at,
        updatedAt: agendamento.updated_at
      });
    } catch (error: any) {
      console.error('Error creating agendamento:', error);
      res.status(500).json({ error: 'Falha ao criar agendamento' });
    }
  });

  // Atualizar agendamento
  app.put("/api/admin/agendamentos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, observacoes } = req.body;

      console.log('📝 Atualizando agendamento:', id, { status, observacoes });

      const updateData: any = {};
      if (status) updateData.status = status;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data: agendamento, error } = await supabase
        .from('agendamentos_presenciais')
        .update(updateData)
        .eq('id', id)
        .select(`
          id,
          aluno_id,
          data_agendamento,
          hora_inicio,
          hora_fim,
          status,
          tipo,
          observacoes,
          updated_at
        `)
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar:', error);
        throw error;
      }

      console.log('✅ Agendamento atualizado com sucesso');

      res.json({
        id: agendamento.id,
        alunoId: agendamento.aluno_id,
        blocoHorarioId: null,
        dataAgendamento: agendamento.data_agendamento,
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        updatedAt: agendamento.updated_at
      });
    } catch (error: any) {
      console.error('❌ Error updating agendamento:', error);
      res.status(500).json({ error: 'Falha ao atualizar agendamento' });
    }
  });

  // Deletar agendamento
  app.delete("/api/admin/agendamentos/:id", async (req, res) => {
    try {
      const { id } = req.params;

      console.log('🗑️ Deletando agendamento:', id);

      const { error } = await supabase
        .from('agendamentos_presenciais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Agendamento deletado com sucesso' });
    } catch (error: any) {
      console.error('Error deleting agendamento:', error);
      res.status(500).json({ error: 'Falha ao deletar agendamento' });
    }
  });

  // ============ EXCEÇÕES DE DISPONIBILIDADE ============
  
  // Listar exceções
  app.get("/api/admin/excecoes-disponibilidade", async (req, res) => {
    try {
      const { data: excecoes, error } = await supabase
        .from('excecoes_disponibilidade')
        .select('*')
        .order('data_inicio', { ascending: true });

      if (error) throw error;

      const excecoesFormatted = excecoes.map((e: any) => ({
        id: e.id,
        dataInicio: e.data_inicio,
        dataFim: e.data_fim,
        motivo: e.motivo,
        ativo: e.ativo,
        createdAt: e.created_at,
        updatedAt: e.updated_at
      }));

      res.json(excecoesFormatted);
    } catch (error: any) {
      console.error('Error fetching excecoes:', error);
      res.status(500).json({ error: 'Falha ao buscar exceções' });
    }
  });
}
