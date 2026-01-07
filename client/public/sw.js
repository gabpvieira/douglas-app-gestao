/**
 * Service Worker com suporte robusto para notificações em background
 * Versão: 4.0.0 - Sistema de alertas de treino 100% confiável
 * 
 * Correções v4.0:
 * - Persistência de timers via IndexedDB (sobrevive restart do SW)
 * - Loop de verificação mais robusto com auto-recovery
 * - Keep-alive melhorado com múltiplas estratégias
 * - Fallback para setTimeout quando setInterval falha
 * - Logs detalhados para debug
 */

var CACHE_VERSION = 'app-v7';
var STATIC_CACHE = 'static-' + CACHE_VERSION;
var DYNAMIC_CACHE = 'dynamic-' + CACHE_VERSION;
var TIMER_DB_NAME = 'sw-timers-db';
var TIMER_STORE_NAME = 'active-timers';
var NOTIFICATION_STORE_NAME = 'sent-notifications';

// Assets estáticos para cache
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/icone-pwa.png',
  '/apple-touch-icon.png',
  '/sounds/workout-alert.mp3'
];

// ============================================
// INDEXEDDB PARA PERSISTÊNCIA DE TIMERS
// ============================================

var dbPromise = null;

function openTimerDB() {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise(function(resolve, reject) {
    var request = indexedDB.open(TIMER_DB_NAME, 2); // Versão 2 para nova store
    
    request.onerror = function() {
      console.error('[SW] IndexedDB error:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = function() {
      resolve(request.result);
    };
    
    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains(TIMER_STORE_NAME)) {
        db.createObjectStore(TIMER_STORE_NAME, { keyPath: 'id' });
      }
      // Nova store para rastrear notificações enviadas (persiste entre reinícios do SW)
      if (!db.objectStoreNames.contains(NOTIFICATION_STORE_NAME)) {
        db.createObjectStore(NOTIFICATION_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
  
  return dbPromise;
}

function saveTimerToDB(timer) {
  return openTimerDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(TIMER_STORE_NAME, 'readwrite');
      var store = tx.objectStore(TIMER_STORE_NAME);
      var request = store.put(timer);
      request.onsuccess = function() { resolve(); };
      request.onerror = function() { reject(request.error); };
    });
  }).catch(function(err) {
    console.error('[SW] Error saving timer to DB:', err);
  });
}

function removeTimerFromDB(timerId) {
  return openTimerDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(TIMER_STORE_NAME, 'readwrite');
      var store = tx.objectStore(TIMER_STORE_NAME);
      var request = store.delete(timerId);
      request.onsuccess = function() { resolve(); };
      request.onerror = function() { reject(request.error); };
    });
  }).catch(function(err) {
    console.error('[SW] Error removing timer from DB:', err);
  });
}

function loadTimersFromDB() {
  return openTimerDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(TIMER_STORE_NAME, 'readonly');
      var store = tx.objectStore(TIMER_STORE_NAME);
      var request = store.getAll();
      request.onsuccess = function() { resolve(request.result || []); };
      request.onerror = function() { reject(request.error); };
    });
  }).catch(function(err) {
    console.error('[SW] Error loading timers from DB:', err);
    return [];
  });
}

function clearAllTimersFromDB() {
  return openTimerDB().then(function(db) {
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(TIMER_STORE_NAME, 'readwrite');
      var store = tx.objectStore(TIMER_STORE_NAME);
      var request = store.clear();
      request.onsuccess = function() { resolve(); };
      request.onerror = function() { reject(request.error); };
    });
  }).catch(function(err) {
    console.error('[SW] Error clearing timers from DB:', err);
  });
}

// ============================================
// INSTALAÇÃO E ATIVAÇÃO
// ============================================

self.addEventListener('install', function(event) {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function() {
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] Cache failed:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map(function(cacheName) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        // Restaurar timers do IndexedDB após ativação
        return restoreTimersFromDB();
      })
      .then(function() {
        return self.clients.claim();
      })
  );
});

// ============================================
// FETCH HANDLER (Network First)
// ============================================

self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  if (request.method !== 'GET') return;
  
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith('/api/')) return;
  
  event.respondWith(
    fetch(request)
      .then(function(response) {
        var responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then(function(cache) {
          cache.put(request, responseClone);
        });
        return response;
      })
      .catch(function() {
        return caches.match(request).then(function(cachedResponse) {
          if (cachedResponse) return cachedResponse;
          if (request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});

// ============================================
// SISTEMA DE TIMERS ROBUSTO v5.0
// Correção: Notificações 100% confiáveis em múltiplos intervalos
// ============================================

var activeTimers = {};
var TIMER_CHECK_INTERVAL = 500; // Verificar a cada 500ms para maior precisão
var timerCheckIntervalId = null;
var timerCheckTimeoutId = null;
var lastCheckTime = 0;
var checkLoopRunning = false;

// Controle de notificações enviadas para evitar duplicação
// Agora com persistência via IndexedDB para sobreviver reinícios do SW
var sentNotifications = {};
var NOTIFICATION_STORE_NAME = 'sent-notifications';

// Carregar notificações enviadas do IndexedDB ao iniciar
function loadSentNotificationsFromDB() {
  return openTimerDB().then(function(db) {
    // Verificar se a store existe
    if (!db.objectStoreNames.contains(NOTIFICATION_STORE_NAME)) {
      return;
    }
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(NOTIFICATION_STORE_NAME, 'readonly');
      var store = tx.objectStore(NOTIFICATION_STORE_NAME);
      var request = store.getAll();
      request.onsuccess = function() {
        var results = request.result || [];
        var now = Date.now();
        results.forEach(function(item) {
          // Manter apenas notificações dos últimos 5 minutos
          if (now - item.timestamp < 300000) {
            sentNotifications[item.id] = item.timestamp;
          }
        });
        console.log('[SW] Loaded', Object.keys(sentNotifications).length, 'sent notifications from DB');
        resolve();
      };
      request.onerror = function() { resolve(); }; // Ignorar erros
    });
  }).catch(function(err) {
    console.warn('[SW] Error loading sent notifications:', err);
  });
}

// Salvar notificação enviada no IndexedDB
function saveSentNotificationToDB(timerId) {
  return openTimerDB().then(function(db) {
    // Verificar se a store existe
    if (!db.objectStoreNames.contains(NOTIFICATION_STORE_NAME)) {
      return;
    }
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(NOTIFICATION_STORE_NAME, 'readwrite');
      var store = tx.objectStore(NOTIFICATION_STORE_NAME);
      var request = store.put({ id: timerId, timestamp: Date.now() });
      request.onsuccess = function() { resolve(); };
      request.onerror = function() { resolve(); }; // Ignorar erros
    });
  }).catch(function(err) {
    console.warn('[SW] Error saving sent notification:', err);
  });
}

// Limpar notificações antigas do IndexedDB
function cleanOldNotificationsFromDB() {
  return openTimerDB().then(function(db) {
    if (!db.objectStoreNames.contains(NOTIFICATION_STORE_NAME)) {
      return;
    }
    return new Promise(function(resolve, reject) {
      var tx = db.transaction(NOTIFICATION_STORE_NAME, 'readwrite');
      var store = tx.objectStore(NOTIFICATION_STORE_NAME);
      var request = store.getAll();
      request.onsuccess = function() {
        var results = request.result || [];
        var now = Date.now();
        results.forEach(function(item) {
          // Remover notificações com mais de 5 minutos
          if (now - item.timestamp > 300000) {
            store.delete(item.id);
          }
        });
        resolve();
      };
      request.onerror = function() { resolve(); };
    });
  }).catch(function() {});
}

/**
 * Restaurar timers do IndexedDB após SW reiniciar
 */
function restoreTimersFromDB() {
  // Primeiro carregar notificações enviadas
  return loadSentNotificationsFromDB().then(function() {
    // Limpar notificações antigas
    return cleanOldNotificationsFromDB();
  }).then(function() {
    return loadTimersFromDB();
  }).then(function(timers) {
    var now = Date.now();
    var restoredCount = 0;
    
    timers.forEach(function(timer) {
      // Verificar se timer ainda é válido (não expirou há muito tempo)
      var elapsed = now - timer.startTime;
      var remaining = (timer.duration * 1000) - elapsed;
      
      // Se expirou há menos de 30 segundos E não foi notificado, ainda processar
      if (remaining > -30000 && !sentNotifications[timer.id]) {
        activeTimers[timer.id] = timer;
        restoredCount++;
        console.log('[SW] Restored timer from DB:', timer.id, 'remaining:', Math.ceil(remaining / 1000) + 's');
      } else if (sentNotifications[timer.id]) {
        // Timer já foi notificado, remover do DB
        console.log('[SW] Timer already notified, removing:', timer.id);
        removeTimerFromDB(timer.id);
      } else {
        // Timer muito antigo, remover do DB
        removeTimerFromDB(timer.id);
      }
    });
    
    if (restoredCount > 0) {
      console.log('[SW] Restored', restoredCount, 'timers from IndexedDB');
      startTimerCheckLoop();
    }
  });
}

/**
 * Inicia o loop de verificação de timers com múltiplas estratégias
 */
function startTimerCheckLoop() {
  if (checkLoopRunning) {
    console.log('[SW] Timer check loop already running');
    return;
  }
  
  checkLoopRunning = true;
  lastCheckTime = Date.now();
  console.log('[SW] Starting timer check loop');
  
  // Estratégia 1: setInterval (principal)
  if (timerCheckIntervalId) {
    clearInterval(timerCheckIntervalId);
  }
  timerCheckIntervalId = setInterval(function() {
    runTimerCheck();
  }, TIMER_CHECK_INTERVAL);
  
  // Estratégia 2: setTimeout recursivo (backup)
  scheduleNextCheck();
}

/**
 * Agenda próxima verificação via setTimeout (mais confiável em alguns navegadores)
 */
function scheduleNextCheck() {
  if (timerCheckTimeoutId) {
    clearTimeout(timerCheckTimeoutId);
  }
  
  if (!checkLoopRunning) return;
  
  timerCheckTimeoutId = setTimeout(function() {
    // Verificar se setInterval está funcionando
    var timeSinceLastCheck = Date.now() - lastCheckTime;
    
    // Se passou mais de 2 segundos desde última verificação, setInterval pode ter falhado
    if (timeSinceLastCheck > 2000) {
      console.log('[SW] setInterval may have stalled, running check via setTimeout');
      runTimerCheck();
    }
    
    // Reagendar
    if (checkLoopRunning && Object.keys(activeTimers).length > 0) {
      scheduleNextCheck();
    }
  }, TIMER_CHECK_INTERVAL * 2);
}

/**
 * Executa verificação de timers
 */
function runTimerCheck() {
  lastCheckTime = Date.now();
  checkAllTimers();
}

/**
 * Para o loop de verificação
 */
function stopTimerCheckLoop() {
  checkLoopRunning = false;
  
  if (timerCheckIntervalId) {
    clearInterval(timerCheckIntervalId);
    timerCheckIntervalId = null;
  }
  
  if (timerCheckTimeoutId) {
    clearTimeout(timerCheckTimeoutId);
    timerCheckTimeoutId = null;
  }
  
  console.log('[SW] Stopped timer check loop');
}

/**
 * Verifica todos os timers ativos
 */
function checkAllTimers() {
  var now = Date.now();
  var timerIds = Object.keys(activeTimers);
  
  if (timerIds.length === 0) {
    stopTimerCheckLoop();
    return;
  }
  
  timerIds.forEach(function(timerId) {
    var timer = activeTimers[timerId];
    if (!timer) return;
    
    var elapsed = now - timer.startTime;
    var remaining = (timer.duration * 1000) - elapsed;
    
    // Timer completou - verificar se já enviamos notificação
    // Verificação tripla: timer.notificationSent, sentNotifications em memória, e DB
    if (remaining <= 0 && !timer.notificationSent && !sentNotifications[timerId]) {
      console.log('[SW] Timer completed:', timerId, 'elapsed:', Math.floor(elapsed / 1000) + 's');
      
      // Marcar como enviado ANTES de enviar para evitar race conditions
      timer.notificationSent = true;
      sentNotifications[timerId] = now;
      
      // Persistir no DB para sobreviver reinícios
      saveTimerToDB(timer);
      saveSentNotificationToDB(timerId);
      
      // Enviar notificação única
      sendTimerCompleteNotification(timer);
      
      // Notificar clientes (sem som - o SW já cuida disso)
      notifyClientsTimerComplete(timerId);
      
      // Limpar timer após 10 segundos
      setTimeout(function() {
        delete activeTimers[timerId];
        removeTimerFromDB(timerId);
        
        // Manter registro de notificação por 5 minutos para evitar duplicação
        // (agora persistido no DB, então não precisa limpar da memória imediatamente)
        setTimeout(function() {
          delete sentNotifications[timerId];
        }, 300000); // 5 minutos
        
        // Verificar se ainda há timers ativos
        if (Object.keys(activeTimers).length === 0) {
          stopTimerCheckLoop();
        }
      }, 10000);
    }
  });
}

/**
 * Inicia um novo timer
 */
function handleStartTimer(timerData) {
  var timerId = timerData.id;
  
  // Se já existe um timer com esse ID e já foi notificado (em memória ou DB), ignorar
  if (sentNotifications[timerId]) {
    console.log('[SW] Timer already completed (memory), ignoring:', timerId);
    return;
  }
  
  // Verificar também se já existe um timer ativo com esse ID
  if (activeTimers[timerId] && activeTimers[timerId].notificationSent) {
    console.log('[SW] Timer already completed (active), ignoring:', timerId);
    return;
  }
  
  console.log('[SW] Starting timer:', timerId, 'duration:', timerData.duration + 's');
  
  var timer = {
    id: timerId,
    startTime: timerData.startTime || Date.now(),
    duration: timerData.duration,
    exerciseName: timerData.exerciseName,
    notificationSent: false,
    soundType: timerData.soundType || 'alarm'
  };
  
  activeTimers[timerId] = timer;
  
  // Persistir no IndexedDB
  saveTimerToDB(timer);
  
  startTimerCheckLoop();
  
  // Confirmar para o cliente que timer foi iniciado
  notifyClientsTimerStarted(timerId, timer.duration);
}

/**
 * Cancela um timer
 */
function handleCancelTimer(timerId) {
  console.log('[SW] Canceling timer:', timerId);
  delete activeTimers[timerId];
  delete sentNotifications[timerId];
  
  // Remover do IndexedDB
  removeTimerFromDB(timerId);
  
  if (Object.keys(activeTimers).length === 0) {
    stopTimerCheckLoop();
  }
}

/**
 * Retorna status de um timer
 */
function getTimerStatus(timerId) {
  var timer = activeTimers[timerId];
  if (!timer) return null;
  
  var now = Date.now();
  var elapsed = now - timer.startTime;
  var remaining = Math.max(0, (timer.duration * 1000) - elapsed);
  
  return {
    id: timer.id,
    remaining: Math.ceil(remaining / 1000),
    completed: remaining <= 0,
    exerciseName: timer.exerciseName,
    notificationSent: timer.notificationSent
  };
}

/**
 * Notifica clientes que timer foi iniciado
 */
function notifyClientsTimerStarted(timerId, duration) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'TIMER_STARTED',
          timerId: timerId,
          duration: duration
        });
      });
    });
}

// ============================================
// NOTIFICAÇÕES - FONTE ÚNICA
// ============================================

/**
 * Envia notificação de timer completo
 * ÚNICA fonte de notificação para evitar duplicação
 */
function sendTimerCompleteNotification(timer) {
  console.log('[SW] Sending timer complete notification:', timer.id);
  
  var title = '💪 Pausa finalizada';
  var body = 'Volte ao exercício' + (timer.exerciseName ? ': ' + timer.exerciseName : '!');
  
  var options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'rest-timer-complete', // Tag única para evitar múltiplas notificações
    renotify: true,
    requireInteraction: true,
    vibrate: [400, 100, 400, 100, 400, 100, 400], // Vibração forte e longa
    actions: [
      { action: 'continue', title: '▶️ Continuar' },
      { action: 'dismiss', title: '✓ OK' }
    ],
    data: {
      type: 'timer-complete',
      timerId: timer.id,
      exerciseName: timer.exerciseName,
      timestamp: Date.now()
    },
    // Som personalizado (se suportado pelo navegador)
    sound: '/sounds/workout-alert.mp3',
    // Prioridade alta para Android
    urgency: 'high',
    silent: false
  };
  
  return self.registration.showNotification(title, options);
}

/**
 * Notifica clientes que timer completou
 * Envia flag indicando que notificação já foi enviada pelo SW
 */
function notifyClientsTimerComplete(timerId) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'TIMER_COMPLETE',
          timerId: timerId,
          notificationSentBySW: true // Flag para evitar duplicação no frontend
        });
      });
    });
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================

self.addEventListener('push', function(event) {
  console.log('[SW] Push notification received');
  
  var data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.error('[SW] Error parsing push data:', e);
    data = {
      title: 'Nova Notificação',
      body: event.data ? event.data.text() : 'Você tem uma nova notificação'
    };
  }
  
  var title = data.title || 'Notificação';
  var options = {
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: data.vibrate || [200, 100, 200],
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    data: data.data || {},
    actions: data.actions || [],
    silent: false
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================
// NOTIFICATION CLICK HANDLER
// ============================================

self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  var targetUrl = '/aluno/treinos';
  
  if (event.notification.data) {
    if (event.notification.data.url) {
      targetUrl = event.notification.data.url;
    } else if (event.notification.data.type === 'timer-complete') {
      targetUrl = '/aluno/treinos';
    }
  }
  
  // Notificar clientes sobre o clique
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'NOTIFICATION_CLICKED',
          action: event.action,
          data: event.notification.data
        });
      });
    });
  
  if (event.action === 'dismiss') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
            return client.focus().then(function(focusedClient) {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(targetUrl);
              }
            });
          }
        }
        
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});

// ============================================
// MESSAGE HANDLER
// ============================================

self.addEventListener('message', function(event) {
  var data = event.data;
  
  if (!data || !data.type) return;
  
  console.log('[SW] Message received:', data.type);
  
  switch (data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'CLEAR_CACHE':
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      });
      break;
      
    case 'START_TIMER':
      handleStartTimer(data.timer);
      break;
      
    case 'CANCEL_TIMER':
      handleCancelTimer(data.timerId);
      break;
      
    case 'GET_TIMER_STATUS':
      var status = getTimerStatus(data.timerId);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage(status);
      }
      break;
      
    case 'GET_ALL_TIMERS':
      var allStatus = Object.keys(activeTimers).map(function(id) {
        return getTimerStatus(id);
      }).filter(Boolean);
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage(allStatus);
      }
      break;
      
    case 'PING':
      // Keep-alive ping - também verifica se há timers pendentes
      if (Object.keys(activeTimers).length > 0 && !checkLoopRunning) {
        console.log('[SW] PING detected stalled timer loop, restarting');
        startTimerCheckLoop();
      }
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ 
          type: 'PONG', 
          timestamp: Date.now(),
          activeTimers: Object.keys(activeTimers).length,
          loopRunning: checkLoopRunning
        });
      }
      break;
      
    case 'CHECK_NOTIFICATION_SENT':
      // Verificar se notificação já foi enviada para um timer
      var wasSent = !!sentNotifications[data.timerId];
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ sent: wasSent });
      }
      break;
      
    case 'FORCE_CHECK_TIMERS':
      // Forçar verificação imediata de timers
      console.log('[SW] Force checking timers');
      if (Object.keys(activeTimers).length > 0) {
        checkAllTimers();
      }
      break;
      
    case 'RESTORE_TIMERS':
      // Restaurar timers do IndexedDB
      restoreTimersFromDB();
      break;
  }
});

// ============================================
// PERIODIC SYNC (para manter SW ativo)
// ============================================

self.addEventListener('periodicsync', function(event) {
  if (event.tag === 'check-timers') {
    event.waitUntil(checkAllTimers());
  }
});

// ============================================
// BACKGROUND SYNC
// ============================================

self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-timers') {
    event.waitUntil(checkAllTimers());
  }
});

console.log('[SW] Service Worker loaded v' + CACHE_VERSION);
