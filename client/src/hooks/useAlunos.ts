import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

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
      const response = await fetch('/api/admin/students');
      if (!response.ok) {
        throw new Error('Falha ao buscar alunos');
      }
      return response.json();
    }
  });
}

// Hook para criar aluno
export function useCreateAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAlunoData) => {
      const response = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar aluno');
      }

      return response.json();
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
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar aluno');
      }

      return response.json();
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
      const response = await fetch(`/api/admin/students/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar aluno');
      }

      return response.json();
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
