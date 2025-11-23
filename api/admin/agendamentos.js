const { getSupabaseAdmin } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabase = getSupabaseAdmin();
    const { id } = req.query;

    // GET - Listar agendamentos
    if (req.method === 'GET' && !id) {
      const { dataInicio, dataFim } = req.query;

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

      if (dataInicio) query = query.gte('data_agendamento', dataInicio);
      if (dataFim) query = query.lte('data_agendamento', dataFim);

      const { data: agendamentos, error } = await query;
      if (error) throw error;

      const formatted = agendamentos.map((a) => ({
        id: a.id,
        alunoId: a.aluno_id,
        blocoHorarioId: null,
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

      return res.status(200).json(formatted);
    }

    // POST - Criar agendamento
    if (req.method === 'POST') {
      const { alunoId, blocoHorarioId, dataAgendamento, observacoes } = req.body;

      if (blocoHorarioId) {
        const { data: existente } = await supabase
          .from('agendamentos_presenciais')
          .select('id')
          .eq('bloco_horario_id', blocoHorarioId)
          .eq('data_agendamento', dataAgendamento)
          .single();

        if (existente) {
          return res.status(400).json({ error: 'Já existe um agendamento para este horário' });
        }
      }

      const { data: agendamento, error } = await supabase
        .from('agendamentos_presenciais')
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

      return res.status(201).json({
        id: agendamento.id,
        alunoId: agendamento.aluno_id,
        blocoHorarioId: agendamento.bloco_horario_id,
        dataAgendamento: agendamento.data_agendamento,
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        createdAt: agendamento.created_at,
        updatedAt: agendamento.updated_at
      });
    }

    // PUT - Atualizar agendamento
    if (req.method === 'PUT' && id) {
      const { status, observacoes } = req.body;

      const updateData = {};
      if (status) updateData.status = status;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data: agendamento, error } = await supabase
        .from('agendamentos_presenciais')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        id: agendamento.id,
        alunoId: agendamento.aluno_id,
        blocoHorarioId: null,
        dataAgendamento: agendamento.data_agendamento,
        status: agendamento.status,
        observacoes: agendamento.observacoes,
        updatedAt: agendamento.updated_at
      });
    }

    // DELETE - Deletar agendamento
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('agendamentos_presenciais')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({ message: 'Agendamento deletado com sucesso' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in agendamentos API:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
};
