/**
 * Hook de compatibilidade para browsers legados (Chrome 109)
 * Fornece acesso fácil aos utilitários de polyfill nos componentes React
 */

import { useCallback, useEffect, useState } from 'react';
import {
  supportsWebShare,
  shareContent,
  copyToClipboard,
  formatDate,
  formatTime,
  canInstallPWA,
  installPWA,
  supportsIntersectionObserver,
  createIntersectionObserver,
  supportsCSSBackdropFilter,
} from '@/lib/polyfills';

/**
 * Hook para compartilhamento com fallback
 */
export function useShare() {
  const canShare = supportsWebShare();

  const share = useCallback(async (data: ShareData): Promise<boolean> => {
    return shareContent(data);
  }, []);

  const copyLink = useCallback(async (url: string): Promise<boolean> => {
    return copyToClipboard(url);
  }, []);

  return { canShare, share, copyLink };
}

/**
 * Hook para clipboard com fallback
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    return success;
  }, []);

  return { copy, copied };
}

/**
 * Hook para formatação de datas com fallback
 */
export function useDateFormat() {
  const format = useCallback((date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatDate(dateObj, options);
  }, []);

  const formatTimeOnly = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return formatTime(dateObj);
  }, []);

  const formatDateTime = useCallback((date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
  }, []);

  return { format, formatTimeOnly, formatDateTime };
}

/**
 * Hook para instalação PWA com fallback
 */
export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsInstalled(isStandalone);
    
    // Verifica se pode instalar
    const checkInstall = () => {
      setCanInstall(canInstallPWA());
    };
    
    checkInstall();
    
    // Re-verifica quando o evento de instalação é capturado
    window.addEventListener('beforeinstallprompt', checkInstall);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', checkInstall);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    const success = await installPWA();
    if (success) {
      setIsInstalled(true);
      setCanInstall(false);
    }
    return success;
  }, []);

  return { canInstall, isInstalled, install };
}

/**
 * Hook para IntersectionObserver com fallback
 */
export function useIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const [observer, setObserver] = useState<IntersectionObserver | null>(null);
  const isSupported = supportsIntersectionObserver();

  useEffect(() => {
    if (!isSupported) {
      console.warn('[Compat] IntersectionObserver not supported');
      return;
    }

    const obs = createIntersectionObserver(callback, options);
    setObserver(obs);

    return () => {
      obs?.disconnect();
    };
  }, [callback, options, isSupported]);

  const observe = useCallback((element: Element | null) => {
    if (element && observer) {
      observer.observe(element);
    }
  }, [observer]);

  const unobserve = useCallback((element: Element | null) => {
    if (element && observer) {
      observer.unobserve(element);
    }
  }, [observer]);

  return { observe, unobserve, isSupported };
}

/**
 * Hook para verificar suporte a recursos CSS
 */
export function useCSSSupport() {
  const [support, setSupport] = useState({
    backdropFilter: false,
    cssHas: false,
  });

  useEffect(() => {
    setSupport({
      backdropFilter: supportsCSSBackdropFilter(),
      cssHas: CSS.supports?.('selector(:has(*))') ?? false,
    });
  }, []);

  return support;
}

/**
 * Hook para lazy loading de imagens com fallback
 */
export function useLazyImage(src: string) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoaded(true);
      setError(false);
    };
    
    img.onerror = () => {
      setError(true);
      setLoaded(false);
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { src: currentSrc, loaded, error };
}
