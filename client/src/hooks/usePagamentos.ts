import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface Pagamento {
  id: string;
  assinaturaId: string;
  status: 'pendente' | 'aprovado' | 'recusado' | 'cancelado' | 'estornado';
  valor: number;
  metodo: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  mercadoPagoPaymentId: string | null;
  dataPagamento: string | null;
  createdAt: string;
}

interface CreatePagamentoData {
  assinaturaId: string;
  valor: number;
  metodo: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  status?: 'pendente' | 'aprovado';
}

// Listar todos os pagamentos (Admin)
export function usePagamentos(assinaturaId?: string) {
  return useQuery<Pagamento[]>({
    queryKey: ['pagamentos', assinaturaId],
    queryFn: async () => {
      let query = supabase
        .from('pagamentos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (assinaturaId) {
        query = query.eq('assinatura_id', assinaturaId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw new Error('Falha ao buscar pagamentos');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        assinaturaId: item.assinatura_id,
        status: item.status,
        valor: item.valor,
        metodo: item.metodo,
        mercadoPagoPaymentId: item.mercado_pago_payment_id,
        dataPagamento: item.data_pagamento,
        createdAt: item.created_at
      }));
    }
  });
}

// Obter meus pagamentos (Aluno)
export function useMyPagamentos(alunoId: string) {
  return useQuery<Pagamento[]>({
    queryKey: ['meus-pagamentos', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          assinaturas!inner(aluno_id)
        `)
        .eq('assinaturas.aluno_id', alunoId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Erro ao buscar pagamentos:', error);
        throw new Error('Falha ao buscar pagamentos');
      }
      
      return (data || []).map((item: any) => ({
        id: item.id,
        assinaturaId: item.assinatura_id,
        status: item.status,
        valor: item.valor,
        metodo: item.metodo,
        mercadoPagoPaymentId: item.mercado_pago_payment_id,
        dataPagamento: item.data_pagamento,
        createdAt: item.created_at
      }));
    },
    enabled: !!alunoId
  });
}

// Obter pagamento específico
export function usePagamento(id: string) {
  return useQuery<Pagamento>({
    queryKey: ['pagamento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ Erro ao buscar pagamento:', error);
        throw new Error('Falha ao buscar pagamento');
      }
      
      return {
        id: data.id,
        assinaturaId: data.assinatura_id,
        status: data.status,
        valor: data.valor,
        metodo: data.metodo,
        mercadoPagoPaymentId: data.mercado_pago_payment_id,
        dataPagamento: data.data_pagamento,
        createdAt: data.created_at
      };
    },
    enabled: !!id
  });
}

// Criar pagamento
export function useCreatePagamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePagamentoData) => {
      const { data: pagamento, error } = await supabase
        .from('pagamentos')
        .insert([{
          assinatura_id: data.assinaturaId,
          valor: data.valor,
          metodo: data.metodo,
          status: data.status || 'pendente'
        }])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Erro ao criar pagamento:', error);
        throw new Error(error.message || 'Falha ao criar pagamento');
      }
      
      return pagamento;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['pagamentos', variables.assinaturaId] });
      toast({
        title: 'Sucesso!',
        description: 'Pagamento registrado com sucesso'
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

// Atualizar status do pagamento
export function useUpdatePagamento() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Pagamento['status'] }) => {
      const { data, error } = await supabase
        .from('pagamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar pagamento:', error);
        throw new Error(error.message || 'Falha ao atualizar pagamento');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pagamentos'] });
      queryClient.invalidateQueries({ queryKey: ['meus-pagamentos'] });
      toast({
        title: 'Sucesso!',
        description: 'Pagamento atualizado com sucesso'
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
