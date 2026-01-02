import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Exercicio {
  id?: string;
  nome: string;
  grupo_muscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  video_id?: string;
}

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao_semanas: number;
  ativo: string;
  exercicios?: Exercicio[];
  created_at: string;
  updated_at: string;
}

// Buscar todas as fichas
export function useFichasTreino() {
  return useQuery({
    queryKey: ['fichas-treino'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fichas_treino')
        .select(`
          *,
          exercicios:exercicios_ficha(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FichaTreino[];
    }
  });
}

// Buscar ficha específica com exercícios
export function useFichaTreino(id: string) {
  return useQuery({
    queryKey: ['fichas-treino', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fichas_treino')
        .select(`
          *,
          exercicios:exercicios_ficha(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as FichaTreino;
    },
    enabled: !!id
  });
}

// Criar ficha
export function useCreateFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<FichaTreino> & { exercicios?: Exercicio[] }) => {
      const { exercicios, ...fichaData } = data;
      
      // Criar ficha
      const { data: novaFicha, error: fichaError } = await supabase
        .from('fichas_treino')
        .insert([fichaData])
        .select()
        .single();
      
      if (fichaError) throw fichaError;
      
      // Criar exercícios se fornecidos
      if (exercicios && exercicios.length > 0) {
        const exerciciosComFichaId = exercicios.map((ex, index) => {
          // Remover IDs temporários antes de inserir no banco
          const { id: exercicioId, ...exercicioData } = ex;
          
          return {
            ...exercicioData,
            ficha_id: novaFicha.id,
            ordem: ex.ordem || index + 1
          };
        });
        
        const { error: exError } = await supabase
          .from('exercicios_ficha')
          .insert(exerciciosComFichaId);
        
        if (exError) throw exError;
      }
      
      return novaFicha;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Atualizar ficha
export function useUpdateFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FichaTreino> & { exercicios?: Exercicio[] } }) => {
      const { exercicios, ...fichaData } = data;
      
      // Atualizar ficha
      const { data: fichaAtualizada, error: fichaError } = await supabase
        .from('fichas_treino')
        .update({ ...fichaData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (fichaError) throw fichaError;
      
      // Se exercícios foram fornecidos, atualizar
      if (exercicios !== undefined) {
        // Remover exercícios antigos (CASCADE vai cuidar dos relacionamentos)
        const { error: deleteError } = await supabase
          .from('exercicios_ficha')
          .delete()
          .eq('ficha_id', id);
        
        if (deleteError) throw deleteError;
        
        // Inserir novos exercícios (apenas se houver algum)
        if (exercicios.length > 0) {
          const exerciciosComFichaId = exercicios.map((ex, index) => {
            // Remover IDs temporários antes de inserir no banco
            const { id: exercicioId, ...exercicioData } = ex;
            const isTemporaryId = typeof exercicioId === 'string' && exercicioId.startsWith('temp-');
            
            return {
              ...exercicioData,
              // Manter ID real do banco, remover IDs temporários
              ...(exercicioId && !isTemporaryId ? { id: exercicioId } : {}),
              ficha_id: id,
              ordem: index + 1
            };
          });
          
          const { error: exerciciosError } = await supabase
            .from('exercicios_ficha')
            .insert(exerciciosComFichaId);
          
          if (exerciciosError) throw exerciciosError;
        }
      }
      
      return fichaAtualizada;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-treino', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Deletar ficha
export function useDeleteFichaTreino() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      // Verificar se há atribuições ativas
      const { data: atribuicoes, error: atribuicoesError } = await supabase
        .from('fichas_alunos')
        .select('id')
        .eq('ficha_id', id);
      
      if (atribuicoesError) throw atribuicoesError;
      
      // Se houver atribuições, remover primeiro
      if (atribuicoes && atribuicoes.length > 0) {
        const { error: deleteAtribuicoesError } = await supabase
          .from('fichas_alunos')
          .delete()
          .eq('ficha_id', id);
        
        if (deleteAtribuicoesError) throw deleteAtribuicoesError;
      }
      
      // Remover exercícios (embora o CASCADE deveria fazer isso automaticamente)
      const { error: deleteExerciciosError } = await supabase
        .from('exercicios_ficha')
        .delete()
        .eq('ficha_id', id);
      
      if (deleteExerciciosError) throw deleteExerciciosError;
      
      // Remover ficha
      const { error } = await supabase
        .from('fichas_treino')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-atribuicoes'] });
    },
    onError: (error) => {
      console.error('Erro ao deletar ficha:', error);
    }
  });
}

// Atribuir ficha a aluno
export function useAtribuirFicha() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fichaId, data }: { fichaId: string; data: any }) => {
      const { data: atribuicao, error } = await supabase
        .from('fichas_alunos')
        .insert({
          ficha_id: fichaId,
          ...data
        })
        .select()
        .single();
      
      if (error) throw error;
      return atribuicao;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas-treino'] });
      queryClient.invalidateQueries({ queryKey: ['fichas-atribuicoes', variables.fichaId] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Buscar atribuições de uma ficha
export function useFichaAtribuicoes(fichaId: string) {
  return useQuery({
    queryKey: ['fichas-atribuicoes', fichaId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fichas_alunos')
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
        .eq('ficha_id', fichaId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      return data.map((item: any) => ({
        ...item,
        aluno: {
          id: item.aluno.id,
          nome: item.aluno.user_profile.nome,
          email: item.aluno.user_profile.email
        }
      }));
    },
    enabled: !!fichaId
  });
}

// Remover atribuição
export function useRemoverAtribuicao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ fichaId, atribuicaoId }: { fichaId: string; atribuicaoId: string }) => {
      const { error } = await supabase
        .from('fichas_alunos')
        .delete()
        .eq('id', atribuicaoId)
        .eq('ficha_id', fichaId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas-atribuicoes', variables.fichaId] });
      queryClient.invalidateQueries({ queryKey: ['fichas-stats'] });
    }
  });
}

// Buscar estatísticas gerais
export function useFichasStats() {
  return useQuery({
    queryKey: ['fichas-stats'],
    queryFn: async () => {
      const { data: fichas } = await supabase
        .from('fichas_treino')
        .select('id, ativo, exercicios:exercicios_ficha(id)');
      
      const { data: atribuicoes } = await supabase
        .from('fichas_alunos')
        .select('aluno_id')
        .eq('status', 'ativo');
      
      const totalFichas = fichas?.length || 0;
      const fichasAtivas = fichas?.filter(f => f.ativo === 'true').length || 0;
      const totalExercicios = fichas?.reduce((acc: number, f: any) => acc + (f.exercicios?.length || 0), 0) || 0;
      const alunosComFichas = new Set(atribuicoes?.map(a => a.aluno_id) || []).size;
      
      return {
        totalFichas,
        fichasAtivas,
        totalExercicios,
        alunosComFichas
      };
    }
  });
}
