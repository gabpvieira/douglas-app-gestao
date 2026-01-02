/**
 * Audio Manager - Sistema de alertas sonoros para treinos
 * 
 * Gerencia sons de alerta com volume alto e claro para:
 * - Fim de descanso entre séries
 * - Conclusão de exercícios
 * - Alertas importantes durante treino
 */

export type AlertSoundType = 'alarm' | 'bell' | 'beep';

export interface AudioSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundType: AlertSoundType;
  volume: number; // 0 a 1
}

// Configurações padrão
const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  soundType: 'alarm',
  volume: 0.8,
};

const STORAGE_KEY = 'workout_audio_settings';

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
    // Criar AudioContext (precisa de interação do usuário na primeira vez)
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    // Garantir que o contexto está rodando
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
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
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext = new AudioContextClass();
    
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    
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
