import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface TreinoVideo {
  id: string;
  nome: string;
  objetivo: string | null;
  descricao: string | null;
  urlVideo: string;
  thumbnailUrl: string | null;
  duracao: number | null;
  dataUpload: string;
  createdAt: string;
}

interface UploadVideoData {
  nome: string;
  objetivo?: string;
  descricao?: string;
  duracao?: number;
  file: File;
  thumbnailFile?: File;
}

interface UpdateVideoData {
  nome?: string;
  objetivo?: string;
  descricao?: string;
  duracao?: number;
}

// Listar vídeos (com filtro opcional por objetivo)
export function useTreinosVideo(objetivo?: string) {
  return useQuery<TreinoVideo[]>({
    queryKey: ['treinos-video', objetivo],
    queryFn: async () => {
      const url = objetivo 
        ? `/api/treinos-video?objetivo=${encodeURIComponent(objetivo)}`
        : '/api/treinos-video';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar vídeos');
      }
      return response.json();
    }
  });
}

// Obter vídeo específico
export function useTreinoVideo(id: string) {
  return useQuery<TreinoVideo>({
    queryKey: ['treino-video', id],
    queryFn: async () => {
      const response = await fetch(`/api/treinos-video/${id}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar vídeo');
      }
      return response.json();
    },
    enabled: !!id
  });
}

// Obter URL de streaming
export function useStreamTreinoVideo(id: string) {
  return useQuery<{ id: string; nome: string; streamUrl: string; duracao: number; expiresIn: number }>({
    queryKey: ['treino-video-stream', id],
    queryFn: async () => {
      const response = await fetch(`/api/treinos-video/${id}/stream`);
      if (!response.ok) {
        throw new Error('Falha ao gerar URL de streaming');
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 // 1 hora
  });
}

// Upload de vídeo
export function useUploadTreinoVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UploadVideoData) => {
      console.group('🌐 REQUISIÇÃO HTTP - UPLOAD DE VÍDEO');
      
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.thumbnailFile) formData.append('thumbnail', data.thumbnailFile);
      formData.append('nome', data.nome);
      if (data.objetivo) formData.append('objetivo', data.objetivo);
      if (data.descricao) formData.append('descricao', data.descricao);
      if (data.duracao) formData.append('duracao', data.duracao.toString());

      console.log('📦 FormData preparado:', {
        arquivo: data.file.name,
        tamanho: `${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
        nome: data.nome,
        objetivo: data.objetivo,
        duracao: data.duracao
      });
      
      console.log('🚀 Enviando requisição POST para /api/admin/treinos-video/upload...');
      const requestStart = Date.now();
      
      const response = await fetch('/api/admin/treinos-video/upload', {
        method: 'POST',
        body: formData
      });

      const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
      console.log(`📡 Resposta recebida em ${requestTime}s:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ ERRO NA RESPOSTA:', error);
        console.groupEnd();
        throw new Error(error.error || error.details || 'Falha ao fazer upload do vídeo');
      }

      const result = await response.json();
      console.log('✅ SUCESSO! Vídeo salvo:', result);
      console.groupEnd();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos-video'] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo enviado com sucesso'
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

// Atualizar vídeo (sem substituir arquivo)
export function useUpdateTreinoVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateVideoData }) => {
      console.group('🌐 REQUISIÇÃO HTTP - ATUALIZAR VÍDEO');
      console.log('🆔 ID do vídeo:', id);
      console.log('📝 Dados a atualizar:', data);
      
      console.log('🚀 Enviando requisição PUT...');
      const requestStart = Date.now();
      
      const response = await fetch(`/api/admin/treinos-video/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
      console.log(`📡 Resposta recebida em ${requestTime}s:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ ERRO NA RESPOSTA:', error);
        console.groupEnd();
        throw new Error(error.error || 'Falha ao atualizar vídeo');
      }

      const result = await response.json();
      console.log('✅ SUCESSO! Vídeo atualizado:', result);
      console.groupEnd();
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treinos-video'] });
      queryClient.invalidateQueries({ queryKey: ['treino-video', variables.id] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo atualizado com sucesso'
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

// Substituir arquivo de vídeo
export function useReplaceVideoFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UploadVideoData }) => {
      console.group('🌐 REQUISIÇÃO HTTP - SUBSTITUIR VÍDEO');
      console.log('🆔 ID do vídeo:', id);
      
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.thumbnailFile) formData.append('thumbnail', data.thumbnailFile);
      formData.append('nome', data.nome);
      if (data.objetivo) formData.append('objetivo', data.objetivo);
      if (data.descricao) formData.append('descricao', data.descricao);
      if (data.duracao) formData.append('duracao', data.duracao.toString());

      console.log('📦 FormData preparado:', {
        arquivo: data.file.name,
        tamanho: `${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
        nome: data.nome,
        temThumbnail: !!data.thumbnailFile
      });
      
      console.log('🚀 Enviando requisição POST para substituir...');
      const requestStart = Date.now();
      
      const response = await fetch(`/api/admin/treinos-video/${id}/replace`, {
        method: 'POST',
        body: formData
      });

      const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
      console.log(`📡 Resposta recebida em ${requestTime}s:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        console.error('❌ ERRO NA RESPOSTA:', error);
        console.groupEnd();
        throw new Error(error.error || error.details || 'Falha ao substituir vídeo');
      }

      const result = await response.json();
      console.log('✅ SUCESSO! Vídeo substituído:', result);
      console.groupEnd();
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treinos-video'] });
      queryClient.invalidateQueries({ queryKey: ['treino-video', variables.id] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo substituído com sucesso'
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

// Deletar vídeo
export function useDeleteTreinoVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.group('🌐 REQUISIÇÃO HTTP - DELETAR VÍDEO');
      console.log('🆔 ID do vídeo:', id);
      
      console.log('🚀 Enviando requisição DELETE...');
      const requestStart = Date.now();
      
      const response = await fetch(`/api/admin/treinos-video/${id}`, {
        method: 'DELETE'
      });

      const requestTime = ((Date.now() - requestStart) / 1000).toFixed(2);
      console.log(`📡 Resposta recebida em ${requestTime}s:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('❌ ERRO NA RESPOSTA:', error);
        console.groupEnd();
        throw new Error(error.error || 'Falha ao deletar vídeo');
      }

      const result = await response.json();
      console.log('✅ SUCESSO! Vídeo deletado:', result);
      console.groupEnd();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos-video'] });
      toast({
        title: 'Sucesso!',
        description: 'Vídeo deletado com sucesso'
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
