import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";

interface RestTimerProps {
  tempoInicial: number;
  onSkip: () => void;
  onComplete: () => void;
}

export default function RestTimer({ tempoInicial, onSkip, onComplete }: RestTimerProps) {
  const [tempoRestante, setTempoRestante] = useState(tempoInicial);
  const [completo, setCompleto] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Criar áudio de notificação
  useEffect(() => {
    // Criar um beep simples usando Web Audio API
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
      // Tocar som
      createBeep();
      
      // Vibrar
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }

      // Auto-fechar após 3 segundos
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

  const adicionarTempo = () => {
    setTempoRestante((prev) => prev + 30);
    setCompleto(false);
  };

  const porcentagem = ((tempoInicial - tempoRestante) / tempoInicial) * 100;

  return (
    <Card
      className={`fixed bottom-20 left-0 right-0 lg:left-64 z-20 border-t-4 transition-all ${
        completo
          ? "bg-green-500/20 border-green-500"
          : "bg-blue-500/20 border-blue-500"
      }`}
    >
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="h-16 w-16 -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-700"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - porcentagem / 100)}`}
                  className={`transition-all ${
                    completo ? "text-green-500" : "text-blue-500"
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-lg font-bold tabular-nums ${
                    completo ? "text-green-500" : "text-blue-500"
                  }`}
                >
                  {completo ? "✓" : formatarTempo(tempoRestante)}
                </span>
              </div>
            </div>

            <div>
              <h3
                className={`text-lg font-bold ${
                  completo ? "text-green-500" : "text-blue-500"
                }`}
              >
                {completo ? "Descanso Completo!" : "Descansando..."}
              </h3>
              <p className="text-sm text-gray-400">
                {completo ? "Pronto para a próxima série" : "Aguarde o timer"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!completo && (
              <Button
                variant="outline"
                size="sm"
                onClick={adicionarTempo}
                className="text-gray-300"
              >
                <Plus className="h-4 w-4 mr-1" />
                30s
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-100"
            >
              <X className="h-4 w-4 mr-1" />
              {completo ? "Fechar" : "Pular"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
