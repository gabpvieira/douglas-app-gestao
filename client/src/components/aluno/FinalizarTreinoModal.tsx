import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trophy, Clock, Dumbbell, TrendingUp } from "lucide-react";

interface ExercicioExecucao {
  id: string;
  nome: string;
  seriesRealizadas: {
    numero: number;
    peso: string;
    repeticoes: number;
    concluida: boolean;
  }[];
}

interface FinalizarTreinoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  exercicios: ExercicioExecucao[];
  tempoDecorrido: number;
  nomeFicha: string;
}

export default function FinalizarTreinoModal({
  open,
  onClose,
  onConfirm,
  exercicios,
  tempoDecorrido,
  nomeFicha,
}: FinalizarTreinoModalProps) {
  const [salvando, setSalvando] = useState(false);

  const handleConfirm = async () => {
    setSalvando(true);
    try {
      await onConfirm();
    } finally {
      setSalvando(false);
    }
  };

  // Calcular estatísticas
  const exerciciosConcluidos = exercicios.filter((ex) =>
    ex.seriesRealizadas.some((s) => s.concluida)
  ).length;

  const totalSeries = exercicios.reduce(
    (acc, ex) => acc + ex.seriesRealizadas.filter((s) => s.concluida).length,
    0
  );

  const volumeTotal = exercicios.reduce((acc, ex) => {
    return (
      acc +
      ex.seriesRealizadas
        .filter((s) => s.concluida)
        .reduce((sum, s) => {
          const peso = parseFloat(s.peso) || 0;
          return sum + peso * s.repeticoes;
        }, 0)
    );
  }, 0);

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos}min ${segs}s`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            Finalizar Treino
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Nome da Ficha */}
          <div className="text-center py-2">
            <h3 className="text-lg font-semibold text-zinc-100">{nomeFicha}</h3>
            <p className="text-sm text-zinc-500 mt-0.5">Resumo do treino</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tempo */}
            <div className="bg-zinc-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">Duração</span>
              </div>
              <p className="text-xl font-bold text-blue-400">{formatarTempo(tempoDecorrido)}</p>
            </div>

            {/* Exercícios */}
            <div className="bg-zinc-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Dumbbell className="h-3.5 w-3.5" />
                <span className="text-xs">Exercícios</span>
              </div>
              <p className="text-xl font-bold text-emerald-400">
                {exerciciosConcluidos}/{exercicios.length}
              </p>
            </div>

            {/* Séries */}
            <div className="bg-zinc-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs">Séries</span>
              </div>
              <p className="text-xl font-bold text-violet-400">{totalSeries}</p>
            </div>

            {/* Volume */}
            <div className="bg-zinc-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-zinc-500 mb-1">
                <Trophy className="h-3.5 w-3.5" />
                <span className="text-xs">Volume</span>
              </div>
              <p className="text-xl font-bold text-amber-400">
                {volumeTotal.toFixed(0)}kg
              </p>
            </div>
          </div>

          {/* Aviso */}
          {exerciciosConcluidos < exercicios.length && (
            <div className="bg-amber-600 rounded-lg p-3">
              <p className="text-sm text-white">
                ⚠️ Você não completou todos os exercícios. Deseja finalizar mesmo assim?
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={salvando}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
          >
            Continuar Treino
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={salvando}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {salvando ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Finalizar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
