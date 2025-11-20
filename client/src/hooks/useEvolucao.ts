import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

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
      
      const url = limit 
        ? `/api/aluno/evolucao?alunoId=${alunoId}&limit=${limit}`
        : `/api/aluno/evolucao?alunoId=${alunoId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar evolução');
      }
      return response.json();
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
      
      const response = await fetch(`/api/aluno/evolucao/stats?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas');
      }
      return response.json();
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
      const response = await fetch('/api/aluno/evolucao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao registrar evolução');
      }

      return response.json();
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
      const response = await fetch(`/api/aluno/evolucao/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar evolução');
      }

      return response.json();
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
      const response = await fetch(`/api/aluno/evolucao/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar evolução');
      }

      return response.json();
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
