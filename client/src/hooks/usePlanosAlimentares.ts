import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface PlanoAlimentar {
  id: string;
  alunoId: string;
  titulo: string;
  conteudoHtml: string;
  observacoes: string | null;
  dataCriacao: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePlanoData {
  alunoId: string;
  titulo: string;
  conteudoHtml: string;
  observacoes?: string;
}

interface UpdatePlanoData {
  titulo?: string;
  conteudoHtml?: string;
  observacoes?: string;
}

// Listar planos de um aluno (Admin)
export function usePlanosAlimentares(alunoId: string) {
  return useQuery<PlanoAlimentar[]>({
    queryKey: ['planos-alimentares', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/planos-alimentares/${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar planos alimentares');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Obter plano atual do aluno
export function useMyPlanoAlimentar(alunoId: string) {
  return useQuery<PlanoAlimentar>({
    queryKey: ['meu-plano-alimentar', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/aluno/plano-alimentar?alunoId=${alunoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Falha ao buscar plano alimentar');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Obter plano específico
export function usePlanoAlimentar(id: string) {
  return useQuery<PlanoAlimentar>({
    queryKey: ['plano-alimentar', id],
    queryFn: async () => {
      const response = await fetch(`/api/planos-alimentares/${id}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar plano alimentar');
      }
      return response.json();
    },
    enabled: !!id
  });
}

// Criar plano alimentar
export function useCreatePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePlanoData) => {
      const response = await fetch('/api/admin/planos-alimentares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar plano alimentar');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar criado com sucesso'
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

// Atualizar plano alimentar
export function useUpdatePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanoData }) => {
      const response = await fetch(`/api/admin/planos-alimentares/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar plano alimentar');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares', data.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar', data.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['plano-alimentar', data.id] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar atualizado com sucesso'
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

// Deletar plano alimentar
export function useDeletePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/planos-alimentares/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar plano alimentar');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar deletado com sucesso'
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
