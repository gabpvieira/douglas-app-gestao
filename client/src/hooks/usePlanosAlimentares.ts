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
          id,
          aluno_id,
          titulo,
          conteudo_html,
          observacoes,
          dados_json,
          data_criacao,
          created_at,
          updated_at,
          refeicoes:refeicoes_plano(*)
        `)
        .order('created_at', { ascending: false });
      
      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Converter snake_case para camelCase
      return (data || []).map(plano => ({
        id: plano.id,
        alunoId: plano.aluno_id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dadosJson: plano.dados_json,
        dataCriacao: plano.data_criacao,
        createdAt: plano.created_at,
        updatedAt: plano.updated_at,
        refeicoes: plano.refeicoes || []
      }));
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
          id,
          aluno_id,
          titulo,
          conteudo_html,
          observacoes,
          dados_json,
          data_criacao,
          created_at,
          updated_at,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) return null;
      
      // Converter snake_case para camelCase
      return {
        id: data.id,
        alunoId: data.aluno_id,
        titulo: data.titulo,
        conteudoHtml: data.conteudo_html,
        observacoes: data.observacoes,
        dadosJson: data.dados_json,
        dataCriacao: data.data_criacao,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        refeicoes: data.refeicoes || []
      };
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
          id,
          aluno_id,
          titulo,
          conteudo_html,
          observacoes,
          dados_json,
          data_criacao,
          created_at,
          updated_at,
          refeicoes:refeicoes_plano(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Converter snake_case para camelCase
      return {
        id: data.id,
        alunoId: data.aluno_id,
        titulo: data.titulo,
        conteudoHtml: data.conteudo_html,
        observacoes: data.observacoes,
        dadosJson: data.dados_json,
        dataCriacao: data.data_criacao,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        refeicoes: data.refeicoes || []
      };
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
      
      // Converter camelCase para snake_case
      const planoDataSnakeCase = {
        aluno_id: planoData.alunoId,
        titulo: planoData.titulo,
        conteudo_html: planoData.conteudoHtml,
        observacoes: planoData.observacoes,
        dados_json: planoData.dadosJson
      };
      
      // Criar plano
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .insert(planoDataSnakeCase)
        .select()
        .single();
      
      if (planoError) throw planoError;
      
      // Criar refeições se fornecidas
      if (refeicoes && refeicoes.length > 0) {
        const refeicoesComPlanoId = refeicoes.map((r) => ({
          ...r,
          plano_id: plano.id
        }));
        
        const { error: refeicoesError } = await supabase
          .from('refeicoes_plano')
          .insert(refeicoesComPlanoId);
        
        if (refeicoesError) throw refeicoesError;
      }
      
      return plano;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
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
      console.log('🔄 [Update] Dados recebidos:', data);
      
      const { refeicoes, ...planoData } = data;
      
      // Converter camelCase para snake_case - GARANTIR conversão correta
      const planoDataSnakeCase: Record<string, any> = {};
      if (planoData.titulo !== undefined) planoDataSnakeCase.titulo = planoData.titulo;
      if (planoData.conteudoHtml !== undefined) planoDataSnakeCase.conteudo_html = planoData.conteudoHtml;
      if (planoData.observacoes !== undefined) planoDataSnakeCase.observacoes = planoData.observacoes;
      if (planoData.dadosJson !== undefined) planoDataSnakeCase.dados_json = planoData.dadosJson;
      
      console.log('📤 [Update] Dados convertidos para snake_case:', planoDataSnakeCase);
      console.log('📤 [Update] Tipo dos dados:', typeof planoDataSnakeCase, Object.keys(planoDataSnakeCase));
      
      // Garantir que estamos enviando apenas snake_case
      const updatePayload = {
        ...(planoDataSnakeCase.titulo && { titulo: planoDataSnakeCase.titulo }),
        ...(planoDataSnakeCase.conteudo_html && { conteudo_html: planoDataSnakeCase.conteudo_html }),
        ...(planoDataSnakeCase.observacoes !== undefined && { observacoes: planoDataSnakeCase.observacoes }),
        ...(planoDataSnakeCase.dados_json && { dados_json: planoDataSnakeCase.dados_json }),
        updated_at: new Date().toISOString()
      };
      
      console.log('📦 [Update] Payload final:', updatePayload);
      
      // Atualizar plano
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();
      
      console.log('✅ [Update] Resposta do Supabase:', { plano, error: planoError });
      
      if (planoError) {
        console.error('❌ [Update] Erro detalhado:', planoError);
        throw planoError;
      }
      
      // Atualizar refeições se fornecidas
      if (refeicoes) {
        // Remover refeições antigas
        await supabase
          .from('refeicoes_plano')
          .delete()
          .eq('plano_id', id);
        
        // Inserir novas refeições
        if (refeicoes.length > 0) {
          const refeicoesComPlanoId = refeicoes.map((r) => ({
            ...r,
            plano_id: id
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
        .eq('plano_id', id);
      
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
