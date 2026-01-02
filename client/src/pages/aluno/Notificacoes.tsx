import { useState } from 'react';
import { Bell, BellOff, Smartphone, Monitor, Tablet, Check, X, TestTube, Volume2, VolumeX, Vibrate, Settings2, AlertTriangle, Info, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import AlunoLayout from '@/components/aluno/AlunoLayout';
import PageHeader from '@/components/PageHeader';
import { useAlunoProfile } from '@/hooks/useAlunoData';
import {
  usePushSubscriptions,
  useNotificationSupport,
  useRequestNotificationPermission,
  useSubscribePush,
  useUnsubscribePush,
  useUpdateNotificationPreferences,
  useTestNotification,
} from '@/hooks/usePushNotifications';
import {
  getAudioSettings,
  saveAudioSettings,
  testSound,
  testVibration,
  supportsBackgroundNotifications,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  type AlertSoundType,
} from '@/lib/audioManager';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// VAPID Public Key (gerada via web-push generate-vapid-keys)
const VAPID_PUBLIC_KEY = 'BAHJlVrf9a3LsLWMpN4YG7hLK1X4aqSyAJ9mDmAVxyOXg_P21aL9HsUDjptZ8zJ9rWelL2PTecuIboOYDNif910';

export default function Notificacoes() {
  const { toast } = useToast();
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Configurações de áudio
  const [audioSettings, setAudioSettings] = useState(() => getAudioSettings());
  
  // Buscar perfil do aluno
  const { data: profile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;
  
  // Hooks
  const { supported, permission } = useNotificationSupport();
  const { data: subscriptions = [], isLoading } = usePushSubscriptions(alunoId);
  const requestPermission = useRequestNotificationPermission();
  const subscribePush = useSubscribePush();
  const unsubscribePush = useUnsubscribePush();
  const updatePreferences = useUpdateNotificationPreferences();
  const testNotification = useTestNotification();
  
  // Dispositivo atual
  const currentSubscription = subscriptions.find(sub => sub.enabled);
  
  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission.mutateAsync();
      
      if (result === 'granted') {
        toast({
          title: 'Permissão concedida!',
          description: 'Agora você pode ativar as notificações.',
        });
      } else if (result === 'denied') {
        toast({
          title: 'Permissão negada',
          description: 'Você precisará habilitar nas configurações do navegador.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao solicitar permissão',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleSubscribe = async () => {
    if (!alunoId) {
      toast({
        title: 'Erro',
        description: 'Não foi possível identificar o aluno.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubscribing(true);
    
    try {
      await subscribePush.mutateAsync({
        alunoId,
        vapidPublicKey: VAPID_PUBLIC_KEY,
      });
      
      toast({
        title: 'Notificações ativadas! 🔔',
        description: 'Você receberá alertas neste dispositivo.',
      });
    } catch (error: any) {
      console.error('Erro ao ativar notificações:', error);
      toast({
        title: 'Erro ao ativar notificações',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const handleUnsubscribe = async (subscriptionId: string) => {
    if (!alunoId) return;
    
    try {
      await unsubscribePush.mutateAsync({ subscriptionId, alunoId });
      
      toast({
        title: 'Notificações desativadas',
        description: 'Você não receberá mais alertas neste dispositivo.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao desativar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdatePreference = async (
    subscriptionId: string,
    key: string,
    value: boolean
  ) => {
    if (!alunoId) return;
    
    try {
      await updatePreferences.mutateAsync({
        subscriptionId,
        alunoId,
        preferences: { [key]: value },
      });
      
      toast({
        title: 'Preferência atualizada',
        description: 'Suas configurações foram salvas.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleTestNotification = async () => {
    try {
      await testNotification.mutateAsync();
      
      toast({
        title: 'Notificação de teste enviada!',
        description: 'Verifique se apareceu no seu dispositivo.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao testar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const handleUpdateAudioSetting = (key: keyof typeof audioSettings, value: any) => {
    const updated = { ...audioSettings, [key]: value };
    setAudioSettings(updated);
    saveAudioSettings({ [key]: value });
    
    toast({
      title: 'Configuração salva',
      description: 'Suas preferências de áudio foram atualizadas.',
    });
  };
  
  const handleTestSound = async () => {
    try {
      await testSound(audioSettings.soundType, audioSettings.volume);
      toast({
        title: 'Som de teste reproduzido',
        description: 'Você ouviu o alerta?',
      });
    } catch (error) {
      toast({
        title: 'Erro ao testar som',
        description: 'Verifique as permissões do navegador.',
        variant: 'destructive',
      });
    }
  };
  
  const handleTestVibration = () => {
    testVibration();
    toast({
      title: 'Vibração testada',
      description: 'Você sentiu a vibração?',
    });
  };
  
  const handleTestBackgroundNotification = async () => {
    const success = await sendTestNotification();
    if (success) {
      toast({
        title: 'Notificação enviada!',
        description: 'Verifique se apareceu mesmo com o app em segundo plano.',
      });
    } else {
      toast({
        title: 'Erro ao enviar',
        description: 'Verifique as permissões do navegador.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRequestBackgroundPermission = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      toast({
        title: 'Permissão concedida!',
        description: 'Agora os alertas funcionarão em segundo plano.',
      });
    } else if (result === 'denied') {
      toast({
        title: 'Permissão negada',
        description: 'Você precisará habilitar nas configurações do navegador.',
        variant: 'destructive',
      });
    }
  };
  
  const backgroundPermission = getNotificationPermission();
  const supportsBackground = supportsBackgroundNotifications();
  
  const getDeviceIcon = (type?: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-5 w-5" />;
      case 'tablet':
        return <Tablet className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };
  
  const getPermissionBadge = () => {
    if (permission === 'granted') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Permitido</Badge>;
    } else if (permission === 'denied') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Negado</Badge>;
    } else {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Não solicitado</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
        </div>
      </AlunoLayout>
    );
  }
  
  return (
    <AlunoLayout>
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
        <PageHeader
          title="Notificações"
          description="Configure como você deseja receber alertas e lembretes"
        />
        
        {/* Status do Navegador */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Status das Notificações
            </CardTitle>
            <CardDescription>
              Informações sobre o suporte do seu navegador
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Suporte do Navegador</p>
                <p className="text-sm text-gray-400">
                  {supported ? 'Seu navegador suporta notificações' : 'Notificações não suportadas'}
                </p>
              </div>
              {supported ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Permissão</p>
                <p className="text-sm text-gray-400">
                  Status atual da permissão de notificações
                </p>
              </div>
              {getPermissionBadge()}
            </div>
            
            {supported && permission === 'default' && (
              <Button
                onClick={handleRequestPermission}
                disabled={requestPermission.isPending}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Solicitar Permissão
              </Button>
            )}
            
            {supported && permission === 'denied' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400">
                  Você negou a permissão de notificações. Para habilitar, acesse as configurações do seu navegador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Dispositivos Inscritos */}
        {supported && permission === 'granted' && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Dispositivos
              </CardTitle>
              <CardDescription>
                Gerencie os dispositivos que recebem notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <BellOff className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400 mb-4">
                    Nenhum dispositivo inscrito
                  </p>
                  <Button
                    onClick={handleSubscribe}
                    disabled={isSubscribing}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Ativar Notificações Neste Dispositivo
                  </Button>
                </div>
              ) : (
                <>
                  {subscriptions.map((sub) => (
                    <Card key={sub.id} className="border-gray-700 bg-gray-800/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getDeviceIcon(sub.device_type)}
                            <div>
                              <p className="font-medium text-white">
                                {sub.device_name || 'Dispositivo Desconhecido'}
                              </p>
                              <p className="text-xs text-gray-400">
                                {sub.browser} • {sub.os}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnsubscribe(sub.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor={`enabled-${sub.id}`} className="text-sm">
                              Notificações ativadas
                            </Label>
                            <Switch
                              id={`enabled-${sub.id}`}
                              checked={sub.enabled}
                              onCheckedChange={(checked) =>
                                handleUpdatePreference(sub.id, 'enabled', checked)
                              }
                            />
                          </div>
                          
                          {sub.enabled && (
                            <>
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`treino-${sub.id}`} className="text-sm">
                                  Alertas de treino
                                </Label>
                                <Switch
                                  id={`treino-${sub.id}`}
                                  checked={sub.notifications_treino}
                                  onCheckedChange={(checked) =>
                                    handleUpdatePreference(sub.id, 'notifications_treino', checked)
                                  }
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`descanso-${sub.id}`} className="text-sm">
                                  Fim do descanso
                                </Label>
                                <Switch
                                  id={`descanso-${sub.id}`}
                                  checked={sub.notifications_descanso}
                                  onCheckedChange={(checked) =>
                                    handleUpdatePreference(sub.id, 'notifications_descanso', checked)
                                  }
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`agenda-${sub.id}`} className="text-sm">
                                  Lembretes de agenda
                                </Label>
                                <Switch
                                  id={`agenda-${sub.id}`}
                                  checked={sub.notifications_agenda}
                                  onCheckedChange={(checked) =>
                                    handleUpdatePreference(sub.id, 'notifications_agenda', checked)
                                  }
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`mensagens-${sub.id}`} className="text-sm">
                                  Mensagens do treinador
                                </Label>
                                <Switch
                                  id={`mensagens-${sub.id}`}
                                  checked={sub.notifications_mensagens}
                                  onCheckedChange={(checked) =>
                                    handleUpdatePreference(sub.id, 'notifications_mensagens', checked)
                                  }
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {!currentSubscription && (
                    <Button
                      onClick={handleSubscribe}
                      disabled={isSubscribing}
                      variant="outline"
                      className="w-full"
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Adicionar Este Dispositivo
                    </Button>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Testar Notificação */}
        {supported && permission === 'granted' && subscriptions.length > 0 && (
          <Card className="border-gray-800 bg-gray-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Testar Notificações
              </CardTitle>
              <CardDescription>
                Envie uma notificação de teste para verificar se está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleTestNotification}
                disabled={testNotification.isPending}
                variant="outline"
                className="w-full"
              >
                <TestTube className="h-4 w-4 mr-2" />
                Enviar Notificação de Teste
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Configurações de Som e Vibração */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Alertas de Treino
            </CardTitle>
            <CardDescription>
              Configure som e vibração para alertas durante o treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ativar/Desativar Som */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sound-enabled" className="text-base font-medium">
                  Som de alerta
                </Label>
                <p className="text-sm text-gray-400">
                  Tocar som quando o descanso terminar
                </p>
              </div>
              <Switch
                id="sound-enabled"
                checked={audioSettings.soundEnabled}
                onCheckedChange={(checked) => handleUpdateAudioSetting('soundEnabled', checked)}
              />
            </div>
            
            {/* Tipo de Som */}
            {audioSettings.soundEnabled && (
              <div className="space-y-3">
                <Label className="text-base font-medium">Tipo de som</Label>
                <RadioGroup
                  value={audioSettings.soundType}
                  onValueChange={(value: AlertSoundType) => handleUpdateAudioSetting('soundType', value)}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alarm" id="alarm" />
                    <Label htmlFor="alarm" className="font-normal cursor-pointer">
                      🚨 Alarme (forte e claro)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bell" id="bell" />
                    <Label htmlFor="bell" className="font-normal cursor-pointer">
                      🔔 Sino (agradável e perceptível)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beep" id="beep" />
                    <Label htmlFor="beep" className="font-normal cursor-pointer">
                      📢 Bip (simples e direto)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            
            {/* Volume */}
            {audioSettings.soundEnabled && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Volume</Label>
                  <span className="text-sm text-gray-400">
                    {Math.round(audioSettings.volume * 100)}%
                  </span>
                </div>
                <Slider
                  value={[audioSettings.volume * 100]}
                  onValueChange={([value]) => handleUpdateAudioSetting('volume', value / 100)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Testar Som */}
            {audioSettings.soundEnabled && (
              <Button
                onClick={handleTestSound}
                variant="outline"
                className="w-full"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                Testar Som
              </Button>
            )}
            
            {/* Divisor */}
            <div className="border-t border-gray-800 my-4"></div>
            
            {/* Ativar/Desativar Vibração */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vibration-enabled" className="text-base font-medium">
                  Vibração
                </Label>
                <p className="text-sm text-gray-400">
                  Vibrar quando o descanso terminar
                </p>
              </div>
              <Switch
                id="vibration-enabled"
                checked={audioSettings.vibrationEnabled}
                onCheckedChange={(checked) => handleUpdateAudioSetting('vibrationEnabled', checked)}
              />
            </div>
            
            {/* Testar Vibração */}
            {audioSettings.vibrationEnabled && (
              <Button
                onClick={handleTestVibration}
                variant="outline"
                className="w-full"
              >
                <Vibrate className="h-4 w-4 mr-2" />
                Testar Vibração
              </Button>
            )}
            
            {/* Aviso sobre compatibilidade */}
            {audioSettings.vibrationEnabled && !navigator.vibrate && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-sm text-yellow-400">
                  ⚠️ Seu dispositivo ou navegador não suporta vibração.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Configurações de Segundo Plano */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Alertas em Segundo Plano
            </CardTitle>
            <CardDescription>
              Configure para receber alertas mesmo com a tela bloqueada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status do suporte */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Suporte do Navegador</p>
                <p className="text-sm text-gray-400">
                  {supportsBackground 
                    ? 'Seu navegador suporta alertas em segundo plano' 
                    : 'Alertas em segundo plano não suportados'}
                </p>
              </div>
              {supportsBackground ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <X className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            {/* Status da permissão */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Permissão de Notificação</p>
                <p className="text-sm text-gray-400">
                  Necessária para alertas com tela bloqueada
                </p>
              </div>
              {backgroundPermission === 'granted' ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Permitido</Badge>
              ) : backgroundPermission === 'denied' ? (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Negado</Badge>
              ) : (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Não solicitado</Badge>
              )}
            </div>
            
            {/* Botão para solicitar permissão */}
            {supportsBackground && backgroundPermission === 'default' && (
              <Button
                onClick={handleRequestBackgroundPermission}
                className="w-full"
              >
                <Bell className="h-4 w-4 mr-2" />
                Permitir Notificações em Segundo Plano
              </Button>
            )}
            
            {/* Ativar/Desativar segundo plano */}
            {supportsBackground && backgroundPermission === 'granted' && (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="background-enabled" className="text-base font-medium">
                      Execução em segundo plano
                    </Label>
                    <p className="text-sm text-gray-400">
                      Alertas funcionam com app minimizado
                    </p>
                  </div>
                  <Switch
                    id="background-enabled"
                    checked={audioSettings.backgroundEnabled}
                    onCheckedChange={(checked) => handleUpdateAudioSetting('backgroundEnabled', checked)}
                  />
                </div>
                
                {/* Testar notificação em background */}
                {audioSettings.backgroundEnabled && (
                  <Button
                    onClick={handleTestBackgroundNotification}
                    variant="outline"
                    className="w-full"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Testar Alerta em Segundo Plano
                  </Button>
                )}
              </>
            )}
            
            {/* Aviso sobre permissão negada */}
            {backgroundPermission === 'denied' && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-sm text-red-400">
                  Você negou a permissão de notificações. Para habilitar alertas em segundo plano, 
                  acesse as configurações do seu navegador e permita notificações para este site.
                </p>
              </div>
            )}
            
            {/* Instruções para Android */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-300 mb-2">
                    Para garantir alertas com tela bloqueada:
                  </p>
                  <ul className="text-sm text-blue-200/80 space-y-1.5 list-disc list-inside">
                    <li>Instale o app na tela inicial (PWA)</li>
                    <li>Permita notificações nas configurações do sistema</li>
                    <li>Desative otimização de bateria para este app</li>
                    <li>Mantenha o volume de notificações alto</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Aviso sobre limitações */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-300 mb-1">Limitações conhecidas:</p>
                  <ul className="text-sm text-yellow-200/80 space-y-1 list-disc list-inside">
                    <li>iOS/Safari: Funciona melhor com PWA instalado</li>
                    <li>Alguns dispositivos limitam apps em segundo plano</li>
                    <li>O som depende do volume de notificações do sistema</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Informações */}
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle>Sobre as Notificações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-400">
            <p>
              💡 <strong className="text-white">Múltiplos dispositivos:</strong> Você pode ativar notificações em vários dispositivos (celular, tablet, computador).
            </p>
            <p>
              🔔 <strong className="text-white">Tipos de notificação:</strong> Receba alertas quando o descanso acabar, lembretes de treino e muito mais.
            </p>
            <p>
              🔒 <strong className="text-white">Privacidade:</strong> Suas preferências são salvas de forma segura e você pode desativar a qualquer momento.
            </p>
            <p>
              📱 <strong className="text-white">Funciona em background:</strong> As notificações chegam mesmo com o app minimizado ou fechado.
            </p>
          </CardContent>
        </Card>
      </div>
    </AlunoLayout>
  );
}
