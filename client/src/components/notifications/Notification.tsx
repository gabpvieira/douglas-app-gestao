/**
 * Componente individual de notificação
 */

import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification as NotificationType } from './types';
import { cn } from '@/lib/utils';

interface NotificationProps {
  notification: NotificationType;
  onDismiss: (id: string) => void;
}

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  create: Plus,
  system: Info,
};

const colorMap = {
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500',
    text: 'text-green-500',
    progress: 'bg-green-500',
  },
  error: {
    bg: 'bg-red-500/10',
    border: 'border-red-500',
    text: 'text-red-500',
    progress: 'bg-red-500',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500',
    text: 'text-yellow-500',
    progress: 'bg-yellow-500',
  },
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500',
    text: 'text-blue-500',
    progress: 'bg-blue-500',
  },
  create: {
    bg: 'bg-purple-500/10',
    border: 'border-purple-500',
    text: 'text-purple-500',
    progress: 'bg-purple-500',
  },
  system: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500',
    text: 'text-gray-300',
    progress: 'bg-gray-500',
  },
};

export function Notification({ notification, onDismiss }: NotificationProps) {
  const [isExiting, setIsExiting] = useState(false);
  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  useEffect(() => {
    if (notification.duration === Infinity) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, notification.duration);

    return () => clearTimeout(timer);
  }, [notification.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
      notification.onClose?.();
    }, 300);
  };

  const handleAction = () => {
    notification.action?.onClick();
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={cn(
            'relative w-full max-w-md rounded-lg border-l-4 p-4 shadow-lg backdrop-blur-sm',
            colors.bg,
            colors.border,
            'bg-gray-900/95'
          )}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className={cn('flex-shrink-0 mt-0.5', colors.text)}>
              <Icon className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">
                {notification.title}
              </h3>
              {notification.description && (
                <p className="text-sm text-gray-400 leading-relaxed">
                  {notification.description}
                </p>
              )}

              {/* Action Button */}
              {notification.action && (
                <button
                  onClick={handleAction}
                  className={cn(
                    'mt-3 text-sm font-medium transition-colors',
                    colors.text,
                    'hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900',
                    `focus:ring-${notification.type}-500`
                  )}
                >
                  {notification.action.label}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-all focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/10"
              aria-label="Fechar notificação"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Bar */}
          {notification.duration !== Infinity && (
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: notification.duration / 1000, ease: 'linear' }}
              className={cn('absolute bottom-0 left-0 h-1 rounded-bl-lg', colors.progress)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
