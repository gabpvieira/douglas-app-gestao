import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Exercicio {
  id?: string;
  nome: string;
  grupo_muscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  video_id?: string;
}

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao_semanas: number;
  ativo: string;
  exercicios?: Exercicio[];
  created_at: string;
  updated_at: string;
}

// Buscar todas as fichas
export function useFichasTreino() {
  return useQuery({
    queryKey: ['fichas-treino'],
    queryFn: async () => {
      const response = await fetch('/api/fichas-treino');
      if (!response.ok) throw new Error('Erro ao buscar fichas');
      return response.json() as Promise<FichaTreino[]>;
    }
  });
}

// Buscar ficha específica com exercícios
export function useFichaTreino(id: string) {
  return useQuery({
    queryKey: ['fichas-treino', id],
    queryFn: async () => {
      const response = await fetch(`/api/fichas-treino/${id}`);
      if (!response.ok) throw new Error('Erro ao buscar ficha');
      return response.json() as Promise<FichaTreino>;
    },
    enabled: !!id
  });
}

// Criar ficha
export function useCreateFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<FichaTreino> & { exercicios?: Exercicio[] }) => {
      const response = await fetch('/api/fichas-treino', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao criar ficha');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Atualizar ficha
export function useUpdateFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FichaTreino> & { exercicios?: Exercicio[] } }) => {
      const response = await fetch(`/api/fichas-treino/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao atualizar ficha');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Deletar ficha
export function useDeleteFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/fichas-treino/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao deletar ficha');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Atribuir ficha a aluno
export function useAtribuirFicha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fichaId, data }: { fichaId: string; data: any }) => {
      const response = await fetch(`/api/fichas-treino/${fichaId}/atribuir`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Erro ao atribuir ficha');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-atribuicoes', variables.fichaId] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Buscar atribuições de uma ficha
export function useFichaAtribuicoes(fichaId: string) {
  return useQuery({
    queryKey: ['fichas-atribuicoes', fichaId],
    queryFn: async () => {
      const response = await fetch(`/api/fichas-treino/${fichaId}/atribuicoes`);
      if (!response.ok) throw new Error('Erro ao buscar atribuições');
      return response.json();
    },
    enabled: !!fichaId
  });
}

// Remover atribuição
export function useRemoverAtribuicao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fichaId, atribuicaoId }: { fichaId: string; atribuicaoId: string }) => {
      const response = await fetch(`/api/fichas-treino/${fichaId}/atribuicoes/${atribuicaoId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Erro ao remover atribuição');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas-atribuicoes', variables.fichaId] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Buscar estatísticas gerais
export function useFichasStats() {
  return useQuery({
    queryKey: ['fichas-stats'],
    queryFn: async () => {
      const response = await fetch('/api/fichas-treino/stats/geral');
      if (!response.ok) throw new Error('Erro ao buscar estatísticas');
      return response.json() as Promise<{
        totalFichas: number;
        fichasAtivas: number;
        totalExercicios: number;
        alunosComFichas: number;
      }>;
    }
  });
}
