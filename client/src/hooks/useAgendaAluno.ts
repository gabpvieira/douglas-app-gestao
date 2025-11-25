import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AgendamentoAluno {
  id: string;
  dataAgendamento: string;
  horaInicio: string;
  horaFim: string;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'concluido';
  tipo: 'presencial' | 'online';
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

// Buscar agendamentos do aluno logado
export function useAgendamentosAluno() {
  return useQuery({
    queryKey: ['agendamentos-aluno'],
    queryFn: async () => {
      // Pegar o ID do aluno logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      // Buscar o perfil do usuário
      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('auth_uid', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      // Buscar o aluno
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_profile_id', profile.id)
        .single();

      if (!aluno) throw new Error('Aluno não encontrado');

      // Buscar agendamentos do aluno
      const { data, error } = await supabase
        .from('agendamentos_presenciais')
        .select('*')
        .eq('aluno_id', aluno.id)
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;

      return data.map((a: any) => ({
        id: a.id,
        dataAgendamento: a.data_agendamento,
        horaInicio: a.hora_inicio,
        horaFim: a.hora_fim,
        status: a.status,
        tipo: a.tipo,
        observacoes: a.observacoes,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      })) as AgendamentoAluno[];
    },
  });
}

// Solicitar reagendamento
export function useSolicitarReagendamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      agendamentoId, 
      novaData, 
      novaHoraInicio,
      motivo 
    }: { 
      agendamentoId: string; 
      novaData: string;
      novaHoraInicio: string;
      motivo: string;
    }) => {
      // Atualizar observações com solicitação de reagendamento
      const observacao = `SOLICITAÇÃO DE REAGENDAMENTO:\nNova data: ${novaData} às ${novaHoraInicio}\nMotivo: ${motivo}`;

      const { data, error } = await supabase
        .from('agendamentos_presenciais')
        .update({ 
          observacoes: observacao,
          status: 'agendado' // Mantém como agendado até admin confirmar
        })
        .eq('id', agendamentoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-aluno'] });
    },
  });
}

// Comunicar falta/cancelamento
export function useComunicarFalta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      agendamentoId, 
      motivo 
    }: { 
      agendamentoId: string; 
      motivo: string;
    }) => {
      const observacao = `COMUNICAÇÃO DE FALTA:\nMotivo: ${motivo}\nData: ${new Date().toLocaleString('pt-BR')}`;

      const { data, error } = await supabase
        .from('agendamentos_presenciais')
        .update({ 
          observacoes: observacao,
          status: 'cancelado'
        })
        .eq('id', agendamentoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-aluno'] });
    },
  });
}

// Buscar horários disponíveis para agendamento
export function useHorariosDisponiveis(data?: string) {
  return useQuery({
    queryKey: ['horarios-disponiveis', data],
    queryFn: async () => {
      if (!data) return [];

      // Buscar disponibilidade semanal
      const diaSemana = new Date(data).getDay();
      
      const { data: disponibilidade, error: dispError } = await supabase
        .from('disponibilidade_semanal')
        .select('*')
        .eq('dia_semana', diaSemana)
        .eq('ativo', true);

      if (dispError) throw dispError;

      // Buscar agendamentos já existentes nesta data
      const { data: agendamentos, error: agendError } = await supabase
        .from('agendamentos_presenciais')
        .select('hora_inicio, hora_fim')
        .eq('data_agendamento', data)
        .neq('status', 'cancelado');

      if (agendError) throw agendError;

      // Gerar slots disponíveis
      const slots: { horaInicio: string; horaFim: string; disponivel: boolean }[] = [];
      
      disponibilidade.forEach((disp: any) => {
        const inicio = disp.hora_inicio;
        const fim = disp.hora_fim;
        const duracao = disp.duracao_atendimento;

        // Gerar slots de acordo com a duração
        let horaAtual = inicio;
        while (horaAtual < fim) {
          const [h, m] = horaAtual.split(':').map(Number);
          const proximaHora = new Date(2000, 0, 1, h, m + duracao);
          const horaFimSlot = `${String(proximaHora.getHours()).padStart(2, '0')}:${String(proximaHora.getMinutes()).padStart(2, '0')}`;

          // Verificar se está ocupado
          const ocupado = agendamentos.some((ag: any) => 
            ag.hora_inicio === horaAtual
          );

          slots.push({
            horaInicio: horaAtual,
            horaFim: horaFimSlot,
            disponivel: !ocupado,
          });

          horaAtual = horaFimSlot;
        }
      });

      return slots;
    },
    enabled: !!data,
  });
}
