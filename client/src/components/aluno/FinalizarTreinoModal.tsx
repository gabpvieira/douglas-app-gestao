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
      <DialogContent className="bg-gray-900 border-gray-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Finalizar Treino
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome da Ficha */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-gray-100">{nomeFicha}</h3>
            <p className="text-sm text-gray-400 mt-1">Resumo do treino</p>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3">
            {/* Tempo */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Duração</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{formatarTempo(tempoDecorrido)}</p>
            </div>

            {/* Exercícios */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Dumbbell className="h-4 w-4" />
                <span className="text-xs">Exercícios</span>
              </div>
              <p className="text-2xl font-bold text-green-500">
                {exerciciosConcluidos}/{exercicios.length}
              </p>
            </div>

            {/* Séries */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Séries</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">{totalSeries}</p>
            </div>

            {/* Volume */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Trophy className="h-4 w-4" />
                <span className="text-xs">Volume</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {volumeTotal.toFixed(0)}kg
              </p>
            </div>
          </div>

          {/* Aviso */}
          {exerciciosConcluidos < exercicios.length && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-500">
                ⚠️ Você não completou todos os exercícios. Deseja finalizar mesmo assim?
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={salvando}
            className="flex-1"
          >
            Continuar Treino
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={salvando}
            className="flex-1 bg-green-500 hover:bg-green-600"
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
