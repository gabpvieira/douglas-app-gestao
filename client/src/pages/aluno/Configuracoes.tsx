import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings,
  Bell,
  Lock,
  Eye,
  Mail,
  Smartphone,
  Shield,
  Moon,
  Sun,
  Globe,
  Save,
  Key,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Configuracoes() {
  const { toast } = useToast();

  // Notification Settings
  const [notifications, setNotifications] = useState({
    emailWorkouts: true,
    emailSchedule: true,
    emailProgress: false,
    pushWorkouts: true,
    pushSchedule: true,
    pushMessages: true,
    smsReminders: false,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    progressVisible: false,
    shareData: false,
  });

  // Appearance Settings
  const [appearance, setAppearance] = useState({
    theme: "dark",
    language: "pt-BR",
  });

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveNotifications = () => {
    // TODO: Implement API call
    toast({
      title: "Notificações atualizadas!",
      description: "Suas preferências de notificação foram salvas.",
    });
  };

  const handleSavePrivacy = () => {
    // TODO: Implement API call
    toast({
      title: "Privacidade atualizada!",
      description: "Suas configurações de privacidade foram salvas.",
    });
  };

  const handleSaveAppearance = () => {
    // TODO: Implement API call
    toast({
      title: "Aparência atualizada!",
      description: "Suas preferências de aparência foram salvas.",
    });
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erro!",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }
    // TODO: Implement API call
    toast({
      title: "Senha alterada!",
      description: "Sua senha foi atualizada com sucesso.",
    });
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleDeleteAccount = () => {
    // TODO: Implement API call
    console.log("Delete account");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="w-8 h-8" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Personalize suas preferências e gerencie sua conta</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="profile">
            <Shield className="w-4 h-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="physical">
            <Shield className="w-4 h-4 mr-2" />
            Físico
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="w-4 h-4 mr-2" />
            Privacidade
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Sun className="w-4 h-4 mr-2" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="plan">
            <Shield className="w-4 h-4 mr-2" />
            Plano
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                    AS
                  </div>
                  <Button 
                    size="sm" 
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Shield className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <Badge className="bg-chart-2 text-white">
                    <Shield className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-2">
                    Plano Trimestral
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Membro desde 15/01/2024
                  </p>
                </div>
              </div>

              {/* Personal Info Form */}
              <div className="flex-1 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Nome Completo</Label>
                    <Input id="profile-name" defaultValue="Ana Silva" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-email">E-mail</Label>
                    <Input id="profile-email" type="email" defaultValue="ana@email.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Telefone</Label>
                    <Input id="profile-phone" defaultValue="(11) 98765-4321" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-birthdate">Data de Nascimento</Label>
                    <Input id="profile-birthdate" defaultValue="15/03/1995" />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="profile-address">Endereço</Label>
                    <Input id="profile-address" defaultValue="São Paulo, SP" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Physical Data Tab */}
        <TabsContent value="physical" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Medidas Corporais
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input id="height" type="number" defaultValue="165" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-weight">Peso Atual (kg)</Label>
                  <Input id="current-weight" type="number" step="0.1" defaultValue="68.5" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target-weight">Peso Meta (kg)</Label>
                  <Input id="target-weight" type="number" step="0.1" defaultValue="60" />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Peso Inicial</p>
                  <p className="text-2xl font-bold">75 kg</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-primary" />
                Composição Corporal
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="body-fat">Percentual de Gordura (%)</Label>
                  <Input id="body-fat" type="number" step="0.1" defaultValue="22" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="muscle-mass">Massa Muscular (kg)</Label>
                  <Input id="muscle-mass" type="number" step="0.1" defaultValue="45" />
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">IMC</p>
                  <p className="text-2xl font-bold">25.2</p>
                  <p className="text-xs text-muted-foreground mt-1">Sobrepeso</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              Objetivos de Treino
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary-goal">Objetivo Principal</Label>
                <Input id="primary-goal" defaultValue="Perda de peso" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-goal">Objetivo Secundário</Label>
                <Input id="secondary-goal" defaultValue="Ganho de massa muscular" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weekly-workouts">Frequência de Treinos</Label>
                <Input id="weekly-workouts" defaultValue="4-5 vezes por semana" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Nível de Experiência</Label>
                <Input id="experience" defaultValue="Intermediário" />
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  Notificações por E-mail
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-workouts">Novos Treinos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba e-mail quando um novo treino for atribuído
                      </p>
                    </div>
                    <Switch
                      id="email-workouts"
                      checked={notifications.emailWorkouts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailWorkouts: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-schedule">Agendamentos</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba lembretes de treinos agendados
                      </p>
                    </div>
                    <Switch
                      id="email-schedule"
                      checked={notifications.emailSchedule}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailSchedule: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-progress">Relatórios de Progresso</Label>
                      <p className="text-sm text-muted-foreground">
                        Receba resumos semanais do seu progresso
                      </p>
                    </div>
                    <Switch
                      id="email-progress"
                      checked={notifications.emailProgress}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, emailProgress: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Notificações Push
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-workouts">Novos Treinos</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações instantâneas de novos treinos
                      </p>
                    </div>
                    <Switch
                      id="push-workouts"
                      checked={notifications.pushWorkouts}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushWorkouts: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-schedule">Lembretes de Treino</Label>
                      <p className="text-sm text-muted-foreground">
                        Lembrete 1 hora antes do treino agendado
                      </p>
                    </div>
                    <Switch
                      id="push-schedule"
                      checked={notifications.pushSchedule}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushSchedule: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-messages">Mensagens</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações de mensagens do personal trainer
                      </p>
                    </div>
                    <Switch
                      id="push-messages"
                      checked={notifications.pushMessages}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, pushMessages: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  SMS
                </h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sms-reminders">Lembretes por SMS</Label>
                    <p className="text-sm text-muted-foreground">
                      Receba lembretes importantes por SMS
                    </p>
                  </div>
                  <Switch
                    id="sms-reminders"
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, smsReminders: checked })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveNotifications} data-testid="button-save-notifications">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5 text-primary" />
                  Alterar Senha
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Senha Atual</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, currentPassword: e.target.value })
                      }
                      data-testid="input-current-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      data-testid="input-new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      data-testid="input-confirm-password"
                    />
                  </div>

                  <Button onClick={handleChangePassword} data-testid="button-change-password">
                    <Lock className="w-4 h-4 mr-2" />
                    Alterar Senha
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Autenticação em Dois Fatores
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                  <Button variant="outline" data-testid="button-enable-2fa">
                    Ativar Autenticação em Dois Fatores
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
                  <Trash2 className="w-5 h-5" />
                  Zona de Perigo
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Excluir sua conta permanentemente. Esta ação não pode ser desfeita.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" data-testid="button-delete-account">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Conta
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta
                          e removerá todos os seus dados de nossos servidores.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Sim, excluir minha conta
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Visibilidade do Perfil
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="profile-visible">Perfil Público</Label>
                      <p className="text-sm text-muted-foreground">
                        Permitir que outros alunos vejam seu perfil
                      </p>
                    </div>
                    <Switch
                      id="profile-visible"
                      checked={privacy.profileVisible}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, profileVisible: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="progress-visible">Progresso Visível</Label>
                      <p className="text-sm text-muted-foreground">
                        Compartilhar seu progresso com outros alunos
                      </p>
                    </div>
                    <Switch
                      id="progress-visible"
                      checked={privacy.progressVisible}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, progressVisible: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Dados e Privacidade
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="share-data">Compartilhar Dados Anônimos</Label>
                      <p className="text-sm text-muted-foreground">
                        Ajude a melhorar a plataforma compartilhando dados anônimos
                      </p>
                    </div>
                    <Switch
                      id="share-data"
                      checked={privacy.shareData}
                      onCheckedChange={(checked) =>
                        setPrivacy({ ...privacy, shareData: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePrivacy} data-testid="button-save-privacy">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-primary" />
                  Tema
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Selecione o Tema</Label>
                    <Select
                      value={appearance.theme}
                      onValueChange={(value) =>
                        setAppearance({ ...appearance, theme: value })
                      }
                    >
                      <SelectTrigger id="theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="w-4 h-4" />
                            Claro
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="w-4 h-4" />
                            Escuro
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            Sistema
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Idioma
                </h3>
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="language">Selecione o Idioma</Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) =>
                        setAppearance({ ...appearance, language: value })
                      }
                    >
                      <SelectTrigger id="language">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveAppearance} data-testid="button-save-appearance">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent value="plan" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Meu Plano Atual
                </h3>
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-purple-600/10 border-primary/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-2xl font-bold">Plano Trimestral</h4>
                      <p className="text-muted-foreground">Renovação automática ativa</p>
                    </div>
                    <Badge className="bg-chart-2 text-white text-lg px-4 py-2">
                      Ativo
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-semibold">15/01/2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Próxima Renovação</p>
                      <p className="font-semibold">15/04/2024</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor Mensal</p>
                      <p className="font-semibold">R$ 197,00</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Benefícios do Seu Plano</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Treinos Personalizados</p>
                      <p className="text-sm text-muted-foreground">Acesso ilimitado a treinos customizados</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Plano Alimentar</p>
                      <p className="text-sm text-muted-foreground">Dieta personalizada e ajustável</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Acompanhamento</p>
                      <p className="text-sm text-muted-foreground">Suporte direto com personal trainer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                    <Shield className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Comunidade</p>
                      <p className="text-sm text-muted-foreground">Acesso à comunidade de alunos</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Gerenciar Assinatura</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Alterar Plano
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Atualizar Forma de Pagamento
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                    Cancelar Assinatura
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
