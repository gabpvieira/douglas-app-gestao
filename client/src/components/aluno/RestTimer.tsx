import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface RestTimerProps {
  tempoInicial: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ tempoInicial, onSkip, onComplete }: RestTimerProps) {
  const [tempoRestante, setTempoRestante] = useState(tempoInicial);
  const [completo, setCompleto] = useState(false);

  // Criar áudio de notificação
  useEffect(() => {
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    if (completo) {
      createBeep();
      
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      const timeout = setTimeout(() => {
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [completo, onComplete]);

  // Timer countdown
  useEffect(() => {
    if (tempoRestante <= 0 && !completo) {
      setCompleto(true);
      return;
    }

    if (completo) return;

    const interval = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tempoRestante, completo]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const porcentagem = ((tempoInicial - tempoRestante) / tempoInicial) * 100;

  return (
    <div
      className={`fixed bottom-20 left-0 right-0 lg:left-64 z-20 transition-all ${
        completo ? "bg-emerald-600" : "bg-card border-t border-border"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Timer circular */}
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <svg className="h-14 w-14 -rotate-90">
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  className={completo ? "text-emerald-400/30" : "text-secondary"}
                />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - porcentagem / 100)}`}
                  className={`transition-all duration-300 ${
                    completo ? "text-white" : "text-primary"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-sm font-bold tabular-nums ${
                    completo ? "text-white" : "text-primary"
                  }`}
                >
                  {completo ? "✓" : formatarTempo(tempoRestante)}
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className={`font-semibold ${completo ? "text-white" : "text-foreground"}`}>
                {completo ? "Descanso Completo!" : "Descansando..."}
              </h3>
              <p className={`text-sm ${completo ? "text-emerald-100" : "text-muted-foreground"}`}>
                {completo ? "Pronto para a próxima série" : "Aguarde o timer"}
              </p>
            </div>
          </div>

          {/* Ação de pular */}
          <Button
            size="sm"
            variant="ghost"
            onClick={onSkip}
            className={`flex-shrink-0 ${completo ? "text-white hover:bg-emerald-500" : ""}`}
          >
            <X className="h-4 w-4 mr-1" />
            {completo ? "Fechar" : "Pular"}
          </Button>
        </div>
      </div>
    </div>
  );
}
