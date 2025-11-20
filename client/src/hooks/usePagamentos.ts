import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';

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
      // TODO: Implementar com Supabase
      console.warn('usePagamentos: Retornando array vazio temporariamente');
      return [];
    }
  });
}

// Obter meus pagamentos (Aluno)
export function useMyPagamentos(alunoId: string) {
  return useQuery<Pagamento[]>({
    queryKey: ['meus-pagamentos', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/aluno/pagamentos?alunoId=${alunoId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar pagamentos');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}

// Obter pagamento específico
export function usePagamento(id: string) {
  return useQuery<Pagamento>({
    queryKey: ['pagamento', id],
    queryFn: async () => {
      const response = await fetch(`/api/pagamentos/${id}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar pagamento');
      }
      return response.json();
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
      const response = await fetch('/api/admin/pagamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao criar pagamento');
      }

      return response.json();
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
      const response = await fetch(`/api/admin/pagamentos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Falha ao atualizar pagamento');
      }

      return response.json();
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
