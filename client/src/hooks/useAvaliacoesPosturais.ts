import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AvaliacaoPostural {
  id: string;
  avaliacaoId: string;
  cabeca?: string;
  ombros?: string;
  clavicula?: string;
  quadril?: string;
  curvaturaLombar?: string;
  curvaturaDorsal?: string;
  curvaturaCervical?: string;
  joelhos?: string;
  pes?: string;
  observacoes?: string;
  fotoFrenteUrl?: string;
  fotoCostasUrl?: string;
  fotoLateralDirUrl?: string;
  fotoLateralEsqUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvaliacaoPosturalComData extends AvaliacaoPostural {
  dataAvaliacao: string;
  alunoId: string;
}

// Buscar avaliações posturais de um aluno (admin)
export function useAvaliacoesPosturaisAluno(alunoId: string | undefined) {
  return useQuery({
    queryKey: ['avaliacoes-posturais-aluno', alunoId],
    queryFn: async () => {
      if (!alunoId) throw new Error('ID do aluno não fornecido');

      const { data, error } = await supabase
        .from('avaliacoes_posturais')
        .select(`
          *,
          avaliacoes_fisicas!inner(
            id,
            data_avaliacao,
            aluno_id
          )
        `)
        .eq('avaliacoes_fisicas.aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((ap: any) => ({
        id: ap.id,
        avaliacaoId: ap.avaliacao_id,
        cabeca: ap.cabeca,
        ombros: ap.ombros,
        clavicula: ap.clavicula,
        quadril: ap.quadril,
        curvaturaLombar: ap.curvatura_lombar,
        curvaturaDorsal: ap.curvatura_dorsal,
        curvaturaCervical: ap.curvatura_cervical,
        joelhos: ap.joelhos,
        pes: ap.pes,
        observacoes: ap.observacoes,
        fotoFrenteUrl: ap.foto_frente_url,
        fotoCostasUrl: ap.foto_costas_url,
        fotoLateralDirUrl: ap.foto_lateral_dir_url,
        fotoLateralEsqUrl: ap.foto_lateral_esq_url,
        createdAt: ap.created_at,
        updatedAt: ap.updated_at,
        dataAvaliacao: ap.avaliacoes_fisicas.data_avaliacao,
        alunoId: ap.avaliacoes_fisicas.aluno_id,
      })) as AvaliacaoPosturalComData[];
    },
    enabled: !!alunoId,
  });
}

// Criar avaliação postural
export function useCriarAvaliacaoPostural() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      avaliacaoId: string;
      observacoes?: string;
      fotoFrenteUrl?: string;
      fotoCostasUrl?: string;
      fotoLateralDirUrl?: string;
      fotoLateralEsqUrl?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .insert({
          avaliacao_id: data.avaliacaoId,
          observacoes: data.observacoes,
          foto_frente_url: data.fotoFrenteUrl,
          foto_costas_url: data.fotoCostasUrl,
          foto_lateral_dir_url: data.fotoLateralDirUrl,
          foto_lateral_esq_url: data.fotoLateralEsqUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-posturais-aluno'] });
    },
  });
}

// Atualizar avaliação postural
export function useAtualizarAvaliacaoPostural() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: string;
      observacoes?: string;
      fotoFrenteUrl?: string;
      fotoCostasUrl?: string;
      fotoLateralDirUrl?: string;
      fotoLateralEsqUrl?: string;
    }) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .update({
          observacoes: data.observacoes,
          foto_frente_url: data.fotoFrenteUrl,
          foto_costas_url: data.fotoCostasUrl,
          foto_lateral_dir_url: data.fotoLateralDirUrl,
          foto_lateral_esq_url: data.fotoLateralEsqUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-posturais-aluno'] });
    },
  });
}

// Deletar avaliação postural
export function useDeletarAvaliacaoPostural() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('avaliacoes_posturais')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-posturais-aluno'] });
    },
  });
}

// Upload de foto postural
export async function uploadFotoPostural(file: File, alunoId: string, tipo: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${alunoId}/${tipo}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('fotos-progresso')
    .upload(fileName, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('fotos-progresso')
    .getPublicUrl(fileName);

  return publicUrl;
}
