import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabaseAdmin } from '../_lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const supabase = getSupabaseAdmin();
    const { method } = req;
    const { resource, id, alunoId } = req.query;

    const idParam = Array.isArray(id) ? id[0] : id;
    const alunoIdParam = Array.isArray(alunoId) ? alunoId[0] : alunoId;

    // Roteamento baseado no recurso
    switch (resource) {
      case 'evolucoes':
        return handleEvolucoes(req, res, method, supabase, idParam, alunoIdParam);
      case 'pagamentos':
        return handlePagamentos(req, res, method, supabase, idParam, alunoIdParam);
      case 'fotos-progresso':
        return handleFotosProgresso(req, res, method, supabase, idParam, alunoIdParam);
      case 'assinaturas':
        return handleAssinaturas(req, res, method, supabase, idParam, alunoIdParam);
      case 'agenda':
        return handleAgenda(req, res, method, supabase, idParam);
      default:
        return res.status(404).json({ error: 'Resource not found' });
    }
  } catch (error: any) {
    console.error('Data API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

async function handleEvolucoes(req: VercelRequest, res: VercelResponse, method: string, supabase: SupabaseClient, id: string | undefined, alunoId: string | undefined) {
  if (method === 'GET') {
    let query = supabase.from('evolucoes').select('*').order('data', { ascending: false });
    if (alunoId) query = query.eq('aluno_id', alunoId);
    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'POST') {
    const { data, error } = await supabase.from('evolucoes').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  }
  if (method === 'PUT' && id) {
    const { data, error } = await supabase.from('evolucoes').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'DELETE' && id) {
    const { error } = await supabase.from('evolucoes').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handlePagamentos(req: VercelRequest, res: VercelResponse, method: string, supabase: SupabaseClient, id: string | undefined, alunoId: string | undefined) {
  if (method === 'GET') {
    let query = supabase.from('pagamentos').select('*').order('data_vencimento', { ascending: false });
    if (alunoId) query = query.eq('aluno_id', alunoId);
    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'POST') {
    const { data, error } = await supabase.from('pagamentos').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  }
  if (method === 'PUT' && id) {
    const { data, error } = await supabase.from('pagamentos').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'DELETE' && id) {
    const { error } = await supabase.from('pagamentos').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleFotosProgresso(req: VercelRequest, res: VercelResponse, method: string, supabase: SupabaseClient, id: string | undefined, alunoId: string | undefined) {
  if (method === 'GET') {
    let query = supabase.from('fotos_progresso').select('*').order('data', { ascending: false });
    if (alunoId) query = query.eq('aluno_id', alunoId);
    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'POST') {
    const { data, error } = await supabase.from('fotos_progresso').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  }
  if (method === 'DELETE' && id) {
    const { error } = await supabase.from('fotos_progresso').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleAssinaturas(req: VercelRequest, res: VercelResponse, method: string, supabase: SupabaseClient, id: string | undefined, alunoId: string | undefined) {
  if (method === 'GET') {
    let query = supabase.from('assinaturas').select('*').order('created_at', { ascending: false });
    if (alunoId) query = query.eq('aluno_id', alunoId);
    const { data, error } = await query;
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'POST') {
    const { data, error } = await supabase.from('assinaturas').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  }
  if (method === 'PUT' && id) {
    const { data, error } = await supabase.from('assinaturas').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'DELETE' && id) {
    const { error } = await supabase.from('assinaturas').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleAgenda(req: VercelRequest, res: VercelResponse, method: string, supabase: SupabaseClient, id: string | undefined) {
  if (method === 'GET') {
    const { data, error } = await supabase.from('agenda').select('*').order('data', { ascending: true });
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'POST') {
    const { data, error } = await supabase.from('agenda').insert(req.body).select().single();
    if (error) throw error;
    return res.status(201).json(data);
  }
  if (method === 'PUT' && id) {
    const { data, error } = await supabase.from('agenda').update(req.body).eq('id', id).select().single();
    if (error) throw error;
    return res.status(200).json(data);
  }
  if (method === 'DELETE' && id) {
    const { error } = await supabase.from('agenda').delete().eq('id', id);
    if (error) throw error;
    return res.status(204).end();
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
