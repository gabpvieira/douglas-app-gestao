/**
 * Container para renderizar todas as notificações
 */

import { Notification } from './Notification';
import type { Notification as NotificationType, NotificationPosition } from './types';
import { cn } from '@/lib/utils';

interface NotificationContainerProps {
  notifications: NotificationType[];
  onDismiss: (id: string) => void;
}

const positionClasses: Record<NotificationPosition, string> = {
  'top-right': 'top-4 right-4',
  'top-left': 'top-4 left-4',
  'bottom-right': 'bottom-4 right-4',
  'bottom-left': 'bottom-4 left-4',
  'top-center': 'top-4 left-1/2 -translate-x-1/2',
};

export function NotificationContainer({ notifications, onDismiss }: NotificationContainerProps) {
  // Agrupar notificações por posição
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const position = notification.position;
    if (!acc[position]) {
      acc[position] = [];
    }
    acc[position].push(notification);
    return acc;
  }, {} as Record<NotificationPosition, NotificationType[]>);

  return (
    <>
      {Object.entries(groupedNotifications).map(([position, notifs]) => (
        <div
          key={position}
          className={cn(
            'fixed z-50 flex flex-col gap-3 pointer-events-none',
            positionClasses[position as NotificationPosition],
            'max-w-md w-full px-4 sm:px-0'
          )}
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          <div className="flex flex-col gap-3 overflow-y-auto pointer-events-auto">
            {notifs.map((notification) => (
              <Notification
                key={notification.id}
                notification={notification}
                onDismiss={onDismiss}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
