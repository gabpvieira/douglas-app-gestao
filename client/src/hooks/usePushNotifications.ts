import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface PushSubscription {
  id: string;
  aluno_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  user_agent?: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  enabled: boolean;
  notifications_treino: boolean;
  notifications_descanso: boolean;
  notifications_agenda: boolean;
  notifications_mensagens: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
}

interface DeviceInfo {
  userAgent: string;
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  browser: string;
  os: string;
}

// Detectar informações do dispositivo
const getDeviceInfo = (): DeviceInfo => {
  const ua = navigator.userAgent;
  
  // Detectar tipo de dispositivo
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(ua);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';
  
  // Detectar navegador
  let browser = 'unknown';
  if (ua.includes('Chrome')) browser = 'chrome';
  else if (ua.includes('Firefox')) browser = 'firefox';
  else if (ua.includes('Safari')) browser = 'safari';
  else if (ua.includes('Edge')) browser = 'edge';
  
  // Detectar OS
  let os = 'unknown';
  if (ua.includes('Android')) os = 'android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'ios';
  else if (ua.includes('Windows')) os = 'windows';
  else if (ua.includes('Mac')) os = 'macos';
  else if (ua.includes('Linux')) os = 'linux';
  
  // Nome do dispositivo
  const deviceName = `${browser.charAt(0).toUpperCase() + browser.slice(1)} em ${os.charAt(0).toUpperCase() + os.slice(1)}`;
  
  return {
    userAgent: ua,
    deviceName,
    deviceType,
    browser,
    os,
  };
};

// Buscar todas as inscrições do aluno
export function usePushSubscriptions(alunoId?: string) {
  return useQuery({
    queryKey: ['push-subscriptions', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('aluno_id', alunoId!)
        .order('last_used_at', { ascending: false });
      
      if (error) throw error;
      return data as PushSubscription[];
    },
    enabled: !!alunoId,
  });
}

// Verificar se navegador suporta notificações
export function useNotificationSupport() {
  return {
    supported: 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window,
    permission: 'Notification' in window ? Notification.permission : 'denied',
  };
}

// Solicitar permissão de notificação
export function useRequestNotificationPermission() {
  return useMutation({
    mutationFn: async () => {
      if (!('Notification' in window)) {
        throw new Error('Este navegador não suporta notificações');
      }
      
      const permission = await Notification.requestPermission();
      return permission;
    },
  });
}

// Inscrever dispositivo para push notifications
export function useSubscribePush() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ alunoId, vapidPublicKey }: { alunoId: string; vapidPublicKey: string }) => {
      // Verificar suporte
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications não são suportadas neste navegador');
      }
      
      // Registrar service worker
      const registration = await navigator.serviceWorker.ready;
      
      // Verificar se já existe inscrição
      let subscription = await registration.pushManager.getSubscription();
      
      // Se não existe, criar nova
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }
      
      // Extrair dados da inscrição
      const subscriptionJson = subscription.toJSON();
      const deviceInfo = getDeviceInfo();
      
      // Salvar no Supabase
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          aluno_id: alunoId,
          endpoint: subscription.endpoint,
          p256dh: subscriptionJson.keys?.p256dh || '',
          auth: subscriptionJson.keys?.auth || '',
          user_agent: deviceInfo.userAgent,
          device_name: deviceInfo.deviceName,
          device_type: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          enabled: true,
          last_used_at: new Date().toISOString(),
        }, {
          onConflict: 'endpoint',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['push-subscriptions', variables.alunoId] });
    },
  });
}

// Cancelar inscrição de push notifications
export function useUnsubscribePush() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ subscriptionId, alunoId }: { subscriptionId: string; alunoId: string }) => {
      // Remover do Supabase
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('id', subscriptionId);
      
      if (error) throw error;
      
      // Tentar cancelar no navegador também
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
        }
      } catch (error) {
        console.error('Erro ao cancelar inscrição no navegador:', error);
      }
      
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['push-subscriptions', variables.alunoId] });
    },
  });
}

// Atualizar preferências de notificação
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      subscriptionId, 
      alunoId,
      preferences 
    }: { 
      subscriptionId: string; 
      alunoId: string;
      preferences: {
        enabled?: boolean;
        notifications_treino?: boolean;
        notifications_descanso?: boolean;
        notifications_agenda?: boolean;
        notifications_mensagens?: boolean;
      };
    }) => {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .update({
          ...preferences,
          last_used_at: new Date().toISOString(),
        })
        .eq('id', subscriptionId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['push-subscriptions', variables.alunoId] });
    },
  });
}

// Testar notificação
export function useTestNotification() {
  return useMutation({
    mutationFn: async () => {
      if (!('Notification' in window)) {
        throw new Error('Notificações não são suportadas');
      }
      
      if (Notification.permission !== 'granted') {
        throw new Error('Permissão de notificação não concedida');
      }
      
      const notification = new Notification('Teste de Notificação 🔔', {
        body: 'Se você viu esta mensagem, as notificações estão funcionando!',
        icon: '/icon-192.png',
        badge: '/icon-72.png',
        vibrate: [200, 100, 200],
        tag: 'test-notification',
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      
      return { success: true };
    },
  });
}

// Converter VAPID key de base64 para Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
