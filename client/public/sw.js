/**
 * Service Worker com suporte robusto para notificações em background
 * Versão: 3.0.0 - Sistema de alertas de treino corrigido
 * 
 * Correções:
 * - Eliminação de notificações duplicadas
 * - Som personalizado forte e identificável
 * - Controle centralizado de notificações
 * - Funciona com tela bloqueada e app em background
 */

var CACHE_VERSION = 'app-v5';
var STATIC_CACHE = 'static-' + CACHE_VERSION;
var DYNAMIC_CACHE = 'dynamic-' + CACHE_VERSION;

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
// SISTEMA DE TIMERS ROBUSTO
// ============================================

var activeTimers = {};
var TIMER_CHECK_INTERVAL = 1000;
var timerCheckIntervalId = null;

// Controle de notificações enviadas para evitar duplicação
var sentNotifications = {};

/**
 * Inicia o loop de verificação de timers
 */
function startTimerCheckLoop() {
  if (timerCheckIntervalId) return;
  
  console.log('[SW] Starting timer check loop');
  
  timerCheckIntervalId = setInterval(function() {
    checkAllTimers();
  }, TIMER_CHECK_INTERVAL);
}

/**
 * Para o loop de verificação
 */
function stopTimerCheckLoop() {
  if (timerCheckIntervalId) {
    clearInterval(timerCheckIntervalId);
    timerCheckIntervalId = null;
    console.log('[SW] Stopped timer check loop');
  }
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
    if (remaining <= 0 && !timer.notificationSent && !sentNotifications[timerId]) {
      console.log('[SW] Timer completed:', timerId);
      
      // Marcar como enviado ANTES de enviar para evitar race conditions
      timer.notificationSent = true;
      sentNotifications[timerId] = now;
      
      // Enviar notificação única
      sendTimerCompleteNotification(timer);
      
      // Notificar clientes (sem som - o SW já cuida disso)
      notifyClientsTimerComplete(timerId);
      
      // Limpar timer após 10 segundos
      setTimeout(function() {
        delete activeTimers[timerId];
        // Manter registro de notificação por 60 segundos para evitar duplicação
        setTimeout(function() {
          delete sentNotifications[timerId];
        }, 60000);
      }, 10000);
    }
  });
}

/**
 * Inicia um novo timer
 */
function handleStartTimer(timerData) {
  var timerId = timerData.id;
  
  // Se já existe um timer com esse ID e já foi notificado, ignorar
  if (sentNotifications[timerId]) {
    console.log('[SW] Timer already completed, ignoring:', timerId);
    return;
  }
  
  console.log('[SW] Starting timer:', timerId, 'duration:', timerData.duration);
  
  activeTimers[timerId] = {
    id: timerId,
    startTime: timerData.startTime || Date.now(),
    duration: timerData.duration,
    exerciseName: timerData.exerciseName,
    notificationSent: false,
    soundType: timerData.soundType || 'alarm'
  };
  
  startTimerCheckLoop();
}

/**
 * Cancela um timer
 */
function handleCancelTimer(timerId) {
  console.log('[SW] Canceling timer:', timerId);
  delete activeTimers[timerId];
  delete sentNotifications[timerId];
  
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
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
      }
      break;
      
    case 'CHECK_NOTIFICATION_SENT':
      // Verificar se notificação já foi enviada para um timer
      var wasSent = !!sentNotifications[data.timerId];
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ sent: wasSent });
      }
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
