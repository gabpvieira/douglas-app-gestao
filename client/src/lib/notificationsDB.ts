/**
 * IndexedDB Helper para Sistema de Notificações
 * Gerencia preferências, horários e timers ativos
 */

const DB_NAME = 'notifications-db';
const DB_VERSION = 1;

// Stores
const STORES = {
  PREFERENCES: 'preferences',
  SCHEDULES: 'schedules',
  TIMERS: 'active-timers',
  REMINDERS: 'reminder-history'
};

export interface NotificationPreferences {
  id: string;
  inicioTreino: boolean;
  lembretesTreino: boolean;
  pausasExercicios: boolean;
  intervalosDescanso: boolean;
  terminoPausa: boolean; // Sempre true
  updatedAt: number;
}

export interface TrainingSchedule {
  id: string;
  dayOfWeek: number; // 0-6 (domingo-sábado)
  time: string; // HH:MM
  enabled: boolean;
}

export interface ActiveTimer {
  id: string;
  type: 'rest' | 'workout';
  startTime: number;
  duration: number; // segundos
  exerciseName?: string;
  notificationSent: boolean;
  createdAt: number;
}

export interface ReminderHistory {
  scheduleId: string;
  lastSent: string; // Date string (YYYY-MM-DD)
}

// Inicializar banco de dados
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store de preferências
      if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
        db.createObjectStore(STORES.PREFERENCES, { keyPath: 'id' });
      }

      // Store de horários
      if (!db.objectStoreNames.contains(STORES.SCHEDULES)) {
        db.createObjectStore(STORES.SCHEDULES, { keyPath: 'id' });
      }

      // Store de timers ativos
      if (!db.objectStoreNames.contains(STORES.TIMERS)) {
        db.createObjectStore(STORES.TIMERS, { keyPath: 'id' });
      }

      // Store de histórico de lembretes
      if (!db.objectStoreNames.contains(STORES.REMINDERS)) {
        db.createObjectStore(STORES.REMINDERS, { keyPath: 'scheduleId' });
      }
    };
  });
}

// ============================================
// PREFERÊNCIAS
// ============================================

export async function getPreferences(): Promise<NotificationPreferences> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PREFERENCES], 'readonly');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.get('notification-preferences');

    request.onsuccess = () => {
      const result = request.result;
      
      // Retornar preferências padrão se não existir
      if (!result) {
        resolve({
          id: 'notification-preferences',
          inicioTreino: true,
          lembretesTreino: true,
          pausasExercicios: false,
          intervalosDescanso: true,
          terminoPausa: true,
          updatedAt: Date.now()
        });
      } else {
        resolve(result);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function savePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
  const db = await openDB();
  const current = await getPreferences();
  
  const updated: NotificationPreferences = {
    ...current,
    ...preferences,
    id: 'notification-preferences',
    terminoPausa: true, // Sempre true
    updatedAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PREFERENCES], 'readwrite');
    const store = transaction.objectStore(STORES.PREFERENCES);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// HORÁRIOS DE TREINO
// ============================================

export async function getSchedules(): Promise<TrainingSchedule[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SCHEDULES], 'readonly');
    const store = transaction.objectStore(STORES.SCHEDULES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function addSchedule(schedule: Omit<TrainingSchedule, 'id'>): Promise<TrainingSchedule> {
  const db = await openDB();
  
  const newSchedule: TrainingSchedule = {
    ...schedule,
    id: `schedule-${Date.now()}`
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SCHEDULES], 'readwrite');
    const store = transaction.objectStore(STORES.SCHEDULES);
    const request = store.add(newSchedule);

    request.onsuccess = () => resolve(newSchedule);
    request.onerror = () => reject(request.error);
  });
}

export async function updateSchedule(id: string, updates: Partial<TrainingSchedule>): Promise<void> {
  const db = await openDB();
  const schedules = await getSchedules();
  const schedule = schedules.find(s => s.id === id);
  
  if (!schedule) {
    throw new Error('Schedule not found');
  }

  const updated = { ...schedule, ...updates };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SCHEDULES], 'readwrite');
    const store = transaction.objectStore(STORES.SCHEDULES);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removeSchedule(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SCHEDULES], 'readwrite');
    const store = transaction.objectStore(STORES.SCHEDULES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// TIMERS ATIVOS
// ============================================

export async function getActiveTimers(): Promise<ActiveTimer[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMERS], 'readonly');
    const store = transaction.objectStore(STORES.TIMERS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function addTimer(timer: Omit<ActiveTimer, 'id' | 'createdAt'>): Promise<ActiveTimer> {
  const db = await openDB();
  
  const newTimer: ActiveTimer = {
    ...timer,
    id: `timer-${Date.now()}`,
    createdAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMERS], 'readwrite');
    const store = transaction.objectStore(STORES.TIMERS);
    const request = store.add(newTimer);

    request.onsuccess = () => resolve(newTimer);
    request.onerror = () => reject(request.error);
  });
}

export async function updateTimer(id: string, updates: Partial<ActiveTimer>): Promise<void> {
  const db = await openDB();
  const timers = await getActiveTimers();
  const timer = timers.find(t => t.id === id);
  
  if (!timer) {
    throw new Error('Timer not found');
  }

  const updated = { ...timer, ...updates };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMERS], 'readwrite');
    const store = transaction.objectStore(STORES.TIMERS);
    const request = store.put(updated);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function removeTimer(id: string): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.TIMERS], 'readwrite');
    const store = transaction.objectStore(STORES.TIMERS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function clearCompletedTimers(): Promise<void> {
  const timers = await getActiveTimers();
  const now = Date.now();
  
  for (const timer of timers) {
    const elapsed = now - timer.startTime;
    const duration = timer.duration * 1000;
    
    // Remover timers completados há mais de 5 minutos
    if (elapsed > duration + 300000) {
      await removeTimer(timer.id);
    }
  }
}

// ============================================
// HISTÓRICO DE LEMBRETES
// ============================================

export async function getLastReminderSent(scheduleId: string): Promise<string | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REMINDERS], 'readonly');
    const store = transaction.objectStore(STORES.REMINDERS);
    const request = store.get(scheduleId);

    request.onsuccess = () => {
      const result = request.result as ReminderHistory | undefined;
      resolve(result?.lastSent || null);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function setLastReminderSent(scheduleId: string, date: string): Promise<void> {
  const db = await openDB();
  
  const history: ReminderHistory = {
    scheduleId,
    lastSent: date
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.REMINDERS], 'readwrite');
    const store = transaction.objectStore(STORES.REMINDERS);
    const request = store.put(history);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ============================================
// UTILITÁRIOS
// ============================================

export async function clearAllData(): Promise<void> {
  const db = await openDB();
  
  const stores = [STORES.PREFERENCES, STORES.SCHEDULES, STORES.TIMERS, STORES.REMINDERS];
  
  for (const storeName of stores) {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export async function exportData(): Promise<string> {
  const preferences = await getPreferences();
  const schedules = await getSchedules();
  const timers = await getActiveTimers();
  
  return JSON.stringify({
    preferences,
    schedules,
    timers,
    exportedAt: new Date().toISOString()
  }, null, 2);
}
