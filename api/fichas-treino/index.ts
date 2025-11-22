import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
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

    // GET - Listar todas as fichas
    if (req.method === 'GET') {
      const { data: fichas, error } = await supabase
        .from('fichas_treino')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Buscar exercícios para cada ficha
      const fichasComExercicios = await Promise.all(
        (fichas || []).map(async (ficha) => {
          const { data: exercicios } = await supabase
            .from('exercicios_ficha')
            .select('*')
            .eq('ficha_id', ficha.id)
            .order('ordem', { ascending: true });
          
          return {
            ...ficha,
            exercicios: exercicios || []
          };
        })
      );
      
      return res.status(200).json(fichasComExercicios);
    }

    // POST - Criar nova ficha
    if (req.method === 'POST') {
      const { exercicios, ...fichaData } = req.body;
      
      // Criar ficha
      const { data: novaFicha, error: fichaError } = await supabase
        .from('fichas_treino')
        .insert([fichaData])
        .select()
        .single();
      
      if (fichaError) throw fichaError;
      
      // Criar exercícios se fornecidos
      let exerciciosCriados = [];
      if (exercicios && exercicios.length > 0) {
        const exerciciosComFichaId = exercicios.map((ex: any, index: number) => ({
          ...ex,
          ficha_id: novaFicha.id,
          ordem: ex.ordem || index + 1
        }));
        
        const { data: exData, error: exError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId)
          .select();
        
        if (exError) throw exError;
        exerciciosCriados = exData || [];
      }
      
      return res.status(201).json({ ...novaFicha, exercicios: exerciciosCriados });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Error in fichas-treino API:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
