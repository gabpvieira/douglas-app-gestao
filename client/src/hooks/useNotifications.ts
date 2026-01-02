/**
 * Hook customizado para gerenciar notificações
 * Integra com IndexedDB e Notification Manager
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getPreferences,
  savePreferences,
  getSchedules,
  addSchedule,
  updateSchedule,
  removeSchedule,
  type NotificationPreferences,
  type TrainingSchedule
} from '@/lib/notificationsDB';
import {
  requestNotificationPermission,
  hasNotificationPermission,
  notifyInicioTreino,
  notifyLembreteTreino,
  notifyPausaExercicio,
  notifyIntervaloDescanso,
  notifyTerminoPausa,
  startRestTimer,
  cancelTimer,
  initializeNotificationSystem,
  playNotificationSound,
  vibrateDevice
} from '@/lib/notificationManager';

export function useNotifications() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar preferências e horários
  useEffect(() => {
    loadData();
  }, []);

  // Inicializar sistema de notificações
  useEffect(() => {
    initializeNotificationSystem();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefs, scheds] = await Promise.all([
        getPreferences(),
        getSchedules()
      ]);
      
      setPreferences(prefs);
      setSchedules(scheds);
      setHasPermission(hasNotificationPermission());
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestPermission = useCallback(async () => {
    const permission = await requestNotificationPermission();
    setHasPermission(permission === 'granted');
    return permission;
  }, []);

  const updatePreference = useCallback(async (key: keyof NotificationPreferences, value: boolean) => {
    if (!preferences) return;
    
    const updated = { ...preferences, [key]: value };
    await savePreferences(updated);
    setPreferences(updated);
  }, [preferences]);

  const addNewSchedule = useCallback(async (schedule: Omit<TrainingSchedule, 'id'>) => {
    const newSchedule = await addSchedule(schedule);
    setSchedules([...schedules, newSchedule]);
    return newSchedule;
  }, [schedules]);

  const updateExistingSchedule = useCallback(async (id: string, updates: Partial<TrainingSchedule>) => {
    await updateSchedule(id, updates);
    setSchedules(schedules.map(s => s.id === id ? { ...s, ...updates } : s));
  }, [schedules]);

  const removeExistingSchedule = useCallback(async (id: string) => {
    await removeSchedule(id);
    setSchedules(schedules.filter(s => s.id !== id));
  }, [schedules]);

  return {
    // Estado
    preferences,
    schedules,
    hasPermission,
    loading,
    
    // Ações
    requestPermission,
    updatePreference,
    addSchedule: addNewSchedule,
    updateSchedule: updateExistingSchedule,
    removeSchedule: removeExistingSchedule,
    
    // Notificações
    notifyInicioTreino,
    notifyLembreteTreino,
    notifyPausaExercicio,
    notifyIntervaloDescanso,
    notifyTerminoPausa,
    
    // Timers
    startRestTimer,
    cancelTimer,
    
    // Utilitários
    playSound: playNotificationSound,
    vibrate: vibrateDevice,
    
    // Recarregar
    reload: loadData
  };
}
