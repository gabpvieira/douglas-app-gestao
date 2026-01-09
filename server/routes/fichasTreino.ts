import type { Express } from 'express';
import { supabase } from '../supabase';

export function registerFichasTreinoRoutes(app: Express) {
  
  // Listar todas as fichas de treino com exercícios
  app.get('/api/fichas-treino', async (req, res) => {
    try {
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
      
      res.json(fichasComExercicios);
    } catch (error) {
      console.error('Erro ao buscar fichas:', error);
      res.status(500).json({ error: 'Erro ao buscar fichas de treino' });
    }
  });

  // Buscar ficha específica com exercícios
  app.get('/api/fichas-treino/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
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
      
      res.json({ ...ficha, exercicios: exercicios || [] });
    } catch (error) {
      console.error('Erro ao buscar ficha:', error);
      res.status(500).json({ error: 'Erro ao buscar ficha de treino' });
    }
  });

  // Criar nova ficha de treino
  app.post('/api/fichas-treino', async (req, res) => {
    try {
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
      
      res.status(201).json({ ...novaFicha, exercicios: exerciciosCriados });
    } catch (error) {
      console.error('Erro ao criar ficha:', error);
      res.status(500).json({ error: 'Erro ao criar ficha de treino' });
    }
  });

  // Atualizar ficha de treino
  app.put('/api/fichas-treino/:id', async (req, res) => {
    try {
      const { id } = req.params;
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
      if (exercicios) {
        // Remover exercícios antigos
        await supabase.from('exercicios_ficha').delete().eq('ficha_id', id);
        
        // Inserir novos exercícios
        if (exercicios.length > 0) {
          const exerciciosComFichaId = exercicios.map((ex: any, index: number) => ({
            ...ex,
            ficha_id: id,
            ordem: ex.ordem || index + 1
          }));
          
          await supabase.from('exercicios_ficha').insert(exerciciosComFichaId);
        }
      }
      
      // Buscar ficha completa com exercícios
      const { data: exerciciosAtualizados } = await supabase
        .from('exercicios_ficha')
        .select('*')
        .eq('ficha_id', id)
        .order('ordem', { ascending: true });
      
      res.json({ ...fichaAtualizada, exercicios: exerciciosAtualizados || [] });
    } catch (error) {
      console.error('Erro ao atualizar ficha:', error);
      res.status(500).json({ error: 'Erro ao atualizar ficha de treino' });
    }
  });

  // Deletar ficha de treino
  app.delete('/api/fichas-treino/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Verificar se há atribuições com histórico de treinos
      const { data: atribuicoes } = await supabase
        .from('fichas_alunos')
        .select('id')
        .eq('ficha_id', id);
      
      if (atribuicoes && atribuicoes.length > 0) {
        const fichaIds = atribuicoes.map(a => a.id);
        
        // Verificar se há treinos realizados
        const { count } = await supabase
          .from('treinos_realizados')
          .select('*', { count: 'exact', head: true })
          .in('ficha_aluno_id', fichaIds);
        
        if (count && count > 0) {
          return res.status(400).json({ 
            error: 'Não é possível deletar esta ficha pois existem treinos realizados. Desative-a ao invés de deletar.' 
          });
        }
      }
      
      const { error } = await supabase
        .from('fichas_treino')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao deletar ficha:', error);
      res.status(500).json({ error: 'Erro ao deletar ficha de treino' });
    }
  });

  // Atribuir ficha a aluno
  app.post('/api/fichas-treino/:id/atribuir', async (req, res) => {
    try {
      const { id } = req.params;
      const atribuicaoData = req.body;
      
      const { data: atribuicao, error } = await supabase
        .from('fichas_alunos')
        .insert([{ ...atribuicaoData, ficha_id: id }])
        .select()
        .single();
      
      if (error) throw error;
      
      res.status(201).json(atribuicao);
    } catch (error) {
      console.error('Erro ao atribuir ficha:', error);
      res.status(500).json({ error: 'Erro ao atribuir ficha ao aluno' });
    }
  });

  // Listar fichas de um aluno
  app.get('/api/fichas-treino/aluno/:alunoId', async (req, res) => {
    try {
      const { alunoId } = req.params;
      
      const { data: fichasDoAluno, error } = await supabase
        .from('fichas_alunos')
        .select(`
          id,
          ficha_id,
          data_inicio,
          data_fim,
          status,
          observacoes,
          fichas_treino (
            nome,
            descricao,
            objetivo,
            nivel,
            duracao_semanas
          )
        `)
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      res.json(fichasDoAluno);
    } catch (error) {
      console.error('Erro ao buscar fichas do aluno:', error);
      res.status(500).json({ error: 'Erro ao buscar fichas do aluno' });
    }
  });

  // Buscar atribuições de uma ficha específica
  app.get('/api/fichas-treino/:id/atribuicoes', async (req, res) => {
    try {
      const { id } = req.params;
      
      const { data: atribuicoes, error } = await supabase
        .from('fichas_alunos')
        .select(`
          id,
          aluno_id,
          data_inicio,
          data_fim,
          status,
          observacoes,
          created_at
        `)
        .eq('ficha_id', id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      res.json(atribuicoes || []);
    } catch (error) {
      console.error('Erro ao buscar atribuições:', error);
      res.status(500).json({ error: 'Erro ao buscar atribuições da ficha' });
    }
  });

  // Remover atribuição
  app.delete('/api/fichas-treino/:fichaId/atribuicoes/:atribuicaoId', async (req, res) => {
    try {
      const { atribuicaoId } = req.params;
      
      // Verificar se há treinos realizados nesta atribuição
      const { count } = await supabase
        .from('treinos_realizados')
        .select('*', { count: 'exact', head: true })
        .eq('ficha_aluno_id', atribuicaoId);
      
      if (count && count > 0) {
        return res.status(400).json({ 
          error: 'Não é possível remover esta atribuição pois existem treinos realizados. Altere o status para "concluído" ao invés de deletar.' 
        });
      }
      
      const { error } = await supabase
        .from('fichas_alunos')
        .delete()
        .eq('id', atribuicaoId);
      
      if (error) throw error;
      
      res.json({ success: true });
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      res.status(500).json({ error: 'Erro ao remover atribuição' });
    }
  });

  // Buscar estatísticas das fichas
  app.get('/api/fichas-treino/stats/geral', async (req, res) => {
    try {
      // Total de fichas
      const { count: totalFichas } = await supabase
        .from('fichas_treino')
        .select('*', { count: 'exact', head: true });

      // Fichas ativas
      const { count: fichasAtivas } = await supabase
        .from('fichas_treino')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', 'true');

      // Total de exercícios
      const { count: totalExercicios } = await supabase
        .from('exercicios_ficha')
        .select('*', { count: 'exact', head: true });

      // Alunos únicos com fichas ativas
      const { data: alunosComFichas } = await supabase
        .from('fichas_alunos')
        .select('aluno_id')
        .eq('status', 'ativo');

      const alunosUnicos = new Set(alunosComFichas?.map(a => a.aluno_id) || []);

      res.json({
        totalFichas: totalFichas || 0,
        fichasAtivas: fichasAtivas || 0,
        totalExercicios: totalExercicios || 0,
        alunosComFichas: alunosUnicos.size
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas' });
    }
  });
}
