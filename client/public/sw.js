/**
 * Service Worker com compatibilidade para Chrome 109 (Windows 7)
 * Versão: 1.1.0 - Atualização do ícone PWA
 */

var CACHE_VERSION = 'app-v3';
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

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function() {
        // Força ativação imediata
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              // Remove caches antigos
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map(function(cacheName) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        // Assume controle de todas as páginas imediatamente
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições (Network First com fallback para cache)
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  // Ignora requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora requisições para APIs externas e Supabase
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Ignora requisições de API
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then(function(response) {
        // Clona a resposta para cache
        var responseClone = response.clone();
        
        caches.open(DYNAMIC_CACHE)
          .then(function(cache) {
            cache.put(request, responseClone);
          });
        
        return response;
      })
      .catch(function() {
        // Fallback para cache se offline
        return caches.match(request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback para página principal se for navegação
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Listener para mensagens (atualização forçada)
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  // Gerenciamento de timers
  if (event.data && event.data.type === 'START_TIMER') {
    handleStartTimer(event.data.timer);
  }
  
  if (event.data && event.data.type === 'CANCEL_TIMER') {
    handleCancelTimer(event.data.timerId);
  }
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Listener para push events (notificações recebidas do servidor)
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
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ============================================
// SISTEMA DE NOTIFICAÇÕES E TIMERS
// ============================================

var activeTimers = {};

function handleStartTimer(timer) {
  console.log('[SW] Starting timer:', timer.id);
  
  var delay = timer.duration * 1000;
  
  // Usar setTimeout (pode não ser confiável se SW for terminado)
  var timeoutId = setTimeout(function() {
    sendTimerNotification(timer);
    delete activeTimers[timer.id];
  }, delay);
  
  activeTimers[timer.id] = {
    timeoutId: timeoutId,
    timer: timer
  };
}

function handleCancelTimer(timerId) {
  console.log('[SW] Canceling timer:', timerId);
  
  if (activeTimers[timerId]) {
    clearTimeout(activeTimers[timerId].timeoutId);
    delete activeTimers[timerId];
  }
}

function sendTimerNotification(timer) {
  console.log('[SW] Sending timer notification:', timer.id);
  
  var title = 'Descanso Completo! 💪';
  var body = timer.exerciseName 
    ? 'Pronto para a próxima série de ' + timer.exerciseName
    : 'Pronto para a próxima série';
  
  self.registration.showNotification(title, {
    body: body,
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'timer-' + timer.id,
    requireInteraction: false,
    actions: [
      { action: 'view', title: 'Ver Treino' },
      { action: 'dismiss', title: 'OK' }
    ],
    data: {
      type: 'timer-complete',
      timerId: timer.id,
      exerciseName: timer.exerciseName
    }
  });
}

// Listener para cliques em notificações (unificado para timers e push)
self.addEventListener('notificationclick', function(event) {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  // Determinar URL de destino
  var targetUrl = '/';
  
  if (event.notification.data) {
    if (event.notification.data.url) {
      targetUrl = event.notification.data.url;
    } else if (event.notification.data.type === 'timer-complete') {
      targetUrl = '/aluno/treinos';
    }
  }
  
  if (event.action === 'view' || !event.action) {
    // Abrir ou focar na aba do app
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Se já existe uma aba aberta, focar nela
          for (var i = 0; i < clientList.length; i++) {
            var client = clientList[i];
            if (client.url.indexOf(self.location.origin) !== -1 && 'focus' in client) {
              return client.focus().then(function() {
                // Navegar para URL específica se necessário
                if (targetUrl !== '/' && 'navigate' in client) {
                  return client.navigate(targetUrl);
                }
              });
            }
          }
          
          // Caso contrário, abrir nova aba
          if (clients.openWindow) {
            return clients.openWindow(targetUrl);
          }
        })
    );
  }
});
