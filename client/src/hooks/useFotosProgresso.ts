import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

interface FotoProgresso {
  id: string;
  alunoId?: string;
  data: string;
  tipo: 'front' | 'side' | 'back';
  urlFoto: string;
  createdAt: string;
}

interface UploadFotoData {
  alunoId: string;
  data: string;
  tipo: 'front' | 'side' | 'back';
  file: File;
}

// Listar fotos de progresso do aluno
export function useFotosProgresso(alunoId: string) {
  return useQuery<FotoProgresso[]>({
    queryKey: ['fotos-progresso', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/aluno/fotos-progresso?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar fotos de progresso');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Listar fotos por data
export function useFotosProgressoByData(alunoId: string, data: string) {
  return useQuery<FotoProgresso[]>({
    queryKey: ['fotos-progresso', alunoId, data],
    queryFn: async () => {
      const response = await fetch(`/api/aluno/fotos-progresso/data/${data}?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar fotos');
      }
      return response.json();
    },
    enabled: !!alunoId && !!data
  });
}

// Admin: Listar fotos de um aluno
export function useAdminFotosProgresso(alunoId: string) {
  return useQuery<FotoProgresso[]>({
    queryKey: ['admin-fotos-progresso', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/fotos-progresso/${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar fotos');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Upload de foto
export function useUploadFotoProgresso() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UploadFotoData) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('alunoId', data.alunoId);
      formData.append('data', data.data);
      formData.append('tipo', data.tipo);

      const response = await fetch('/api/aluno/fotos-progresso/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao fazer upload da foto');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fotos-progresso', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['admin-fotos-progresso', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Foto enviada com sucesso'
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

// Deletar foto
export function useDeleteFotoProgresso() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, alunoId }: { id: string; alunoId: string }) => {
      const response = await fetch(`/api/aluno/fotos-progresso/${id}?alunoId=${alunoId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao deletar foto');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fotos-progresso', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['admin-fotos-progresso', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Foto deletada com sucesso'
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
