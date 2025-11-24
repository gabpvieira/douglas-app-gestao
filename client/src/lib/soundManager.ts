/**
 * Sound Manager - Gerenciador de efeitos sonoros para notificações
 * Usa Web Audio API para gerar sons sintetizados (sem arquivos externos)
 */

type SoundType = 'success' | 'error' | 'warning' | 'info' | 'create' | 'system';

class SoundManager {
  private audioContext: AudioContext | null = null;
  private volume: number = 0.3;
  private enabled: boolean = true;

  constructor() {
    this.initAudioContext();
  }

  /**
   * Inicializa o AudioContext (lazy loading)
   */
  private initAudioContext(): void {
    try {
      // AudioContext é criado apenas quando necessário
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new AudioContext();
      }
    } catch (error) {
      console.warn('Web Audio API not supported', error);
    }
  }

  /**
   * Garante que o AudioContext está ativo
   */
  private async ensureAudioContext(): Promise<AudioContext | null> {
    if (!this.audioContext) {
      this.initAudioContext();
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.warn('Failed to resume AudioContext', error);
      }
    }

    return this.audioContext;
  }

  /**
   * Cria um oscilador com envelope ADSR
   */
  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    attack: number = 0.01,
    decay: number = 0.1,
    sustain: number = 0.7,
    release: number = 0.1
  ): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Envelope ADSR
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + attack);
    gainNode.gain.linearRampToValueAtTime(this.volume * sustain, now + attack + decay);
    gainNode.gain.setValueAtTime(this.volume * sustain, now + duration - release);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  /**
   * Som de sucesso - Duas notas ascendentes (C5 -> E5)
   */
  private playSuccessSound(): void {
    this.createTone(523.25, 0.1, 'sine'); // C5
    setTimeout(() => {
      this.createTone(659.25, 0.15, 'sine'); // E5
    }, 80);
  }

  /**
   * Som de erro - Duas notas descendentes graves (E4 -> C4)
   */
  private playErrorSound(): void {
    this.createTone(329.63, 0.12, 'square', 0.01, 0.05, 0.8, 0.1); // E4
    setTimeout(() => {
      this.createTone(261.63, 0.2, 'square', 0.01, 0.05, 0.8, 0.15); // C4
    }, 100);
  }

  /**
   * Som de aviso - Nota única com vibrato (A4)
   */
  private playWarningSound(): void {
    if (!this.audioContext) return;

    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const vibrato = this.audioContext.createOscillator();
    const vibratoGain = this.audioContext.createGain();

    // Configurar vibrato
    vibrato.frequency.setValueAtTime(5, now); // 5Hz vibrato
    vibratoGain.gain.setValueAtTime(10, now); // Profundidade do vibrato
    vibrato.connect(vibratoGain);
    vibratoGain.connect(oscillator.frequency);

    // Configurar nota principal
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(440, now); // A4
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(this.volume, now + 0.02);
    gainNode.gain.linearRampToValueAtTime(this.volume * 0.6, now + 0.1);
    gainNode.gain.setValueAtTime(this.volume * 0.6, now + 0.25);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.35);

    vibrato.start(now);
    oscillator.start(now);
    vibrato.stop(now + 0.35);
    oscillator.stop(now + 0.35);
  }

  /**
   * Som de info - Nota única suave (G4)
   */
  private playInfoSound(): void {
    this.createTone(392, 0.15, 'sine', 0.02, 0.08, 0.7, 0.12); // G4
  }

  /**
   * Som de criação - Três notas ascendentes rápidas (C5 -> E5 -> G5)
   */
  private playCreateSound(): void {
    this.createTone(523.25, 0.08, 'sine'); // C5
    setTimeout(() => {
      this.createTone(659.25, 0.08, 'sine'); // E5
    }, 60);
    setTimeout(() => {
      this.createTone(783.99, 0.12, 'sine'); // G5
    }, 120);
  }

  /**
   * Som de sistema - Nota única grave (D4)
   */
  private playSystemSound(): void {
    this.createTone(293.66, 0.15, 'triangle', 0.02, 0.08, 0.7, 0.12); // D4
  }

  /**
   * Reproduz um som específico
   */
  async play(type: SoundType): Promise<void> {
    if (!this.enabled) return;

    const context = await this.ensureAudioContext();
    if (!context) return;

    try {
      switch (type) {
        case 'success':
          this.playSuccessSound();
          break;
        case 'error':
          this.playErrorSound();
          break;
        case 'warning':
          this.playWarningSound();
          break;
        case 'info':
          this.playInfoSound();
          break;
        case 'create':
          this.playCreateSound();
          break;
        case 'system':
          this.playSystemSound();
          break;
      }
    } catch (error) {
      console.warn(`Failed to play sound: ${type}`, error);
    }
  }

  /**
   * Define o volume (0.0 a 1.0)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Habilita ou desabilita sons
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Retorna se os sons estão habilitados
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Retorna o volume atual
   */
  getVolume(): number {
    return this.volume;
  }
}

// Singleton instance
export const soundManager = new SoundManager();
