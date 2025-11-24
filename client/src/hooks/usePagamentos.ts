/**
 * Hook para gerenciar pagamentos e assinaturas via Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Assinatura {
  id: string;
  aluno_id: string;
  plano_tipo: 'mensal' | 'trimestral' | 'familia';
  preco: number;
  data_inicio: string;
  data_fim: string;
  status: 'ativa' | 'cancelada' | 'vencida';
  mercado_pago_subscription_id: string | null;
  created_at: string;
  updated_at: string;
  // Dados do aluno (join)
  aluno?: {
    id: string;
    user_profile_id: string;
    status: string;
    user_profile: {
      nome: string;
      email: string;
    };
  };
}

export interface Pagamento {
  id: string;
  assinatura_id: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'estornado';
  valor: number;
  metodo: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  mercado_pago_payment_id: string | null;
  data_pagamento: string | null;
  created_at: string;
  // Dados da assinatura (join)
  assinatura?: Assinatura;
}

export interface AssinaturaComPagamentos extends Assinatura {
  pagamentos: Pagamento[];
  ultimo_pagamento?: Pagamento;
}

/**
 * Busca todas as assinaturas com dados dos alunos
 */
export function useAssinaturas() {
  return useQuery({
    queryKey: ['assinaturas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinaturas')
        .select(`
          *,
          aluno:alunos!inner(
            id,
            user_profile_id,
            status,
            user_profile:users_profile!inner(
              nome,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AssinaturaComPagamentos[];
    },
  });
}

/**
 * Busca todos os pagamentos com dados das assinaturas
 */
export function usePagamentos() {
  return useQuery({
    queryKey: ['pagamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          assinatura:assinaturas!inner(
            *,
            aluno:alunos!inner(
              id,
              user_profile_id,
              user_profile:users_profile!inner(
                nome,
                email
              )
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Pagamento[];
    },
  });
}

/**
 * Busca assinaturas com seus pagamentos
 */
export function useAssinaturasComPagamentos() {
  return useQuery({
    queryKey: ['assinaturas-com-pagamentos'],
    queryFn: async () => {
      // Buscar assinaturas
      const { data: assinaturas, error: assinaturasError } = await supabase
        .from('assinaturas')
        .select(`
          *,
          aluno:alunos!inner(
            id,
            user_profile_id,
            status,
            user_profile:users_profile!inner(
              nome,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (assinaturasError) throw assinaturasError;

      // Buscar pagamentos para cada assinatura
      const assinaturasComPagamentos = await Promise.all(
        (assinaturas || []).map(async (assinatura) => {
          const { data: pagamentos, error: pagamentosError } = await supabase
            .from('pagamentos')
            .select('*')
            .eq('assinatura_id', assinatura.id)
            .order('created_at', { ascending: false });

          if (pagamentosError) throw pagamentosError;

          return {
            ...assinatura,
            pagamentos: pagamentos || [],
            ultimo_pagamento: pagamentos?.[0] || null,
          };
        })
      );

      return assinaturasComPagamentos as AssinaturaComPagamentos[];
    },
  });
}

/**
 * Cria uma nova assinatura
 */
export function useCreateAssinatura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      aluno_id: string;
      plano_tipo: 'mensal' | 'trimestral' | 'familia';
      preco: number;
      data_inicio: string;
      data_fim: string;
    }) => {
      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return assinatura;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}

/**
 * Atualiza uma assinatura
 */
export function useUpdateAssinatura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Assinatura>;
    }) => {
      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return assinatura;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}

/**
 * Cancela uma assinatura
 */
export function useCancelAssinatura() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('assinaturas')
        .update({ status: 'cancelada' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}

/**
 * Cria um novo pagamento
 */
export function useCreatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      assinatura_id: string;
      status: 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'estornado';
      valor: number;
      metodo: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
      data_pagamento?: string;
    }) => {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return pagamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}

/**
 * Atualiza um pagamento
 */
export function useUpdatePagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Pagamento>;
    }) => {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return pagamento;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}

/**
 * Marca um pagamento como aprovado
 */
export function useAprovarPagamento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .update({
          status: 'aprovado',
          data_pagamento: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['assinaturas-com-pagamentos'] });
    },
  });
}
