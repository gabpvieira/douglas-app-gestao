import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { 
  AvaliacaoNeuromotora, 
  InsertAvaliacaoNeuromotora,
  AvaliacaoPostural,
  InsertAvaliacaoPostural,
  Anamnese,
  InsertAnamnese
} from '@shared/schema';

// =====================================================
// AVALIAÇÃO NEUROMOTORA
// =====================================================

export function useAvaliacaoNeuromotora(avaliacaoId: string) {
  return useQuery({
    queryKey: ['avaliacoes-neuromotor', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AvaliacaoNeuromotora | null;
    },
    enabled: !!avaliacaoId,
  });
}

export function useCreateAvaliacaoNeuromotora() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAvaliacaoNeuromotora) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as AvaliacaoNeuromotora;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-neuromotor', data.avaliacaoId] });
    },
  });
}

export function useUpdateAvaliacaoNeuromotora() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AvaliacaoNeuromotora> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as AvaliacaoNeuromotora;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-neuromotor', data.avaliacaoId] });
    },
  });
}

// =====================================================
// AVALIAÇÃO POSTURAL
// =====================================================

export function useAvaliacaoPostural(avaliacaoId: string) {
  return useQuery({
    queryKey: ['avaliacoes-postural', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_posturais')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as AvaliacaoPostural | null;
    },
    enabled: !!avaliacaoId,
  });
}

export function useCreateAvaliacaoPostural() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAvaliacaoPostural) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as AvaliacaoPostural;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-postural', data.avaliacaoId] });
    },
  });
}

export function useUpdateAvaliacaoPostural() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AvaliacaoPostural> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as AvaliacaoPostural;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-postural', data.avaliacaoId] });
    },
  });
}

// =====================================================
// ANAMNESE
// =====================================================

export function useAnamnese(alunoId: string) {
  return useQuery({
    queryKey: ['anamnese', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('aluno_id', alunoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as Anamnese | null;
    },
    enabled: !!alunoId,
  });
}

export function useCreateAnamnese() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertAnamnese) => {
      const { data: result, error } = await supabase
        .from('anamneses')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result as Anamnese;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['anamnese', data.alunoId] });
    },
  });
}

export function useUpdateAnamnese() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Anamnese> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('anamneses')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result as Anamnese;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['anamnese', data.alunoId] });
    },
  });
}
