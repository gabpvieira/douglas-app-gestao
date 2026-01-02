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
  const [localTime, setLocalTime] = useState(tempoDecorrido);

  // Atualizar tempo local a cada segundo para garantir atualização visual
  useEffect(() => {
    if (pausado) {
      setLocalTime(tempoDecorrido);
      return;
    }

    // Atualizar imediatamente
    setLocalTime(tempoDecorrido);

    // Continuar atualizando a cada segundo
    const interval = setInterval(() => {
      setLocalTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoDecorrido, pausado]);

  // Atualizar título da página com tempo
  useEffect(() => {
    const originalTitle = document.title;
    
    if (timerDescanso && timerDescanso.tempoRestante > 0) {
      document.title = `⏱️ ${formatarTempo(timerDescanso.tempoRestante)} - Descanso`;
    } else if (!pausado) {
      document.title = `💪 ${formatarTempo(localTime)} - Treino`;
    } else {
      document.title = `⏸️ Treino Pausado`;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [localTime, pausado, timerDescanso]);

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
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-lg border-2 border-primary/30 rounded-2xl shadow-2xl p-6 space-y-4 animate-in zoom-in-95">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
            <span className="text-3xl">💪</span>
          </div>
          <h2 className="font-bold text-xl text-foreground">
            {nomeFicha}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pausado ? "⏸️ Treino Pausado" : "🔥 Treino em Andamento"}
          </p>
        </div>

        {/* Aviso Explicativo */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
          <p className="text-sm text-blue-400 text-center leading-relaxed">
            💡 <strong>O treino continua rodando!</strong><br />
            Você pode navegar livremente. Os timers continuarão contando em segundo plano.
          </p>
        </div>

        {/* Tempo Total */}
        <div className="bg-card/50 rounded-xl p-4 text-center">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Tempo Total</span>
          <div className="text-4xl font-bold tabular-nums text-primary mt-1">
            {formatarTempo(localTime)}
          </div>
        </div>

        {/* Timer de Descanso */}
        {timerDescanso && timerDescanso.tempoRestante > 0 && (
          <div className="bg-emerald-500/20 border-2 border-emerald-500/40 rounded-xl p-4 text-center animate-pulse">
            <span className="text-xs text-emerald-400 uppercase tracking-wide font-medium">⏱️ Descansando</span>
            <div className="text-5xl font-bold tabular-nums text-emerald-400 mt-1">
              {formatarTempo(timerDescanso.tempoRestante)}
            </div>
            <p className="text-sm text-emerald-300/70 mt-2 truncate">
              {timerDescanso.exercicioNome}
            </p>
          </div>
        )}

        {/* Controles */}
        <div className="flex flex-col gap-2 pt-2">
          <Button
            size="lg"
            className="w-full text-base"
            onClick={onExpand}
          >
            <Maximize2 className="h-5 w-5 mr-2" />
            Ver Treino Completo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full text-base"
            onClick={onTogglePause}
          >
            {pausado ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                Retomar Treino
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 mr-2" />
                Pausar Treino
              </>
            )}
          </Button>
        </div>

        {/* Dica */}
        <p className="text-xs text-center text-muted-foreground">
          Clique em "Ver Treino Completo" para voltar à tela de execução
        </p>
      </div>
    </div>
  );
}
