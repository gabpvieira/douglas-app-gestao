# Sistema de Alertas em Segundo Plano

## 📋 Visão Geral

Sistema robusto de notificações para alertar o aluno quando o tempo de descanso terminar, funcionando mesmo com:
- App em segundo plano
- Tela bloqueada
- Telefone em modo de economia de energia

## 🎯 Problema Resolvido

**Antes:**
- Alertas dependiam de `setTimeout` em JavaScript
- Som não tocava com app minimizado
- Timer parava quando tela bloqueava
- Usuário perdia o aviso para voltar ao exercício

**Depois:**
- Timer baseado em timestamps (funciona em background)
- Notificações do sistema operacional
- Service Worker gerencia timers independentemente
- Alertas chegam mesmo com tela bloqueada

## ✨ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                      │
│  ┌─────────────────┐    ┌─────────────────────────────┐ │
│  │   RestTimer     │───▶│     audioManager.ts         │ │
│  │   Component     │    │  - playCompleteAlert()      │ │
│  └─────────────────┘    │  - startBackgroundTimer()   │ │
│                         │  - setupServiceWorkerListener│ │
│                         └──────────────┬──────────────┘ │
└────────────────────────────────────────┼────────────────┘
                                         │ postMessage
                                         ▼
┌─────────────────────────────────────────────────────────┐
│                  SERVICE WORKER (sw.js)                  │
│  ┌─────────────────────────────────────────────────────┐│
│  │  Timer Check Loop (1s interval)                     ││
│  │  - Calcula tempo restante via timestamps            ││
│  │  - Não depende de setTimeout                        ││
│  │  - Funciona mesmo com SW em background              ││
│  └─────────────────────────────────────────────────────┘│
│                         │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────────┐│
│  │  showNotification()                                 ││
│  │  - requireInteraction: true                         ││
│  │  - vibrate: [300, 100, 300, 100, 300]              ││
│  │  - Prioridade alta                                  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

## 🔧 Componentes Principais

### 1. Service Worker (`client/public/sw.js`)

**Responsabilidades:**
- Gerenciar timers ativos
- Verificar completude via timestamps
- Enviar notificações do sistema
- Funcionar independente da UI

**Mensagens suportadas:**
- `START_TIMER` - Inicia novo timer
- `CANCEL_TIMER` - Cancela timer existente
- `GET_TIMER_STATUS` - Retorna status de um timer
- `GET_ALL_TIMERS` - Lista todos timers ativos
- `PING` - Keep-alive para manter SW ativo

### 2. Audio Manager (`client/src/lib/audioManager.ts`)

**Novas funções:**
```typescript
// Iniciar timer no Service Worker
startBackgroundTimer(timerId, duration, exerciseName): Promise<boolean>

// Cancelar timer
cancelBackgroundTimer(timerId): void

// Obter status do timer
getBackgroundTimerStatus(timerId): Promise<TimerStatus | null>

// Configurar listener para eventos do SW
setupServiceWorkerListener(onComplete, onNotificationClicked): () => void

// Manter SW ativo
startKeepAlive(): void
stopKeepAlive(): void
```

**Novas configurações:**
```typescript
interface AudioSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundType: 'alarm' | 'bell' | 'beep';
  volume: number;
  backgroundEnabled: boolean;      // NOVO
  useSystemNotification: boolean;  // NOVO
}
```

### 3. RestTimer Component (`client/src/components/aluno/RestTimer.tsx`)

**Melhorias:**
- Usa timestamps para cálculo de tempo (não setTimeout)
- Inicia timer no Service Worker
- Escuta eventos de completude do SW
- Mantém SW ativo via keep-alive
- Fallback para notificação local

## 📱 Configurações do Usuário

**Página:** `/aluno/notificacoes`

**Nova seção "Alertas em Segundo Plano":**
- Status do suporte do navegador
- Status da permissão de notificação
- Toggle para ativar/desativar segundo plano
- Botão para testar notificação em background
- Instruções para otimizar funcionamento
- Aviso sobre limitações conhecidas

## 🔔 Notificação do Sistema

**Características:**
```javascript
{
  title: '💪 Descanso Completo!',
  body: 'Hora de voltar para [exercício]',
  icon: '/icon-192.png',
  badge: '/icon-72.png',
  tag: 'rest-timer-[id]',
  renotify: true,
  requireInteraction: true,  // Mantém visível
  vibrate: [300, 100, 300, 100, 300, 100, 300],
  actions: [
    { action: 'continue', title: '▶️ Continuar' },
    { action: 'dismiss', title: '✓ OK' }
  ]
}
```

## ⚠️ Limitações Conhecidas

### iOS/Safari
- Notificações em background requerem PWA instalado
- Não suporta vibração
- Service Worker pode ser terminado pelo sistema

### Android
- Otimização de bateria pode limitar notificações
- Alguns fabricantes (Xiaomi, Huawei) têm restrições extras
- Recomendado desativar otimização de bateria para o app

### Desktop
- Vibração não suportada
- Notificações dependem das configurações do sistema

## 🧪 Como Testar

### 1. Teste Básico
```
1. Acessar /aluno/notificacoes
2. Permitir notificações
3. Ativar "Execução em segundo plano"
4. Clicar "Testar Alerta em Segundo Plano"
5. Verificar se notificação aparece
```

### 2. Teste com Tela Bloqueada
```
1. Iniciar um treino
2. Completar uma série (inicia timer de descanso)
3. Bloquear a tela do dispositivo
4. Aguardar timer completar
5. Verificar se notificação aparece na tela de bloqueio
```

### 3. Teste em Background
```
1. Iniciar treino e completar série
2. Minimizar o app ou trocar de aba
3. Aguardar timer completar
4. Verificar se notificação aparece
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
   
3. Service Worker
   │
   ├─▶ Armazena timer com startTime
   │
   └─▶ Inicia loop de verificação (1s)
   
4. A cada segundo:
   │
   └─▶ remaining = duration - (now - startTime)
       │
       └─▶ Se remaining <= 0:
           │
           ├─▶ showNotification()
           │
           └─▶ postMessage(TIMER_COMPLETE)
           
5. Frontend recebe TIMER_COMPLETE
   │
   ├─▶ playCompleteAlert() (som + vibração)
   │
   └─▶ onComplete() (fecha timer)
```

## 🔐 Permissões Necessárias

1. **Notification** - Para enviar notificações do sistema
2. **Service Worker** - Para executar em background
3. **Vibration** - Para vibrar o dispositivo (opcional)

## 📚 Referências

- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notification API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Push Notifications - web.dev](https://web.dev/push-notifications-overview/)

---

**Data de Implementação:** Janeiro 2026  
**Versão:** 2.0  
**Status:** ✅ Implementado
