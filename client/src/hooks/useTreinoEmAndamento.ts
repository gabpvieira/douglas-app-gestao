import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SerieRealizada {
  numero: number;
  peso: string;
  repeticoes: number;
  concluida: boolean;
}

export interface ExercicioEmAndamento {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string | null;
  seriesRealizadas: SerieRealizada[];
}

export interface TreinoEmAndamento {
  id?: string;
  alunoId: string;
  fichaAlunoId: string;
  nomeFicha: string;
  exercicios: ExercicioEmAndamento[];
  tempoInicio: string;
  tempoAcumulado: number;
  pausado: boolean;
  ultimaAtualizacao: string;
}

const STORAGE_KEY = "treino_em_andamento";
const AUTO_SAVE_INTERVAL = 10000; // 10 segundos

export function useTreinoEmAndamento(alunoId?: string) {
  const queryClient = useQueryClient();
  const [localTreino, setLocalTreino] = useState<TreinoEmAndamento | null>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const pendingUpdateRef = useRef<TreinoEmAndamento | null>(null);

  // Buscar sessão do banco de dados
  const { data: sessaoDB, isLoading } = useQuery({
    queryKey: ["sessao-treino-andamento", alunoId],
    queryFn: async () => {
      if (!alunoId) return null;
      
      const { data, error } = await supabase
        .from("sessoes_treino_andamento")
        .select("*")
        .eq("aluno_id", alunoId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar sessão:", error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          alunoId: data.aluno_id,
          fichaAlunoId: data.ficha_aluno_id,
          nomeFicha: data.nome_ficha,
          exercicios: data.exercicios as ExercicioEmAndamento[],
          tempoInicio: data.tempo_inicio,
          tempoAcumulado: data.tempo_acumulado || 0,
          pausado: data.pausado || false,
          ultimaAtualizacao: data.ultima_atualizacao,
        } as TreinoEmAndamento;
      }

      return null;
    },
    enabled: !!alunoId,
    staleTime: 5000,
  });

  // Sincronizar estado local com banco
  useEffect(() => {
    if (sessaoDB && !localTreino) {
      setLocalTreino(sessaoDB);
      // Também salvar no localStorage como backup
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessaoDB));
    }
  }, [sessaoDB, localTreino]);

  // Carregar do localStorage como fallback
  useEffect(() => {
    if (!alunoId || isLoading || sessaoDB) return;

    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo) {
      try {
        const treino = JSON.parse(salvo) as TreinoEmAndamento;
        if (treino.alunoId === alunoId) {
          const ultimaAtualizacao = new Date(treino.ultimaAtualizacao);
          const agora = new Date();
          const horasPassadas = (agora.getTime() - ultimaAtualizacao.getTime()) / (1000 * 60 * 60);
          
          if (horasPassadas < 24) {
            setLocalTreino(treino);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar treino do localStorage:", e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [alunoId, isLoading, sessaoDB]);

  // Mutation para salvar no banco
  const salvarMutation = useMutation({
    mutationFn: async (treino: TreinoEmAndamento) => {
      const payload = {
        aluno_id: treino.alunoId,
        ficha_aluno_id: treino.fichaAlunoId,
        nome_ficha: treino.nomeFicha,
        exercicios: treino.exercicios,
        tempo_inicio: treino.tempoInicio,
        tempo_acumulado: treino.tempoAcumulado,
        pausado: treino.pausado,
        ultima_atualizacao: new Date().toISOString(),
      };

      if (treino.id) {
        // Atualizar existente
        const { data, error } = await supabase
          .from("sessoes_treino_andamento")
          .update(payload)
          .eq("id", treino.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Inserir novo (upsert para evitar duplicatas)
        const { data, error } = await supabase
          .from("sessoes_treino_andamento")
          .upsert(payload, { onConflict: "aluno_id" })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      if (data && localTreino) {
        const atualizado = { ...localTreino, id: data.id };
        setLocalTreino(atualizado);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      }
    },
    onError: (error) => {
      console.error("Erro ao salvar sessão no banco:", error);
    },
  });

  // Mutation para deletar sessão
  const deletarMutation = useMutation({
    mutationFn: async (sessaoId: string) => {
      const { error } = await supabase
        .from("sessoes_treino_andamento")
        .delete()
        .eq("id", sessaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessao-treino-andamento"] });
    },
  });

  // Auto-save periódico
  useEffect(() => {
    if (!localTreino || localTreino.pausado) return;

    autoSaveRef.current = setInterval(() => {
      if (pendingUpdateRef.current) {
        salvarMutation.mutate(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
    }, AUTO_SAVE_INTERVAL);

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [localTreino?.pausado]);

  // Salvar ao sair da página
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localTreino) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(localTreino));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [localTreino]);


  // Iniciar novo treino
  const iniciarTreino = useCallback((
    fichaAlunoId: string,
    nomeFicha: string,
    exercicios: ExercicioEmAndamento[],
    alunoIdParam: string
  ) => {
    const novoTreino: TreinoEmAndamento = {
      alunoId: alunoIdParam,
      fichaAlunoId,
      nomeFicha,
      exercicios,
      tempoInicio: new Date().toISOString(),
      tempoAcumulado: 0,
      pausado: false,
      ultimaAtualizacao: new Date().toISOString(),
    };
    
    setLocalTreino(novoTreino);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novoTreino));
    salvarMutation.mutate(novoTreino);
    
    return novoTreino;
  }, [salvarMutation]);

  // Atualizar exercícios do treino
  const atualizarExercicios = useCallback((exercicios: ExercicioEmAndamento[]) => {
    setLocalTreino((prev) => {
      if (!prev) return null;
      
      const atualizado: TreinoEmAndamento = {
        ...prev,
        exercicios,
        ultimaAtualizacao: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      pendingUpdateRef.current = atualizado;
      
      return atualizado;
    });
  }, []);

  // Salvar imediatamente (para ações importantes)
  const salvarImediato = useCallback(() => {
    if (localTreino) {
      salvarMutation.mutate(localTreino);
    }
  }, [localTreino, salvarMutation]);

  // Pausar/retomar treino
  const togglePausado = useCallback((pausado: boolean) => {
    setLocalTreino((prev) => {
      if (!prev) return null;
      
      // Calcular tempo acumulado ao pausar
      let tempoAcumulado = prev.tempoAcumulado;
      if (pausado && !prev.pausado) {
        const inicio = new Date(prev.tempoInicio);
        const agora = new Date();
        tempoAcumulado = prev.tempoAcumulado + Math.floor((agora.getTime() - inicio.getTime()) / 1000);
      }
      
      const atualizado: TreinoEmAndamento = {
        ...prev,
        pausado,
        tempoAcumulado,
        tempoInicio: pausado ? prev.tempoInicio : new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      salvarMutation.mutate(atualizado);
      
      return atualizado;
    });
  }, [salvarMutation]);

  // Finalizar treino (limpar do storage e banco)
  const finalizarTreino = useCallback(async () => {
    if (localTreino?.id) {
      await deletarMutation.mutateAsync(localTreino.id);
    }
    setLocalTreino(null);
    localStorage.removeItem(STORAGE_KEY);
    queryClient.invalidateQueries({ queryKey: ["sessao-treino-andamento"] });
  }, [localTreino, deletarMutation, queryClient]);

  // Calcular tempo decorrido desde o início
  const calcularTempoDecorrido = useCallback(() => {
    if (!localTreino) return 0;
    
    if (localTreino.pausado) {
      return Math.max(0, localTreino.tempoAcumulado || 0);
    }
    
    // Garantir que tempoInicio seja uma data válida
    const tempoInicioStr = localTreino.tempoInicio;
    let inicio: Date;
    
    // Tentar parsear a data - pode vir do banco sem timezone
    if (tempoInicioStr) {
      // Se não tem timezone, adicionar Z para UTC
      const dataStr = tempoInicioStr.includes('Z') || tempoInicioStr.includes('+') 
        ? tempoInicioStr 
        : tempoInicioStr + 'Z';
      inicio = new Date(dataStr);
    } else {
      inicio = new Date();
    }
    
    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();
    const diffSegundos = Math.floor(diffMs / 1000);
    
    // Garantir que o tempo nunca seja negativo
    const tempoAcumulado = localTreino.tempoAcumulado || 0;
    return Math.max(0, tempoAcumulado + diffSegundos);
  }, [localTreino]);

  // Verificar se há treino em andamento para uma ficha específica
  const temTreinoParaFicha = useCallback((fichaAlunoId: string) => {
    return localTreino?.fichaAlunoId === fichaAlunoId;
  }, [localTreino]);

  // Treino efetivo (local ou do banco)
  const treinoEmAndamento = localTreino || sessaoDB || null;

  return {
    treinoEmAndamento,
    carregado: !isLoading,
    iniciarTreino,
    atualizarExercicios,
    togglePausado,
    finalizarTreino,
    calcularTempoDecorrido,
    temTreinoParaFicha,
    salvarImediato,
    salvando: salvarMutation.isPending,
  };
}
