import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

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
      const { data, error } = await supabase
        .from('blocos_horarios')
        .select('*')
        .order('dia_semana', { ascending: true })
        .order('hora_inicio', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar blocos:', error);
        throw new Error('Falha ao buscar blocos de horários');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        diaSemana: item.dia_semana,
        horaInicio: item.hora_inicio,
        horaFim: item.hora_fim,
        duracao: item.duracao,
        ativo: item.ativo,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    }
  });
}

// Hook para buscar agendamentos
export function useAgendamentos(dataInicio?: string, dataFim?: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', dataInicio, dataFim],
    queryFn: async () => {
      let query = supabase
        .from('agendamentos')
        .select(`
          *,
          alunos!inner(
            id,
            users_profile(nome, email)
          ),
          blocos_horarios(*)
        `)
        .order('data_agendamento', { ascending: true });
      
      if (dataInicio) {
        query = query.gte('data_agendamento', dataInicio);
      }
      if (dataFim) {
        query = query.lte('data_agendamento', dataFim);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar agendamentos:', error);
        throw new Error('Falha ao buscar agendamentos');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        blocoHorarioId: item.bloco_horario_id,
        dataAgendamento: item.data_agendamento,
        status: item.status,
        observacoes: item.observacoes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        aluno: item.alunos?.users_profile ? {
          id: item.alunos.id,
          nome: item.alunos.users_profile.nome,
          email: item.alunos.users_profile.email
        } : undefined,
        blocoHorario: item.blocos_horarios ? {
          id: item.blocos_horarios.id,
          diaSemana: item.blocos_horarios.dia_semana,
          horaInicio: item.blocos_horarios.hora_inicio,
          horaFim: item.blocos_horarios.hora_fim,
          duracao: item.blocos_horarios.duracao,
          ativo: item.blocos_horarios.ativo,
          createdAt: item.blocos_horarios.created_at,
          updatedAt: item.blocos_horarios.updated_at
        } : undefined
      }));
    }
  });
}

// Hook para buscar exceções de disponibilidade
export function useExcecoesDisponibilidade() {
  return useQuery<ExcecaoDisponibilidade[]>({
    queryKey: ['excecoes-disponibilidade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('excecoes_disponibilidade')
        .select('*')
        .order('data_inicio', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar exceções:', error);
        throw new Error('Falha ao buscar exceções');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        dataInicio: item.data_inicio,
        dataFim: item.data_fim,
        motivo: item.motivo,
        ativo: item.ativo,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    }
  });
}

// Hook para criar bloco de horário
export function useCreateBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: Omit<BlocoHorario, 'id' | 'createdAt' | 'updatedAt'>) => {
      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .insert([{
          dia_semana: data.diaSemana,
          hora_inicio: data.horaInicio,
          hora_fim: data.horaFim,
          duracao: data.duracao,
          ativo: data.ativo
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar bloco:', error);
        throw new Error(error.message || 'Falha ao criar bloco de horário');
      }
      
      return bloco;
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
      const { data: agendamento, error } = await supabase
        .from('agendamentos')
        .insert([{
          aluno_id: data.alunoId,
          bloco_horario_id: data.blocoHorarioId,
          data_agendamento: data.dataAgendamento,
          observacoes: data.observacoes || null,
          status: 'agendado'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar agendamento:', error);
        throw new Error(error.message || 'Falha ao criar agendamento');
      }
      
      return agendamento;
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
    mutationFn: async ({ id, status, observacoes }: { id: string; status?: string; observacoes?: string }) => {
      const updateData: any = {};
      if (status) updateData.status = status;
      if (observacoes !== undefined) updateData.observacoes = observacoes;

      const { data, error } = await supabase
        .from('agendamentos')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao atualizar agendamento:', error);
        throw new Error(error.message || 'Falha ao atualizar agendamento');
      }
      
      return data;
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
      const { error } = await supabase
        .from('agendamentos')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erro ao deletar agendamento:', error);
        throw new Error(error.message || 'Falha ao deletar agendamento');
      }
      
      return { success: true };
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
      const updateData: any = {};
      if (data.diaSemana !== undefined) updateData.dia_semana = data.diaSemana;
      if (data.horaInicio !== undefined) updateData.hora_inicio = data.horaInicio;
      if (data.horaFim !== undefined) updateData.hora_fim = data.horaFim;
      if (data.duracao !== undefined) updateData.duracao = data.duracao;
      if (data.ativo !== undefined) updateData.ativo = data.ativo;

      const { data: bloco, error } = await supabase
        .from('blocos_horarios')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao atualizar bloco:', error);
        throw new Error(error.message || 'Falha ao atualizar bloco de horário');
      }
      
      return bloco;
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
      const { error } = await supabase
        .from('blocos_horarios')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('❌ Erro ao deletar bloco:', error);
        throw new Error(error.message || 'Falha ao deletar bloco de horário');
      }
      
      return { success: true };
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
