import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface BlocoHorario {
  id: string;
  diaSemana: number; // 0=domingo, 6=sábado
  horaInicio: string;
  horaFim: string;
  duracao: number; // em minutos
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateBlocoHorarioData {
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  duracao: number;
  ativo?: boolean;
}

interface UpdateBlocoHorarioData {
  diaSemana?: number;
  horaInicio?: string;
  horaFim?: string;
  duracao?: number;
  ativo?: boolean;
}

// Listar todos os blocos de horário
export function useBlocosHorarios() {
  return useQuery<BlocoHorario[]>({
    queryKey: ['blocos-horarios'],
    queryFn: async () => {
      const response = await fetch('/api/admin/blocos-horarios');
      if (!response.ok) {
        throw new Error('Falha ao buscar blocos de horário');
      }
      return response.json();
    }
  });
}

// Listar blocos ativos
export function useBlocosHorariosAtivos() {
  return useQuery<BlocoHorario[]>({
    queryKey: ['blocos-horarios-ativos'],
    queryFn: async () => {
      const response = await fetch('/api/admin/blocos-horarios');
      if (!response.ok) {
        throw new Error('Falha ao buscar blocos de horário');
      }
      const blocos = await response.json();
      return blocos.filter((b: BlocoHorario) => b.ativo);
    }
  });
}

// Criar bloco de horário
export function useCreateBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBlocoHorarioData) => {
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
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios-ativos'] });
      toast({
        title: 'Sucesso!',
        description: 'Bloco de horário criado com sucesso'
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

// Atualizar bloco de horário
export function useUpdateBlocoHorario() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBlocoHorarioData }) => {
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
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios-ativos'] });
      toast({
        title: 'Sucesso!',
        description: 'Bloco de horário atualizado com sucesso'
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

// Deletar bloco de horário
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
      queryClient.invalidateQueries({ queryKey: ['blocos-horarios-ativos'] });
      toast({
        title: 'Sucesso!',
        description: 'Bloco de horário deletado com sucesso'
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

// Helper para converter número do dia em nome
export function getDiaNome(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[diaSemana] || '';
}
