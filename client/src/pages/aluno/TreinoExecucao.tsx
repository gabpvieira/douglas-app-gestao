import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Check, X, Save, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import TreinoHeader from "@/components/aluno/TreinoHeader";
import ExercicioCard from "@/components/aluno/ExercicioCard";
import RestTimer from "@/components/aluno/RestTimer";
import MinimizedWorkout from "@/components/aluno/MinimizedWorkout";
import FinalizarTreinoModal from "@/components/aluno/FinalizarTreinoModal";
import { FeedbackTreinoModal } from "@/components/FeedbackTreinoModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAlunoProfile } from "@/hooks/useAlunoData";
import { useTreinoEmAndamento, ExercicioEmAndamento } from "@/hooks/useTreinoEmAndamento";
import { useCreateFeedback } from "@/hooks/useFeedbackTreinos";
import { notifyInicioTreino } from "@/lib/notificationManager";

export default function TreinoExecucao() {
  const [, params] = useRoute("/aluno/treino/:fichaAlunoId");
  const [, setLocation] = useLocation();
  const fichaAlunoId = params?.fichaAlunoId;

  const [exercicios, setExercicios] = useState<ExercicioEmAndamento[]>([]);
  const [restTimer, setRestTimer] = useState<{ ativo: boolean; tempo: number; exercicioId: string; exercicioNome: string } | null>(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [treinoFinalizadoId, setTreinoFinalizadoId] = useState<string | null>(null);
  const [minimizado, setMinimizado] = useState(false);
  const { toast } = useToast();
  const createFeedback = useCreateFeedback();
  
  // Buscar perfil do aluno
  const { data: profile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  // Hook de treino em andamento
  const {
    treinoEmAndamento,
    carregado: treinoCarregado,
    iniciarTreino,
    atualizarExercicios,
    togglePausado,
    finalizarTreino,
    calcularTempoDecorrido,
    salvarImediato,
    salvando,
  } = useTreinoEmAndamento(alunoId);

  // Buscar ficha e exercícios
  const { data: ficha, isLoading } = useQuery({
    queryKey: ["ficha-execucao", fichaAlunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fichas_alunos")
        .select(`
          *,
          fichas_treino(
            *,
            exercicios_ficha(*)
          )
        `)
        .eq("id", fichaAlunoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!fichaAlunoId,
  });

  // Inicializar ou retomar treino
  useEffect(() => {
    if (!ficha?.fichas_treino?.exercicios_ficha || !alunoId || !treinoCarregado || treinoIniciado) return;

    // Verificar se há treino em andamento para esta ficha
    if (treinoEmAndamento && treinoEmAndamento.fichaAlunoId === fichaAlunoId) {
      // Retomar treino existente
      setExercicios(treinoEmAndamento.exercicios);
      setTreinoIniciado(true);
      toast({
        title: "Treino retomado",
        description: "Continuando de onde você parou.",
      });
    } else if (!treinoEmAndamento) {
      // Iniciar novo treino
      const exerciciosIniciais: ExercicioEmAndamento[] = ficha.fichas_treino.exercicios_ficha
        .sort((a: any, b: any) => a.ordem - b.ordem)
        .map((ex: any) => ({
          id: ex.id,
          nome: ex.nome,
          grupoMuscular: ex.grupo_muscular,
          series: ex.series,
          repeticoes: ex.repeticoes,
          descanso: ex.descanso,
          observacoes: ex.observacoes,
          tecnica: ex.tecnica,
          videoId: ex.video_id,
          seriesRealizadas: Array.from({ length: ex.series }, (_, i) => ({
            numero: i + 1,
            peso: "",
            repeticoes: 0,
            concluida: false,
          })),
        }));
      
      setExercicios(exerciciosIniciais);
      iniciarTreino(
        fichaAlunoId!,
        ficha.fichas_treino.nome,
        exerciciosIniciais,
        alunoId
      );
      setTreinoIniciado(true);
      
      // Notificar início do treino
      notifyInicioTreino(ficha.fichas_treino.nome).catch(err => 
        console.error('Error sending start notification:', err)
      );
    }
  }, [ficha, alunoId, treinoCarregado, treinoEmAndamento, fichaAlunoId, treinoIniciado]);

  // Atualizar exercícios no hook quando mudar
  const exerciciosRef = useRef(exercicios);
  useEffect(() => {
    if (exercicios.length > 0 && treinoIniciado && exercicios !== exerciciosRef.current) {
      exerciciosRef.current = exercicios;
      atualizarExercicios(exercicios);
    }
  }, [exercicios, treinoIniciado, atualizarExercicios]);

  // Tempo decorrido atualizado (baseado em timestamp - funciona em background)
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  
  useEffect(() => {
    if (!treinoEmAndamento) return;

    // Atualizar imediatamente
    setTempoDecorrido(calcularTempoDecorrido());

    // Se pausado, não precisa continuar atualizando
    if (treinoEmAndamento.pausado) return;

    // Atualizar a cada 500ms para maior precisão e responsividade
    const interval = setInterval(() => {
      setTempoDecorrido(calcularTempoDecorrido());
    }, 500);

    return () => clearInterval(interval);
  }, [treinoEmAndamento, treinoEmAndamento?.pausado, calcularTempoDecorrido]);

  // Atualizar tempo quando a página volta a ficar visível (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && treinoEmAndamento && !treinoEmAndamento.pausado) {
        // Atualizar imediatamente quando voltar à aba
        setTempoDecorrido(calcularTempoDecorrido());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [treinoEmAndamento, calcularTempoDecorrido]);


  const handleSerieCompleta = (exercicioId: string, numeroSerie: number) => {
    setExercicios((prev) =>
      prev.map((ex) => {
        if (ex.id === exercicioId) {
          const novasSeries = ex.seriesRealizadas.map((s) =>
            s.numero === numeroSerie ? { ...s, concluida: !s.concluida } : s
          );
          
          // Iniciar timer de descanso se série foi marcada como completa
          const serieCompleta = novasSeries.find((s) => s.numero === numeroSerie)?.concluida;
          if (serieCompleta && ex.descanso > 0) {
            setRestTimer({
              ativo: true,
              tempo: ex.descanso,
              exercicioId: ex.id,
              exercicioNome: ex.nome,
            });
          }

          return { ...ex, seriesRealizadas: novasSeries };
        }
        return ex;
      })
    );
  };

  const handleUpdateSerie = (
    exercicioId: string,
    numeroSerie: number,
    campo: "peso" | "repeticoes",
    valor: string | number
  ) => {
    setExercicios((prev) =>
      prev.map((ex) => {
        if (ex.id === exercicioId) {
          const novasSeries = ex.seriesRealizadas.map((s) =>
            s.numero === numeroSerie ? { ...s, [campo]: valor } : s
          );
          return { ...ex, seriesRealizadas: novasSeries };
        }
        return ex;
      })
    );
  };

  const handlePausar = () => {
    togglePausado(!treinoEmAndamento?.pausado);
  };

  const handleMinimizar = () => {
    setMinimizado(true);
    toast({
      title: "Treino minimizado",
      description: "Continue navegando. O timer continuará rodando.",
    });
  };

  const handleVoltar = () => {
    // Salvar antes de sair
    salvarImediato();
    toast({
      title: "Treino salvo",
      description: "Você pode retomar a qualquer momento.",
    });
    setLocation("/aluno/treinos");
  };

  const handleFinalizarTreino = async () => {
    try {
      // Salvar cada exercício realizado
      for (const exercicio of exercicios) {
        const seriesConcluidas = exercicio.seriesRealizadas.filter((s) => s.concluida);
        
        if (seriesConcluidas.length === 0) continue;

        // Inserir treino_realizado
        const { data: treinoRealizado, error: treinoError } = await supabase
          .from("treinos_realizados")
          .insert({
            ficha_aluno_id: fichaAlunoId,
            exercicio_id: exercicio.id,
            data_realizacao: new Date().toISOString(),
            series_realizadas: seriesConcluidas.length,
          })
          .select()
          .single();

        if (treinoError) throw treinoError;

        // Inserir cada série realizada
        for (const serie of seriesConcluidas) {
          const { error: serieError } = await supabase
            .from("series_realizadas")
            .insert({
              treino_realizado_id: treinoRealizado.id,
              numero_serie: serie.numero,
              carga: serie.peso,
              repeticoes: serie.repeticoes,
              concluida: "true",
            });

          if (serieError) throw serieError;
        }
      }

      // Limpar sessão em andamento
      await finalizarTreino();

      toast({
        title: "Treino Finalizado! 🎉",
        description: "Seu treino foi salvo com sucesso.",
      });

      // Fechar modal de finalização e abrir modal de feedback
      setModalFinalizar(false);
      setTreinoFinalizadoId(fichaAlunoId || null);
      setModalFeedback(true);
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o treino. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitFeedback = async (estrelas: number, comentario?: string) => {
    if (!alunoId || !treinoFinalizadoId) return;

    await createFeedback.mutateAsync({
      alunoId,
      treinoId: treinoFinalizadoId,
      estrelas,
      comentario,
    });

    setModalFeedback(false);
    setLocation("/aluno/treinos");
  };

  const handleSkipFeedback = () => {
    setModalFeedback(false);
    setLocation("/aluno/treinos");
  };

  // Calcular tempo restante do timer para o modo minimizado
  const [timerDescansoMinimizado, setTimerDescansoMinimizado] = useState<{
    tempoRestante: number;
    exercicioNome: string;
  } | null>(null);

  useEffect(() => {
    if (restTimer?.ativo) {
      const exercicio = exercicios.find(ex => ex.id === restTimer.exercicioId);
      if (exercicio) {
        setTimerDescansoMinimizado({
          tempoRestante: restTimer.tempo, // Será atualizado pelo callback
          exercicioNome: exercicio.nome,
        });
      }
    } else {
      setTimerDescansoMinimizado(null);
    }
  }, [restTimer, exercicios]);

  // Callback para atualizar tempo restante do timer
  const handleTimerUpdate = (tempoRestante: number) => {
    if (restTimer?.ativo) {
      const exercicio = exercicios.find(ex => ex.id === restTimer.exercicioId);
      if (exercicio) {
        setTimerDescansoMinimizado({
          tempoRestante,
          exercicioNome: exercicio.nome,
        });
      }
    }
  };

  const exerciciosConcluidos = exercicios.filter((ex) =>
    ex.seriesRealizadas.every((s) => s.concluida)
  ).length;

  if (isLoading || !treinoCarregado) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
        </div>
      </AlunoLayout>
    );
  }

  if (!ficha) {
    return (
      <AlunoLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ficha não encontrada</p>
          <Button onClick={() => setLocation("/aluno/treinos")} variant="secondary" className="mt-4">
            Voltar
          </Button>
        </div>
      </AlunoLayout>
    );
  }

  // Se há treino em andamento para outra ficha, mostrar aviso
  if (treinoEmAndamento && treinoEmAndamento.fichaAlunoId !== fichaAlunoId) {
    return (
      <AlunoLayout>
        <div className="max-w-md mx-auto text-center py-12 px-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-2">
              Treino em andamento
            </h2>
            <p className="text-gray-300 mb-4">
              Você já tem um treino em andamento: <strong>{treinoEmAndamento.nomeFicha}</strong>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Finalize ou descarte o treino atual antes de iniciar outro.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => setLocation(`/aluno/treino/${treinoEmAndamento.fichaAlunoId}`)}
              >
                Retomar treino
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await finalizarTreino();
                  window.location.reload();
                }}
              >
                Descartar
              </Button>
            </div>
          </div>
        </div>
      </AlunoLayout>
    );
  }

  // Modo minimizado
  if (minimizado) {
    return (
      <MinimizedWorkout
        nomeFicha={ficha.fichas_treino?.nome || "Treino"}
        tempoDecorrido={tempoDecorrido}
        pausado={treinoEmAndamento?.pausado || false}
        timerDescanso={timerDescansoMinimizado}
        onExpand={() => setMinimizado(false)}
        onTogglePause={handlePausar}
      />
    );
  }

  return (
    <AlunoLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-24 px-4 sm:px-0">
        {/* Header */}
        <TreinoHeader
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
          tempoDecorrido={tempoDecorrido}
          exerciciosConcluidos={exerciciosConcluidos}
          totalExercicios={exercicios.length}
          pausado={treinoEmAndamento?.pausado || false}
          onPausar={handlePausar}
          onVoltar={handleVoltar}
        />

        {/* Botão Minimizar */}
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleMinimizar}
            className="gap-2"
          >
            <Minimize2 className="h-4 w-4" />
            Minimizar Treino
          </Button>
        </div>

        {/* Indicador de salvamento */}
        {salvando && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Save className="h-4 w-4 animate-pulse" />
            Salvando progresso...
          </div>
        )}

        {/* Lista de Exercícios */}
        <div className="space-y-3">
          {exercicios.map((exercicio, index) => (
            <ExercicioCard
              key={exercicio.id}
              exercicio={exercicio}
              numero={index + 1}
              onSerieCompleta={handleSerieCompleta}
              onUpdateSerie={handleUpdateSerie}
            />
          ))}
        </div>

        {/* Botão Finalizar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleVoltar}
            >
              <X className="h-4 w-4 mr-2" />
              Sair e Salvar
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => setModalFinalizar(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Finalizar Treino
            </Button>
          </div>
        </div>

        {/* Modal Finalizar */}
        <FinalizarTreinoModal
          open={modalFinalizar}
          onClose={() => setModalFinalizar(false)}
          onConfirm={handleFinalizarTreino}
          exercicios={exercicios}
          tempoDecorrido={tempoDecorrido}
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
          alunoId={alunoId}
        />

        {/* Modal Feedback */}
        <FeedbackTreinoModal
          open={modalFeedback}
          onOpenChange={(open) => {
            if (!open) {
              handleSkipFeedback();
            }
          }}
          onSubmit={handleSubmitFeedback}
          isLoading={createFeedback.isPending}
        />

        {/* Timer de Descanso */}
        {restTimer?.ativo && (
          <RestTimer
            tempoInicial={restTimer.tempo}
            exercicioNome={restTimer.exercicioNome}
            onSkip={() => setRestTimer(null)}
            onComplete={() => setRestTimer(null)}
            onTimeUpdate={handleTimerUpdate}
          />
        )}
      </div>
    </AlunoLayout>
  );
}
