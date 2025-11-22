import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface Assinatura {
  id: string;
  alunoId: string;
  planoTipo: 'mensal' | 'trimestral' | 'familia';
  preco: number;
  dataInicio: string;
  dataFim: string;
  status: 'ativa' | 'cancelada' | 'vencida';
  mercadoPagoSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAssinaturaData {
  alunoId: string;
  planoTipo: 'mensal' | 'trimestral' | 'familia';
  preco: number;
  dataInicio: string;
  dataFim: string;
}

interface UpdateAssinaturaData {
  status?: 'ativa' | 'cancelada' | 'vencida';
  dataFim?: string;
}

// Listar todas as assinaturas (Admin)
export function useAssinaturas() {
  return useQuery<Assinatura[]>({
    queryKey: ['assinaturas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar assinaturas:', error);
        throw new Error('Falha ao buscar assinaturas');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        alunoId: item.aluno_id,
        planoTipo: item.plano_tipo,
        preco: item.preco,
        dataInicio: item.data_inicio,
        dataFim: item.data_fim,
        status: item.status,
        mercadoPagoSubscriptionId: item.mercado_pago_subscription_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    }
  });
}

// Obter assinatura de um aluno
export function useAssinaturaAluno(alunoId: string) {
  return useQuery<Assinatura | null>({
    queryKey: ['assinatura-aluno', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao buscar assinatura:', error);
        throw new Error('Falha ao buscar assinatura');
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        alunoId: data.aluno_id,
        planoTipo: data.plano_tipo,
        preco: data.preco,
        dataInicio: data.data_inicio,
        dataFim: data.data_fim,
        status: data.status,
        mercadoPagoSubscriptionId: data.mercado_pago_subscription_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    enabled: !!alunoId
  });
}

// Obter minha assinatura (Aluno)
export function useMyAssinatura(alunoId: string) {
  return useQuery<Assinatura | null>({
    queryKey: ['minha-assinatura', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Erro ao buscar assinatura:', error);
        throw new Error('Falha ao buscar assinatura');
      }
      
      if (!data) return null;
      
      return {
        id: data.id,
        alunoId: data.aluno_id,
        planoTipo: data.plano_tipo,
        preco: data.preco,
        dataInicio: data.data_inicio,
        dataFim: data.data_fim,
        status: data.status,
        mercadoPagoSubscriptionId: data.mercado_pago_subscription_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    enabled: !!alunoId
  });
}

// Criar assinatura
export function useCreateAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAssinaturaData) => {
      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .insert([{
          aluno_id: data.alunoId,
          plano_tipo: data.planoTipo,
          preco: data.preco,
          data_inicio: data.dataInicio,
          data_fim: data.dataFim,
          status: 'ativa'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        throw new Error(error.message || 'Falha ao criar assinatura');
      }
      
      return assinatura;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura criada com sucesso'
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

// Atualizar assinatura
export function useUpdateAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateAssinaturaData }) => {
      const updateData: any = {};
      if (data.status) updateData.status = data.status;
      if (data.dataFim) updateData.data_fim = data.dataFim;

      const { data: assinatura, error } = await supabase
        .from('assinaturas')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar assinatura:', error);
        throw new Error(error.message || 'Falha ao atualizar assinatura');
      }

      return {
        id: assinatura.id,
        alunoId: assinatura.aluno_id,
        planoTipo: assinatura.plano_tipo,
        preco: assinatura.preco,
        dataInicio: assinatura.data_inicio,
        dataFim: assinatura.data_fim,
        status: assinatura.status,
        mercadoPagoSubscriptionId: assinatura.mercado_pago_subscription_id,
        createdAt: assinatura.created_at,
        updatedAt: assinatura.updated_at
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno', data.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['minha-assinatura', data.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura atualizada com sucesso'
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

// Cancelar assinatura
export function useCancelAssinatura() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('assinaturas')
        .update({ status: 'cancelada' })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao cancelar assinatura:', error);
        throw new Error(error.message || 'Falha ao cancelar assinatura');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assinaturas'] });
      queryClient.invalidateQueries({ queryKey: ['assinatura-aluno'] });
      queryClient.invalidateQueries({ queryKey: ['minha-assinatura'] });
      toast({
        title: 'Sucesso!',
        description: 'Assinatura cancelada com sucesso'
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
