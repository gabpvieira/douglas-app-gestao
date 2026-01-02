/**
 * Service Worker com suporte robusto para notificações em background
 * Versão: 2.0.0 - Sistema de alertas de treino melhorado
 * 
 * Funcionalidades:
 * - Notificações funcionam com tela bloqueada
 * - Timer baseado em timestamps (não depende de setTimeout)
 * - Som de alarme via notificação do sistema
 * - Compatível com Chrome 109+ (Windows 7)
 */

var CACHE_VERSION = 'app-v4';
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
  '/apple-touch-icon.png'
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
var TIMER_CHECK_INTERVAL = 1000; // Verificar a cada 1 segundo
var timerCheckIntervalId = null;

/**
 * Inicia o loop de verificação de timers
 * Usa timestamps para calcular tempo restante (funciona em background)
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
    
    // Timer completou
    if (remaining <= 0 && !timer.notificationSent) {
      console.log('[SW] Timer completed:', timerId);
      sendTimerCompleteNotification(timer);
      timer.notificationSent = true;
      
      // Remover timer após 5 segundos
      setTimeout(function() {
        delete activeTimers[timerId];
        notifyClientsTimerComplete(timerId);
      }, 5000);
    }
  });
}

/**
 * Inicia um novo timer
 */
function handleStartTimer(timerData) {
  console.log('[SW] Starting timer:', timerData.id, 'duration:', timerData.duration);
  
  activeTimers[timerData.id] = {
    id: timerData.id,
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
    exerciseName: timer.exerciseName
  };
}

// ============================================
// NOTIFICAÇÕES
// ============================================

/**
 * Envia notificação de timer completo
 * Usa requireInteraction e prioridade alta para funcionar com tela bloqueada
 */
function sendTimerCompleteNotification(timer) {
  console.log('[SW] Sending timer complete notification:', timer.id);
  
  var title = '💪 Descanso Completo!';
  var body = timer.exerciseName 
    ? 'Hora de voltar para ' + timer.exerciseName
    : 'Hora de voltar ao exercício!';
  
  var options = {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    tag: 'rest-timer-' + timer.id,
    renotify: true,
    requireInteraction: true, // Mantém notificação visível até interação
    vibrate: [300, 100, 300, 100, 300, 100, 300], // Vibração forte
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
    // Configurações para prioridade alta (Android)
    urgency: 'high',
    silent: false // Permite som do sistema
  };
  
  return self.registration.showNotification(title, options);
}

/**
 * Notifica clientes que timer completou
 */
function notifyClientsTimerComplete(timerId) {
  self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then(function(clients) {
      clients.forEach(function(client) {
        client.postMessage({
          type: 'TIMER_COMPLETE',
          timerId: timerId
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
      // Keep-alive ping
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ type: 'PONG', timestamp: Date.now() });
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
