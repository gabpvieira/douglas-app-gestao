/**
 * Audio Manager - Sistema de alertas sonoros para treinos
 * 
 * Versão 3.0 - Correção de notificações duplicadas
 * 
 * Mudanças:
 * - Notificação centralizada no Service Worker (única fonte)
 * - Som local apenas como fallback quando SW não disponível
 * - Controle de duplicação via flags
 */

export type AlertSoundType = 'alarm' | 'bell' | 'beep';

export interface AudioSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundType: AlertSoundType;
  volume: number; // 0 a 1
  backgroundEnabled: boolean;
  useSystemNotification: boolean;
}

const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  soundType: 'alarm',
  volume: 0.9, // Volume alto por padrão
  backgroundEnabled: true,
  useSystemNotification: true,
};

const STORAGE_KEY = 'workout_audio_settings';

let globalAudioContext: AudioContext | null = null;

// Controle de alertas já disparados para evitar duplicação
const firedAlerts = new Map<string, number>();
const ALERT_COOLDOWN = 5000; // 5 segundos de cooldown entre alertas do mesmo timer

/**
 * Obter configurações de áudio do localStorage
 */
export function getAudioSettings(): AudioSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading audio settings:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Salvar configurações de áudio no localStorage
 */
export function saveAudioSettings(settings: Partial<AudioSettings>): void {
  try {
    const current = getAudioSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving audio settings:', error);
  }
}

/**
 * Obter ou criar AudioContext global
 */
function getAudioContext(): AudioContext {
  if (!globalAudioContext || globalAudioContext.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    globalAudioContext = new AudioContextClass();
  }
  return globalAudioContext;
}

/**
 * Garantir que AudioContext está ativo
 */
async function ensureAudioContextActive(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
  return ctx;
}

/**
 * Criar som de alarme forte e identificável
 * Estilo "REV" - som curto, forte e reconhecível
 */
function createAlarmSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  
  // Som de alarme forte: 4 bips rápidos com frequência crescente
  const frequencies = [880, 1100, 1320, 1540]; // Escala ascendente
  
  frequencies.forEach((freq, i) => {
    const startTime = now + (i * 0.15);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'square'; // Som mais "cortante" e perceptível
    
    // Volume alto com ataque rápido
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    gainNode.gain.setValueAtTime(volume, startTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.12);
  });
  
  // Segundo grupo após pausa curta (padrão reconhecível)
  setTimeout(() => {
    frequencies.forEach((freq, i) => {
      const ctx = getAudioContext();
      const startTime = ctx.currentTime + (i * 0.15);
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.01);
      gainNode.gain.setValueAtTime(volume, startTime + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.12);
    });
  }, 400);
}

/**
 * Criar som de sino
 */
function createBellSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const frequencies = [523, 659, 784, 1047]; // C5, E5, G5, C6 (acorde maior)
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    const harmVolume = volume * (1 - index * 0.15);
    gainNode.gain.setValueAtTime(harmVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
    
    oscillator.start(now);
    oscillator.stop(now + 1.0);
  });
}

/**
 * Criar som de bip forte
 */
function createBeepSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  
  // 3 bips fortes
  for (let i = 0; i < 3; i++) {
    const startTime = now + (i * 0.25);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1200;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.15);
  }
}

/**
 * Tocar som de alerta baseado nas configurações
 */
export async function playAlertSound(type?: AlertSoundType): Promise<void> {
  const settings = getAudioSettings();
  
  if (!settings.soundEnabled) {
    console.log('[AudioManager] Sound disabled by user settings');
    return;
  }
  
  try {
    const audioContext = await ensureAudioContextActive();
    const soundType = type || settings.soundType;
    const volume = settings.volume;
    
    switch (soundType) {
      case 'alarm':
        createAlarmSound(audioContext, volume);
        break;
      case 'bell':
        createBellSound(audioContext, volume);
        break;
      case 'beep':
        createBeepSound(audioContext, volume);
        break;
      default:
        createAlarmSound(audioContext, volume);
    }
    
    console.log(`[AudioManager] Played ${soundType} sound at volume ${volume}`);
  } catch (error) {
    console.error('[AudioManager] Error playing alert sound:', error);
  }
}

/**
 * Ativar vibração do dispositivo
 */
export function triggerVibration(pattern?: number | number[]): void {
  const settings = getAudioSettings();
  
  if (!settings.vibrationEnabled) {
    console.log('[AudioManager] Vibration disabled by user settings');
    return;
  }
  
  if (!navigator.vibrate) {
    console.log('[AudioManager] Vibration API not supported');
    return;
  }
  
  try {
    // Padrão forte e longo para ser perceptível
    const vibrationPattern = pattern || [400, 100, 400, 100, 400];
    navigator.vibrate(vibrationPattern);
    console.log('[AudioManager] Vibration triggered:', vibrationPattern);
  } catch (error) {
    console.error('[AudioManager] Error triggering vibration:', error);
  }
}

/**
 * Verificar se alerta já foi disparado recentemente (evita duplicação)
 */
function canFireAlert(timerId?: string): boolean {
  if (!timerId) return true;
  
  const lastFired = firedAlerts.get(timerId);
  if (!lastFired) return true;
  
  const elapsed = Date.now() - lastFired;
  return elapsed > ALERT_COOLDOWN;
}

/**
 * Marcar alerta como disparado
 */
function markAlertFired(timerId?: string): void {
  if (timerId) {
    firedAlerts.set(timerId, Date.now());
    
    // Limpar após cooldown
    setTimeout(() => {
      firedAlerts.delete(timerId);
    }, ALERT_COOLDOWN + 1000);
  }
}

/**
 * Tocar alerta completo (som + vibração)
 * Verifica duplicação antes de disparar
 */
export async function playCompleteAlert(soundType?: AlertSoundType, timerId?: string): Promise<void> {
  // Verificar se já disparamos alerta para este timer recentemente
  if (!canFireAlert(timerId)) {
    console.log('[AudioManager] Alert already fired recently for timer:', timerId);
    return;
  }
  
  markAlertFired(timerId);
  
  // Tocar som e vibração simultaneamente
  await Promise.all([
    playAlertSound(soundType),
    Promise.resolve(triggerVibration()),
  ]);
}

/**
 * Testar som (para página de configurações)
 */
export async function testSound(soundType: AlertSoundType, volume: number): Promise<void> {
  try {
    const audioContext = await ensureAudioContextActive();
    
    switch (soundType) {
      case 'alarm':
        createAlarmSound(audioContext, volume);
        break;
      case 'bell':
        createBellSound(audioContext, volume);
        break;
      case 'beep':
        createBeepSound(audioContext, volume);
        break;
    }
  } catch (error) {
    console.error('[AudioManager] Error testing sound:', error);
  }
}

/**
 * Testar vibração (para página de configurações)
 */
export function testVibration(): void {
  if (navigator.vibrate) {
    navigator.vibrate([400, 100, 400]);
  }
}

// ============================================
// SISTEMA DE TIMER COM SERVICE WORKER
// ============================================

/**
 * Iniciar timer no Service Worker
 */
export async function startBackgroundTimer(
  timerId: string,
  duration: number,
  exerciseName?: string
): Promise<boolean> {
  const settings = getAudioSettings();
  
  if (!settings.backgroundEnabled) {
    console.log('[AudioManager] Background timers disabled');
    return false;
  }
  
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('[AudioManager] Service Worker not available for background timer');
    return false;
  }
  
  try {
    navigator.serviceWorker.controller!.postMessage({
      type: 'START_TIMER',
      timer: {
        id: timerId,
        duration,
        exerciseName,
        startTime: Date.now(),
        soundType: settings.soundType
      }
    });
    
    console.log(`[AudioManager] Background timer started: ${timerId}, duration: ${duration}s`);
    return true;
  } catch (error) {
    console.error('[AudioManager] Error starting background timer:', error);
    return false;
  }
}

/**
 * Cancelar timer no Service Worker
 */
export function cancelBackgroundTimer(timerId: string): void {
  // Limpar registro de alerta disparado
  firedAlerts.delete(timerId);
  
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }
  
  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_TIMER',
      timerId
    });
    console.log(`[AudioManager] Background timer canceled: ${timerId}`);
  } catch (error) {
    console.error('[AudioManager] Error canceling background timer:', error);
  }
}

/**
 * Obter status de um timer do Service Worker
 */
export async function getBackgroundTimerStatus(timerId: string): Promise<{
  id: string;
  remaining: number;
  completed: boolean;
  exerciseName?: string;
  notificationSent?: boolean;
} | null> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return null;
  }
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    setTimeout(() => resolve(null), 1000);
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_TIMER_STATUS', timerId },
      [channel.port2]
    );
  });
}

/**
 * Verificar se notificação já foi enviada pelo SW
 */
export async function checkNotificationSentBySW(timerId: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return false;
  }
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data?.sent || false);
    };
    
    setTimeout(() => resolve(false), 500);
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'CHECK_NOTIFICATION_SENT', timerId },
      [channel.port2]
    );
  });
}

/**
 * Listener para mensagens do Service Worker
 * NÃO dispara som automaticamente - deixa o SW cuidar disso
 */
export function setupServiceWorkerListener(
  onTimerComplete?: (timerId: string, notificationSentBySW: boolean) => void,
  onNotificationClicked?: (action: string, data: any) => void
): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }
  
  const handler = (event: MessageEvent) => {
    const { type, timerId, action, data, notificationSentBySW } = event.data || {};
    
    if (type === 'TIMER_COMPLETE' && onTimerComplete) {
      console.log('[AudioManager] Timer complete from SW:', timerId, 'notification sent:', notificationSentBySW);
      
      // Apenas notificar o componente - NÃO tocar som aqui
      // O SW já enviou a notificação com som
      onTimerComplete(timerId, notificationSentBySW || false);
    }
    
    if (type === 'NOTIFICATION_CLICKED' && onNotificationClicked) {
      onNotificationClicked(action, data);
    }
  };
  
  navigator.serviceWorker.addEventListener('message', handler);
  
  return () => {
    navigator.serviceWorker.removeEventListener('message', handler);
  };
}

/**
 * Verificar se o navegador suporta notificações em background
 */
export function supportsBackgroundNotifications(): boolean {
  return (
    'serviceWorker' in navigator &&
    'Notification' in window &&
    'PushManager' in window
  );
}

/**
 * Verificar permissão de notificação
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Solicitar permissão de notificação
 */
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  
  if (Notification.permission === 'granted') {
    return 'granted';
  }
  
  if (Notification.permission === 'denied') {
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

/**
 * Enviar notificação de teste via Service Worker
 */
export async function sendTestNotification(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification('🔔 Teste de Notificação', {
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      tag: 'test-notification',
      requireInteraction: false,
      vibrate: [200, 100, 200],
    });
    
    return true;
  } catch (error) {
    console.error('[AudioManager] Error sending test notification:', error);
    return false;
  }
}

/**
 * Inicializar sistema de notificações de treino
 * Deve ser chamado quando o app inicia
 */
export async function initializeWorkoutNotifications(): Promise<void> {
  console.log('[AudioManager] Initializing workout notification system');
  
  // Verificar suporte
  if (!('serviceWorker' in navigator)) {
    console.warn('[AudioManager] Service Worker not supported');
    return;
  }
  
  try {
    // Aguardar SW estar pronto
    const registration = await navigator.serviceWorker.ready;
    console.log('[AudioManager] Service Worker ready:', registration.active?.state);
    
    // Solicitar permissão de notificação se necessário
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      console.log('[AudioManager] Notification permission:', permission);
    }
    
    // Enviar comando para restaurar timers do IndexedDB (caso SW tenha reiniciado)
    if (registration.active) {
      registration.active.postMessage({ type: 'RESTORE_TIMERS' });
    }
    
    // Iniciar keep-alive
    const settings = getAudioSettings();
    if (settings.backgroundEnabled) {
      startKeepAlive();
    }
    
    console.log('[AudioManager] Workout notification system initialized');
  } catch (error) {
    console.error('[AudioManager] Error initializing notification system:', error);
  }
}

/**
 * Verificar saúde do sistema de notificações
 */
export async function checkNotificationSystemHealth(): Promise<{
  swReady: boolean;
  swResponsive: boolean;
  notificationPermission: NotificationPermission | 'unsupported';
  activeTimers: number;
  loopRunning: boolean;
}> {
  const result = {
    swReady: false,
    swResponsive: false,
    notificationPermission: getNotificationPermission(),
    activeTimers: 0,
    loopRunning: false
  };
  
  if (!('serviceWorker' in navigator)) {
    return result;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    result.swReady = !!registration.active;
    
    if (registration.active) {
      const response = await sendPingWithTimeout(2000);
      if (response) {
        result.swResponsive = true;
        result.activeTimers = response.activeTimers || 0;
        result.loopRunning = response.loopRunning || false;
      }
    }
  } catch (error) {
    console.error('[AudioManager] Error checking system health:', error);
  }
  
  return result;
}

/**
 * Manter Service Worker ativo (ping periódico com verificação de saúde)
 */
let keepAliveInterval: number | null = null;
let lastPongTime: number = 0;
let missedPongs: number = 0;
const MAX_MISSED_PONGS = 3;

export function startKeepAlive(): void {
  if (keepAliveInterval) return;
  
  const settings = getAudioSettings();
  if (!settings.backgroundEnabled) return;
  
  lastPongTime = Date.now();
  missedPongs = 0;
  
  // Ping a cada 10 segundos para manter SW ativo (mais frequente)
  keepAliveInterval = window.setInterval(async () => {
    if (!navigator.serviceWorker?.controller) {
      console.log('[AudioManager] SW not available, attempting to restore');
      await attemptSWRestore();
      return;
    }
    
    try {
      const response = await sendPingWithTimeout(2000);
      
      if (response) {
        lastPongTime = Date.now();
        missedPongs = 0;
        
        // Verificar se o loop de timers está rodando quando deveria
        if (response.activeTimers > 0 && !response.loopRunning) {
          console.log('[AudioManager] Timer loop stalled, forcing check');
          navigator.serviceWorker.controller?.postMessage({ type: 'FORCE_CHECK_TIMERS' });
        }
      } else {
        missedPongs++;
        console.warn('[AudioManager] Missed pong', missedPongs, '/', MAX_MISSED_PONGS);
        
        if (missedPongs >= MAX_MISSED_PONGS) {
          console.error('[AudioManager] SW unresponsive, attempting restore');
          await attemptSWRestore();
        }
      }
    } catch (error) {
      console.error('[AudioManager] Keep-alive error:', error);
      missedPongs++;
    }
  }, 10000);
  
  console.log('[AudioManager] Keep-alive started for Service Worker (10s interval)');
}

/**
 * Enviar ping com timeout
 */
async function sendPingWithTimeout(timeout: number): Promise<{
  type: string;
  timestamp: number;
  activeTimers: number;
  loopRunning: boolean;
} | null> {
  if (!navigator.serviceWorker?.controller) return null;
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    const timeoutId = setTimeout(() => resolve(null), timeout);
    
    channel.port1.onmessage = (event) => {
      clearTimeout(timeoutId);
      resolve(event.data);
    };
    
    navigator.serviceWorker.controller.postMessage({ type: 'PING' }, [channel.port2]);
  });
}

/**
 * Tentar restaurar conexão com SW
 */
async function attemptSWRestore(): Promise<void> {
  try {
    // Verificar se SW está registrado
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      // Forçar restauração de timers do IndexedDB
      registration.active.postMessage({ type: 'RESTORE_TIMERS' });
      console.log('[AudioManager] Sent RESTORE_TIMERS to SW');
    }
    
    missedPongs = 0;
  } catch (error) {
    console.error('[AudioManager] Failed to restore SW:', error);
  }
}

export function stopKeepAlive(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('[AudioManager] Keep-alive stopped');
  }
}
