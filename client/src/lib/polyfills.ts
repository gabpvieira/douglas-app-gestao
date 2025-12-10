/**
 * Polyfills e utilitários de compatibilidade para Chrome 109 (Windows 7)
 * Este arquivo deve ser importado no início da aplicação
 */

// ============================================
// IntersectionObserver Polyfill Check
// ============================================
export function supportsIntersectionObserver(): boolean {
  return 'IntersectionObserver' in window;
}

export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver | null {
  if (!supportsIntersectionObserver()) {
    console.warn('[Compat] IntersectionObserver not supported, using fallback');
    return null;
  }
  return new IntersectionObserver(callback, options);
}

// ============================================
// Web Share API Fallback
// ============================================
export function supportsWebShare(): boolean {
  return 'share' in navigator;
}

export async function shareContent(data: ShareData): Promise<boolean> {
  if (supportsWebShare()) {
    try {
      await navigator.share(data);
      return true;
    } catch (error) {
      console.warn('[Compat] Web Share failed:', error);
      return false;
    }
  }
  
  // Fallback: copiar para clipboard ou abrir em nova janela
  const shareText = data.url || data.text || '';
  if (shareText) {
    return copyToClipboard(shareText);
  }
  return false;
}

// ============================================
// Clipboard API Fallback
// ============================================
export function supportsClipboard(): boolean {
  return 'clipboard' in navigator && typeof navigator.clipboard.writeText === 'function';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (supportsClipboard()) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.warn('[Compat] Clipboard API failed, using fallback');
    }
  }
  
  // Fallback usando execCommand (deprecated mas funciona em browsers antigos)
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('[Compat] Clipboard fallback failed:', error);
    return false;
  }
}

// ============================================
// Intl.DateTimeFormat Fallback
// ============================================
export function supportsIntlDateTimeFormat(): boolean {
  try {
    new Intl.DateTimeFormat('pt-BR');
    return true;
  } catch {
    return false;
  }
}

export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  if (supportsIntlDateTimeFormat()) {
    try {
      return new Intl.DateTimeFormat('pt-BR', options).format(date);
    } catch (error) {
      console.warn('[Compat] Intl.DateTimeFormat failed, using fallback');
    }
  }
  
  // Fallback simples
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatTime(date: Date): string {
  if (supportsIntlDateTimeFormat()) {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.warn('[Compat] Intl.DateTimeFormat failed, using fallback');
    }
  }
  
  // Fallback simples
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ============================================
// Service Worker Registration
// ============================================
export function supportsServiceWorker(): boolean {
  return 'serviceWorker' in navigator && 'caches' in window;
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!supportsServiceWorker()) {
    console.warn('[Compat] Service Worker not supported');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('[SW] Service Worker registered:', registration.scope);
    
    // Verifica atualizações
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Nova versão disponível
            console.log('[SW] New version available');
            // Força atualização
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      }
    });
    
    return registration;
  } catch (error) {
    console.error('[SW] Registration failed:', error);
    return null;
  }
}

// ============================================
// PWA Install Prompt Fallback
// ============================================
let deferredPrompt: BeforeInstallPromptEvent | null = null;

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function setupInstallPrompt(): void {
  if ('BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[PWA] Install prompt captured');
    });
  } else {
    console.warn('[Compat] beforeinstallprompt not supported');
  }
}

export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

export async function installPWA(): Promise<boolean> {
  if (!deferredPrompt) {
    console.warn('[PWA] No install prompt available');
    return false;
  }
  
  try {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    return outcome === 'accepted';
  } catch (error) {
    console.error('[PWA] Install failed:', error);
    return false;
  }
}

// ============================================
// CSS Feature Detection
// ============================================
export function supportsCSSBackdropFilter(): boolean {
  return CSS.supports('backdrop-filter', 'blur(10px)') || 
         CSS.supports('-webkit-backdrop-filter', 'blur(10px)');
}

export function supportsCSSHas(): boolean {
  try {
    return CSS.supports('selector(:has(*))');
  } catch {
    return false;
  }
}

// ============================================
// Initialize Polyfills
// ============================================
export function initializePolyfills(): void {
  console.log('[Compat] Initializing polyfills for legacy browser support');
  
  // Log feature support
  console.log('[Compat] Feature support:', {
    serviceWorker: supportsServiceWorker(),
    intersectionObserver: supportsIntersectionObserver(),
    webShare: supportsWebShare(),
    clipboard: supportsClipboard(),
    intlDateTimeFormat: supportsIntlDateTimeFormat(),
    cssBackdropFilter: supportsCSSBackdropFilter(),
    cssHas: supportsCSSHas()
  });
  
  // Setup PWA install prompt
  setupInstallPrompt();
  
  // Register Service Worker
  if (supportsServiceWorker()) {
    registerServiceWorker();
  }
}
