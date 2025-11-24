/**
 * Provider de contexto para gerenciar notificações globalmente
 */

import { createContext, useCallback, useState, ReactNode } from 'react';
import { NotificationContainer } from './NotificationContainer';
import { soundManager } from '@/lib/soundManager';
import type {
  Notification,
  NotificationAPI,
  NotificationOptions,
  NotificationType,
} from './types';

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string;
  removeNotification: (id: string) => void;
  removeAllNotifications: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION = 'top-right';
const MAX_NOTIFICATIONS = 5;

export function NotificationProvider({
  children,
  maxNotifications = MAX_NOTIFICATIONS,
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>): string => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const createdAt = Date.now();

      const newNotification: Notification = {
        ...notification,
        id,
        createdAt,
      };

      // Tocar som se habilitado
      if (notification.sound) {
        soundManager.play(notification.type);
      }

      setNotifications((prev) => {
        // Limitar número de notificações visíveis
        const updated = [...prev, newNotification];
        if (updated.length > maxNotifications) {
          return updated.slice(-maxNotifications);
        }
        return updated;
      });

      return id;
    },
    [maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const removeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        removeAllNotifications,
      }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onDismiss={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

/**
 * Hook para criar API de notificações tipada
 */
export function createNotificationAPI(
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => string,
  removeNotification: (id: string) => void,
  removeAllNotifications: () => void
): NotificationAPI {
  const createNotifier = (type: NotificationType) => {
    return (
      title: string,
      description?: string,
      options: NotificationOptions = {}
    ): string => {
      const {
        duration = DEFAULT_DURATION,
        sound = true,
        action,
        onClose,
        position = DEFAULT_POSITION,
      } = options;

      return addNotification({
        type,
        title,
        description,
        duration,
        sound,
        action,
        onClose,
        position,
      });
    };
  };

  return {
    success: createNotifier('success'),
    error: createNotifier('error'),
    warning: createNotifier('warning'),
    info: createNotifier('info'),
    create: createNotifier('create'),
    system: createNotifier('system'),
    dismiss: removeNotification,
    dismissAll: removeAllNotifications,
  };
}
