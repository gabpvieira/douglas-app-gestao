# Sistema de Alertas em Segundo Plano

## 📋 Visão Geral

Sistema robusto de notificações para alertar o aluno quando o tempo de descanso terminar, funcionando mesmo com:
- App em segundo plano
- Tela bloqueada
- Usuário em outro app

## 🎯 Problemas Resolvidos (v3.0)

### Notificações Duplicadas
**Antes:** Duas notificações eram exibidas ao finalizar a pausa
**Causa:** Lógica duplicada entre UI (RestTimer) e Service Worker
**Solução:** Centralização do disparo no Service Worker como fonte única

### Som Fraco e Genérico
**Antes:** Som pouco perceptível e difícil de identificar
**Solução:** Som forte com padrão reconhecível (escala ascendente em 4 bips)

### Alarme não Funciona em Background
**Antes:** Som só tocava após clicar na notificação
**Solução:** Notificação do sistema com `requireInteraction: true` e vibração forte

## ✨ Arquitetura v3.0

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────────┐                                    │
│  │   RestTimer     │                                    │
│  │   Component     │                                    │
│  │                 │                                    │
│  │ - Inicia timer  │                                    │
│  │ - Escuta SW     │                                    │
│  │ - NÃO dispara   │                                    │
│  │   notificação   │                                    │
│  └────────┬────────┘                                    │
│           │ postMessage(START_TIMER)                    │
└───────────┼─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICE WORKER (sw.js) - FONTE ÚNICA       │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Timer Check Loop (1s interval)                     ││
│  │  - Calcula tempo via timestamps                     ││
│  │  - Verifica sentNotifications[] antes de disparar   ││
│  │  - ÚNICA fonte de showNotification()                ││
│  └─────────────────────────────────────────────────────┘│
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │  showNotification() - DISPARO ÚNICO                 ││
│  │  - tag: 'rest-timer-complete' (evita duplicação)    ││
│  │  - requireInteraction: true                         ││
│  │  - vibrate: [400, 100, 400, 100, 400, 100, 400]    ││
│  │  - Notifica clientes com flag notificationSentBySW  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🔧 Mecanismos Anti-Duplicação

### 1. Service Worker
```javascript
// Controle de notificações enviadas
var sentNotifications = {};

// Antes de enviar, verifica se já foi enviado
if (remaining <= 0 && !timer.notificationSent && !sentNotifications[timerId]) {
  timer.notificationSent = true;
  sentNotifications[timerId] = now;
  sendTimerCompleteNotification(timer);
}
```

### 2. AudioManager
```typescript
// Cooldown de 5 segundos entre alertas do mesmo timer
const firedAlerts = new Map<string, number>();
const ALERT_COOLDOWN = 5000;

function canFireAlert(timerId?: string): boolean {
  const lastFired = firedAlerts.get(timerId);
  if (!lastFired) return true;
  return Date.now() - lastFired > ALERT_COOLDOWN;
}
```

### 3. RestTimer Component
```typescript
// Refs para controle de estado
const alertFiredRef = useRef(false);
const swNotifiedRef = useRef(false);

// Só dispara som local se SW não notificou
if (!swNotifiedRef.current) {
  const swSent = await checkNotificationSentBySW(timerId);
  if (!swSent) {
    await playCompleteAlert(undefined, timerId);
  }
}
```

## 🔔 Notificação do Sistema

```javascript
{
  title: '💪 Pausa finalizada',
  body: 'Volte ao exercício: [nome]',
  tag: 'rest-timer-complete',  // Tag única - evita múltiplas notificações
  renotify: true,
  requireInteraction: true,    // Mantém visível até interação
  vibrate: [400, 100, 400, 100, 400, 100, 400],  // Vibração forte
  urgency: 'high',
  silent: false
}
```

## 🎵 Som Personalizado

O som de alarme usa Web Audio API com padrão reconhecível:

```typescript
// Escala ascendente em 4 bips (880Hz → 1540Hz)
const frequencies = [880, 1100, 1320, 1540];

// Repetido 2x com pausa de 400ms
// Total: ~1.5 segundos de som forte e identificável
```

**Características:**
- Forma de onda: `square` (mais cortante e perceptível)
- Volume padrão: 90%
- Padrão: 4 bips ascendentes, pausa, 4 bips ascendentes

## ⚠️ Limitações Conhecidas

### iOS / Safari
- Notificações em background requerem PWA instalado na home screen
- Não suporta vibração
- Service Worker pode ser terminado pelo sistema após ~30s em background
- Som pode não tocar com tela bloqueada (limitação do iOS)

### Android
- Otimização de bateria pode limitar notificações
- Fabricantes como Xiaomi, Huawei, Samsung têm restrições extras
- Recomendado: desativar otimização de bateria para o app

### PWA não Instalado
- Funcionalidade reduzida em navegador comum
- Recomendado: instalar como PWA para melhor experiência

### Desktop
- Vibração não suportada
- Notificações dependem das configurações do sistema

## 🧪 Como Testar

### 1. Teste de Notificação Única
```
1. Iniciar um treino
2. Completar uma série (inicia timer de descanso)
3. Aguardar timer completar
4. Verificar: APENAS UMA notificação aparece
```

### 2. Teste em Background
```
1. Iniciar treino e completar série
2. Minimizar o app ou trocar de aba
3. Aguardar timer completar
4. Verificar:
   - Notificação aparece
   - Som/vibração funciona (se suportado)
```

### 3. Teste com Tela Bloqueada
```
1. Iniciar treino e completar série
2. Bloquear a tela do dispositivo
3. Aguardar timer completar
4. Verificar se notificação aparece na tela de bloqueio
```

## 📊 Fluxo de Dados

```
1. Usuário completa série
   │
2. RestTimer monta
   │
   ├─▶ startBackgroundTimer() ──▶ SW: START_TIMER
   │
   └─▶ setupServiceWorkerListener()
   
3. Service Worker (FONTE ÚNICA)
   │
   ├─▶ Armazena timer com startTime
   │
   └─▶ Loop de verificação (1s)
       │
       └─▶ remaining = duration - (now - startTime)
           │
           └─▶ Se remaining <= 0 E !sentNotifications[id]:
               │
               ├─▶ sentNotifications[id] = true
               │
               ├─▶ showNotification() ← ÚNICA NOTIFICAÇÃO
               │
               └─▶ postMessage(TIMER_COMPLETE, notificationSentBySW: true)
           
4. Frontend recebe TIMER_COMPLETE
   │
   ├─▶ swNotifiedRef.current = true
   │
   └─▶ NÃO dispara som (SW já cuidou)
```

## 📚 Referências

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Data de Atualização:** Janeiro 2026  
**Versão:** 3.0  
**Status:** ✅ Implementado - Correção de duplicação
