/**
 * Hook para usar o sistema de notificações
 */

import { useContext } from 'react';
import { NotificationContext, createNotificationAPI } from '@/components/notifications/NotificationProvider';
import type { NotificationAPI } from '@/components/notifications/types';

export function useNotification(): { notify: NotificationAPI } {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  const { addNotification, removeNotification, removeAllNotifications } = context;

  const notify = createNotificationAPI(
    addNotification,
    removeNotification,
    removeAllNotifications
  );

  return { notify };
}
