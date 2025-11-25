import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { ArrowLeft, Play, Pause, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import TreinoHeader from "@/components/aluno/TreinoHeader";
import ExercicioCard from "@/components/aluno/ExercicioCard";
import RestTimer from "@/components/aluno/RestTimer";
import FinalizarTreinoModal from "@/components/aluno/FinalizarTreinoModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SerieRealizada {
  numero: number;
  peso: string;
  repeticoes: number;
  concluida: boolean;
}

interface ExercicioExecucao {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  seriesRealizadas: SerieRealizada[];
}

export default function TreinoExecucao() {
  const [, params] = useRoute("/aluno/treino/:fichaAlunoId");
  const [, setLocation] = useLocation();
  const fichaAlunoId = params?.fichaAlunoId;

  const [exercicios, setExercicios] = useState<ExercicioExecucao[]>([]);
  const [tempoInicio] = useState(new Date());
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [treinoPausado, setTreinoPausado] = useState(false);
  const [restTimer, setRestTimer] = useState<{ ativo: boolean; tempo: number; exercicioId: string } | null>(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const { toast } = useToast();

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

  // Inicializar exercícios quando ficha carregar
  useEffect(() => {
    if (ficha?.fichas_treino?.exercicios_ficha) {
      const exerciciosIniciais = ficha.fichas_treino.exercicios_ficha
        .sort((a, b) => a.ordem - b.ordem)
        .map((ex) => ({
          id: ex.id,
          nome: ex.nome,
          grupoMuscular: ex.grupo_muscular,
          series: ex.series,
          repeticoes: ex.repeticoes,
          descanso: ex.descanso,
          observacoes: ex.observacoes,
          tecnica: ex.tecnica,
          seriesRealizadas: Array.from({ length: ex.series }, (_, i) => ({
            numero: i + 1,
            peso: "",
            repeticoes: 0,
            concluida: false,
          })),
        }));
      setExercicios(exerciciosIniciais);
    }
  }, [ficha]);

  // Cronômetro do treino
  useEffect(() => {
    if (treinoPausado) return;

    const interval = setInterval(() => {
      const agora = new Date();
      const diff = Math.floor((agora.getTime() - tempoInicio.getTime()) / 1000);
      setTempoDecorrido(diff);
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoInicio, treinoPausado]);

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

      toast({
        title: "Treino Finalizado! 🎉",
        description: "Seu treino foi salvo com sucesso.",
      });

      setLocation("/aluno/treinos");
    } catch (error) {
      console.error("Erro ao salvar treino:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o treino. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const exerciciosConcluidos = exercicios.filter((ex) =>
    ex.seriesRealizadas.every((s) => s.concluida)
  ).length;

  if (isLoading) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AlunoLayout>
    );
  }

  if (!ficha) {
    return (
      <AlunoLayout>
        <div className="text-center py-12">
          <p className="text-gray-400">Ficha não encontrada</p>
          <Button onClick={() => setLocation("/aluno/treinos")} className="mt-4">
            Voltar
          </Button>
        </div>
      </AlunoLayout>
    );
  }

  return (
    <AlunoLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-24">
        {/* Header */}
        <TreinoHeader
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
          tempoDecorrido={tempoDecorrido}
          exerciciosConcluidos={exerciciosConcluidos}
          totalExercicios={exercicios.length}
          pausado={treinoPausado}
          onPausar={() => setTreinoPausado(!treinoPausado)}
          onVoltar={() => setLocation("/aluno/treinos")}
        />

        {/* Lista de Exercícios */}
        <div className="space-y-4">
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
        <Card className="fixed bottom-0 left-0 right-0 lg:left-64 bg-gray-900 border-gray-800 border-t p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setLocation("/aluno/treinos")}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-500 hover:bg-green-600"
              onClick={() => setModalFinalizar(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Finalizar Treino
            </Button>
          </div>
        </Card>

        {/* Modal Finalizar */}
        <FinalizarTreinoModal
          open={modalFinalizar}
          onClose={() => setModalFinalizar(false)}
          onConfirm={handleFinalizarTreino}
          exercicios={exercicios}
          tempoDecorrido={tempoDecorrido}
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
        />

        {/* Timer de Descanso */}
        {restTimer?.ativo && (
          <RestTimer
            tempoInicial={restTimer.tempo}
            onSkip={() => setRestTimer(null)}
            onComplete={() => setRestTimer(null)}
          />
        )}
      </div>
    </AlunoLayout>
  );
}
