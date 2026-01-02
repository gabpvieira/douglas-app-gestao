import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { 
  playCompleteAlert, 
  startBackgroundTimer, 
  cancelBackgroundTimer,
  setupServiceWorkerListener,
  startKeepAlive,
  getAudioSettings
} from "@/lib/audioManager";

interface RestTimerProps {
  tempoInicial: number;
  onSkip: () => void;
  onComplete: () => void;
  exercicioNome?: string;
}

export default function RestTimer({ tempoInicial, onSkip, onComplete, exercicioNome }: RestTimerProps) {
  // Timer baseado em timestamp para funcionar em background
  const [startTime] = useState(() => Date.now());
  const [duration] = useState(tempoInicial);
  const [tempoRestante, setTempoRestante] = useState(tempoInicial);
  const [completo, setCompleto] = useState(false);
  const notificationSentRef = useRef(false);
  const timerIdRef = useRef<string>(`rest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Calcular tempo restante baseado em timestamp
  const calculateTimeRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, duration - elapsed);
  }, [startTime, duration]);

  // Iniciar timer de background e listeners
  useEffect(() => {
    const timerId = timerIdRef.current;
    const settings = getAudioSettings();
    
    // Iniciar keep-alive para manter SW ativo
    if (settings.backgroundEnabled) {
      startKeepAlive();
    }
    
    // Iniciar timer no Service Worker
    startBackgroundTimer(timerId, duration, exercicioNome);
    
    // Setup listener para quando timer completar via SW
    cleanupRef.current = setupServiceWorkerListener(
      (completedTimerId) => {
        if (completedTimerId === timerId && !completo) {
          setCompleto(true);
        }
      }
    );
    
    // Cleanup ao desmontar
    return () => {
      cancelBackgroundTimer(timerId);
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [duration, exercicioNome, completo]);

  // Solicitar permissão de notificação (apenas uma vez)
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Enviar notificação local quando completar (backup)
  const sendLocalNotification = useCallback(() => {
    if (notificationSentRef.current) return;
    notificationSentRef.current = true;

    // Notificação do navegador (fallback se SW não enviou)
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('💪 Descanso Completo!', {
          body: exercicioNome 
            ? `Hora de voltar para ${exercicioNome}`
            : 'Hora de voltar ao exercício!',
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          tag: 'rest-timer-local',
          requireInteraction: false,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('Error sending local notification:', error);
      }
    }
  }, [exercicioNome]);

  // Efeito quando completar
  useEffect(() => {
    if (completo) {
      // Tocar alerta completo (som + vibração) baseado nas configurações do usuário
      playCompleteAlert().catch(err => 
        console.error('Error playing complete alert:', err)
      );
      
      // Enviar notificação local como backup
      sendLocalNotification();

      const timeout = setTimeout(() => {
        onComplete();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [completo, onComplete, sendLocalNotification]);

  // Timer countdown baseado em timestamp
  useEffect(() => {
    if (completo) return;

    // Atualizar a cada 100ms para maior precisão
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTempoRestante(remaining);

      if (remaining <= 0 && !completo) {
        setCompleto(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [completo, calculateTimeRemaining]);

  // Handler para pular/fechar
  const handleSkip = useCallback(() => {
    cancelBackgroundTimer(timerIdRef.current);
    onSkip();
  }, [onSkip]);

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const porcentagem = ((duration - tempoRestante) / duration) * 100;

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
            onClick={handleSkip}
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
