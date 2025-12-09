/**
 * Hook para gerenciamento de Avaliações Físicas
 * 
 * Fornece CRUD completo para avaliações físicas e módulos relacionados:
 * - Avaliações principais
 * - Perimetria detalhada
 * - Avaliações neuromotoras
 * - Avaliações posturais
 * - Anamneses
 * - Metas
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  AvaliacaoFisica,
  PerimetriaDetalhada,
  AvaliacaoNeuromotora,
  AvaliacaoPostural,
  Anamnese,
  MetaAvaliacao
} from '@shared/schema';

// ============================================
// TIPOS
// ============================================

export interface AvaliacaoCompleta extends AvaliacaoFisica {
  perimetria?: PerimetriaDetalhada;
  neuromotora?: AvaliacaoNeuromotora;
  postural?: AvaliacaoPostural;
  aluno?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface CreateAvaliacaoData {
  avaliacao: Partial<AvaliacaoFisica>;
  perimetria?: Partial<PerimetriaDetalhada>;
  neuromotora?: Partial<AvaliacaoNeuromotora>;
  postural?: Partial<AvaliacaoPostural>;
}

// ============================================
// QUERY KEYS
// ============================================

const QUERY_KEYS = {
  avaliacoes: ['avaliacoes-fisicas'] as const,
  avaliacoesByAluno: (alunoId: string) => ['avaliacoes-fisicas', 'aluno', alunoId] as const,
  avaliacao: (id: string) => ['avaliacoes-fisicas', id] as const,
  anamnese: (alunoId: string) => ['anamnese', alunoId] as const,
  metas: (alunoId: string) => ['metas-avaliacoes', alunoId] as const,
};

// ============================================
// HOOKS DE LISTAGEM
// ============================================

/**
 * Lista todas as avaliações físicas
 */
export function useAvaliacoes() {
  return useQuery({
    queryKey: QUERY_KEYS.avaliacoes,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .select(`
          *,
          aluno:alunos!inner(
            id,
            user_profile:users_profile!inner(
              nome,
              email
            )
          )
        `)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;

      // Transformar dados para formato mais amigável com camelCase
      return data.map(av => ({
        ...av,
        alunoId: av.aluno.id,
        dataAvaliacao: av.data_avaliacao,
        percentualGordura: av.percentual_gordura,
        massaMagra: av.massa_magra,
        massaGorda: av.massa_gorda,
        classificacaoGordura: av.classificacao_gordura,
        aluno: {
          id: av.aluno.id,
          nome: av.aluno.user_profile.nome,
          email: av.aluno.user_profile.email,
        }
      })) as AvaliacaoCompleta[];
    },
  });
}

/**
 * Lista avaliações de um aluno específico
 */
export function useAvaliacoesByAluno(alunoId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.avaliacoesByAluno(alunoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      return data as AvaliacaoFisica[];
    },
    enabled: !!alunoId,
  });
}

/**
 * Busca uma avaliação específica com todos os dados relacionados
 */
export function useAvaliacaoById(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.avaliacao(id),
    queryFn: async () => {
      // Buscar avaliação principal
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes_fisicas')
        .select(`
          *,
          aluno:alunos!inner(
            id,
            user_profile:users_profile!inner(
              nome,
              email
            )
          )
        `)
        .eq('id', id)
        .single();

      if (avaliacaoError) throw avaliacaoError;

      // Buscar perimetria (maybeSingle para evitar erro 406 quando não existe)
      const { data: perimetria } = await supabase
        .from('perimetria_detalhada')
        .select('*')
        .eq('avaliacao_id', id)
        .maybeSingle();

      // Buscar neuromotora (maybeSingle para evitar erro 406 quando não existe)
      const { data: neuromotora } = await supabase
        .from('avaliacoes_neuromotoras')
        .select('*')
        .eq('avaliacao_id', id)
        .maybeSingle();

      // Buscar postural (maybeSingle para evitar erro 406 quando não existe)
      const { data: postural } = await supabase
        .from('avaliacoes_posturais')
        .select('*')
        .eq('avaliacao_id', id)
        .maybeSingle();

      return {
        ...avaliacao,
        aluno: {
          id: avaliacao.aluno.id,
          nome: avaliacao.aluno.user_profile.nome,
          email: avaliacao.aluno.user_profile.email,
        },
        perimetria: perimetria || undefined,
        neuromotora: neuromotora || undefined,
        postural: postural || undefined,
      } as AvaliacaoCompleta;
    },
    enabled: !!id,
  });
}

// ============================================
// HOOKS DE MUTAÇÃO - AVALIAÇÕES
// ============================================

/**
 * Cria uma nova avaliação física completa
 */
export function useCreateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateAvaliacaoData) => {
      // 1. Criar avaliação principal
      const { data: avaliacao, error: avaliacaoError } = await supabase
        .from('avaliacoes_fisicas')
        .insert(data.avaliacao)
        .select()
        .single();

      if (avaliacaoError) throw avaliacaoError;

      const avaliacaoId = avaliacao.id;

      // 2. Criar perimetria se fornecida
      if (data.perimetria) {
        const { error: perimetriaError } = await supabase
          .from('perimetria_detalhada')
          .insert({ ...data.perimetria, avaliacao_id: avaliacaoId });

        if (perimetriaError) throw perimetriaError;
      }

      // 3. Criar neuromotora se fornecida
      if (data.neuromotora) {
        const { error: neuromotoraError } = await supabase
          .from('avaliacoes_neuromotoras')
          .insert({ ...data.neuromotora, avaliacao_id: avaliacaoId });

        if (neuromotoraError) throw neuromotoraError;
      }

      // 4. Criar postural se fornecida
      if (data.postural) {
        const { error: posturalError } = await supabase
          .from('avaliacoes_posturais')
          .insert({ ...data.postural, avaliacao_id: avaliacaoId });

        if (posturalError) throw posturalError;
      }

      return avaliacao;
    },
    onSuccess: async (_, variables) => {
      // Invalidar todas as queries relacionadas
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes });
      if (variables.avaliacao.aluno_id) {
        await queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.avaliacoesByAluno(variables.avaliacao.aluno_id) 
        });
      }
      // Forçar refetch imediato
      await queryClient.refetchQueries({ queryKey: QUERY_KEYS.avaliacoes });
    },
  });
}

/**
 * Atualiza uma avaliação física existente
 */
export function useUpdateAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AvaliacaoFisica> }) => {
      const { data: updated, error } = await supabase
        .from('avaliacoes_fisicas')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacao(data.id) });
      if (data.aluno_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.avaliacoesByAluno(data.aluno_id) 
        });
      }
    },
  });
}

/**
 * Deleta uma avaliação física
 */
export function useDeleteAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('avaliacoes_fisicas')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes });
    },
  });
}

/**
 * Toggle fixar/desafixar avaliação
 */
export function useTogglePinAvaliacao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, fixada }: { id: string; fixada: boolean }) => {
      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .update({ fixada })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacoes });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.avaliacao(data.id) });
      if (data.aluno_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.avaliacoesByAluno(data.aluno_id) 
        });
      }
    },
  });
}

// ============================================
// HOOKS DE MUTAÇÃO - PERIMETRIA
// ============================================

export function useUpdatePerimetria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      avaliacaoId, 
      data 
    }: { 
      avaliacaoId: string; 
      data: Partial<PerimetriaDetalhada> 
    }) => {
      // Verificar se já existe (maybeSingle para evitar erro 406)
      const { data: existing } = await supabase
        .from('perimetria_detalhada')
        .select('id')
        .eq('avaliacao_id', avaliacaoId)
        .maybeSingle();

      if (existing) {
        // Atualizar
        const { data: updated, error } = await supabase
          .from('perimetria_detalhada')
          .update(data)
          .eq('avaliacao_id', avaliacaoId)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        // Criar
        const { data: created, error } = await supabase
          .from('perimetria_detalhada')
          .insert({ ...data, avaliacao_id: avaliacaoId })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.avaliacao(variables.avaliacaoId) 
      });
    },
  });
}

// ============================================
// HOOKS DE MUTAÇÃO - NEUROMOTORA
// ============================================

export function useUpdateNeuromotora() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      avaliacaoId, 
      data 
    }: { 
      avaliacaoId: string; 
      data: Partial<AvaliacaoNeuromotora> 
    }) => {
      const { data: existing } = await supabase
        .from('avaliacoes_neuromotoras')
        .select('id')
        .eq('avaliacao_id', avaliacaoId)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('avaliacoes_neuromotoras')
          .update(data)
          .eq('avaliacao_id', avaliacaoId)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('avaliacoes_neuromotoras')
          .insert({ ...data, avaliacao_id: avaliacaoId })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.avaliacao(variables.avaliacaoId) 
      });
    },
  });
}

// ============================================
// HOOKS DE MUTAÇÃO - POSTURAL
// ============================================

export function useUpdatePostural() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      avaliacaoId, 
      data 
    }: { 
      avaliacaoId: string; 
      data: Partial<AvaliacaoPostural> 
    }) => {
      const { data: existing } = await supabase
        .from('avaliacoes_posturais')
        .select('id')
        .eq('avaliacao_id', avaliacaoId)
        .maybeSingle();

      if (existing) {
        const { data: updated, error } = await supabase
          .from('avaliacoes_posturais')
          .update(data)
          .eq('avaliacao_id', avaliacaoId)
          .select()
          .single();

        if (error) throw error;
        return updated;
      } else {
        const { data: created, error } = await supabase
          .from('avaliacoes_posturais')
          .insert({ ...data, avaliacao_id: avaliacaoId })
          .select()
          .single();

        if (error) throw error;
        return created;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.avaliacao(variables.avaliacaoId) 
      });
    },
  });
}

// ============================================
// HOOKS - ANAMNESE
// ============================================

export function useAnamnese(alunoId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.anamnese(alunoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('aluno_id', alunoId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return data as Anamnese | null;
    },
    enabled: !!alunoId,
  });
}

export function useUpsertAnamnese() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<Anamnese>) => {
      const { data: upserted, error } = await supabase
        .from('anamneses')
        .upsert(data, { onConflict: 'aluno_id' })
        .select()
        .single();

      if (error) throw error;
      return upserted;
    },
    onSuccess: (data) => {
      if (data.aluno_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.anamnese(data.aluno_id) 
        });
      }
    },
  });
}

// ============================================
// HOOKS - METAS
// ============================================

export function useMetas(alunoId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.metas(alunoId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_avaliacoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MetaAvaliacao[];
    },
    enabled: !!alunoId,
  });
}

export function useCreateMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<MetaAvaliacao>) => {
      const { data: created, error } = await supabase
        .from('metas_avaliacoes')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return created;
    },
    onSuccess: (data) => {
      if (data.aluno_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.metas(data.aluno_id) 
        });
      }
    },
  });
}

export function useUpdateMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MetaAvaliacao> }) => {
      const { data: updated, error } = await supabase
        .from('metas_avaliacoes')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: (data) => {
      if (data.aluno_id) {
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.metas(data.aluno_id) 
        });
      }
    },
  });
}

export function useDeleteMeta() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('metas_avaliacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-avaliacoes'] });
    },
  });
}
