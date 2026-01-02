/**
 * Audio Manager - Sistema de alertas sonoros para treinos
 * 
 * Gerencia sons de alerta com volume alto e claro para:
 * - Fim de descanso entre séries
 * - Conclusão de exercícios
 * - Alertas importantes durante treino
 * 
 * Versão 2.0 - Suporte a background e notificações do sistema
 */

export type AlertSoundType = 'alarm' | 'bell' | 'beep';

export interface AudioSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundType: AlertSoundType;
  volume: number; // 0 a 1
  backgroundEnabled: boolean; // Permitir execução em segundo plano
  useSystemNotification: boolean; // Usar notificação do sistema para som
}

// Configurações padrão
const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  soundType: 'alarm',
  volume: 0.8,
  backgroundEnabled: true,
  useSystemNotification: true,
};

const STORAGE_KEY = 'workout_audio_settings';

// AudioContext global para reutilização
let globalAudioContext: AudioContext | null = null;

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
 * Criar som de alarme usando Web Audio API
 * Som forte e claro, estilo alarme de celular
 */
function createAlarmSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const duration = 1.5; // 1.5 segundos
  
  // Criar três bips rápidos e fortes
  for (let i = 0; i < 3; i++) {
    const startTime = now + (i * 0.5);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frequência alta para ser mais perceptível
    oscillator.frequency.value = 1200;
    oscillator.type = 'square'; // Som mais "duro" e perceptível
    
    // Volume alto com fade out rápido
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.3);
  }
}

/**
 * Criar som de sino usando Web Audio API
 * Som agradável mas perceptível
 */
function createBellSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const duration = 1.2;
  
  // Criar harmônicos de sino
  const frequencies = [800, 1000, 1200];
  
  frequencies.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    // Volume decrescente para cada harmônico
    const harmVolume = volume * (1 - index * 0.2);
    gainNode.gain.setValueAtTime(harmVolume, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
    
    oscillator.start(now);
    oscillator.stop(now + duration);
  });
}

/**
 * Criar som de bip simples mas forte
 */
function createBeepSound(audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  
  // Dois bips fortes
  for (let i = 0; i < 2; i++) {
    const startTime = now + (i * 0.4);
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.4);
  }
}

/**
 * Tocar som de alerta baseado nas configurações
 */
export async function playAlertSound(type?: AlertSoundType): Promise<void> {
  const settings = getAudioSettings();
  
  if (!settings.soundEnabled) {
    console.log('Sound disabled by user settings');
    return;
  }
  
  try {
    const audioContext = await ensureAudioContextActive();
    const soundType = type || settings.soundType;
    const volume = settings.volume;
    
    // Tocar som baseado no tipo
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
    
    console.log(`Played ${soundType} sound at volume ${volume}`);
  } catch (error) {
    console.error('Error playing alert sound:', error);
  }
}

/**
 * Ativar vibração do dispositivo
 */
export function triggerVibration(pattern?: number | number[]): void {
  const settings = getAudioSettings();
  
  if (!settings.vibrationEnabled) {
    console.log('Vibration disabled by user settings');
    return;
  }
  
  if (!navigator.vibrate) {
    console.log('Vibration API not supported');
    return;
  }
  
  try {
    // Padrão padrão: vibração forte e perceptível
    const vibrationPattern = pattern || [300, 100, 300, 100, 300];
    navigator.vibrate(vibrationPattern);
    console.log('Vibration triggered:', vibrationPattern);
  } catch (error) {
    console.error('Error triggering vibration:', error);
  }
}

/**
 * Tocar alerta completo (som + vibração)
 */
export async function playCompleteAlert(soundType?: AlertSoundType): Promise<void> {
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
    console.error('Error testing sound:', error);
  }
}

/**
 * Testar vibração (para página de configurações)
 */
export function testVibration(): void {
  if (navigator.vibrate) {
    navigator.vibrate([300, 100, 300]);
  }
}

// ============================================
// SISTEMA DE TIMER COM SERVICE WORKER
// ============================================

/**
 * Iniciar timer no Service Worker
 * Funciona mesmo com tela bloqueada
 */
export async function startBackgroundTimer(
  timerId: string,
  duration: number,
  exerciseName?: string
): Promise<boolean> {
  const settings = getAudioSettings();
  
  if (!settings.backgroundEnabled) {
    console.log('Background timers disabled');
    return false;
  }
  
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    console.warn('Service Worker not available for background timer');
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
    
    console.log(`Background timer started: ${timerId}, duration: ${duration}s`);
    return true;
  } catch (error) {
    console.error('Error starting background timer:', error);
    return false;
  }
}

/**
 * Cancelar timer no Service Worker
 */
export function cancelBackgroundTimer(timerId: string): void {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return;
  }
  
  try {
    navigator.serviceWorker.controller.postMessage({
      type: 'CANCEL_TIMER',
      timerId
    });
    console.log(`Background timer canceled: ${timerId}`);
  } catch (error) {
    console.error('Error canceling background timer:', error);
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
} | null> {
  if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
    return null;
  }
  
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    
    channel.port1.onmessage = (event) => {
      resolve(event.data);
    };
    
    // Timeout de 1 segundo
    setTimeout(() => resolve(null), 1000);
    
    navigator.serviceWorker.controller.postMessage(
      { type: 'GET_TIMER_STATUS', timerId },
      [channel.port2]
    );
  });
}

/**
 * Listener para mensagens do Service Worker
 */
export function setupServiceWorkerListener(
  onTimerComplete?: (timerId: string) => void,
  onNotificationClicked?: (action: string, data: any) => void
): () => void {
  if (!('serviceWorker' in navigator)) {
    return () => {};
  }
  
  const handler = (event: MessageEvent) => {
    const { type, timerId, action, data } = event.data || {};
    
    if (type === 'TIMER_COMPLETE' && onTimerComplete) {
      // Tocar som local quando timer completa (backup)
      playCompleteAlert();
      onTimerComplete(timerId);
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
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Manter Service Worker ativo (ping periódico)
 */
let keepAliveInterval: number | null = null;

export function startKeepAlive(): void {
  if (keepAliveInterval) return;
  
  const settings = getAudioSettings();
  if (!settings.backgroundEnabled) return;
  
  // Ping a cada 20 segundos para manter SW ativo
  keepAliveInterval = window.setInterval(() => {
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'PING' });
    }
  }, 20000);
  
  console.log('Keep-alive started for Service Worker');
}

export function stopKeepAlive(): void {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log('Keep-alive stopped');
  }
}
