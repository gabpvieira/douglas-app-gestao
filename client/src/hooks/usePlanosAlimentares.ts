import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface PlanoAlimentar {
  id: string;
  alunoId: string;
  titulo: string;
  conteudoHtml: string;
  observacoes: string | null;
  dadosJson?: any;
  dataCriacao: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePlanoData {
  alunoId: string;
  titulo: string;
  conteudoHtml: string;
  observacoes?: string;
  dadosJson?: any;
  refeicoes?: any[];
}

interface UpdatePlanoData {
  titulo?: string;
  conteudoHtml?: string;
  observacoes?: string;
  dadosJson?: any;
  refeicoes?: any[];
}

// Listar planos de um aluno (Admin)
export function usePlanosAlimentares(alunoId?: string) {
  return useQuery<PlanoAlimentar[]>({
    queryKey: ['planos-alimentares', alunoId],
    queryFn: async () => {
      let query = supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .order('created_at', { ascending: false });
      
      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
}

// Obter plano atual do aluno
export function useMyPlanoAlimentar(alunoId: string) {
  return useQuery<PlanoAlimentar | null>({
    queryKey: ['meu-plano-alimentar', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!alunoId
  });
}

// Obter plano específico
export function usePlanoAlimentar(id: string) {
  return useQuery<PlanoAlimentar>({
    queryKey: ['plano-alimentar', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          *,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

// Criar plano alimentar
export function useCreatePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreatePlanoData) => {
      const { refeicoes, ...planoData } = data;
      
      // Criar plano
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .insert(planoData)
        .select()
        .single();
      
      if (planoError) throw planoError;
      
      // Criar refeições se fornecidas
      if (refeicoes && refeicoes.length > 0) {
        const refeicoesComPlanoId = refeicoes.map((r) => ({
          ...r,
          plano_alimentar_id: plano.id
        }));
        
        const { error: refeicoesError } = await supabase
          .from('refeicoes_plano')
          .insert(refeicoesComPlanoId);
        
        if (refeicoesError) throw refeicoesError;
      }
      
      return plano;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares', variables.alunoId] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar', variables.alunoId] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar criado com sucesso'
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

// Atualizar plano alimentar
export function useUpdatePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanoData }) => {
      const { refeicoes, ...planoData } = data;
      
      // Atualizar plano
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .update(planoData)
        .eq('id', id)
        .select()
        .single();
      
      if (planoError) throw planoError;
      
      // Atualizar refeições se fornecidas
      if (refeicoes) {
        // Remover refeições antigas
        await supabase
          .from('refeicoes_plano')
          .delete()
          .eq('plano_alimentar_id', id);
        
        // Inserir novas refeições
        if (refeicoes.length > 0) {
          const refeicoesComPlanoId = refeicoes.map((r) => ({
            ...r,
            plano_alimentar_id: id
          }));
          
          const { error: refeicoesError } = await supabase
            .from('refeicoes_plano')
            .insert(refeicoesComPlanoId);
          
          if (refeicoesError) throw refeicoesError;
        }
      }
      
      return plano;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
      queryClient.invalidateQueries({ queryKey: ['plano-alimentar', data.id] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar atualizado com sucesso'
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

// Deletar plano alimentar
export function useDeletePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Remover refeições primeiro
      await supabase
        .from('refeicoes_plano')
        .delete()
        .eq('plano_alimentar_id', id);
      
      // Remover plano
      const { error } = await supabase
        .from('planos_alimentares')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
      toast({
        title: 'Sucesso!',
        description: 'Plano alimentar deletado com sucesso'
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
