import type { Express } from "express";
import { supabase } from "../supabase";

export function registerEvolucoesRoutes(app: Express) {
  
  // Registrar nova evolução
  app.post("/api/aluno/evolucao", async (req, res) => {
    try {
      const { 
        alunoId, 
        data, 
        peso, 
        gorduraCorporal, 
        massaMuscular, 
        peito,
        cintura,
        quadril,
        braco,
        coxa,
        observacoes 
      } = req.body;

      if (!alunoId || !data) {
        return res.status(400).json({ error: 'alunoId e data são obrigatórios' });
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

      const { data: evolucao, error } = await supabase
        .from('evolucoes')
        .insert({
          aluno_id: alunoId,
          data,
          peso: peso || null,
          gordura_corporal: gorduraCorporal || null,
          massa_muscular: massaMuscular || null,
          peito: peito || null,
          cintura: cintura || null,
          quadril: quadril || null,
          braco: braco || null,
          coxa: coxa || null,
          observacoes: observacoes || null
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        id: evolucao.id,
        alunoId: evolucao.aluno_id,
        data: evolucao.data,
        peso: evolucao.peso,
        gorduraCorporal: evolucao.gordura_corporal,
        massaMuscular: evolucao.massa_muscular,
        peito: evolucao.peito,
        cintura: evolucao.cintura,
        quadril: evolucao.quadril,
        braco: evolucao.braco,
        coxa: evolucao.coxa,
        observacoes: evolucao.observacoes,
        createdAt: evolucao.created_at
      });

    } catch (error: any) {
      console.error('Error creating evolucao:', error);
      res.status(500).json({ error: 'Falha ao registrar evolução' });
    }
  });

  // Obter histórico de evolução do aluno
  app.get("/api/aluno/evolucao", async (req, res) => {
    try {
      const { alunoId, limit } = req.query; // TODO: Pegar alunoId do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      let query = supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });

      if (limit) {
        query = query.limit(parseInt(limit as string));
      }

      const { data: evolucoes, error } = await query;

      if (error) throw error;

      const evolucoesFormatted = evolucoes.map(e => ({
        id: e.id,
        data: e.data,
        peso: e.peso,
        gorduraCorporal: e.gordura_corporal,
        massaMuscular: e.massa_muscular,
        peito: e.peito,
        cintura: e.cintura,
        quadril: e.quadril,
        braco: e.braco,
        coxa: e.coxa,
        observacoes: e.observacoes,
        createdAt: e.created_at
      }));

      res.json(evolucoesFormatted);

    } catch (error: any) {
      console.error('Error fetching evolucoes:', error);
      res.status(500).json({ error: 'Falha ao buscar evolução' });
    }
  });

  // Admin: Obter evolução de um aluno
  app.get("/api/admin/evolucao/:alunoId", async (req, res) => {
    try {
      const { alunoId } = req.params;
      const { limit } = req.query;

      let query = supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });

      if (limit) {
        query = query.limit(parseInt(limit as string));
      }

      const { data: evolucoes, error } = await query;

      if (error) throw error;

      const evolucoesFormatted = evolucoes.map(e => ({
        id: e.id,
        alunoId: e.aluno_id,
        data: e.data,
        peso: e.peso,
        gorduraCorporal: e.gordura_corporal,
        massaMuscular: e.massa_muscular,
        peito: e.peito,
        cintura: e.cintura,
        quadril: e.quadril,
        braco: e.braco,
        coxa: e.coxa,
        observacoes: e.observacoes,
        createdAt: e.created_at
      }));

      res.json(evolucoesFormatted);

    } catch (error: any) {
      console.error('Error fetching student evolucoes:', error);
      res.status(500).json({ error: 'Falha ao buscar evolução' });
    }
  });

  // Obter evolução específica
  app.get("/api/evolucao/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { data: evolucao, error } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !evolucao) {
        return res.status(404).json({ error: 'Evolução não encontrada' });
      }

      res.json({
        id: evolucao.id,
        alunoId: evolucao.aluno_id,
        data: evolucao.data,
        peso: evolucao.peso,
        gorduraCorporal: evolucao.gordura_corporal,
        massaMuscular: evolucao.massa_muscular,
        peito: evolucao.peito,
        cintura: evolucao.cintura,
        quadril: evolucao.quadril,
        braco: evolucao.braco,
        coxa: evolucao.coxa,
        observacoes: evolucao.observacoes,
        createdAt: evolucao.created_at
      });

    } catch (error: any) {
      console.error('Error fetching evolucao:', error);
      res.status(500).json({ error: 'Falha ao buscar evolução' });
    }
  });

  // Atualizar evolução
  app.put("/api/aluno/evolucao/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        peso, 
        gorduraCorporal, 
        massaMuscular, 
        peito,
        cintura,
        quadril,
        braco,
        coxa,
        observacoes 
      } = req.body;

      const updateData: any = {};
      if (peso !== undefined) updateData.peso = peso;
      if (gorduraCorporal !== undefined) updateData.gordura_corporal = gorduraCorporal;
      if (massaMuscular !== undefined) updateData.massa_muscular = massaMuscular;
      if (peito !== undefined) updateData.peito = peito;
      if (cintura !== undefined) updateData.cintura = cintura;
      if (quadril !== undefined) updateData.quadril = quadril;
      if (braco !== undefined) updateData.braco = braco;
      if (coxa !== undefined) updateData.coxa = coxa;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data: evolucao, error } = await supabase
        .from('evolucoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      res.json({
        id: evolucao.id,
        data: evolucao.data,
        peso: evolucao.peso,
        gorduraCorporal: evolucao.gordura_corporal,
        massaMuscular: evolucao.massa_muscular,
        peito: evolucao.peito,
        cintura: evolucao.cintura,
        quadril: evolucao.quadril,
        braco: evolucao.braco,
        coxa: evolucao.coxa,
        observacoes: evolucao.observacoes
      });

    } catch (error: any) {
      console.error('Error updating evolucao:', error);
      res.status(500).json({ error: 'Falha ao atualizar evolução' });
    }
  });

  // Deletar evolução
  app.delete("/api/aluno/evolucao/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('evolucoes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      res.json({ message: 'Evolução deletada com sucesso' });

    } catch (error: any) {
      console.error('Error deleting evolucao:', error);
      res.status(500).json({ error: 'Falha ao deletar evolução' });
    }
  });

  // Obter estatísticas de evolução
  app.get("/api/aluno/evolucao/stats", async (req, res) => {
    try {
      const { alunoId } = req.query; // TODO: Pegar do token JWT

      if (!alunoId) {
        return res.status(400).json({ error: 'alunoId é obrigatório' });
      }

      const { data: evolucoes, error } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: true });

      if (error) throw error;

      if (evolucoes.length === 0) {
        return res.json({
          totalRegistros: 0,
          primeiroRegistro: null,
          ultimoRegistro: null,
          pesoInicial: null,
          pesoAtual: null,
          pesoPerdido: null,
          gorduraInicial: null,
          gorduraAtual: null,
          gorduraReduzida: null
        });
      }

      const primeiro = evolucoes[0];
      const ultimo = evolucoes[evolucoes.length - 1];

      res.json({
        totalRegistros: evolucoes.length,
        primeiroRegistro: primeiro.data,
        ultimoRegistro: ultimo.data,
        pesoInicial: primeiro.peso,
        pesoAtual: ultimo.peso,
        pesoPerdido: primeiro.peso && ultimo.peso ? (primeiro.peso - ultimo.peso) : null,
        gorduraInicial: primeiro.gordura_corporal,
        gorduraAtual: ultimo.gordura_corporal,
        gorduraReduzida: primeiro.gordura_corporal && ultimo.gordura_corporal 
          ? (primeiro.gordura_corporal - ultimo.gordura_corporal) 
          : null,
        musculoInicial: primeiro.massa_muscular,
        musculoAtual: ultimo.massa_muscular,
        musculoGanho: primeiro.massa_muscular && ultimo.massa_muscular
          ? (ultimo.massa_muscular - primeiro.massa_muscular)
          : null
      });

    } catch (error: any) {
      console.error('Error fetching evolucao stats:', error);
      res.status(500).json({ error: 'Falha ao buscar estatísticas' });
    }
  });
}
