import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  Settings,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useBlocosHorarios, useAgendamentos, useCreateAgendamento, useUpdateAgendamento, useDeleteAgendamento, useCreateBlocoHorario, useUpdateBlocoHorario, useDeleteBlocoHorario } from '@/hooks/useAgenda';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

export default function AgendaProfissional() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isNewBlocoModalOpen, setIsNewBlocoModalOpen] = useState(false);
  const [isNewAgendamentoModalOpen, setIsNewAgendamentoModalOpen] = useState(false);
  const [editingBloco, setEditingBloco] = useState<any>(null);
  const [newBloco, setNewBloco] = useState({
    diaSemana: 1,
    horaInicio: '08:00',
    horaFim: '09:00',
    duracao: 60,
    ativo: true
  });
  const [newAgendamento, setNewAgendamento] = useState({
    alunoId: '',
    blocoHorarioId: '',
    dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
    observacoes: ''
  });
  const { toast } = useToast();

  // Buscar dados reais do Supabase
  const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
  
  const { data: blocosData = [], isLoading: loadingBlocos } = useBlocosHorarios();
  const { data: agendamentosData = [], isLoading: loadingAgendamentos } = useAgendamentos(startDate, endDate);
  const { data: alunosData = [], isLoading: loadingAlunos } = useAlunos();
  
  const createAgendamento = useCreateAgendamento();
  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();
  const createBloco = useCreateBlocoHorario();
  const updateBloco = useUpdateBlocoHorario();
  const deleteBloco = useDeleteBlocoHorario();

  const isLoading = loadingBlocos || loadingAgendamentos || loadingAlunos;

  // Handlers para configuração de horários
  const handleCreateBloco = async () => {
    try {
      await createBloco.mutateAsync(newBloco);
      setIsNewBlocoModalOpen(false);
      setEditingBloco(null);
      setNewBloco({
        diaSemana: 1,
        horaInicio: '08:00',
        horaFim: '09:00',
        duracao: 60,
        ativo: true
      });
    } catch (error) {
      console.error('Erro ao criar bloco:', error);
    }
  };

  const handleEditBloco = (bloco: any) => {
    setEditingBloco(bloco);
    setNewBloco({
      diaSemana: bloco.diaSemana,
      horaInicio: bloco.horaInicio.substring(0, 5),
      horaFim: bloco.horaFim.substring(0, 5),
      duracao: bloco.duracao,
      ativo: bloco.ativo
    });
    setIsNewBlocoModalOpen(true);
  };

  const handleUpdateBloco = async () => {
    if (!editingBloco) return;
    
    try {
      await updateBloco.mutateAsync({
        id: editingBloco.id,
        data: newBloco
      });
      setIsNewBlocoModalOpen(false);
      setEditingBloco(null);
      setNewBloco({
        diaSemana: 1,
        horaInicio: '08:00',
        horaFim: '09:00',
        duracao: 60,
        ativo: true
      });
    } catch (error) {
      console.error('Erro ao atualizar bloco:', error);
    }
  };

  const handleDeleteBloco = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este horário? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteBloco.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao deletar bloco:', error);
    }
  };

  // Handlers para agendamentos
  const handleCreateAgendamento = async () => {
    if (!newAgendamento.alunoId || !newAgendamento.blocoHorarioId || !newAgendamento.dataAgendamento) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createAgendamento.mutateAsync(newAgendamento);
      setIsNewAgendamentoModalOpen(false);
      setNewAgendamento({
        alunoId: '',
        blocoHorarioId: '',
        dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  // Filtrar blocos disponíveis para a data selecionada
  const getBlocosDisponiveis = (data: Date) => {
    const diaSemana = data.getDay();
    return blocosData.filter(b => b.ativo && b.diaSemana === diaSemana);
  };

  // Verificar se um bloco já está ocupado em uma data
  const isBlocoOcupado = (blocoId: string, data: string) => {
    return agendamentosData.some(a => 
      a.blocoHorarioId === blocoId && 
      a.dataAgendamento === data &&
      a.status !== 'cancelado'
    );
  };

  // Calcular estatísticas
  const stats = {
    total: agendamentosData.length,
    agendados: agendamentosData.filter(a => a.status === 'agendado').length,
    confirmados: agendamentosData.filter(a => a.status === 'agendado').length,
    concluidos: agendamentosData.filter(a => a.status === 'concluido').length
  };

  // Agrupar blocos por dia da semana
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const disponibilidades = blocosData
    .filter(b => b.ativo)
    .map(b => ({
      dia: diasSemana[b.diaSemana],
      inicio: b.horaInicio.substring(0, 5),
      fim: b.horaFim.substring(0, 5),
      tipo: 'Presencial',
      slots: 1
    }));

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(startOfWeek(selectedDate, { locale: ptBR }), i);
    return date;
  });

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-blue-500/10 text-blue-600 border-blue-200',
      confirmado: 'bg-green-500/10 text-green-600 border-green-200',
      cancelado: 'bg-red-500/10 text-red-600 border-red-200',
      concluido: 'bg-gray-500/10 text-gray-600 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.agendado;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      agendado: AlertCircle,
      confirmado: CheckCircle2,
      cancelado: XCircle,
      concluido: CheckCircle2
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        
        {/* Header */}
        <PageHeader
          title="Agenda Profissional"
          description="Gerencie seus atendimentos presenciais e online"
          actions={
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
                disabled={isLoading}
                onClick={() => setIsConfigModalOpen(true)}
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Configurar Horários</span>
                <span className="sm:hidden">Horários</span>
              </Button>
              <Button 
                size="sm" 
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
                disabled={isLoading}
                onClick={() => setIsNewAgendamentoModalOpen(true)}
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Novo Agendamento</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </>
          }
        />

        {/* Loading State */}
        {isLoading && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando dados da agenda...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Total</p>
                <p className="text-xl sm:text-3xl font-bold text-white mt-1">{stats.total}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">agendamentos</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Agendados</p>
                <p className="text-xl sm:text-3xl font-bold text-blue-400 mt-1">{stats.agendados}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">aguardando</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Confirmados</p>
                <p className="text-xl sm:text-3xl font-bold text-green-400 mt-1">{stats.confirmados}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">próximos</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-400">Concluídos</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-300 mt-1">{stats.concluidos}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-1">este mês</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Calendar Sidebar */}
          <Card className="lg:col-span-1 p-4 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Calendário</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-lg border-gray-800 bg-gray-800/30 w-full"
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4 sm:pt-6 border-t border-gray-800">
                <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Disponibilidade</h3>
                <div className="space-y-2 sm:space-y-3">
                  {disponibilidades.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-4">
                      Nenhum horário configurado
                    </p>
                  ) : (
                    disponibilidades.map((disp, index) => (
                      <div key={index} className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center justify-between mb-1 sm:mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-200">{disp.dia}</span>
                          <Badge variant="outline" className="text-[10px] sm:text-xs border-gray-600 text-gray-400">
                            {disp.tipo}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{disp.inicio} - {disp.fim}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Schedule View */}
          <Card className="lg:col-span-2 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="p-4 sm:p-6">
              <Tabs defaultValue="week" className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="text-sm sm:text-base font-semibold text-white">
                    {format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <TabsList className="bg-gray-800 border-gray-700 w-full sm:w-auto">
                    <TabsTrigger value="day" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none">Dia</TabsTrigger>
                    <TabsTrigger value="week" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none">Semana</TabsTrigger>
                    <TabsTrigger value="month" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm flex-1 sm:flex-none">Mês</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="week" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
                  {/* Week Header */}
                  <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`text-center p-1.5 sm:p-3 rounded-lg transition-colors cursor-pointer ${
                          isSameDay(day, selectedDate)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800'
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="text-[10px] sm:text-xs font-medium uppercase">
                          {format(day, 'EEE', { locale: ptBR })}
                        </div>
                        <div className="text-sm sm:text-lg font-bold mt-0.5 sm:mt-1">
                          {format(day, 'd')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Appointments List */}
                  <div className="space-y-2 sm:space-y-3 mt-4 sm:mt-6">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400">
                      Agendamentos de {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </h4>
                    
                    {agendamentosData.filter(a => isSameDay(new Date(a.dataAgendamento), selectedDate)).length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-800 mb-3 sm:mb-4">
                          <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600" />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500">Nenhum agendamento para esta data</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3 sm:mt-4 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
                          disabled={isLoading}
                          onClick={() => setIsNewAgendamentoModalOpen(true)}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          Criar Agendamento
                        </Button>
                      </div>
                    ) : (
                      agendamentosData
                        .filter(a => isSameDay(new Date(a.dataAgendamento), selectedDate))
                        .map((agendamento) => (
                          <div
                            key={agendamento.id}
                            className="p-3 sm:p-4 rounded-lg border border-gray-700 bg-gray-800/30 hover:border-blue-500 hover:bg-gray-800/50 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                                  <span className="text-xs sm:text-sm font-semibold text-white">
                                    {agendamento.blocoHorario?.horaInicio.substring(0, 5)}
                                  </span>
                                  <Badge 
                                    variant="outline" 
                                    className={`gap-1 text-[10px] sm:text-xs ${getStatusColor(agendamento.status)}`}
                                  >
                                    {getStatusIcon(agendamento.status)}
                                    <span className="hidden sm:inline">{agendamento.status}</span>
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-gray-300 truncate">
                                  {agendamento.aluno?.nome || 'Aluno não encontrado'}
                                </p>
                                {agendamento.observacoes && (
                                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 line-clamp-2">
                                    {agendamento.observacoes}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-gray-400 hover:text-white text-[10px] sm:text-xs h-7 sm:h-8 px-2"
                                  onClick={() => {
                                    updateAgendamento.mutate({ 
                                      id: agendamento.id, 
                                      status: 'concluido' 
                                    });
                                  }}
                                  disabled={agendamento.status === 'concluido'}
                                >
                                  <CheckCircle2 className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Concluir</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-400 hover:text-red-300 text-[10px] sm:text-xs h-7 sm:h-8 px-2"
                                  onClick={() => {
                                    if (confirm('Deseja cancelar este agendamento?')) {
                                      deleteAgendamento.mutate(agendamento.id);
                                    }
                                  }}
                                >
                                  <XCircle className="h-3 w-3 sm:mr-1" />
                                  <span className="hidden sm:inline">Cancelar</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="day">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400">
                      Horários do dia {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
                    </h4>
                    
                    {/* Lista de horários do dia */}
                    <div className="space-y-1.5 sm:space-y-2 max-h-[60vh] overflow-y-auto">
                      {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
                        const hourStr = `${hour.toString().padStart(2, '0')}:00`;
                        const agendamento = agendamentosData.find(a => 
                          isSameDay(new Date(a.dataAgendamento), selectedDate) &&
                          a.blocoHorario?.horaInicio.startsWith(hourStr)
                        );
                        
                        return (
                          <div 
                            key={hour}
                            className={`p-2 sm:p-3 rounded-lg border ${
                              agendamento 
                                ? 'border-blue-500 bg-blue-500/10' 
                                : 'border-gray-700 bg-gray-800/30'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm font-medium text-gray-300">{hourStr}</span>
                              {agendamento ? (
                                <span className="text-xs sm:text-sm text-gray-400 truncate ml-2">
                                  {agendamento.aluno?.nome}
                                </span>
                              ) : (
                                <span className="text-[10px] sm:text-xs text-gray-600">Disponível</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="month">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-400">
                      Resumo do mês
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Card className="p-3 sm:p-4 border-gray-700 bg-gray-800/30">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Por Status</h5>
                        <div className="space-y-1.5 sm:space-y-2">
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Agendados:</span>
                            <span className="text-blue-400 font-medium">{stats.agendados}</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-400">Concluídos:</span>
                            <span className="text-green-400 font-medium">{stats.concluidos}</span>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="p-3 sm:p-4 border-gray-700 bg-gray-800/30">
                        <h5 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Alunos Ativos</h5>
                        <div className="text-xl sm:text-2xl font-bold text-white">
                          {new Set(agendamentosData.map(a => a.alunoId)).size}
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-1">alunos únicos</p>
                      </Card>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal de Configuração de Horários */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-3xl bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Configurar Horários de Atendimento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Gerencie seus blocos de horários disponíveis para agendamento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Botão para adicionar novo bloco */}
            <Button
              onClick={() => setIsNewBlocoModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Horário
            </Button>

            {/* Lista de blocos existentes */}
            <div className="space-y-3">
              {blocosData.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum horário configurado ainda
                </div>
              ) : (
                blocosData.map((bloco) => (
                  <Card key={bloco.id} className="p-4 border-gray-700 bg-gray-800/50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="border-gray-600">
                            {diasSemana[bloco.diaSemana]}
                          </Badge>
                          <span className="text-sm text-gray-300">
                            {bloco.horaInicio.substring(0, 5)} - {bloco.horaFim.substring(0, 5)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({bloco.duracao} min)
                          </span>
                          <Badge 
                            variant={bloco.ativo ? "default" : "secondary"}
                            className={bloco.ativo ? "bg-green-600" : "bg-gray-600"}
                          >
                            {bloco.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-white"
                          onClick={() => handleEditBloco(bloco)}
                          disabled={updateBloco.isPending}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDeleteBloco(bloco.id)}
                          disabled={deleteBloco.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfigModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo/Editar Bloco de Horário */}
      <Dialog open={isNewBlocoModalOpen} onOpenChange={(open) => {
        setIsNewBlocoModalOpen(open);
        if (!open) {
          setEditingBloco(null);
          setNewBloco({
            diaSemana: 1,
            horaInicio: '08:00',
            horaFim: '09:00',
            duracao: 60,
            ativo: true
          });
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>{editingBloco ? 'Editar Horário' : 'Adicionar Novo Horário'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingBloco ? 'Atualize as informações do horário' : 'Configure um novo bloco de horário para atendimento'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Dia da Semana */}
            <div className="space-y-2">
              <Label htmlFor="diaSemana">Dia da Semana</Label>
              <Select
                value={newBloco.diaSemana.toString()}
                onValueChange={(value) => setNewBloco({ ...newBloco, diaSemana: parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {diasSemana.map((dia, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Horário de Início */}
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Horário de Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={newBloco.horaInicio}
                onChange={(e) => setNewBloco({ ...newBloco, horaInicio: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            {/* Horário de Fim */}
            <div className="space-y-2">
              <Label htmlFor="horaFim">Horário de Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={newBloco.horaFim}
                onChange={(e) => setNewBloco({ ...newBloco, horaFim: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            {/* Duração */}
            <div className="space-y-2">
              <Label htmlFor="duracao">Duração (minutos)</Label>
              <Input
                id="duracao"
                type="number"
                value={newBloco.duracao}
                onChange={(e) => setNewBloco({ ...newBloco, duracao: parseInt(e.target.value) })}
                className="bg-gray-800 border-gray-700"
                min="15"
                step="15"
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Horário Ativo</Label>
              <Switch
                id="ativo"
                checked={newBloco.ativo}
                onCheckedChange={(checked) => setNewBloco({ ...newBloco, ativo: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsNewBlocoModalOpen(false);
                setEditingBloco(null);
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={editingBloco ? handleUpdateBloco : handleCreateBloco}
              disabled={createBloco.isPending || updateBloco.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {(createBloco.isPending || updateBloco.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingBloco ? 'Atualizando...' : 'Criando...'}
                </>
              ) : (
                <>
                  {editingBloco ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Atualizar Horário
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Horário
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Agendamento */}
      <Dialog open={isNewAgendamentoModalOpen} onOpenChange={(open) => {
        setIsNewAgendamentoModalOpen(open);
        if (!open) {
          setNewAgendamento({
            alunoId: '',
            blocoHorarioId: '',
            dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
            observacoes: ''
          });
        }
      }}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Agende um atendimento para um aluno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Selecionar Aluno */}
            <div className="space-y-2">
              <Label htmlFor="aluno">Aluno *</Label>
              <Select
                value={newAgendamento.alunoId}
                onValueChange={(value) => setNewAgendamento({ ...newAgendamento, alunoId: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {alunosData.length === 0 ? (
                    <div className="p-2 text-sm text-gray-500">Nenhum aluno cadastrado</div>
                  ) : (
                    alunosData.map((aluno) => (
                      <SelectItem key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Selecionar Data */}
            <div className="space-y-2">
              <Label htmlFor="data">Data do Agendamento *</Label>
              <Input
                id="data"
                type="date"
                value={newAgendamento.dataAgendamento}
                onChange={(e) => {
                  setNewAgendamento({ 
                    ...newAgendamento, 
                    dataAgendamento: e.target.value,
                    blocoHorarioId: '' // Reset horário ao mudar data
                  });
                }}
                className="bg-gray-800 border-gray-700"
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>

            {/* Selecionar Horário */}
            <div className="space-y-2">
              <Label htmlFor="horario">Horário *</Label>
              <Select
                value={newAgendamento.blocoHorarioId}
                onValueChange={(value) => setNewAgendamento({ ...newAgendamento, blocoHorarioId: value })}
                disabled={!newAgendamento.dataAgendamento}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione um horário" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {newAgendamento.dataAgendamento ? (
                    (() => {
                      const blocosDisponiveis = getBlocosDisponiveis(new Date(newAgendamento.dataAgendamento + 'T00:00:00'));
                      
                      if (blocosDisponiveis.length === 0) {
                        return <div className="p-2 text-sm text-gray-500">Nenhum horário disponível para este dia</div>;
                      }

                      return blocosDisponiveis.map((bloco) => {
                        const ocupado = isBlocoOcupado(bloco.id, newAgendamento.dataAgendamento);
                        return (
                          <SelectItem 
                            key={bloco.id} 
                            value={bloco.id}
                            disabled={ocupado}
                          >
                            {bloco.horaInicio.substring(0, 5)} - {bloco.horaFim.substring(0, 5)}
                            {ocupado && ' (Ocupado)'}
                          </SelectItem>
                        );
                      });
                    })()
                  ) : (
                    <div className="p-2 text-sm text-gray-500">Selecione uma data primeiro</div>
                  )}
                </SelectContent>
              </Select>
              {newAgendamento.dataAgendamento && getBlocosDisponiveis(new Date(newAgendamento.dataAgendamento + 'T00:00:00')).length === 0 && (
                <p className="text-xs text-yellow-500">
                  Não há horários configurados para {diasSemana[new Date(newAgendamento.dataAgendamento + 'T00:00:00').getDay()]}
                </p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Input
                id="observacoes"
                type="text"
                placeholder="Ex: Primeira consulta, avaliação física..."
                value={newAgendamento.observacoes}
                onChange={(e) => setNewAgendamento({ ...newAgendamento, observacoes: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            {/* Resumo */}
            {newAgendamento.alunoId && newAgendamento.blocoHorarioId && (
              <Card className="p-3 border-gray-700 bg-gray-800/50">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Resumo do Agendamento</h4>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>
                    <span className="font-medium">Aluno:</span>{' '}
                    {alunosData.find(a => a.id === newAgendamento.alunoId)?.nome}
                  </p>
                  <p>
                    <span className="font-medium">Data:</span>{' '}
                    {format(new Date(newAgendamento.dataAgendamento + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p>
                    <span className="font-medium">Horário:</span>{' '}
                    {(() => {
                      const bloco = blocosData.find(b => b.id === newAgendamento.blocoHorarioId);
                      return bloco ? `${bloco.horaInicio.substring(0, 5)} - ${bloco.horaFim.substring(0, 5)}` : '';
                    })()}
                  </p>
                </div>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNewAgendamentoModalOpen(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAgendamento}
              disabled={createAgendamento.isPending || !newAgendamento.alunoId || !newAgendamento.blocoHorarioId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createAgendamento.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Agendamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
