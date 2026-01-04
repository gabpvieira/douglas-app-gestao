import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { 
  playCompleteAlert, 
  startBackgroundTimer, 
  cancelBackgroundTimer,
  setupServiceWorkerListener,
  startKeepAlive,
  getAudioSettings,
  checkNotificationSentBySW,
  getBackgroundTimerStatus
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
  
  // Refs para controle de estado e evitar duplicações
  const alertFiredRef = useRef(false);
  const swNotifiedRef = useRef(false);
  const timerIdRef = useRef<string>(`rest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  const cleanupRef = useRef<(() => void) | null>(null);
  const swAvailableRef = useRef(false);
  const lastSWCheckRef = useRef(0);

  // Calcular tempo restante baseado em timestamp
  const calculateTimeRemaining = useCallback(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, duration - elapsed);
  }, [startTime, duration]);

  // Verificar status do timer no SW periodicamente
  const checkSWTimerStatus = useCallback(async () => {
    const timerId = timerIdRef.current;
    const now = Date.now();
    
    // Não verificar mais que a cada 2 segundos
    if (now - lastSWCheckRef.current < 2000) return;
    lastSWCheckRef.current = now;
    
    try {
      const status = await getBackgroundTimerStatus(timerId);
      
      if (status) {
        swAvailableRef.current = true;
        
        // Se SW diz que completou e ainda não processamos
        if (status.completed && !completo) {
          console.log('[RestTimer] SW reports timer complete');
          swNotifiedRef.current = status.notificationSent || false;
          setCompleto(true);
        }
      }
    } catch (error) {
      console.warn('[RestTimer] Error checking SW timer status:', error);
    }
  }, [completo]);

  // Iniciar timer de background e listeners
  useEffect(() => {
    const timerId = timerIdRef.current;
    const settings = getAudioSettings();
    
    // Iniciar keep-alive para manter SW ativo
    if (settings.backgroundEnabled) {
      startKeepAlive();
    }
    
    // Iniciar timer no Service Worker
    const initTimer = async () => {
      const started = await startBackgroundTimer(timerId, duration, exercicioNome);
      swAvailableRef.current = started;
      
      if (!started) {
        console.warn('[RestTimer] SW timer not started, using local fallback');
      }
    };
    
    initTimer();
    
    // Setup listener para quando timer completar via SW
    cleanupRef.current = setupServiceWorkerListener(
      (completedTimerId, notificationSentBySW) => {
        if (completedTimerId === timerId && !completo) {
          console.log('[RestTimer] Timer complete from SW, notification sent:', notificationSentBySW);
          swNotifiedRef.current = notificationSentBySW;
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

  // Efeito quando completar - SOM APENAS SE SW NÃO NOTIFICOU
  useEffect(() => {
    if (!completo || alertFiredRef.current) return;
    
    alertFiredRef.current = true;
    const timerId = timerIdRef.current;
    
    // Verificar se o SW já enviou notificação
    const handleCompletion = async () => {
      // Se o SW já notificou, não precisamos fazer nada
      if (swNotifiedRef.current) {
        console.log('[RestTimer] SW already sent notification, skipping local alert');
      } else {
        // Fallback: SW não disponível ou não notificou
        // Verificar novamente com o SW antes de tocar som local
        const swSent = await checkNotificationSentBySW(timerId);
        
        if (!swSent) {
          console.log('[RestTimer] SW did not notify, playing local alert');
          // Tocar alerta local apenas se SW não enviou
          await playCompleteAlert(undefined, timerId);
          
          // Enviar notificação local como fallback
          sendLocalNotification();
        } else {
          console.log('[RestTimer] SW confirmed notification was sent');
        }
      }
      
      // Fechar timer após 3 segundos
      setTimeout(() => {
        onComplete();
      }, 3000);
    };
    
    handleCompletion();
  }, [completo, onComplete]);

  // Enviar notificação local (fallback quando SW não disponível)
  const sendLocalNotification = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('💪 Pausa finalizada', {
          body: exercicioNome 
            ? `Volte ao exercício: ${exercicioNome}`
            : 'Volte ao exercício!',
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          tag: 'rest-timer-fallback',
          requireInteraction: false,
          silent: true, // Silencioso pois já tocamos o som via Web Audio
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('[RestTimer] Error sending local notification:', error);
      }
    }
  }, [exercicioNome]);

  // Timer countdown baseado em timestamp com verificação de SW
  useEffect(() => {
    if (completo) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining();
      setTempoRestante(remaining);

      // Verificar status do SW periodicamente
      checkSWTimerStatus();

      // Timer completou localmente (fallback se SW não notificar)
      if (remaining <= 0 && !completo) {
        // Dar uma pequena margem para o SW notificar primeiro
        setTimeout(() => {
          if (!completo) {
            console.log('[RestTimer] Local timer completed, SW may have missed');
            setCompleto(true);
          }
        }, 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [completo, calculateTimeRemaining, checkSWTimerStatus]);

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
                {completo ? "Pausa finalizada!" : "Descansando..."}
              </h3>
              <p className={`text-sm ${completo ? "text-emerald-100" : "text-muted-foreground"}`}>
                {completo ? "Volte ao exercício" : "Aguarde o timer"}
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
