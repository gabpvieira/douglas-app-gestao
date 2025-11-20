import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  dataNascimento: string | null;
  altura: number | null;
  genero: string | null;
  status: string;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAlunoData {
  nome: string;
  email: string;
  dataNascimento: string;
  altura: number;
  genero: 'masculino' | 'feminino' | 'outro';
  status: 'ativo' | 'inativo' | 'pendente';
  fotoUrl?: string;
}

// Hook para listar alunos
export function useAlunos() {
  return useQuery<Aluno[]>({
    queryKey: ['alunos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('tipo', 'aluno')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alunos:', error);
        throw new Error('Falha ao buscar alunos');
      }

      return data || [];
    }
  });
}

// Hook para criar aluno
export function useCreateAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAlunoData) => {
      const { data: newAluno, error } = await supabase
        .from('users_profile')
        .insert([{
          ...data,
          tipo: 'aluno'
        }])
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar aluno:', error);
        throw new Error('Falha ao criar aluno');
      }

      return newAluno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno criado com sucesso'
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

// Hook para atualizar aluno
export function useUpdateAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAlunoData> }) => {
      const { data: updatedAluno, error } = await supabase
        .from('users_profile')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar aluno:', error);
        throw new Error('Falha ao atualizar aluno');
      }

      return updatedAluno;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno atualizado com sucesso'
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

// Hook para deletar aluno
export function useDeleteAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('users_profile')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar aluno:', error);
        throw new Error('Falha ao deletar aluno');
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno deletado com sucesso'
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
