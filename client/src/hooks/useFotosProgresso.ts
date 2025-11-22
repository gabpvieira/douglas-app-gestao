import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

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
      const { data, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar fotos:', error);
        throw new Error('Falha ao buscar fotos de progresso');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        data: item.data,
        tipo: item.tipo,
        urlFoto: item.url_foto,
        createdAt: item.created_at
      }));
    },
    enabled: !!alunoId
  });
}

// Listar fotos por data
export function useFotosProgressoByData(alunoId: string, data: string) {
  return useQuery<FotoProgresso[]>({
    queryKey: ['fotos-progresso', alunoId, data],
    queryFn: async () => {
      const { data: fotos, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('data', data)
        .order('tipo', { ascending: true });
      
      if (error) {
        console.error('❌ Erro ao buscar fotos:', error);
        throw new Error('Falha ao buscar fotos');
      }
      
      return (fotos || []).map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        data: item.data,
        tipo: item.tipo,
        urlFoto: item.url_foto,
        createdAt: item.created_at
      }));
    },
    enabled: !!alunoId && !!data
  });
}

// Admin: Listar fotos de um aluno
export function useAdminFotosProgresso(alunoId: string) {
  return useQuery<FotoProgresso[]>({
    queryKey: ['admin-fotos-progresso', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar fotos:', error);
        throw new Error('Falha ao buscar fotos');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        data: item.data,
        tipo: item.tipo,
        urlFoto: item.url_foto,
        createdAt: item.created_at
      }));
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
      // Buscar a foto para pegar a URL antes de deletar
      const { data: foto } = await supabase
        .from('fotos_progresso')
        .select('url_foto')
        .eq('id', id)
        .single();

      // Deletar do storage se existir
      if (foto?.url_foto) {
        const fileName = foto.url_foto.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('fotos-progresso')
            .remove([fileName]);
        }
      }

      // Deletar do banco
      const { error } = await supabase
        .from('fotos_progresso')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erro ao deletar foto:', error);
        throw new Error(error.message || 'Falha ao deletar foto');
      }

      return { success: true };
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
