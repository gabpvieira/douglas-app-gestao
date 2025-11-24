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
      console.log('🔍 [useTreinosVideo] Buscando vídeos...');
      
      let query = supabase
        .from('treinos_video')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (objetivo) {
        query = query.eq('objetivo', objetivo);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ [useTreinosVideo] Erro:', error);
        throw error;
      }
      
      console.log('📊 [useTreinosVideo] Dados brutos:', data);
      
      // Converter snake_case para camelCase
      const converted = (data || []).map((item: any) => ({
        id: item.id,
        nome: item.nome,
        objetivo: item.objetivo,
        descricao: item.descricao,
        urlVideo: item.url_video,
        thumbnailUrl: item.thumbnail_url,
        duracao: item.duracao,
        dataUpload: item.data_upload,
        createdAt: item.created_at
      }));
      
      console.log('✅ [useTreinosVideo] Dados convertidos:', converted);
      
      return converted;
    }
  });
}

// Obter vídeo específico
export function useTreinoVideo(id: string) {
  return useQuery<TreinoVideo>({
    queryKey: ['treino-video', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Converter snake_case para camelCase
      return {
        id: data.id,
        nome: data.nome,
        objetivo: data.objetivo,
        descricao: data.descricao,
        urlVideo: data.url_video,
        thumbnailUrl: data.thumbnail_url,
        duracao: data.duracao,
        dataUpload: data.data_upload,
        createdAt: data.created_at
      };
    },
    enabled: !!id
  });
}

// Obter URL de streaming
export function useStreamTreinoVideo(id: string) {
  return useQuery<{ id: string; nome: string; streamUrl: string; duracao: number; expiresIn: number }>({
    queryKey: ['treino-video-stream', id],
    queryFn: async () => {
      console.log('🎬 [Stream] Buscando vídeo:', id);
      
      const { data: video, error } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ [Stream] Erro ao buscar vídeo:', error);
        throw error;
      }
      
      console.log('📹 [Stream] Vídeo encontrado:', {
        id: video.id,
        nome: video.nome,
        url_video: video.url_video,
        urlVideo: video.urlVideo
      });
      
      // Usar url_video ou urlVideo (snake_case ou camelCase)
      const videoUrl = video.url_video || video.urlVideo;
      
      if (!videoUrl) {
        console.error('❌ [Stream] URL do vídeo não encontrada');
        throw new Error('URL do vídeo não encontrada');
      }
      
      // Se a URL já é pública do Supabase, usar diretamente
      if (videoUrl.includes('supabase.co/storage/v1/object/public/')) {
        console.log('✅ [Stream] Usando URL pública:', videoUrl);
        return {
          id: video.id,
          nome: video.nome,
          streamUrl: videoUrl,
          duracao: video.duracao || 0,
          expiresIn: 3600
        };
      }
      
      // Tentar extrair o path do arquivo da URL
      let filePath = videoUrl;
      
      // Se for URL completa do Supabase, extrair o path
      if (videoUrl.includes('supabase.co/storage/v1/object/')) {
        const match = videoUrl.match(/\/object\/(?:public|sign)\/videos\/(.+)/);
        if (match) {
          filePath = match[1];
        }
      }
      
      console.log('🔑 [Stream] Gerando signed URL para:', filePath);
      
      // Tentar gerar URL assinada
      const { data: signedData, error: signedError } = await supabase.storage
        .from('videos')
        .createSignedUrl(filePath, 3600);
      
      if (signedError) {
        console.error('⚠️ [Stream] Erro ao gerar signed URL:', signedError);
        console.log('📌 [Stream] Usando URL original como fallback');
        return {
          id: video.id,
          nome: video.nome,
          streamUrl: videoUrl,
          duracao: video.duracao || 0,
          expiresIn: 3600
        };
      }
      
      console.log('✅ [Stream] Signed URL gerada com sucesso');
      return {
        id: video.id,
        nome: video.nome,
        streamUrl: signedData.signedUrl,
        duracao: video.duracao || 0,
        expiresIn: 3600
      };
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
      const { data: video, error } = await supabase
        .from('treinos_video')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return video;
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
      // Buscar vídeo para pegar URLs dos arquivos
      const { data: video, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Deletar arquivo de vídeo do storage
      if (video.url_video) {
        const fileName = video.url_video.split('/').pop();
        await supabase.storage.from('videos').remove([fileName]);
      }
      
      // Deletar thumbnail do storage
      if (video.thumbnail_url) {
        const thumbName = video.thumbnail_url.split('/').pop();
        await supabase.storage.from('thumbnails').remove([thumbName]);
      }
      
      // Deletar registro do banco
      const { error } = await supabase
        .from('treinos_video')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
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
