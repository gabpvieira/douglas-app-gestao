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
  biset_grupo_id?: string;
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
      
      // Se exercícios foram fornecidos, atualizar usando estratégia de upsert
      if (exercicios !== undefined) {
        // Buscar exercícios atuais da ficha
        const { data: exerciciosAtuais, error: fetchError } = await supabase
          .from('exercicios_ficha')
          .select('id')
          .eq('ficha_id', id);
        
        if (fetchError) throw fetchError;
        
        const idsAtuais = new Set(exerciciosAtuais?.map(e => e.id) || []);
        
        // Separar exercícios em: novos, existentes para atualizar, e para deletar
        const exerciciosParaInserir: typeof exercicios = [];
        const exerciciosParaAtualizar: typeof exercicios = [];
        const idsParaManter = new Set<string>();
        
        exercicios.forEach((ex, index) => {
          const exercicioId = ex.id;
          const isTemporaryId = typeof exercicioId === 'string' && exercicioId.startsWith('temp-');
          
          if (!exercicioId || isTemporaryId) {
            // Novo exercício
            exerciciosParaInserir.push({ ...ex, ordem: index + 1 });
          } else if (idsAtuais.has(exercicioId)) {
            // Exercício existente - atualizar
            exerciciosParaAtualizar.push({ ...ex, ordem: index + 1 });
            idsParaManter.add(exercicioId);
          } else {
            // ID não existe no banco - tratar como novo
            exerciciosParaInserir.push({ ...ex, ordem: index + 1 });
          }
        });
        
        // IDs para deletar (existem no banco mas não estão mais na lista)
        const idsParaDeletar = Array.from(idsAtuais).filter(id => !idsParaManter.has(id));
        
        // 1. Deletar exercícios removidos (apenas os que não têm treinos realizados)
        if (idsParaDeletar.length > 0) {
          // Verificar quais exercícios têm treinos realizados
          const { data: exerciciosComTreinos } = await supabase
            .from('treinos_realizados')
            .select('exercicio_id')
            .in('exercicio_id', idsParaDeletar);
          
          const idsComTreinos = new Set(exerciciosComTreinos?.map(t => t.exercicio_id) || []);
          const idsSegurosParaDeletar = idsParaDeletar.filter(id => !idsComTreinos.has(id));
          
          if (idsSegurosParaDeletar.length > 0) {
            const { error: deleteError } = await supabase
              .from('exercicios_ficha')
              .delete()
              .in('id', idsSegurosParaDeletar);
            
            if (deleteError) {
              console.error('Erro ao deletar exercícios:', deleteError);
              // Não lançar erro, continuar com as outras operações
            }
          }
          
          // Se há exercícios com treinos que não podem ser deletados, apenas desvinculá-los
          // marcando como inativos ou movendo para outra ficha (opcional - por ora apenas log)
          if (idsComTreinos.size > 0) {
            console.warn('Exercícios com histórico de treinos não foram deletados:', Array.from(idsComTreinos));
          }
        }
        
        // 2. Atualizar exercícios existentes
        for (const ex of exerciciosParaAtualizar) {
          const { id: exercicioId, ...exercicioData } = ex;
          const { error: updateError } = await supabase
            .from('exercicios_ficha')
            .update({
              ...exercicioData,
              ficha_id: id,
              updated_at: new Date().toISOString()
            })
            .eq('id', exercicioId);
          
          if (updateError) {
            console.error('Erro ao atualizar exercício:', updateError);
            throw updateError;
          }
        }
        
        // 3. Inserir novos exercícios
        if (exerciciosParaInserir.length > 0) {
          const novosExercicios = exerciciosParaInserir.map(ex => {
            const { id: _, ...exercicioData } = ex;
            return {
              ...exercicioData,
              ficha_id: id
            };
          });
          
          const { error: insertError } = await supabase
            .from('exercicios_ficha')
            .insert(novosExercicios);
          
          if (insertError) {
            console.error('Erro ao inserir exercícios:', insertError);
            throw insertError;
          }
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

// ============================================
// FUNÇÕES UTILITÁRIAS PARA BI-SET
// ============================================

// Gerar UUID para grupo de Bi-set
export function gerarBisetGrupoId(): string {
  return crypto.randomUUID();
}

// Interface para Bi-set agrupado
export interface BiSetGroup {
  grupoId: string;
  exercicioA: Exercicio;
  exercicioB: Exercicio;
  series: number;
  descanso: number;
}

// Validar se exercícios podem formar um Bi-set
export function validarBiset(exercicioA: Exercicio, exercicioB: Exercicio): { valido: boolean; erro?: string } {
  if (!exercicioA || !exercicioB) {
    return { valido: false, erro: 'Selecione dois exercícios para formar o Bi-set' };
  }
  
  if (exercicioA.id === exercicioB.id) {
    return { valido: false, erro: 'Selecione dois exercícios diferentes' };
  }
  
  if (exercicioA.series !== exercicioB.series) {
    return { valido: false, erro: 'Os exercícios do Bi-set devem ter o mesmo número de séries' };
  }
  
  if (exercicioA.biset_grupo_id || exercicioB.biset_grupo_id) {
    return { valido: false, erro: 'Um dos exercícios já faz parte de outro Bi-set' };
  }
  
  return { valido: true };
}

// Agrupar exercícios por Bi-set para exibição
export function agruparExerciciosPorBiset(exercicios: Exercicio[]): (Exercicio | BiSetGroup)[] {
  const resultado: (Exercicio | BiSetGroup)[] = [];
  const processados = new Set<string>();
  
  // Ordenar por ordem
  const ordenados = [...exercicios].sort((a, b) => a.ordem - b.ordem);
  
  for (const exercicio of ordenados) {
    const exId = exercicio.id || `temp-${exercicio.ordem}`;
    
    if (processados.has(exId)) continue;
    
    if (exercicio.biset_grupo_id) {
      // Encontrar parceiro do Bi-set
      const parceiro = ordenados.find(
        e => e.biset_grupo_id === exercicio.biset_grupo_id && 
             (e.id || `temp-${e.ordem}`) !== exId
      );
      
      if (parceiro) {
        const parceiroId = parceiro.id || `temp-${parceiro.ordem}`;
        
        // Determinar ordem A/B baseado na ordem de execução
        const [exercicioA, exercicioB] = exercicio.ordem < parceiro.ordem 
          ? [exercicio, parceiro] 
          : [parceiro, exercicio];
        
        resultado.push({
          grupoId: exercicio.biset_grupo_id,
          exercicioA,
          exercicioB,
          series: exercicioA.series,
          descanso: exercicioB.descanso // Descanso após completar o par
        });
        
        processados.add(exId);
        processados.add(parceiroId);
      } else {
        // Bi-set incompleto, tratar como exercício individual
        resultado.push(exercicio);
        processados.add(exId);
      }
    } else {
      // Exercício individual
      resultado.push(exercicio);
      processados.add(exId);
    }
  }
  
  return resultado;
}

// Verificar se um item é um BiSetGroup
export function isBiSetGroup(item: Exercicio | BiSetGroup): item is BiSetGroup {
  return 'grupoId' in item && 'exercicioA' in item && 'exercicioB' in item;
}

// Criar Bi-set a partir de dois exercícios
export function criarBiset(
  exercicioA: Exercicio, 
  exercicioB: Exercicio,
  series: number,
  descanso: number
): { exercicioA: Exercicio; exercicioB: Exercicio } {
  const grupoId = gerarBisetGrupoId();
  
  return {
    exercicioA: {
      ...exercicioA,
      series,
      biset_grupo_id: grupoId,
      tecnica: 'Bi-Set',
      descanso: 0 // Sem descanso após o primeiro exercício
    },
    exercicioB: {
      ...exercicioB,
      series,
      biset_grupo_id: grupoId,
      tecnica: 'Bi-Set',
      descanso // Descanso após completar o par
    }
  };
}

// Desfazer Bi-set (remover agrupamento)
export function desfazerBiset(exercicios: Exercicio[], grupoId: string): Exercicio[] {
  return exercicios.map(ex => {
    if (ex.biset_grupo_id === grupoId) {
      return {
        ...ex,
        biset_grupo_id: undefined,
        tecnica: ex.tecnica === 'Bi-Set' ? undefined : ex.tecnica
      };
    }
    return ex;
  });
}

// Reordenar exercícios mantendo Bi-sets juntos
export function reordenarComBisets(exercicios: Exercicio[], fromIndex: number, toIndex: number): Exercicio[] {
  const resultado = [...exercicios];
  const exercicioMovido = resultado[fromIndex];
  
  // Se o exercício faz parte de um Bi-set, mover o par junto
  if (exercicioMovido.biset_grupo_id) {
    const parceiroIndex = resultado.findIndex(
      (e, i) => i !== fromIndex && e.biset_grupo_id === exercicioMovido.biset_grupo_id
    );
    
    if (parceiroIndex !== -1) {
      // Remover ambos exercícios
      const [primeiro, segundo] = fromIndex < parceiroIndex 
        ? [fromIndex, parceiroIndex] 
        : [parceiroIndex, fromIndex];
      
      const exercicioA = resultado[primeiro];
      const exercicioB = resultado[segundo];
      
      // Remover do array (do maior índice primeiro para não afetar o menor)
      resultado.splice(segundo, 1);
      resultado.splice(primeiro, 1);
      
      // Calcular nova posição ajustada
      let novaPosicao = toIndex;
      if (toIndex > segundo) novaPosicao -= 2;
      else if (toIndex > primeiro) novaPosicao -= 1;
      
      // Inserir na nova posição
      resultado.splice(novaPosicao, 0, exercicioA, exercicioB);
    }
  } else {
    // Exercício individual - mover normalmente
    resultado.splice(fromIndex, 1);
    resultado.splice(toIndex, 0, exercicioMovido);
  }
  
  // Recalcular ordens
  return resultado.map((ex, index) => ({ ...ex, ordem: index + 1 }));
}
