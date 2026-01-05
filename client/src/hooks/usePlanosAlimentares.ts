import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface PlanoAlimentar {
  id: string;
  titulo: string;
  conteudoHtml: string;
  observacoes: string | null;
  dadosJson?: any;
  dataCriacao: string;
  createdAt: string;
  updatedAt: string;
  refeicoes?: any[];
  alunosAtribuidos?: string[]; // IDs dos alunos atribuídos
}

interface CreatePlanoData {
  titulo: string;
  conteudoHtml: string;
  observacoes?: string;
  dadosJson?: any;
  refeicoes?: any[];
  alunosIds?: string[]; // Array de IDs de alunos para atribuir
}

interface UpdatePlanoData {
  titulo?: string;
  conteudoHtml?: string;
  observacoes?: string;
  dadosJson?: any;
  refeicoes?: any[];
  alunosIds?: string[]; // Array de IDs de alunos para atribuir
}

// Listar todos os planos (Admin) ou planos de um aluno específico
export function usePlanosAlimentares(alunoId?: string) {
  return useQuery<PlanoAlimentar[]>({
    queryKey: ['planos-alimentares', alunoId],
    queryFn: async () => {
      console.log('🔍 [usePlanosAlimentares] Iniciando busca...', { alunoId });
      
      if (alunoId) {
        // Buscar planos atribuídos a um aluno específico via tabela de relacionamento
        const { data, error } = await supabase
          .from('planos_alunos')
          .select(`
            plano_id,
            planos_alimentares (
              id,
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
            )
          `)
          .eq('aluno_id', alunoId)
          .eq('status', 'ativo');
        
        if (error) {
          console.error('❌ [usePlanosAlimentares] Erro:', error);
          throw error;
        }
        
        // Extrair planos do resultado
        const planos = (data || [])
          .map((item: any) => item.planos_alimentares)
          .filter(Boolean);
        
        return planos.map((plano: any) => ({
          id: plano.id,
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
      
      // Buscar todos os planos com seus alunos atribuídos
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(`
          id,
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
          ),
          planos_alunos(aluno_id)
        `)
        .order('created_at', { ascending: false });
      
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
      
      // Converter snake_case para camelCase e extrair IDs dos alunos
      const converted = (data || []).map(plano => ({
        id: plano.id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dadosJson: plano.dados_json,
        dataCriacao: plano.data_criacao,
        createdAt: plano.created_at,
        updatedAt: plano.updated_at,
        refeicoes: plano.refeicoes || [],
        alunosAtribuidos: (plano.planos_alunos || []).map((pa: any) => pa.aluno_id)
      }));
      
      console.log('✅ [usePlanosAlimentares] Dados convertidos:', converted);
      
      return converted;
    }
  });
}


// Obter plano atual do aluno (mais recente)
export function useMyPlanoAlimentar(alunoId: string) {
  return useQuery<PlanoAlimentar | null>({
    queryKey: ['meu-plano-alimentar', alunoId],
    queryFn: async () => {
      console.log('🔍 [useMyPlanoAlimentar] Buscando plano do aluno:', alunoId);
      
      // Buscar planos atribuídos ao aluno via tabela de relacionamento
      const { data, error } = await supabase
        .from('planos_alunos')
        .select(`
          plano_id,
          data_atribuicao,
          planos_alimentares (
            id,
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
          )
        `)
        .eq('aluno_id', alunoId)
        .eq('status', 'ativo')
        .order('data_atribuicao', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      console.log('📊 [useMyPlanoAlimentar] Resultado:', { data, error });
      
      if (error) {
        console.error('❌ [useMyPlanoAlimentar] Erro:', error);
        throw error;
      }
      
      if (!data || !data.planos_alimentares) {
        console.log('⚠️ [useMyPlanoAlimentar] Nenhum plano encontrado');
        return null;
      }
      
      const plano = data.planos_alimentares as any;
      
      // Converter snake_case para camelCase
      const converted = {
        id: plano.id,
        titulo: plano.titulo,
        conteudoHtml: plano.conteudo_html,
        observacoes: plano.observacoes,
        dadosJson: plano.dados_json,
        dataCriacao: plano.data_criacao,
        createdAt: plano.created_at,
        updatedAt: plano.updated_at,
        refeicoes: plano.refeicoes || []
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
          ),
          planos_alunos(aluno_id)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Converter snake_case para camelCase
      return {
        id: data.id,
        titulo: data.titulo,
        conteudoHtml: data.conteudo_html,
        observacoes: data.observacoes,
        dadosJson: data.dados_json,
        dataCriacao: data.data_criacao,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        refeicoes: data.refeicoes || [],
        alunosAtribuidos: (data.planos_alunos || []).map((pa: any) => pa.aluno_id)
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
      console.log('🚀 [Create] Iniciando criação de plano alimentar:', {
        titulo: data.titulo,
        alunosIds: data.alunosIds,
        refeicoesCount: data.refeicoes?.length || 0
      });
      
      const { refeicoes, alunosIds, ...planoData } = data;
      
      // Validar dados obrigatórios
      if (!planoData.titulo?.trim()) {
        throw new Error('O título do plano é obrigatório');
      }
      if (!planoData.conteudoHtml?.trim()) {
        throw new Error('O conteúdo do plano é obrigatório');
      }
      
      // Converter camelCase para snake_case
      const planoDataSnakeCase = {
        titulo: planoData.titulo.trim(),
        conteudo_html: planoData.conteudoHtml,
        observacoes: planoData.observacoes || null,
        dados_json: planoData.dadosJson || null
      };
      
      console.log('📦 [Create] Payload do plano:', planoDataSnakeCase);
      
      // Criar plano
      const { data: plano, error: planoError } = await supabase
        .from('planos_alimentares')
        .insert(planoDataSnakeCase)
        .select()
        .single();
      
      if (planoError) {
        console.error('❌ [Create] Erro ao criar plano:', planoError);
        throw new Error(`Erro ao criar plano: ${planoError.message}`);
      }
      
      console.log('✅ [Create] Plano criado com sucesso:', plano.id);
      
      // Atribuir alunos ao plano (REGRA: cada aluno só pode ter UM plano ativo)
      if (alunosIds && alunosIds.length > 0) {
        console.log('👥 [Create] Atribuindo plano a alunos (removendo planos anteriores):', alunosIds);
        
        // Para cada aluno, desativar planos anteriores antes de atribuir o novo
        for (const alunoId of alunosIds) {
          // Desativar todos os planos ativos do aluno
          const { error: desativarError } = await supabase
            .from('planos_alunos')
            .update({ status: 'inativo', updated_at: new Date().toISOString() })
            .eq('aluno_id', alunoId)
            .eq('status', 'ativo');
          
          if (desativarError) {
            console.error('❌ [Create] Erro ao desativar planos anteriores:', desativarError);
            // Continua mesmo com erro para não bloquear a atribuição
          }
        }
        
        // Inserir novas atribuições
        const atribuicoes = alunosIds.map(alunoId => ({
          plano_id: plano.id,
          aluno_id: alunoId,
          status: 'ativo',
          data_atribuicao: new Date().toISOString().split('T')[0]
        }));
        
        console.log('📝 [Create] Inserindo atribuições:', atribuicoes);
        
        const { error: atribError } = await supabase
          .from('planos_alunos')
          .insert(atribuicoes);
        
        if (atribError) {
          console.error('❌ [Create] Erro ao atribuir alunos:', atribError);
          // Se a tabela não existe, dar uma mensagem mais clara
          if (atribError.code === '42P01' || atribError.message?.includes('does not exist')) {
            throw new Error('Tabela de atribuições não encontrada. Execute o script SQL de criação.');
          }
          throw new Error(`Erro ao atribuir alunos: ${atribError.message}`);
        }
        
        console.log('✅ [Create] Alunos atribuídos (planos anteriores desativados):', alunosIds.length);
      }
      
      // Criar refeições se fornecidas
      if (refeicoes && refeicoes.length > 0) {
        console.log('🍽️ [Create] Criando refeições:', refeicoes.length);
        
        for (const refeicao of refeicoes) {
          const { alimentos, calorias, ...refeicaoData } = refeicao;
          
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
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
        titulo: data.titulo,
        alunosIds: data.alunosIds,
        hasRefeicoes: !!data.refeicoes
      });
      
      const { refeicoes, alunosIds, ...planoData } = data;
      
      // Construir payload de atualização
      const updatePayload: Record<string, any> = {
        updated_at: new Date().toISOString()
      };
      
      if (planoData.titulo !== undefined) updatePayload.titulo = planoData.titulo;
      if (planoData.conteudoHtml !== undefined) updatePayload.conteudo_html = planoData.conteudoHtml;
      if (planoData.observacoes !== undefined) updatePayload.observacoes = planoData.observacoes;
      if (planoData.dadosJson !== undefined) updatePayload.dados_json = planoData.dadosJson;
      
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
      
      if (!plano) {
        throw new Error('Nenhum plano foi atualizado. Verifique se o ID está correto.');
      }
      
      // Atualizar atribuições de alunos (REGRA: cada aluno só pode ter UM plano ativo)
      if (alunosIds !== undefined) {
        console.log('👥 [Update] Atualizando atribuições de alunos:', alunosIds);
        
        // Buscar alunos que estavam atribuídos a este plano
        const { data: atribuicoesAntigas } = await supabase
          .from('planos_alunos')
          .select('aluno_id')
          .eq('plano_id', id);
        
        const alunosAntigos = (atribuicoesAntigas || []).map(a => a.aluno_id);
        
        // Remover atribuições antigas deste plano
        await supabase
          .from('planos_alunos')
          .delete()
          .eq('plano_id', id);
        
        // Para cada novo aluno, desativar planos anteriores antes de atribuir
        if (alunosIds.length > 0) {
          for (const alunoId of alunosIds) {
            // Desativar todos os outros planos ativos do aluno
            const { error: desativarError } = await supabase
              .from('planos_alunos')
              .update({ status: 'inativo', updated_at: new Date().toISOString() })
              .eq('aluno_id', alunoId)
              .eq('status', 'ativo')
              .neq('plano_id', id);
            
            if (desativarError) {
              console.error('❌ [Update] Erro ao desativar planos anteriores:', desativarError);
            }
          }
          
          // Inserir novas atribuições
          const atribuicoes = alunosIds.map(alunoId => ({
            plano_id: id,
            aluno_id: alunoId,
            status: 'ativo',
            data_atribuicao: new Date().toISOString().split('T')[0]
          }));
          
          const { error: atribError } = await supabase
            .from('planos_alunos')
            .insert(atribuicoes);
          
          if (atribError) {
            console.error('❌ [Update] Erro ao atribuir alunos:', atribError);
            throw atribError;
          }
        }
        
        console.log('✅ [Update] Atribuições atualizadas (planos anteriores desativados)');
      }
      
      // Atualizar refeições se fornecidas
      if (refeicoes) {
        console.log('🍽️ [Update] Atualizando refeições:', refeicoes.length);
        
        // Remover refeições antigas
        await supabase
          .from('refeicoes_plano')
          .delete()
          .eq('plano_id', id);
        
        // Inserir novas refeições
        if (refeicoes.length > 0) {
          for (const refeicao of refeicoes) {
            const { alimentos, calorias, ...refeicaoData } = refeicao;
            
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
      queryClient.invalidateQueries({ queryKey: ['planos-alimentares'] });
      queryClient.invalidateQueries({ queryKey: ['meu-plano-alimentar'] });
      queryClient.invalidateQueries({ queryKey: ['plano-alimentar', data.id] });
      console.log('✅ [Update] Cache invalidado, dados serão recarregados');
    },
    onError: (error: Error) => {
      console.error('❌ [Update] Erro na mutation:', error);
    }
  });
}

// Deletar plano alimentar
export function useDeletePlanoAlimentar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Remover atribuições primeiro
      await supabase
        .from('planos_alunos')
        .delete()
        .eq('plano_id', id);
      
      // Remover refeições
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
