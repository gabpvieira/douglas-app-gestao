import { Button } from "@/components/ui/button";
import { Maximize2, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

interface MinimizedWorkoutProps {
  nomeFicha: string;
  tempoDecorrido: number;
  pausado: boolean;
  timerDescanso?: {
    tempoRestante: number;
    exercicioNome: string;
  } | null;
  onExpand: () => void;
  onTogglePause: () => void;
}

export default function MinimizedWorkout({
  nomeFicha,
  tempoDecorrido,
  pausado,
  timerDescanso,
  onExpand,
  onTogglePause,
}: MinimizedWorkoutProps) {
  const [visible, setVisible] = useState(true);

  // Atualizar título da página com tempo
  useEffect(() => {
    const originalTitle = document.title;
    
    if (timerDescanso) {
      document.title = `⏱️ ${formatarTempo(timerDescanso.tempoRestante)} - Descanso`;
    } else if (!pausado) {
      document.title = `💪 ${formatarTempo(tempoDecorrido)} - Treino`;
    } else {
      document.title = `⏸️ Treino Pausado`;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [tempoDecorrido, pausado, timerDescanso]);

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;
    
    if (horas > 0) {
      return `${horas}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-lg border border-primary/30 rounded-xl shadow-2xl p-4 z-50 min-w-[280px] animate-in slide-in-from-bottom-5">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {nomeFicha}
            </h3>
            <p className="text-xs text-muted-foreground">
              {pausado ? "Pausado" : "Em andamento"}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 flex-shrink-0"
            onClick={onExpand}
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Tempo Total */}
        <div className="flex items-center justify-between bg-card/50 rounded-lg p-2">
          <span className="text-xs text-muted-foreground">Tempo Total</span>
          <span className="text-lg font-bold tabular-nums text-primary">
            {formatarTempo(tempoDecorrido)}
          </span>
        </div>

        {/* Timer de Descanso */}
        {timerDescanso && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-emerald-400 font-medium">Descansando</span>
                <p className="text-xs text-emerald-300/70 truncate">
                  {timerDescanso.exercicioNome}
                </p>
              </div>
              <span className="text-2xl font-bold tabular-nums text-emerald-400 ml-2">
                {formatarTempo(timerDescanso.tempoRestante)}
              </span>
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={onTogglePause}
          >
            {pausado ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Retomar
              </>
            ) : (
              <>
                <Pause className="h-3 w-3 mr-1" />
                Pausar
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={onExpand}
          >
            Ver Treino
          </Button>
        </div>
      </div>
    </div>
  );
}
