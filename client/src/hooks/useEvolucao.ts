import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface Evolucao {
  id: string;
  data: string;
  peso: number | null;
  gorduraCorporal: number | null;
  massaMuscular: number | null;
  peito: number | null;
  cintura: number | null;
  quadril: number | null;
  braco: number | null;
  coxa: number | null;
  observacoes: string | null;
  createdAt: string;
}

interface EvolucaoStats {
  totalRegistros: number;
  primeiroRegistro: string | null;
  ultimoRegistro: string | null;
  pesoInicial: number | null;
  pesoAtual: number | null;
  pesoPerdido: number | null;
  gorduraInicial: number | null;
  gorduraAtual: number | null;
  gorduraReduzida: number | null;
  musculoInicial: number | null;
  musculoAtual: number | null;
  musculoGanho: number | null;
}

interface CreateEvolucaoData {
  alunoId: string;
  data: string;
  peso?: number;
  gorduraCorporal?: number;
  massaMuscular?: number;
  peito?: number;
  cintura?: number;
  quadril?: number;
  braco?: number;
  coxa?: number;
  observacoes?: string;
}

// Hook para listar evolução do aluno
export function useEvolucao(alunoId: string | null, limit?: number) {
  return useQuery<Evolucao[]>({
    queryKey: ['evolucao', alunoId, limit],
    queryFn: async () => {
      if (!alunoId) return [];
      
      let query = supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar evolução:', error);
        throw new Error('Falha ao buscar evolução');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        data: item.data,
        peso: item.peso,
        gorduraCorporal: item.gordura_corporal,
        massaMuscular: item.massa_muscular,
        peito: item.peito,
        cintura: item.cintura,
        quadril: item.quadril,
        braco: item.braco,
        coxa: item.coxa,
        observacoes: item.observacoes,
        createdAt: item.created_at
      }));
    },
    enabled: !!alunoId
  });
}

// Hook para estatísticas de evolução
export function useEvolucaoStats(alunoId: string | null) {
  return useQuery<EvolucaoStats>({
    queryKey: ['evolucao-stats', alunoId],
    queryFn: async () => {
      if (!alunoId) throw new Error('alunoId é obrigatório');
      
      const { data, error } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw new Error('Falha ao buscar estatísticas');
      }
      
      const evolucoes = data || [];
      const totalRegistros = evolucoes.length;
      
      if (totalRegistros === 0) {
        return {
          totalRegistros: 0,
          primeiroRegistro: null,
          ultimoRegistro: null,
          pesoInicial: null,
          pesoAtual: null,
          pesoPerdido: null,
          gorduraInicial: null,
          gorduraAtual: null,
          gorduraReduzida: null,
          musculoInicial: null,
          musculoAtual: null,
          musculoGanho: null
        };
      }
      
      const primeiro = evolucoes[0];
      const ultimo = evolucoes[evolucoes.length - 1];
      
      return {
        totalRegistros,
        primeiroRegistro: primeiro.data,
        ultimoRegistro: ultimo.data,
        pesoInicial: primeiro.peso,
        pesoAtual: ultimo.peso,
        pesoPerdido: primeiro.peso && ultimo.peso ? primeiro.peso - ultimo.peso : null,
        gorduraInicial: primeiro.gordura_corporal,
        gorduraAtual: ultimo.gordura_corporal,
        gorduraReduzida: primeiro.gordura_corporal && ultimo.gordura_corporal 
          ? primeiro.gordura_corporal - ultimo.gordura_corporal : null,
        musculoInicial: primeiro.massa_muscular,
        musculoAtual: ultimo.massa_muscular,
        musculoGanho: primeiro.massa_muscular && ultimo.massa_muscular 
          ? ultimo.massa_muscular - primeiro.massa_muscular : null
      };
    },
    enabled: !!alunoId
  });
}

// Hook para criar evolução
export function useCreateEvolucao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateEvolucaoData) => {
      const { data: evolucao, error } = await supabase
        .from('evolucoes')
        .insert([{
          aluno_id: data.alunoId,
          data: data.data,
          peso: data.peso || null,
          gordura_corporal: data.gorduraCorporal || null,
          massa_muscular: data.massaMuscular || null,
          peito: data.peito || null,
          cintura: data.cintura || null,
          quadril: data.quadril || null,
          braco: data.braco || null,
          coxa: data.coxa || null,
          observacoes: data.observacoes || null
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar evolução:', error);
        throw new Error(error.message || 'Falha ao registrar evolução');
      }
      
      return evolucao;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['evolucao', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['evolucao-stats', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Evolução registrada com sucesso'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Hook para atualizar evolução
export function useUpdateEvolucao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateEvolucaoData> }) => {
      const updateData: any = {};
      if (data.data) updateData.data = data.data;
      if (data.peso !== undefined) updateData.peso = data.peso;
      if (data.gorduraCorporal !== undefined) updateData.gordura_corporal = data.gorduraCorporal;
      if (data.massaMuscular !== undefined) updateData.massa_muscular = data.massaMuscular;
      if (data.peito !== undefined) updateData.peito = data.peito;
      if (data.cintura !== undefined) updateData.cintura = data.cintura;
      if (data.quadril !== undefined) updateData.quadril = data.quadril;
      if (data.braco !== undefined) updateData.braco = data.braco;
      if (data.coxa !== undefined) updateData.coxa = data.coxa;
      if (data.observacoes !== undefined) updateData.observacoes = data.observacoes;

      const { data: evolucao, error } = await supabase
        .from('evolucoes')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar evolução:', error);
        throw new Error(error.message || 'Falha ao atualizar evolução');
      }

      return evolucao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucao'] });
      queryClient.invalidateQueries({ queryKey: ['evolucao-stats'] });
      toast({
        title: 'Sucesso!',
        description: 'Evolução atualizada com sucesso'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Hook para deletar evolução
export function useDeleteEvolucao() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evolucoes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar evolução:', error);
        throw new Error(error.message || 'Falha ao deletar evolução');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucao'] });
      queryClient.invalidateQueries({ queryKey: ['evolucao-stats'] });
      toast({
        title: 'Sucesso!',
        description: 'Evolução deletada com sucesso'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
