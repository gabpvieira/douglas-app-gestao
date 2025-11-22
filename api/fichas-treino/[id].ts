import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase credentials');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { id } = req.query;

    // GET - Buscar ficha específica
    if (req.method === 'GET') {
      const { data: ficha, error: fichaError } = await supabase
        .from('fichas_treino')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fichaError || !ficha) {
        return res.status(404).json({ error: 'Ficha não encontrada' });
      }
      
      const { data: exercicios, error: exerciciosError } = await supabase
        .from('exercicios_ficha')
        .select('*')
        .eq('ficha_id', id)
        .order('ordem', { ascending: true });
      
      if (exerciciosError) throw exerciciosError;
      
      return res.status(200).json({ ...ficha, exercicios: exercicios || [] });
    }

    // PUT - Atualizar ficha
    if (req.method === 'PUT') {
      const { exercicios, ...fichaData } = req.body;
      
      // Atualizar ficha
      const { data: fichaAtualizada, error: fichaError } = await supabase
        .from('fichas_treino')
        .update({ ...fichaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (fichaError || !fichaAtualizada) {
        return res.status(404).json({ error: 'Ficha não encontrada' });
      }
      
      // Se exercícios foram fornecidos, atualizar
      if (exercicios && exercicios.length > 0) {
        // Remover exercícios antigos
        await supabase.from('exercicios_ficha').delete().eq('ficha_id', id);
        
        // Inserir novos exercícios
        const exerciciosComFichaId = exercicios.map((ex: any, index: number) => ({
          ...ex,
          ficha_id: id,
          ordem: index
        }));
        
        const { error: exerciciosError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId);
        
        if (exerciciosError) throw exerciciosError;
      }
      
      // Buscar ficha atualizada com exercícios
      const { data: exerciciosAtualizados } = await supabase
        .from('exercicios_ficha')
        .select('*')
        .eq('ficha_id', id)
        .order('ordem', { ascending: true });
      
      return res.status(200).json({ 
        ...fichaAtualizada, 
        exercicios: exerciciosAtualizados || [] 
      });
    }

    // DELETE - Remover ficha
    if (req.method === 'DELETE') {
      // Remover exercícios primeiro
      await supabase.from('exercicios_ficha').delete().eq('ficha_id', id);
      
      // Remover ficha
      const { error } = await supabase
        .from('fichas_treino')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return res.status(204).end();
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Fichas Treino [id] API error:', error);
    return res.status(500).json({ error: error.message });
  }
}