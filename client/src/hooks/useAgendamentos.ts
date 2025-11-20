import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface Agendamento {
  id: string;
  alunoId: string;
  blocoHorarioId: string;
  dataAgendamento: string;
  status: 'agendado' | 'cancelado' | 'concluido';
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
  aluno?: {
    id: string;
    nome: string;
    email: string;
  };
  blocoHorario?: any;
}

interface CreateAgendamentoData {
  alunoId: string;
  blocoHorarioId: string;
  dataAgendamento: string;
  observacoes?: string;
}

interface UpdateAgendamentoData {
  status?: 'agendado' | 'cancelado' | 'concluido';
  observacoes?: string;
}

// Listar todos os agendamentos (Admin)
export function useAgendamentos(data?: string, alunoId?: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', data, alunoId],
    queryFn: async () => {
      // TODO: Implementar com Supabase
      console.warn('useAgendamentos: Retornando array vazio temporariamente');
      return [];
    }
  });
}

// Obter meus agendamentos (Aluno)
export function useMyAgendamentos(alunoId: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['meus-agendamentos', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/agendamentos?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Criar agendamento
export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAgendamentoData) => {
      const response = await fetch('/api/admin/agendamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar agendamento');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento criado com sucesso'
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

// Atualizar agendamento
export function useUpdateAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAgendamentoData }) => {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar agendamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento atualizado com sucesso'
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

// Cancelar agendamento
export function useCancelAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelado' })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao cancelar agendamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento cancelado com sucesso'
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

// Deletar agendamento
export function useDeleteAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar agendamento');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      queryClient.invalidateQueries({ queryKey: ['meus-agendamentos'] });
      toast({
        title: 'Sucesso!',
        description: 'Agendamento deletado com sucesso'
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
