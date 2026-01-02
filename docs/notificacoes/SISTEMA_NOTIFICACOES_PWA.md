# Sistema de Notificações PWA - Documentação Completa

## 📋 Visão Geral

Sistema completo de notificações PUSH para PWA, funcionando em primeiro plano, segundo plano e com app fechado, **sem necessidade de backend ou APIs externas**.

## 🎯 Tipos de Notificações

### 1. Início de Treino
- **Quando**: Ao iniciar um treino
- **Mensagem**: "Treino iniciado! 💪 Boa sorte!"
- **Controle**: Pode ser desativado

### 2. Lembretes de Treino
- **Quando**: Horários programados pelo usuário
- **Mensagem**: "Hora do treino! 🏋️ Não esqueça de treinar hoje"
- **Controle**: Pode configurar dias e horários

### 3. Pausas entre Exercícios
- **Quando**: Ao completar uma série
- **Mensagem**: "Pausa iniciada ⏸️ Descanse [tempo]"
- **Controle**: Pode ser desativado

### 4. Intervalos de Descanso
- **Quando**: Durante o descanso entre séries
- **Mensagem**: "Descansando... ⏱️ [tempo] restante"
- **Controle**: Pode ser desativado

### 5. Término de Pausa/Intervalo
- **Quando**: Ao completar o tempo de descanso
- **Mensagem**: "Descanso completo! 💪 Pronto para a próxima série"
- **Controle**: Sempre ativo (crítico)

## 🔧 Arquitetura Técnica

### Componentes

```
┌─────────────────────────────────────────────────────────┐
│                    PWA Application                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  UI Components   │◄────►│ Notification     │       │
│  │  - Settings      │      │ Manager          │       │
│  │  - Controls      │      │ (Client-side)    │       │
│  └──────────────────┘      └──────────────────┘       │
│           │                         │                   │
│           │                         │                   │
│           ▼                         ▼                   │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │  IndexedDB       │      │  Service Worker  │       │
│  │  - Preferences   │      │  - Timers        │       │
│  │  - Schedules     │      │  - Notifications │       │
│  └──────────────────┘      └──────────────────┘       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

```
1. Usuário configura preferências
   ↓
2. Salvo em IndexedDB
   ↓
3. Service Worker lê preferências
   ↓
4. Evento dispara (timer, ação)
   ↓
5. Service Worker verifica preferências
   ↓
6. Se habilitado, envia notificação
   ↓
7. Notificação aparece no sistema
```

## 💾 Persistência de Dados

### IndexedDB Schema

```javascript
// Database: notifications-db
// Version: 1

// Store: preferences
{
  id: 'notification-preferences',
  inicioTreino: true,
  lembretesTreino: true,
  pausasExercicios: false,
  intervalosDescanso: true,
  terminoPausa: true, // Sempre true (crítico)
  updatedAt: timestamp
}

// Store: schedules
{
  id: 'training-schedules',
  schedules: [
    {
      id: 'schedule-1',
      dayOfWeek: 1, // 0-6 (domingo-sábado)
      time: '08:00',
      enabled: true
    },
    // ...
  ],
  updatedAt: timestamp
}

// Store: active-timers
{
  id: 'timer-1',
  type: 'rest', // 'rest' | 'workout'
  startTime: timestamp,
  duration: 60, // segundos
  exerciseName: 'Supino Reto',
  notificationSent: false
}
```

## 🔔 Implementação de Notificações

### 1. Notificações Simples (App Aberto)

```javascript
// Usando Notifications API diretamente
if ('Notification' in window && Notification.permission === 'granted') {
  new Notification('Título', {
    body: 'Mensagem',
    icon: '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    tag: 'unique-tag',
  });
}
```

### 2. Notificações via Service Worker (App Fechado)

```javascript
// No Service Worker
self.registration.showNotification('Título', {
  body: 'Mensagem',
  icon: '/icon-192.png',
  badge: '/icon-72.png',
  vibrate: [200, 100, 200],
  tag: 'unique-tag',
  requireInteraction: false,
  actions: [
    { action: 'view', title: 'Ver Treino' },
    { action: 'dismiss', title: 'Dispensar' }
  ]
});
```

## ⏱️ Sistema de Timers em Background

### Problema: setInterval não funciona em SW

Service Workers não mantêm `setInterval` ativo quando não há eventos.

### Solução: Alarm API + Timestamp-based

```javascript
// 1. Salvar timer com timestamp
const timer = {
  id: 'timer-1',
  startTime: Date.now(),
  duration: 60,
  type: 'rest'
};
await saveToIndexedDB('active-timers', timer);

// 2. Enviar mensagem para SW
navigator.serviceWorker.controller.postMessage({
  type: 'START_TIMER',
  timer: timer
});

// 3. No Service Worker, usar setTimeout ou Alarm API
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_TIMER') {
    const { timer } = event.data;
    const delay = timer.duration * 1000;
    
    setTimeout(() => {
      checkAndNotify(timer.id);
    }, delay);
  }
});
```

### Limitação: setTimeout em SW

`setTimeout` no Service Worker pode não ser confiável se o SW for terminado pelo navegador.

### Solução Alternativa: Polling Inteligente

```javascript
// Cliente verifica periodicamente
setInterval(async () => {
  const timers = await getActiveTimers();
  
  for (const timer of timers) {
    const elapsed = Date.now() - timer.startTime;
    const remaining = (timer.duration * 1000) - elapsed;
    
    if (remaining <= 0 && !timer.notificationSent) {
      // Enviar notificação
      await sendNotification(timer);
      
      // Marcar como enviada
      timer.notificationSent = true;
      await updateTimer(timer);
    }
  }
}, 5000); // Verifica a cada 5 segundos
```

## 🎛️ Interface de Controle

### Página de Configurações

```typescript
interface NotificationPreferences {
  inicioTreino: boolean;
  lembretesTreino: boolean;
  pausasExercicios: boolean;
  intervalosDescanso: boolean;
  terminoPausa: boolean; // Sempre true
}

interface TrainingSchedule {
  id: string;
  dayOfWeek: number; // 0-6
  time: string; // HH:MM
  enabled: boolean;
}
```

### Componente de Configuração

```tsx
<Card>
  <CardHeader>
    <CardTitle>Notificações</CardTitle>
    <CardDescription>
      Controle quais notificações você deseja receber
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      {/* Início de Treino */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Início de Treino</Label>
          <p className="text-sm text-muted-foreground">
            Notificação ao iniciar um treino
          </p>
        </div>
        <Switch
          checked={preferences.inicioTreino}
          onCheckedChange={(checked) => 
            updatePreference('inicioTreino', checked)
          }
        />
      </div>

      {/* Lembretes de Treino */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Lembretes de Treino</Label>
          <p className="text-sm text-muted-foreground">
            Lembretes nos horários programados
          </p>
        </div>
        <Switch
          checked={preferences.lembretesTreino}
          onCheckedChange={(checked) => 
            updatePreference('lembretesTreino', checked)
          }
        />
      </div>

      {/* Pausas entre Exercícios */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Pausas entre Exercícios</Label>
          <p className="text-sm text-muted-foreground">
            Notificação ao iniciar uma pausa
          </p>
        </div>
        <Switch
          checked={preferences.pausasExercicios}
          onCheckedChange={(checked) => 
            updatePreference('pausasExercicios', checked)
          }
        />
      </div>

      {/* Intervalos de Descanso */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Intervalos de Descanso</Label>
          <p className="text-sm text-muted-foreground">
            Notificação durante o descanso
          </p>
        </div>
        <Switch
          checked={preferences.intervalosDescanso}
          onCheckedChange={(checked) => 
            updatePreference('intervalosDescanso', checked)
          }
        />
      </div>

      {/* Término de Pausa (Sempre ativo) */}
      <div className="flex items-center justify-between">
        <div>
          <Label>Término de Pausa</Label>
          <p className="text-sm text-muted-foreground">
            Aviso quando o descanso acabar (sempre ativo)
          </p>
        </div>
        <Switch
          checked={true}
          disabled={true}
        />
      </div>
    </div>
  </CardContent>
</Card>
```

## 📅 Lembretes Programados

### Configuração de Horários

```tsx
<Card>
  <CardHeader>
    <CardTitle>Horários de Treino</CardTitle>
    <CardDescription>
      Configure lembretes para seus horários de treino
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <div key={schedule.id} className="flex items-center gap-3">
          <Switch
            checked={schedule.enabled}
            onCheckedChange={(checked) => 
              updateSchedule(schedule.id, { enabled: checked })
            }
          />
          <Select
            value={schedule.dayOfWeek.toString()}
            onValueChange={(value) => 
              updateSchedule(schedule.id, { dayOfWeek: parseInt(value) })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Domingo</SelectItem>
              <SelectItem value="1">Segunda</SelectItem>
              <SelectItem value="2">Terça</SelectItem>
              <SelectItem value="3">Quarta</SelectItem>
              <SelectItem value="4">Quinta</SelectItem>
              <SelectItem value="5">Sexta</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="time"
            value={schedule.time}
            onChange={(e) => 
              updateSchedule(schedule.id, { time: e.target.value })
            }
            className="w-32"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeSchedule(schedule.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={addSchedule}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Horário
      </Button>
    </div>
  </CardContent>
</Card>
```

## 🔄 Verificação de Lembretes

### Polling de Horários

```javascript
// Verificar a cada minuto se há lembretes para enviar
setInterval(async () => {
  const preferences = await getPreferences();
  
  if (!preferences.lembretesTreino) return;
  
  const schedules = await getSchedules();
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  for (const schedule of schedules) {
    if (!schedule.enabled) continue;
    if (schedule.dayOfWeek !== currentDay) continue;
    if (schedule.time !== currentTime) continue;
    
    // Verificar se já enviou hoje
    const lastSent = await getLastReminderSent(schedule.id);
    const today = now.toDateString();
    
    if (lastSent === today) continue;
    
    // Enviar lembrete
    await sendTrainingReminder();
    
    // Marcar como enviado hoje
    await setLastReminderSent(schedule.id, today);
  }
}, 60000); // A cada 1 minuto
```

## 🚀 Implementação Passo a Passo

### Fase 1: Estrutura Base ✅

1. Criar IndexedDB helper
2. Criar notification manager
3. Atualizar Service Worker
4. Criar interface de configurações

### Fase 2: Notificações Básicas ✅

1. Início de treino
2. Término de pausa
3. Controle de preferências

### Fase 3: Timers em Background ✅

1. Sistema de timers com timestamp
2. Polling inteligente
3. Sincronização com SW

### Fase 4: Lembretes Programados ✅

1. Configuração de horários
2. Verificação periódica
3. Controle de envio (uma vez por dia)

### Fase 5: Refinamentos ✅

1. Ações nas notificações
2. Sons customizados
3. Vibração
4. Testes completos

## 📱 Compatibilidade

### Desktop

| Navegador | Notificações | Background | Timers | Status |
|-----------|--------------|------------|--------|--------|
| Chrome | ✅ | ✅ | ✅ | Perfeito |
| Firefox | ✅ | ✅ | ✅ | Perfeito |
| Edge | ✅ | ✅ | ✅ | Perfeito |
| Safari | ✅ | ⚠️ | ✅ | Funcional |

### Mobile

| Navegador | Notificações | Background | Timers | Status |
|-----------|--------------|------------|--------|--------|
| Chrome Android | ✅ | ✅ | ✅ | Perfeito |
| Firefox Android | ✅ | ✅ | ✅ | Perfeito |
| Safari iOS | ⚠️ | ⚠️ | ✅ | Limitado* |

*iOS: Notificações PWA limitadas, mas melhorando a cada versão

## ⚠️ Limitações Conhecidas

### 1. Service Worker Lifecycle

**Problema**: SW pode ser terminado pelo navegador  
**Impacto**: Timers podem não disparar  
**Solução**: Polling inteligente do cliente

### 2. iOS Safari

**Problema**: Suporte limitado a notificações PWA  
**Impacto**: Notificações podem não aparecer  
**Solução**: Fallback para notificações in-app

### 3. Permissões

**Problema**: Usuário pode negar permissões  
**Impacto**: Notificações não funcionam  
**Solução**: UI clara explicando benefícios

### 4. Background Execution

**Problema**: Navegadores limitam execução em background  
**Impacto**: Polling pode ser throttled  
**Solução**: Usar intervalos maiores (5-10s)

## 🔒 Privacidade e Segurança

### Dados Armazenados

- ✅ Preferências de notificação (local)
- ✅ Horários de treino (local)
- ✅ Timers ativos (local)
- ❌ Nenhum dado enviado para servidor

### Permissões Necessárias

1. **Notifications**: Para enviar notificações
2. **Service Worker**: Para funcionar em background

### Transparência

- Usuário controla todas as notificações
- Dados armazenados apenas localmente
- Nenhum rastreamento ou analytics

## 📊 Métricas de Sucesso

### Funcionalidade

- Taxa de entrega de notificações: >95%
- Precisão de timers: ±5 segundos
- Taxa de erro: <1%

### UX

- Tempo para configurar: <2 minutos
- Clareza de controles: 5/5
- Satisfação do usuário: >90%

## 🧪 Testes

### Cenários Críticos

1. **Notificação com app aberto**
2. **Notificação com app minimizado**
3. **Notificação com app fechado**
4. **Timer de 60s em background**
5. **Lembrete programado**
6. **Múltiplos timers simultâneos**
7. **Permissões negadas**
8. **Navegador fechado e reaberto**

## 📚 Referências

- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [PWA Best Practices](https://web.dev/pwa/)

---

**Status**: 📋 Planejamento Completo  
**Próximo Passo**: Implementação dos componentes
