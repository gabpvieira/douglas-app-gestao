import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface Assinatura {
  id: string;
  alunoId: string;
  planoTipo: 'mensal' | 'trimestral' | 'familia';
  preco: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativa' | 'cancelada' | 'vencida';
  mercadoPagoSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAssinaturaData {
  alunoId: string;
  planoTipo: 'mensal' | 'trimestral' | 'familia';
  preco: number;
  dataInicio: string;
  dataFim: string;
}

interface UpdateAssinaturaData {
  status?: 'ativa' | 'cancelada' | 'vencida';
  dataFim?: string;
}

// Listar todas as assinaturas (Admin)
export function useAssinaturas() {
  return useQuery<Assinatura[]>({
    queryKey: ['assinaturas'],
    queryFn: async () => {
      const response = await fetch('/api/admin/assinaturas');
      if (!response.ok) {
        throw new Error('Falha ao buscar assinaturas');
      }
      return response.json();
    }
  });
}

// Obter assinatura de um aluno
export function useAssinaturaAluno(alunoId: string) {
  return useQuery<Assinatura>({
    queryKey: ['assinatura-aluno', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/assinaturas/aluno/${alunoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Falha ao buscar assinatura');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Obter minha assinatura (Aluno)
export function useMyAssinatura(alunoId: string) {
  return useQuery<Assinatura>({
    queryKey: ['minha-assinatura', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/aluno/assinatura?alunoId=${alunoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Falha ao buscar assinatura');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Criar assinatura
export function useCreateAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAssinaturaData) => {
      const response = await fetch('/api/admin/assinaturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar assinatura');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso'
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

// Atualizar assinatura
export function useUpdateAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssinaturaData }) => {
      const response = await fetch(`/api/admin/assinaturas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar assinatura');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno', data.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['minha-assinatura', data.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura atualizada com sucesso'
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

// Cancelar assinatura
export function useCancelAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/assinaturas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelada' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao cancelar assinatura');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno'] });
      queryClient.invalidateQueries({ queryKey: ['minha-assinatura'] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura cancelada com sucesso'
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
