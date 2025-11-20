import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface TreinoPdf {
  id: string;
  alunoId: string;
  nome: string;
  descricao: string | null;
  urlPdf: string;
  dataUpload: string;
  createdAt: string;
}

// Hook para listar treinos PDF de um aluno
export function useTreinosPdf(alunoId: string | null) {
  return useQuery<TreinoPdf[]>({
    queryKey: ['treinos-pdf', alunoId],
    queryFn: async () => {
      if (!alunoId) return [];
      
      const response = await fetch(`/api/admin/treinos-pdf/${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar treinos PDF');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Hook para aluno ver seus treinos
export function useMyTreinosPdf(alunoId: string | null) {
  return useQuery<TreinoPdf[]>({
    queryKey: ['my-treinos-pdf', alunoId],
    queryFn: async () => {
      if (!alunoId) return [];
      
      const response = await fetch(`/api/aluno/treinos-pdf?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar treinos');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Hook para upload de treino PDF
export function useUploadTreinoPdf() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ file, alunoId, nome, descricao }: {
      file: File;
      alunoId: string;
      nome: string;
      descricao?: string;
    }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alunoId', alunoId);
      formData.append('nome', nome);
      if (descricao) formData.append('descricao', descricao);

      const response = await fetch('/api/admin/treinos-pdf/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao fazer upload');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treinos-pdf', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Treino PDF enviado com sucesso'
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

// Hook para deletar treino PDF
export function useDeleteTreinoPdf() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/treinos-pdf/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar treino');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos-pdf'] });
      toast({
        title: 'Sucesso!',
        description: 'Treino deletado com sucesso'
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

// Hook para obter URL de download
export function useDownloadTreinoPdf() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/treinos-pdf/${id}/download`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao gerar URL de download');
      }

      const data = await response.json();
      
      // Abrir em nova aba
      window.open(data.url, '_blank');
      
      return data;
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
