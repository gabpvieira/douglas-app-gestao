import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

// Interfaces
export interface BlocoHorario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  duracao: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agendamento {
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
  blocoHorario?: BlocoHorario;
}

export interface ExcecaoDisponibilidade {
  id: string;
  dataInicio: string;
  dataFim: string;
  motivo: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

// Hook para buscar blocos de horários
export function useBlocosHorarios() {
  return useQuery<BlocoHorario[]>({
    queryKey: ['blocos-horarios'],
    queryFn: async () => {
      const response = await fetch('/api/admin/blocos-horarios');
      if (!response.ok) throw new Error('Falha ao buscar blocos de horários');
      return response.json();
    }
  });
}

// Hook para buscar agendamentos
export function useAgendamentos(dataInicio?: string, dataFim?: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', dataInicio, dataFim],
    queryFn: async () => {
      let url = '/api/admin/agendamentos';
      const params = new URLSearchParams();
      if (dataInicio) params.append('dataInicio', dataInicio);
      if (dataFim) params.append('dataFim', dataFim);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao buscar agendamentos');
      return response.json();
    }
  });
}

// Hook para buscar exceções de disponibilidade
export function useExcecoesDisponibilidade() {
  return useQuery<ExcecaoDisponibilidade[]>({
    queryKey: ['excecoes-disponibilidade'],
    queryFn: async () => {
      const response = await fetch('/api/admin/excecoes-disponibilidade');
      if (!response.ok) throw new Error('Falha ao buscar exceções');
      return response.json();
    }
  });
}

// Hook para criar bloco de horário
export function useCreateBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<BlocoHorario, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await fetch('/api/admin/blocos-horarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar bloco de horário');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios'] });
      toast({ title: 'Sucesso!', description: 'Bloco de horário criado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}

// Hook para criar agendamento
export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      alunoId: string;
      blocoHorarioId: string;
      dataAgendamento: string;
      observacoes?: string;
    }) => {
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({ title: 'Sucesso!', description: 'Agendamento criado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}

// Hook para atualizar status do agendamento
export function useUpdateAgendamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/agendamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar agendamento');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] });
      toast({ title: 'Sucesso!', description: 'Agendamento atualizado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}

// Hook para deletar agendamento
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
      toast({ title: 'Sucesso!', description: 'Agendamento deletado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}

// Hook para atualizar bloco de horário
export function useUpdateBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<BlocoHorario, 'id' | 'createdAt' | 'updatedAt'>> }) => {
      const response = await fetch(`/api/admin/blocos-horarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar bloco de horário');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios'] });
      toast({ title: 'Sucesso!', description: 'Bloco de horário atualizado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}

// Hook para deletar bloco de horário
export function useDeleteBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/blocos-horarios/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar bloco de horário');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios'] });
      toast({ title: 'Sucesso!', description: 'Bloco de horário deletado' });
    },
    onError: (error: Error) => {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  });
}
