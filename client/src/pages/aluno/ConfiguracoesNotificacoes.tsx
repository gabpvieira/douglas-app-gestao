import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BellOff, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AlunoLayout from '@/components/aluno/AlunoLayout';
import PageHeader from '@/components/PageHeader';
import {
  getPreferences,
  savePreferences,
  getSchedules,
  addSchedule,
  updateSchedule,
  removeSchedule,
  type NotificationPreferences,
  type TrainingSchedule
} from '@/lib/notificationsDB';
import {
  requestNotificationPermission,
  hasNotificationPermission
} from '@/lib/notificationManager';

const DIAS_SEMANA = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

export default function ConfiguracoesNotificacoes() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    id: 'notification-preferences',
    inicioTreino: true,
    lembretesTreino: true,
    pausasExercicios: false,
    intervalosDescanso: true,
    terminoPausa: true,
    updatedAt: Date.now()
  });
  
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);

  // Carregar dados
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [prefs, scheds] = await Promise.all([
        getPreferences(),
        getSchedules()
      ]);
      
      setPreferences(prefs);
      setSchedules(scheds);
      setHasPermission(hasNotificationPermission());
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: 'Erro ao carregar',
        description: 'Não foi possível carregar as configurações.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    
    if (permission === 'granted') {
      setHasPermission(true);
      toast({
        title: 'Permissão concedida!',
        description: 'Você receberá notificações do app.',
      });
    } else {
      toast({
        title: 'Permissão negada',
        description: 'Você não receberá notificações. Pode alterar nas configurações do navegador.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    try {
      const updated = { ...preferences, [key]: value };
      setPreferences(updated);
      
      await savePreferences(updated);
      
      toast({
        title: 'Preferência atualizada',
        description: 'Suas configurações foram salvas.',
      });
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a preferência.',
        variant: 'destructive'
      });
    }
  };

  const handleAddSchedule = async () => {
    try {
      const newSchedule = await addSchedule({
        dayOfWeek: 1, // Segunda-feira
        time: '08:00',
        enabled: true
      });
      
      setSchedules([...schedules, newSchedule]);
      
      toast({
        title: 'Horário adicionado',
        description: 'Novo horário de treino configurado.',
      });
    } catch (error) {
      console.error('Erro ao adicionar horário:', error);
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o horário.',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateSchedule = async (id: string, updates: Partial<TrainingSchedule>) => {
    try {
      await updateSchedule(id, updates);
      
      setSchedules(schedules.map(s => 
        s.id === id ? { ...s, ...updates } : s
      ));
    } catch (error) {
      console.error('Erro ao atualizar horário:', error);
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o horário.',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    try {
      await removeSchedule(id);
      
      setSchedules(schedules.filter(s => s.id !== id));
      
      toast({
        title: 'Horário removido',
        description: 'O horário foi excluído.',
      });
    } catch (error) {
      console.error('Erro ao remover horário:', error);
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o horário.',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
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
          description="Configure como e quando você deseja receber notificações"
        />

        {/* Permissão de Notificações */}
        {!hasPermission && (
          <Card className="border-yellow-500/30 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-500 mb-1">
                    Permissão de Notificações
                  </h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Para receber notificações, você precisa conceder permissão ao navegador.
                  </p>
                  <Button
                    onClick={handleRequestPermission}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Permitir Notificações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tipos de Notificações */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Notificações</CardTitle>
            <CardDescription>
              Escolha quais notificações você deseja receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Início de Treino */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Início de Treino</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação ao iniciar um treino
                </p>
              </div>
              <Switch
                checked={preferences.inicioTreino}
                onCheckedChange={(checked) => 
                  handleUpdatePreference('inicioTreino', checked)
                }
                disabled={!hasPermission}
              />
            </div>

            {/* Lembretes de Treino */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Lembretes de Treino</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes nos horários programados
                </p>
              </div>
              <Switch
                checked={preferences.lembretesTreino}
                onCheckedChange={(checked) => 
                  handleUpdatePreference('lembretesTreino', checked)
                }
                disabled={!hasPermission}
              />
            </div>

            {/* Pausas entre Exercícios */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Pausas entre Exercícios</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação ao iniciar uma pausa
                </p>
              </div>
              <Switch
                checked={preferences.pausasExercicios}
                onCheckedChange={(checked) => 
                  handleUpdatePreference('pausasExercicios', checked)
                }
                disabled={!hasPermission}
              />
            </div>

            {/* Intervalos de Descanso */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Intervalos de Descanso</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação durante o descanso (a cada 30s)
                </p>
              </div>
              <Switch
                checked={preferences.intervalosDescanso}
                onCheckedChange={(checked) => 
                  handleUpdatePreference('intervalosDescanso', checked)
                }
                disabled={!hasPermission}
              />
            </div>

            {/* Término de Pausa (Sempre ativo) */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Término de Pausa</Label>
                <p className="text-sm text-muted-foreground">
                  Aviso quando o descanso acabar (sempre ativo)
                </p>
              </div>
              <Switch
                checked={true}
                disabled={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horários de Treino */}
        <Card>
          <CardHeader>
            <CardTitle>Horários de Treino</CardTitle>
            <CardDescription>
              Configure lembretes para seus horários de treino
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BellOff className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Nenhum horário configurado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-800 bg-gray-900/30">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => 
                        handleUpdateSchedule(schedule.id, { enabled: checked })
                      }
                      disabled={!hasPermission || !preferences.lembretesTreino}
                    />
                    <Select
                      value={schedule.dayOfWeek.toString()}
                      onValueChange={(value) => 
                        handleUpdateSchedule(schedule.id, { dayOfWeek: parseInt(value) })
                      }
                      disabled={!hasPermission || !preferences.lembretesTreino}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DIAS_SEMANA.map((dia, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {dia}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={schedule.time}
                      onChange={(e) => 
                        handleUpdateSchedule(schedule.id, { time: e.target.value })
                      }
                      className="w-32"
                      disabled={!hasPermission || !preferences.lembretesTreino}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSchedule(schedule.id)}
                      className="ml-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={handleAddSchedule}
              className="w-full"
              disabled={!hasPermission || !preferences.lembretesTreino}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Horário
            </Button>
          </CardContent>
        </Card>

        {/* Informações */}
        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Bell className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm text-gray-300">
                <p>
                  <strong>Notificações funcionam mesmo com o app fechado!</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-400">
                  <li>Timers continuam contando em segundo plano</li>
                  <li>Lembretes são enviados nos horários programados</li>
                  <li>Todas as configurações são salvas localmente</li>
                  <li>Nenhum dado é enviado para servidores externos</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AlunoLayout>
  );
}
