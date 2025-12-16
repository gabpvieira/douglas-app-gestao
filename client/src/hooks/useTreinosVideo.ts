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
        url_video: video.url_video
      });
      
      // Usar url_video (snake_case do banco)
      const videoFileName = video.url_video;
      
      if (!videoFileName) {
        console.error('❌ [Stream] Nome do arquivo de vídeo não encontrado');
        throw new Error('Arquivo de vídeo não encontrado');
      }
      
      // Se já for uma URL completa, usar diretamente
      if (videoFileName.startsWith('http')) {
        console.log('✅ [Stream] Usando URL completa:', videoFileName);
        return {
          id: video.id,
          nome: video.nome,
          streamUrl: videoFileName,
          duracao: video.duracao || 0,
          expiresIn: 3600
        };
      }
      
      // Construir URL pública do Supabase Storage
      const { data: { publicUrl } } = supabase.storage
        .from('treinos-video')
        .getPublicUrl(videoFileName);
      
      console.log('✅ [Stream] URL pública gerada:', publicUrl);
      
      return {
        id: video.id,
        nome: video.nome,
        streamUrl: publicUrl,
        duracao: video.duracao || 0,
        expiresIn: 3600
      };
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 // 1 hora
  });
}

// Helper para gerar nome único de arquivo
function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '_');
  return `${timestamp}_${random}_${nameWithoutExt}.${extension}`;
}

// Upload de vídeo (direto para Supabase Storage)
export function useUploadTreinoVideo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: UploadVideoData) => {
      console.group('📹 UPLOAD DIRETO SUPABASE - VÍDEO');
      
      console.log('📦 Dados do upload:', {
        arquivo: data.file.name,
        tamanho: `${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
        nome: data.nome,
        objetivo: data.objetivo,
        duracao: data.duracao
      });
      
      // 1. Gerar nome único para o arquivo
      const fileName = generateUniqueFileName(data.file.name);
      console.log('📝 Nome do arquivo gerado:', fileName);
      
      // 2. Upload do vídeo para Supabase Storage
      console.log('☁️ Fazendo upload do vídeo para Supabase Storage...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('treinos-video')
        .upload(fileName, data.file, {
          contentType: data.file.type,
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Erro no upload do vídeo:', uploadError);
        throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
      }
      
      console.log('✅ Upload do vídeo concluído. Path:', uploadData.path);
      
      // 3. Upload da thumbnail (se fornecida)
      let thumbnailUrl: string | null = null;
      
      if (data.thumbnailFile) {
        console.log('🖼️ Fazendo upload da thumbnail...');
        const thumbnailFileName = generateUniqueFileName(data.thumbnailFile.name);
        const thumbnailPath = `thumbnails/${thumbnailFileName}`;
        
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('treinos-video')
          .upload(thumbnailPath, data.thumbnailFile, {
            contentType: data.thumbnailFile.type,
            upsert: false
          });
        
        if (thumbError) {
          console.warn('⚠️ Erro no upload da thumbnail:', thumbError);
        } else {
          // Obter URL pública da thumbnail
          const { data: { publicUrl } } = supabase.storage
            .from('treinos-video')
            .getPublicUrl(thumbData.path);
          thumbnailUrl = publicUrl;
          console.log('✅ Thumbnail salva:', thumbnailUrl);
        }
      }
      
      // Se não tiver thumbnail, usar URL pública do vídeo como fallback
      if (!thumbnailUrl) {
        const { data: { publicUrl } } = supabase.storage
          .from('treinos-video')
          .getPublicUrl(uploadData.path);
        thumbnailUrl = publicUrl;
      }
      
      // 4. Salvar no banco de dados
      console.log('💾 Salvando no banco de dados...');
      const { data: video, error: dbError } = await supabase
        .from('treinos_video')
        .insert({
          nome: data.nome,
          objetivo: data.objetivo || null,
          descricao: data.descricao || null,
          url_video: uploadData.path,
          thumbnail_url: thumbnailUrl,
          duracao: data.duracao || null
        })
        .select()
        .single();
      
      if (dbError) {
        console.error('❌ Erro ao salvar no banco:', dbError);
        // Se falhar ao salvar no banco, deletar arquivo do storage
        await supabase.storage.from('treinos-video').remove([uploadData.path]);
        throw new Error(`Falha ao salvar: ${dbError.message}`);
      }
      
      console.log('✅ Vídeo salvo com sucesso:', video.id);
      console.groupEnd();
      
      return {
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        urlVideo: video.url_video,
        thumbnailUrl: video.thumbnail_url,
        duracao: video.duracao,
        dataUpload: video.data_upload,
        createdAt: video.created_at
      };
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

// Substituir arquivo de vídeo (direto para Supabase Storage)
export function useReplaceVideoFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UploadVideoData }) => {
      console.group('🔄 SUBSTITUIR VÍDEO - SUPABASE DIRETO');
      console.log('🆔 ID do vídeo:', id);
      
      console.log('📦 Dados do upload:', {
        arquivo: data.file.name,
        tamanho: `${(data.file.size / (1024 * 1024)).toFixed(2)} MB`,
        nome: data.nome,
        temThumbnail: !!data.thumbnailFile
      });
      
      // 1. Buscar vídeo existente
      const { data: videoExistente, error: fetchError } = await supabase
        .from('treinos_video')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError || !videoExistente) {
        console.error('❌ Vídeo não encontrado:', fetchError);
        throw new Error('Vídeo não encontrado');
      }
      
      console.log('📹 Vídeo existente encontrado:', videoExistente.nome);
      
      // 2. Gerar nome único para o novo arquivo
      const fileName = generateUniqueFileName(data.file.name);
      console.log('📝 Nome do novo arquivo:', fileName);
      
      // 3. Upload do novo vídeo
      console.log('☁️ Fazendo upload do novo vídeo...');
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('treinos-video')
        .upload(fileName, data.file, {
          contentType: data.file.type,
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ Erro no upload:', uploadError);
        throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
      }
      
      console.log('✅ Upload concluído. Path:', uploadData.path);
      
      // 4. Upload da thumbnail (se fornecida)
      let thumbnailUrl: string | null = null;
      
      if (data.thumbnailFile) {
        console.log('🖼️ Fazendo upload da thumbnail...');
        const thumbnailFileName = generateUniqueFileName(data.thumbnailFile.name);
        const thumbnailPath = `thumbnails/${thumbnailFileName}`;
        
        const { data: thumbData, error: thumbError } = await supabase.storage
          .from('treinos-video')
          .upload(thumbnailPath, data.thumbnailFile, {
            contentType: data.thumbnailFile.type,
            upsert: false
          });
        
        if (!thumbError && thumbData) {
          const { data: { publicUrl } } = supabase.storage
            .from('treinos-video')
            .getPublicUrl(thumbData.path);
          thumbnailUrl = publicUrl;
          console.log('✅ Thumbnail salva:', thumbnailUrl);
        }
      }
      
      // Se não tiver thumbnail, usar URL pública do vídeo
      if (!thumbnailUrl) {
        const { data: { publicUrl } } = supabase.storage
          .from('treinos-video')
          .getPublicUrl(uploadData.path);
        thumbnailUrl = publicUrl;
      }
      
      // 5. Atualizar registro no banco
      console.log('💾 Atualizando registro no banco...');
      const { data: video, error: updateError } = await supabase
        .from('treinos_video')
        .update({
          nome: data.nome,
          objetivo: data.objetivo || null,
          descricao: data.descricao || null,
          url_video: uploadData.path,
          thumbnail_url: thumbnailUrl,
          duracao: data.duracao || null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Erro ao atualizar banco:', updateError);
        // Se falhar, deletar novo arquivo
        await supabase.storage.from('treinos-video').remove([uploadData.path]);
        throw new Error(`Falha ao atualizar: ${updateError.message}`);
      }
      
      // 6. Deletar vídeo antigo do storage
      console.log('🗑️ Deletando vídeo antigo...');
      if (videoExistente.url_video) {
        await supabase.storage.from('treinos-video').remove([videoExistente.url_video]);
      }
      
      // Deletar thumbnail antiga se existir e for diferente
      if (videoExistente.thumbnail_url && videoExistente.thumbnail_url !== videoExistente.url_video) {
        const oldThumbPath = videoExistente.thumbnail_url.split('/treinos-video/').pop();
        if (oldThumbPath) {
          await supabase.storage.from('treinos-video').remove([oldThumbPath]);
        }
      }
      
      console.log('✅ Vídeo substituído com sucesso!');
      console.groupEnd();
      
      return {
        id: video.id,
        nome: video.nome,
        objetivo: video.objetivo,
        descricao: video.descricao,
        urlVideo: video.url_video,
        thumbnailUrl: video.thumbnail_url,
        duracao: video.duracao,
        dataUpload: video.data_upload,
        updatedAt: video.updated_at
      };
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
        await supabase.storage.from('treinos-video').remove([fileName]);
      }
      
      // Deletar thumbnail do storage
      if (video.thumbnail_url) {
        const thumbName = video.thumbnail_url.split('/').pop();
        await supabase.storage.from('treinos-video').remove([`thumbnails/${thumbName}`]);
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
