import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

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
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          aluno:alunos(id, nome, email),
          blocoHorario:blocos_horarios(*)
        `)
        .order('data_agendamento', { ascending: true });
      
      if (data) {
        query = query.eq('data_agendamento', data);
      }
      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }
      
      const { data: agendamentos, error } = await query;
      if (error) throw error;
      return agendamentos || [];
    }
  });
}

// Obter meus agendamentos (Aluno)
export function useMyAgendamentos(alunoId: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['meus-agendamentos', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          *,
          blocoHorario:blocos_horarios(*)
        `)
        .eq('aluno_id', alunoId)
        .order('data_agendamento', { ascending: true });
      
      if (error) throw error;
      return data || [];
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
      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .insert([data])
        .select()
        .single();
      
      if (error) throw error;
      return agendamento;
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
      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return agendamento;
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
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
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
