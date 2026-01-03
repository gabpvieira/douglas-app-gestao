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
  alunoId?: string;
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
      console.log('🔍 [usePlanosAlimentares] Iniciando busca...', { alunoId });
      
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
          refeicoes:refeicoes_plano(
            id,
            nome,
            horario,
            ordem,
            calorias_calculadas,
            observacoes,
            alimentos:alimentos_refeicao(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (alunoId) {
        query = query.eq('aluno_id', alunoId);
      }
      
      const { data, error } = await query;
      
      console.log('📊 [usePlanosAlimentares] Resultado da query:', {
        sucesso: !error,
        erro: error,
        quantidadePlanos: data?.length,
        primeiroPlano: data?.[0]
      });
      
      if (error) {
        console.error('❌ [usePlanosAlimentares] Erro:', error);
        throw error;
      }
      
      // Converter snake_case para camelCase
      const converted = (data || []).map(plano => ({
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
      
      console.log('✅ [usePlanosAlimentares] Dados convertidos:', converted);
      
      return converted;
    }
  });
}

// Obter plano atual do aluno
export function useMyPlanoAlimentar(alunoId: string) {
  return useQuery<PlanoAlimentar | null>({
    queryKey: ['meu-plano-alimentar', alunoId],
    queryFn: async () => {
      console.log('🔍 [useMyPlanoAlimentar] Buscando plano do aluno:', alunoId);
      
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
          refeicoes:refeicoes_plano(
            id,
            nome,
            horario,
            ordem,
            calorias_calculadas,
            observacoes,
            alimentos:alimentos_refeicao(*)
          )
        `)
        .eq('aluno_id', alunoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      console.log('📊 [useMyPlanoAlimentar] Resultado:', { data, error });
      
      if (error) {
        console.error('❌ [useMyPlanoAlimentar] Erro:', error);
        throw error;
      }
      
      if (!data) {
        console.log('⚠️ [useMyPlanoAlimentar] Nenhum plano encontrado');
        return null;
      }
      
      // Converter snake_case para camelCase
      const converted = {
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
      
      console.log('✅ [useMyPlanoAlimentar] Plano convertido:', converted);
      
      return converted;
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
          refeicoes:refeicoes_plano(
            id,
            nome,
            horario,
            ordem,
            calorias_calculadas,
            observacoes,
            alimentos:alimentos_refeicao(*)
          )
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
        console.log('🍽️ [Create] Criando refeições:', refeicoes.length);
        
        for (const refeicao of refeicoes) {
          const { alimentos, calorias, ...refeicaoData } = refeicao;
          
          // Inserir refeição (sem alimentos)
          const { data: refeicaoInserida, error: refeicaoError } = await supabase
            .from('refeicoes_plano')
            .insert({
              plano_id: plano.id,
              nome: refeicaoData.nome,
              horario: refeicaoData.horario,
              ordem: refeicaoData.ordem || 0,
              calorias_calculadas: Math.round(calorias || 0),
              observacoes: refeicaoData.observacoes
            })
            .select()
            .single();
          
          if (refeicaoError) {
            console.error('❌ [Create] Erro ao inserir refeição:', refeicaoError);
            throw refeicaoError;
          }
          
          // Inserir alimentos da refeição
          if (alimentos && alimentos.length > 0) {
            const alimentosParaInserir = alimentos.map((alimento: any, index: number) => ({
              refeicao_id: refeicaoInserida.id,
              nome: alimento.nome,
              quantidade: alimento.quantidade,
              unidade: alimento.unidade,
              calorias: alimento.calorias,
              proteinas: alimento.proteinas,
              carboidratos: alimento.carboidratos,
              gorduras: alimento.gorduras,
              categoria: alimento.categoria || 'outros',
              ordem: index
            }));
            
            const { error: alimentosError } = await supabase
              .from('alimentos_refeicao')
              .insert(alimentosParaInserir);
            
            if (alimentosError) {
              console.error('❌ [Create] Erro ao inserir alimentos:', alimentosError);
              throw alimentosError;
            }
          }
        }
        
        console.log('✅ [Create] Refeições criadas com sucesso');
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
      console.log('🔄 [Update] Dados recebidos:', {
        id,
        alunoId: data.alunoId,
        titulo: data.titulo,
        hasRefeicoes: !!data.refeicoes
      });
      
      const { refeicoes, ...planoData } = data;
      
      // Converter camelCase para snake_case - GARANTIR conversão correta
      const planoDataSnakeCase: Record<string, any> = {};
      if (planoData.alunoId !== undefined) planoDataSnakeCase.aluno_id = planoData.alunoId;
      if (planoData.titulo !== undefined) planoDataSnakeCase.titulo = planoData.titulo;
      if (planoData.conteudoHtml !== undefined) planoDataSnakeCase.conteudo_html = planoData.conteudoHtml;
      if (planoData.observacoes !== undefined) planoDataSnakeCase.observacoes = planoData.observacoes;
      if (planoData.dadosJson !== undefined) planoDataSnakeCase.dados_json = planoData.dadosJson;
      
      console.log('📤 [Update] Dados convertidos para snake_case:', planoDataSnakeCase);
      
      // Construir payload de atualização - SEMPRE incluir aluno_id se fornecido
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      // Adicionar campos apenas se definidos (usar !== undefined para permitir strings vazias)
      if (planoDataSnakeCase.aluno_id !== undefined) updatePayload.aluno_id = planoDataSnakeCase.aluno_id;
      if (planoDataSnakeCase.titulo !== undefined) updatePayload.titulo = planoDataSnakeCase.titulo;
      if (planoDataSnakeCase.conteudo_html !== undefined) updatePayload.conteudo_html = planoDataSnakeCase.conteudo_html;
      if (planoDataSnakeCase.observacoes !== undefined) updatePayload.observacoes = planoDataSnakeCase.observacoes;
      if (planoDataSnakeCase.dados_json !== undefined) updatePayload.dados_json = planoDataSnakeCase.dados_json;
      
      console.log('📦 [Update] Payload final:', updatePayload);
      console.log('🎯 [Update] aluno_id no payload:', updatePayload.aluno_id);
      
      // Atualizar plano
      const { data: plano, error: planoError, count } = await supabase
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
      
      // Verificar se o plano foi realmente atualizado
      if (!plano) {
        throw new Error('Nenhum plano foi atualizado. Verifique se o ID está correto.');
      }
      
      // Atualizar refeições se fornecidas
      if (refeicoes) {
        console.log('🍽️ [Update] Atualizando refeições:', refeicoes.length);
        
        // Remover refeições antigas (cascade vai deletar alimentos também)
        await supabase
          .from('refeicoes_plano')
          .delete()
          .eq('plano_id', id);
        
        // Inserir novas refeições
        if (refeicoes.length > 0) {
          for (const refeicao of refeicoes) {
            const { alimentos, calorias, ...refeicaoData } = refeicao;
            
            // Inserir refeição (sem alimentos)
            const { data: refeicaoInserida, error: refeicaoError } = await supabase
              .from('refeicoes_plano')
              .insert({
                plano_id: id,
                nome: refeicaoData.nome,
                horario: refeicaoData.horario,
                ordem: refeicaoData.ordem || 0,
                calorias_calculadas: Math.round(calorias || 0),
                observacoes: refeicaoData.observacoes
              })
              .select()
              .single();
            
            if (refeicaoError) {
              console.error('❌ [Update] Erro ao inserir refeição:', refeicaoError);
              throw refeicaoError;
            }
            
            // Inserir alimentos da refeição
            if (alimentos && alimentos.length > 0) {
              const alimentosParaInserir = alimentos.map((alimento: any, index: number) => ({
                refeicao_id: refeicaoInserida.id,
                nome: alimento.nome,
                quantidade: alimento.quantidade,
                unidade: alimento.unidade,
                calorias: alimento.calorias,
                proteinas: alimento.proteinas,
                carboidratos: alimento.carboidratos,
                gorduras: alimento.gorduras,
                categoria: alimento.categoria || 'outros',
                ordem: index
              }));
              
              const { error: alimentosError } = await supabase
                .from('alimentos_refeicao')
                .insert(alimentosParaInserir);
              
              if (alimentosError) {
                console.error('❌ [Update] Erro ao inserir alimentos:', alimentosError);
                throw alimentosError;
              }
            }
          }
          
          console.log('✅ [Update] Refeições atualizadas com sucesso');
        }
      }
      
      return plano;
    },
    onSuccess: (data) => {
      // Invalidar todas as queries relacionadas a planos alimentares
      // Isso força um refetch dos dados do banco
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
      queryClient.invalidateQueries({ queryKey: ['plano-alimentar', data.id] });
      
      // Invalidar também por aluno_id se disponível
      if (data.aluno_id) {
        queryClient.invalidateQueries({ queryKey: ['planos-alimentares', data.aluno_id] });
        queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar', data.aluno_id] });
      }
      
      console.log('✅ [Update] Cache invalidado, dados serão recarregados');
    },
    onError: (error: Error) => {
      console.error('❌ [Update] Erro na mutation:', error);
      // Toast de erro será mostrado pela página que chama a mutation
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
