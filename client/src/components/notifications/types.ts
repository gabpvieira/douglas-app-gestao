/**
 * Tipos e interfaces para o sistema de notificações
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'create' | 'system';

export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center';

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface NotificationOptions {
  duration?: number;
  sound?: boolean;
  action?: NotificationAction;
  onClose?: () => void;
  position?: NotificationPosition;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  duration: number;
  sound: boolean;
  action?: NotificationAction;
  onClose?: () => void;
  position: NotificationPosition;
  createdAt: number;
}

export interface NotificationAPI {
  success: (title: string, description?: string, options?: NotificationOptions) => string;
  error: (title: string, description?: string, options?: NotificationOptions) => string;
  warning: (title: string, description?: string, options?: NotificationOptions) => string;
  info: (title: string, description?: string, options?: NotificationOptions) => string;
  create: (title: string, description?: string, options?: NotificationOptions) => string;
  system: (title: string, description?: string, options?: NotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
