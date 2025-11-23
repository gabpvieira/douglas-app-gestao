import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // GET - Listar blocos de horários
    if (req.method === 'GET' && !id) {
      const { data: blocos, error } = await supabase
        .from('blocos_horarios')
        .select('*')
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) {
        console.error('Error fetching blocos:', error);
        throw error;
      }

      return res.status(200).json(blocos || []);
    }

    // GET - Buscar bloco específico
    if (req.method === 'GET' && id) {
      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !bloco) {
        return res.status(404).json({ error: 'Bloco não encontrado' });
      }

      return res.status(200).json(bloco);
    }

    // POST - Criar bloco de horário
    if (req.method === 'POST') {
      const { diaSemana, horaInicio, horaFim, duracao, ativo } = req.body;

      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .insert({
          dia_semana: diaSemana,
          hora_inicio: horaInicio,
          hora_fim: horaFim,
          duracao: duracao || 60,
          ativo: ativo !== undefined ? String(ativo) : 'true'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating bloco:', error);
        throw error;
      }

      return res.status(201).json(bloco);
    }

    // PUT - Atualizar bloco de horário
    if (req.method === 'PUT' && id) {
      const { diaSemana, horaInicio, horaFim, duracao, ativo } = req.body;

      const updateData: any = {};
      if (diaSemana !== undefined) updateData.dia_semana = diaSemana;
      if (horaInicio !== undefined) updateData.hora_inicio = horaInicio;
      if (horaFim !== undefined) updateData.hora_fim = horaFim;
      if (duracao !== undefined) updateData.duracao = duracao;
      if (ativo !== undefined) updateData.ativo = String(ativo);

      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating bloco:', error);
        throw error;
      }

      return res.status(200).json(bloco);
    }

    // DELETE - Deletar bloco de horário
    if (req.method === 'DELETE' && id) {
      const { error } = await supabase
        .from('blocos_horarios')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting bloco:', error);
        throw error;
      }

      return res.status(200).json({ message: 'Bloco deletado com sucesso' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in blocos-horarios API:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error',
      details: error.details || null,
      hint: error.hint || null
    });
  }
}
