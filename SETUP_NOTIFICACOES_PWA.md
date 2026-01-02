# Setup: Sistema de Notificações PWA

## 📋 Visão Geral

Sistema completo de notificações push com suporte a múltiplos dispositivos por aluno.

## 🗄️ Passo 1: Criar Tabela no Supabase

### Opção A: Via SQL Editor do Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `scripts/create-push-subscriptions-table.sql`
5. Clique em **Run** para executar

### Opção B: Via Linha de Comando

```bash
# Se você tem o Supabase CLI instalado
supabase db push
```

## 🔑 Passo 2: Gerar VAPID Keys

As VAPID keys são necessárias para autenticar as notificações push.

### Gerar Keys

```bash
# Instalar web-push globalmente
npm install -g web-push

# Gerar keys
web-push generate-vapid-keys
```

Isso vai gerar algo como:

```
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SzV95-p9L384gH3BVlKW-dWQhfzjFxdsedioUmqGHwgdsDFlRbvcqSw

Private Key:
p6YVD7t8HkABoez1CvVJ5bl7BnEdKUu5bSyVjyxMBh0
```

### Configurar Keys

1. **Public Key**: Adicionar em `client/src/pages/aluno/Notificacoes.tsx`
   ```typescript
   const VAPID_PUBLIC_KEY = 'SUA_PUBLIC_KEY_AQUI';
   ```

2. **Private Key**: Adicionar no `.env` (NUNCA commitar!)
   ```
   VAPID_PRIVATE_KEY=SUA_PRIVATE_KEY_AQUI
   VAPID_PUBLIC_KEY=SUA_PUBLIC_KEY_AQUI
   ```

## 📱 Passo 3: Configurar Service Worker

O Service Worker já está configurado em `client/public/sw.js`, mas você pode precisar adicionar o handler de push:

```javascript
// Adicionar em client/public/sw.js

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Nova notificação',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Notificação', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
```

## 🚀 Passo 4: Testar o Sistema

### 1. Acessar a Página de Notificações

```
http://localhost:5000/aluno/notificacoes
```

### 2. Fluxo de Teste

1. **Verificar Suporte**: A página deve mostrar se o navegador suporta notificações
2. **Solicitar Permissão**: Clicar em "Solicitar Permissão"
3. **Ativar Notificações**: Clicar em "Ativar Notificações Neste Dispositivo"
4. **Testar**: Clicar em "Enviar Notificação de Teste"
5. **Verificar**: Notificação deve aparecer no sistema

### 3. Verificar no Banco de Dados

```sql
-- Ver todas as inscrições
SELECT * FROM push_subscriptions;

-- Ver inscrições de um aluno específico
SELECT * FROM push_subscriptions WHERE aluno_id = 'ID_DO_ALUNO';

-- Ver dispositivos ativos
SELECT device_name, browser, os, enabled 
FROM push_subscriptions 
WHERE enabled = true;
```

## 🔧 Funcionalidades Implementadas

### ✅ Página de Configurações (`/aluno/notificacoes`)

- Status do navegador e permissões
- Lista de dispositivos inscritos
- Gerenciamento de preferências por dispositivo
- Teste de notificações
- Suporte a múltiplos dispositivos

### ✅ Hook `usePushNotifications`

- `usePushSubscriptions`: Buscar inscrições do aluno
- `useNotificationSupport`: Verificar suporte do navegador
- `useRequestNotificationPermission`: Solicitar permissão
- `useSubscribePush`: Inscrever dispositivo
- `useUnsubscribePush`: Cancelar inscrição
- `useUpdateNotificationPreferences`: Atualizar preferências
- `useTestNotification`: Enviar notificação de teste

### ✅ Tabela `push_subscriptions`

- Suporte a múltiplos dispositivos por aluno
- Metadados do dispositivo (tipo, navegador, OS)
- Preferências individuais por tipo de notificação
- RLS policies para segurança
- Limpeza automática de inscrições antigas

## 📊 Estrutura da Tabela

```sql
push_subscriptions
├── id (UUID)
├── aluno_id (UUID) → alunos.id
├── endpoint (TEXT, UNIQUE)
├── p256dh (TEXT)
├── auth (TEXT)
├── user_agent (TEXT)
├── device_name (TEXT)
├── device_type (TEXT) -- mobile, desktop, tablet
├── browser (TEXT) -- chrome, firefox, safari, edge
├── os (TEXT) -- android, ios, windows, macos, linux
├── enabled (BOOLEAN)
├── notifications_treino (BOOLEAN)
├── notifications_descanso (BOOLEAN)
├── notifications_agenda (BOOLEAN)
├── notifications_mensagens (BOOLEAN)
├── last_used_at (TIMESTAMP)
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 🔐 Segurança (RLS Policies)

### Alunos
- ✅ Podem ver apenas suas próprias inscrições
- ✅ Podem criar inscrições apenas para si mesmos
- ✅ Podem atualizar apenas suas próprias inscrições
- ✅ Podem deletar apenas suas próprias inscrições

### Admins
- ✅ Podem ver e gerenciar todas as inscrições

## 🎯 Tipos de Notificação Suportados

1. **Treino** (`notifications_treino`)
   - Lembretes de treino agendado
   - Novos treinos atribuídos

2. **Descanso** (`notifications_descanso`)
   - Fim do tempo de descanso entre séries
   - Já implementado no `RestTimer.tsx`

3. **Agenda** (`notifications_agenda`)
   - Lembretes de agendamentos
   - Confirmações de horário

4. **Mensagens** (`notifications_mensagens`)
   - Mensagens do treinador
   - Avisos importantes

## 📱 Compatibilidade

### Desktop
| Navegador | Suporte | Status |
|-----------|---------|--------|
| Chrome | ✅ | Completo |
| Firefox | ✅ | Completo |
| Edge | ✅ | Completo |
| Safari | ✅ | Completo |

### Mobile
| Navegador | Suporte | Status |
|-----------|---------|--------|
| Chrome Android | ✅ | Completo |
| Firefox Android | ✅ | Completo |
| Safari iOS | ⚠️ | Limitado* |

*iOS: Notificações web têm suporte limitado no Safari. Funciona melhor quando o app é instalado como PWA.

## 🧪 Testes

### Teste 1: Inscrição Básica
```
1. Acessar /aluno/notificacoes
2. Clicar em "Solicitar Permissão"
3. Permitir notificações
4. Clicar em "Ativar Notificações Neste Dispositivo"
5. Verificar que dispositivo aparece na lista
```

### Teste 2: Múltiplos Dispositivos
```
1. Fazer login no celular
2. Ativar notificações no celular
3. Fazer login no computador
4. Ativar notificações no computador
5. Verificar que ambos aparecem na lista
```

### Teste 3: Preferências
```
1. Desativar "Alertas de treino"
2. Verificar que switch está off
3. Recarregar página
4. Verificar que preferência foi salva
```

### Teste 4: Notificação de Teste
```
1. Clicar em "Enviar Notificação de Teste"
2. Verificar que notificação aparece
3. Clicar na notificação
4. Verificar que foca na aba
```

### Teste 5: Remover Dispositivo
```
1. Clicar em "Remover" em um dispositivo
2. Verificar que dispositivo é removido da lista
3. Verificar que não recebe mais notificações
```

## 🔄 Integração com RestTimer

O `RestTimer.tsx` já está configurado para enviar notificações quando o descanso completa. Para integrar com o sistema de push:

```typescript
// Em RestTimer.tsx, quando o timer completa:

// 1. Notificação local (já implementado)
sendNotification();

// 2. Push notification (adicionar)
// Isso será feito via backend quando implementarmos o envio de push
```

## 📝 Próximos Passos

### Backend para Envio de Push

Criar endpoint para enviar push notifications:

```typescript
// server/routes/notifications.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:seu-email@exemplo.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function sendPushNotification(
  subscription: PushSubscription,
  payload: any
) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (error) {
    console.error('Erro ao enviar push:', error);
  }
}
```

### Integrar com RestTimer

Quando o descanso completar, enviar push para todos os dispositivos do aluno:

```typescript
// Buscar inscrições ativas do aluno
const subscriptions = await supabase
  .from('push_subscriptions')
  .select('*')
  .eq('aluno_id', alunoId)
  .eq('enabled', true)
  .eq('notifications_descanso', true);

// Enviar push para cada dispositivo
for (const sub of subscriptions) {
  await sendPushNotification({
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  }, {
    title: 'Descanso Completo! 💪',
    body: `Pronto para a próxima série de ${exercicioNome}`,
    icon: '/icon-192.png',
    data: {
      url: '/aluno/treino/' + fichaAlunoId,
    },
  });
}
```

## 🆘 Solução de Problemas

### Notificações não aparecem?
- Verificar permissões do navegador
- Verificar se Service Worker está registrado
- Verificar console para erros

### Erro ao inscrever dispositivo?
- Verificar VAPID keys
- Verificar se Service Worker está ativo
- Verificar conexão com Supabase

### Dispositivo não aparece na lista?
- Verificar RLS policies
- Verificar se aluno_id está correto
- Verificar logs do Supabase

### Push não chega em background?
- Verificar se Service Worker tem handler de push
- Verificar se endpoint está correto
- Verificar logs do servidor

## 📚 Referências

- [Web Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web-push library](https://github.com/web-push-libs/web-push)
- [VAPID Protocol](https://tools.ietf.org/html/rfc8292)

---

**Status**: ✅ Frontend completo, aguardando configuração de VAPID keys e backend para envio de push.
