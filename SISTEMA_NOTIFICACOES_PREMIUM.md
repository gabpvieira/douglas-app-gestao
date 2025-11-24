# Sistema de Notificações Premium

## 📋 Visão Geral

Sistema de notificações moderno, elegante e totalmente integrado para feedback visual e sonoro em toda a aplicação. Projetado para alta performance, consistência e extensibilidade.

## 🎨 Arquitetura

### Componentes Principais

1. **NotificationProvider** - Context provider para gerenciar estado global
2. **NotificationContainer** - Container para renderizar notificações
3. **Notification** - Componente individual de notificação
4. **useNotification** - Hook para disparar notificações
5. **SoundManager** - Gerenciador de efeitos sonoros
6. **NotificationQueue** - Sistema de fila para múltiplas notificações

### Estrutura de Arquivos

```
client/src/
├── components/
│   └── notifications/
│       ├── NotificationProvider.tsx
│       ├── NotificationContainer.tsx
│       ├── Notification.tsx
│       └── index.ts
├── hooks/
│   └── useNotification.ts
├── lib/
│   └── soundManager.ts
└── assets/
    └── sounds/
        ├── notification-in.mp3
        ├── notification-out.mp3
        ├── error.mp3
        ├── success.mp3
        └── create.mp3
```

## 🎯 Tipos de Notificações

### 1. Success (Sucesso)
- **Cor**: Verde (`#10b981`, `#059669`)
- **Ícone**: CheckCircle
- **Som**: success.mp3
- **Duração**: 4000ms
- **Uso**: Operações concluídas com sucesso

### 2. Error (Erro)
- **Cor**: Vermelho (`#ef4444`, `#dc2626`)
- **Ícone**: XCircle
- **Som**: error.mp3
- **Duração**: 6000ms
- **Uso**: Erros e falhas

### 3. Warning (Aviso)
- **Cor**: Amarelo (`#f59e0b`, `#d97706`)
- **Ícone**: AlertTriangle
- **Som**: notification-in.mp3
- **Duração**: 5000ms
- **Uso**: Avisos e alertas

### 4. Info (Informação)
- **Cor**: Azul (`#3b82f6`, `#2563eb`)
- **Ícone**: Info
- **Som**: notification-in.mp3
- **Duração**: 4000ms
- **Uso**: Informações gerais

### 5. Create (Criação)
- **Cor**: Roxo (`#8b5cf6`, `#7c3aed`)
- **Ícone**: Plus
- **Som**: create.mp3
- **Duração**: 4000ms
- **Uso**: Criação de novos elementos

### 6. System (Sistema)
- **Cor**: Cinza (`#6b7280`, `#4b5563`)
- **Ícone**: Logo da aplicação
- **Som**: notification-in.mp3
- **Duração**: 5000ms
- **Uso**: Notificações do sistema

## 🔊 Sistema de Sons

### Características
- **Web Audio API**: Sons sintetizados em tempo real (sem arquivos externos)
- **Zero latência**: Geração instantânea de áudio
- **Volume ajustável**: Padrão 0.3 (30%)
- **Fallback silencioso**: Funciona mesmo sem suporte a áudio
- **Gratuito**: Sem necessidade de bibliotecas ou arquivos de som

### Mapeamento de Sons Sintetizados

```typescript
{
  success: 'Duas notas ascendentes (C5 → E5) - Som alegre e positivo',
  error: 'Duas notas descendentes graves (E4 → C4) - Som de alerta',
  warning: 'Nota única com vibrato (A4) - Som de atenção',
  info: 'Nota única suave (G4) - Som neutro e informativo',
  create: 'Três notas ascendentes rápidas (C5 → E5 → G5) - Som de criação',
  system: 'Nota única grave (D4) - Som de sistema'
}
```

### Tecnologia
- **Osciladores**: Geram formas de onda (sine, square, triangle)
- **Envelope ADSR**: Attack, Decay, Sustain, Release para sons naturais
- **Frequências musicais**: Notas da escala temperada
- **Efeitos**: Vibrato para sons mais expressivos

## 💻 API de Uso

### Hook Principal

```typescript
const { notify } = useNotification();

// Notificação simples
notify.success('Operação concluída!');

// Notificação com título e descrição
notify.error('Erro ao salvar', 'Verifique os campos e tente novamente');

// Notificação com opções avançadas
notify.info('Nova mensagem', 'Você tem 3 mensagens não lidas', {
  duration: 8000,
  action: {
    label: 'Ver',
    onClick: () => navigate('/messages')
  }
});

// Notificação sem som
notify.warning('Atenção', 'Dados não salvos', { sound: false });

// Notificação persistente (não fecha automaticamente)
notify.system('Manutenção programada', 'Sistema será atualizado às 22h', {
  duration: Infinity
});
```

### Métodos Disponíveis

```typescript
interface NotificationAPI {
  success: (title: string, description?: string, options?: NotificationOptions) => string;
  error: (title: string, description?: string, options?: NotificationOptions) => string;
  warning: (title: string, description?: string, options?: NotificationOptions) => string;
  info: (title: string, description?: string, options?: NotificationOptions) => string;
  create: (title: string, description?: string, options?: NotificationOptions) => string;
  system: (title: string, description?: string, options?: NotificationOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}
```

### Opções de Configuração

```typescript
interface NotificationOptions {
  duration?: number;           // Duração em ms (Infinity = persistente)
  sound?: boolean;             // Tocar som (padrão: true)
  action?: {                   // Botão de ação
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;        // Callback ao fechar
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}
```

## 🎨 Design System

### Paleta de Cores (Dark Mode)

```css
/* Success */
--success-bg: #10b98120;
--success-border: #10b981;
--success-text: #10b981;

/* Error */
--error-bg: #ef444420;
--error-border: #ef4444;
--error-text: #ef4444;

/* Warning */
--warning-bg: #f59e0b20;
--warning-border: #f59e0b;
--warning-text: #f59e0b;

/* Info */
--info-bg: #3b82f620;
--info-border: #3b82f6;
--info-text: #3b82f6;

/* Create */
--create-bg: #8b5cf620;
--create-border: #8b5cf6;
--create-text: #8b5cf6;

/* System */
--system-bg: #6b728020;
--system-border: #6b7280;
--system-text: #e5e7eb;
```

### Animações

```css
/* Entrada */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Saída */
@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Progresso */
@keyframes progress {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
```

## 📱 Responsividade

### Desktop (> 768px)
- Posição: top-right
- Largura: 400px
- Espaçamento: 16px
- Máximo visível: 5 notificações

### Mobile (≤ 768px)
- Posição: top-center
- Largura: calc(100% - 32px)
- Espaçamento: 12px
- Máximo visível: 3 notificações

## 🚀 Performance

### Otimizações Implementadas

1. **Lazy Loading**: Sons carregados sob demanda
2. **Memoização**: Componentes otimizados com React.memo
3. **Virtual Queue**: Limite de notificações simultâneas
4. **Cleanup**: Remoção automática de notificações antigas
5. **RAF**: Animações usando requestAnimationFrame
6. **Debounce**: Prevenção de notificações duplicadas

### Métricas Alvo

- Tempo de renderização: < 16ms
- Memória por notificação: < 1KB
- Latência de som: < 50ms
- FPS durante animação: 60fps

## 🔧 Exemplos de Implementação

### 1. Formulário de Criação

```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await createFichaTreino(data);
    notify.create('Ficha criada!', 'A ficha de treino foi criada com sucesso');
    navigate('/admin/fichas-treino');
  } catch (error) {
    notify.error('Erro ao criar ficha', error.message);
  }
};
```

### 2. Upload de Arquivo

```typescript
const handleUpload = async (file: File) => {
  const uploadId = notify.info('Enviando arquivo...', 'Aguarde', { duration: Infinity });
  
  try {
    await uploadVideo(file);
    notify.dismiss(uploadId);
    notify.success('Upload concluído!', 'Vídeo enviado com sucesso');
  } catch (error) {
    notify.dismiss(uploadId);
    notify.error('Falha no upload', error.message);
  }
};
```

### 3. Operação em Lote

```typescript
const handleBulkDelete = async (ids: string[]) => {
  const deleteId = notify.warning(
    'Excluindo itens...',
    `${ids.length} itens serão excluídos`,
    { duration: Infinity }
  );
  
  try {
    await Promise.all(ids.map(id => deleteItem(id)));
    notify.dismiss(deleteId);
    notify.success('Itens excluídos', `${ids.length} itens foram removidos`);
  } catch (error) {
    notify.dismiss(deleteId);
    notify.error('Erro na exclusão', 'Alguns itens não puderam ser excluídos');
  }
};
```

### 4. Notificação com Ação

```typescript
const handleSave = async (data: FormData) => {
  try {
    const result = await saveData(data);
    notify.success('Dados salvos!', 'Alterações aplicadas com sucesso', {
      action: {
        label: 'Desfazer',
        onClick: () => undoChanges(result.id)
      }
    });
  } catch (error) {
    notify.error('Erro ao salvar', error.message);
  }
};
```

### 5. Notificação de Sistema

```typescript
// Em um useEffect global ou service worker
useEffect(() => {
  const handleSystemUpdate = (event: CustomEvent) => {
    notify.system(
      'Atualização disponível',
      'Uma nova versão está disponível. Recarregue a página.',
      {
        duration: Infinity,
        action: {
          label: 'Recarregar',
          onClick: () => window.location.reload()
        }
      }
    );
  };
  
  window.addEventListener('app:update', handleSystemUpdate);
  return () => window.removeEventListener('app:update', handleSystemUpdate);
}, []);
```

## 🎯 Boas Práticas

### ✅ Fazer

- Usar títulos curtos e descritivos (máx. 50 caracteres)
- Fornecer descrições claras quando necessário
- Usar o tipo correto de notificação para cada contexto
- Fechar notificações de loading após operação
- Adicionar ações quando houver próximo passo óbvio
- Testar em diferentes tamanhos de tela

### ❌ Evitar

- Notificações genéricas ("Erro", "Sucesso")
- Múltiplas notificações simultâneas do mesmo tipo
- Notificações persistentes sem ação
- Textos muito longos (> 200 caracteres)
- Sons em operações frequentes (ex: digitação)
- Notificações para operações triviais

## 🔐 Acessibilidade

### Recursos Implementados

- **ARIA Labels**: Todas as notificações têm role="alert"
- **Keyboard Navigation**: Tab para focar, Enter para ação, Escape para fechar
- **Screen Reader**: Anúncios automáticos de notificações
- **Contraste**: Cores atendem WCAG AA (4.5:1)
- **Foco Visível**: Indicadores claros de foco
- **Redução de Movimento**: Respeita prefers-reduced-motion

## 🧪 Testes

### Casos de Teste

1. Renderização de cada tipo de notificação
2. Fechamento automático após duração
3. Fechamento manual via botão
4. Múltiplas notificações simultâneas
5. Fila de notificações (máximo visível)
6. Sons tocam corretamente
7. Ações executam callbacks
8. Responsividade em mobile
9. Acessibilidade via teclado
10. Performance com 100+ notificações

## 🔄 Extensibilidade

### Adicionar Novo Tipo

```typescript
// 1. Adicionar tipo
type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'create' | 'system' | 'custom';

// 2. Adicionar configuração
const notificationConfig = {
  custom: {
    icon: CustomIcon,
    color: '#ff00ff',
    sound: 'custom.mp3',
    duration: 4000
  }
};

// 3. Adicionar método no hook
notify.custom = (title, description, options) => {
  return addNotification({ type: 'custom', title, description, ...options });
};
```

### Integração com Analytics

```typescript
const addNotification = (notification: Notification) => {
  // Adicionar notificação
  const id = generateId();
  setNotifications(prev => [...prev, { ...notification, id }]);
  
  // Enviar evento para analytics
  analytics.track('notification_shown', {
    type: notification.type,
    title: notification.title,
    timestamp: Date.now()
  });
  
  return id;
};
```

## 📊 Monitoramento

### Métricas Recomendadas

- Taxa de fechamento manual vs automático
- Tempo médio de visualização
- Notificações mais frequentes
- Taxa de clique em ações
- Erros de reprodução de som
- Performance de renderização

## 🎓 Referências

- [React Context API](https://react.dev/reference/react/useContext)
- [Framer Motion](https://www.framer.com/motion/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Radix UI Toast](https://www.radix-ui.com/primitives/docs/components/toast)

---

**Versão**: 1.0.0  
**Última atualização**: 2025-11-24  
**Autor**: Sistema de Notificações Premium
