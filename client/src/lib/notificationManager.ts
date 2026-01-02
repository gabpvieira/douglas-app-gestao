/**
 * Notification Manager
 * Gerencia envio de notificações respeitando preferências do usuário
 */

import {
  getPreferences,
  getSchedules,
  getActiveTimers,
  addTimer,
  updateTimer,
  removeTimer,
  getLastReminderSent,
  setLastReminderSent,
  clearCompletedTimers,
  type ActiveTimer
} from './notificationsDB';

export type NotificationType =
  | 'inicio-treino'
  | 'lembrete-treino'
  | 'pausa-exercicio'
  | 'intervalo-descanso'
  | 'termino-pausa';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  vibrate?: number[];
  requireInteraction?: boolean;
  actions?: NotificationAction[];
  data?: any;
}

// ============================================
// PERMISSÕES
// ============================================

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  return await Notification.requestPermission();
}

export function hasNotificationPermission(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ============================================
// ENVIO DE NOTIFICAÇÕES
// ============================================

async function sendNotification(options: NotificationOptions): Promise<void> {
  // Verificar permissão
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return;
  }

  // Tentar enviar via Service Worker (funciona em background)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/icon-192.png',
        badge: options.badge || '/icon-72.png',
        tag: options.tag || 'default',
        vibrate: options.vibrate || [200, 100, 200],
        requireInteraction: options.requireInteraction || false,
        actions: options.actions || [],
        data: options.data || {},
        silent: false,
      });
      return;
    } catch (error) {
      console.error('Error sending notification via SW:', error);
    }
  }

  // Fallback: Notificação direta (apenas se app estiver aberto)
  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192.png',
      badge: options.badge || '/icon-72.png',
      tag: options.tag || 'default',
      vibrate: options.vibrate || [200, 100, 200],
      requireInteraction: options.requireInteraction || false,
      data: options.data || {},
    });

    // Focar na aba ao clicar
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// ============================================
// NOTIFICAÇÕES ESPECÍFICAS
// ============================================

export async function notifyInicioTreino(nomeFicha: string): Promise<void> {
  const preferences = await getPreferences();
  
  if (!preferences.inicioTreino) return;

  await sendNotification({
    title: 'Treino Iniciado! 💪',
    body: `Boa sorte no treino: ${nomeFicha}`,
    tag: 'inicio-treino',
    data: { type: 'inicio-treino', nomeFicha }
  });
}

export async function notifyLembreteTreino(): Promise<void> {
  const preferences = await getPreferences();
  
  if (!preferences.lembretesTreino) return;

  await sendNotification({
    title: 'Hora do Treino! 🏋️',
    body: 'Não esqueça de treinar hoje. Seu corpo agradece!',
    tag: 'lembrete-treino',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver Treinos', icon: '/icon-72.png' },
      { action: 'dismiss', title: 'Dispensar', icon: '/icon-72.png' }
    ],
    data: { type: 'lembrete-treino' }
  });
}

export async function notifyPausaExercicio(exercicioNome: string, tempo: number): Promise<void> {
  const preferences = await getPreferences();
  
  if (!preferences.pausasExercicios) return;

  const minutos = Math.floor(tempo / 60);
  const segundos = tempo % 60;
  const tempoFormatado = minutos > 0 
    ? `${minutos}min ${segundos}s`
    : `${segundos}s`;

  await sendNotification({
    title: 'Pausa Iniciada ⏸️',
    body: `Descanse ${tempoFormatado} após ${exercicioNome}`,
    tag: 'pausa-exercicio',
    data: { type: 'pausa-exercicio', exercicioNome, tempo }
  });
}

export async function notifyIntervaloDescanso(exercicioNome: string, tempoRestante: number): Promise<void> {
  const preferences = await getPreferences();
  
  if (!preferences.intervalosDescanso) return;

  const minutos = Math.floor(tempoRestante / 60);
  const segundos = tempoRestante % 60;
  const tempoFormatado = minutos > 0 
    ? `${minutos}min ${segundos}s`
    : `${segundos}s`;

  await sendNotification({
    title: 'Descansando... ⏱️',
    body: `${tempoFormatado} restante após ${exercicioNome}`,
    tag: 'intervalo-descanso',
    data: { type: 'intervalo-descanso', exercicioNome, tempoRestante }
  });
}

export async function notifyTerminoPausa(exercicioNome?: string): Promise<void> {
  // Sempre enviar (crítico)
  await sendNotification({
    title: 'Descanso Completo! 💪',
    body: exercicioNome 
      ? `Pronto para a próxima série de ${exercicioNome}`
      : 'Pronto para a próxima série',
    tag: 'termino-pausa',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'Ver Treino', icon: '/icon-72.png' },
      { action: 'dismiss', title: 'OK', icon: '/icon-72.png' }
    ],
    data: { type: 'termino-pausa', exercicioNome }
  });
}

// ============================================
// GERENCIAMENTO DE TIMERS
// ============================================

export async function startRestTimer(
  duration: number,
  exerciseName?: string
): Promise<string> {
  // Adicionar timer ao IndexedDB
  const timer = await addTimer({
    type: 'rest',
    startTime: Date.now(),
    duration,
    exerciseName,
    notificationSent: false
  });

  // Notificar início da pausa (se habilitado)
  await notifyPausaExercicio(exerciseName || 'Exercício', duration);

  // Enviar mensagem para Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'START_TIMER',
      timer: {
        id: timer.id,
        duration,
        exerciseName,
        startTime: timer.startTime
      }
    });
  }

  return timer.id;
}

export async function cancelTimer(timerId: string): Promise<void> {
  await removeTimer(timerId);

  // Notificar Service Worker
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_TIMER',
      timerId
    });
  }
}

// ============================================
// VERIFICAÇÃO DE TIMERS (Polling)
// ============================================

let timerCheckInterval: number | null = null;

export function startTimerPolling(): void {
  if (timerCheckInterval) return;

  // Verificar a cada 5 segundos
  timerCheckInterval = window.setInterval(async () => {
    await checkTimers();
  }, 5000);

  // Verificar imediatamente
  checkTimers();
}

export function stopTimerPolling(): void {
  if (timerCheckInterval) {
    clearInterval(timerCheckInterval);
    timerCheckInterval = null;
  }
}

async function checkTimers(): Promise<void> {
  try {
    const timers = await getActiveTimers();
    const now = Date.now();

    for (const timer of timers) {
      const elapsed = now - timer.startTime;
      const duration = timer.duration * 1000;
      const remaining = duration - elapsed;

      // Timer completou
      if (remaining <= 0 && !timer.notificationSent) {
        // Enviar notificação de término
        await notifyTerminoPausa(timer.exerciseName);

        // Marcar como enviada
        await updateTimer(timer.id, { notificationSent: true });

        // Remover timer após 5 segundos
        setTimeout(() => {
          removeTimer(timer.id);
        }, 5000);
      }
      
      // Notificação de intervalo (a cada 30s)
      if (remaining > 0 && remaining % 30000 < 5000 && !timer.notificationSent) {
        const remainingSeconds = Math.ceil(remaining / 1000);
        await notifyIntervaloDescanso(timer.exerciseName || 'Exercício', remainingSeconds);
      }
    }

    // Limpar timers antigos
    await clearCompletedTimers();
  } catch (error) {
    console.error('Error checking timers:', error);
  }
}

// ============================================
// LEMBRETES PROGRAMADOS
// ============================================

let reminderCheckInterval: number | null = null;

export function startReminderPolling(): void {
  if (reminderCheckInterval) return;

  // Verificar a cada 1 minuto
  reminderCheckInterval = window.setInterval(async () => {
    await checkReminders();
  }, 60000);

  // Verificar imediatamente
  checkReminders();
}

export function stopReminderPolling(): void {
  if (reminderCheckInterval) {
    clearInterval(reminderCheckInterval);
    reminderCheckInterval = null;
  }
}

async function checkReminders(): Promise<void> {
  try {
    const preferences = await getPreferences();
    
    if (!preferences.lembretesTreino) return;

    const schedules = await getSchedules();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const schedule of schedules) {
      if (!schedule.enabled) continue;
      if (schedule.dayOfWeek !== currentDay) continue;
      if (schedule.time !== currentTime) continue;

      // Verificar se já enviou hoje
      const lastSent = await getLastReminderSent(schedule.id);
      
      if (lastSent === today) continue;

      // Enviar lembrete
      await notifyLembreteTreino();

      // Marcar como enviado hoje
      await setLastReminderSent(schedule.id, today);
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

export function initializeNotificationSystem(): void {
  // Iniciar polling de timers
  startTimerPolling();

  // Iniciar polling de lembretes
  startReminderPolling();

  // Limpar ao descarregar página
  window.addEventListener('beforeunload', () => {
    stopTimerPolling();
    stopReminderPolling();
  });

  console.log('[Notifications] System initialized');
}

// ============================================
// UTILITÁRIOS
// ============================================

export function playNotificationSound(): void {
  try {
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
  } catch (error) {
    console.error('Error playing sound:', error);
  }
}

export function vibrateDevice(pattern: number[] = [200, 100, 200]): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
