import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Edit,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Video,
  Phone,
  CalendarDays
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, isToday, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentos, useUpdateAgendamento, useDeleteAgendamento, useCreateAgendamento } from '@/hooks/useAgenda';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

export default function AgendaProfissional() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    observacoes: ''
  });
  const [newAgendamentoData, setNewAgendamentoData] = useState({
    alunoId: '',
    dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: '',
    horaFim: '',
    tipo: 'presencial',
    observacoes: ''
  });
  const { toast } = useToast();

  // Buscar dados reais do Supabase
  const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
  
  const { data: agendamentosData, isLoading: loadingAgendamentos } = useAgendamentos(startDate, endDate);
  const { data: alunosData = [], isLoading: loadingAlunos } = useAlunos();
  
  const agendamentos = (agendamentosData || []) as any[];
  
  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();
  const createAgendamento = useCreateAgendamento();

  const isLoading = loadingAgendamentos || loadingAlunos;

  // Filtrar agendamentos do dia selecionado
  const agendamentosDoDia = agendamentos
    .filter((a: any) => isSameDay(new Date(a.dataAgendamento), selectedDate))
    .sort((a: any, b: any) => {
      const horaA = a.horaInicio || '00:00';
      const horaB = b.horaInicio || '00:00';
      return horaA.localeCompare(horaB);
    });

  // Calcular estatísticas
  const stats = {
    total: agendamentos.length,
    agendados: agendamentos.filter((a: any) => a.status === 'agendado').length,
    confirmados: agendamentos.filter((a: any) => a.status === 'confirmado').length,
    concluidos: agendamentos.filter((a: any) => a.status === 'concluido').length
  };

  // Calcular semana atual
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Agrupar agendamentos por dia da semana
  const agendamentosPorDia = weekDays.map(day => ({
    date: day,
    agendamentos: agendamentos
      .filter((a: any) => isSameDay(new Date(a.dataAgendamento), day))
      .sort((a: any, b: any) => {
        const horaA = a.horaInicio || '00:00';
        const horaB = b.horaInicio || '00:00';
        return horaA.localeCompare(horaB);
      })
  }));

  // Navegação de datas
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
  };

  const handlePreviousWeek = () => {
    setSelectedDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    setSelectedDate(addWeeks(selectedDate, 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Abrir modal de detalhes
  const handleOpenDetail = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setIsDetailModalOpen(true);
  };

  // Abrir modal de edição
  const handleOpenEdit = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setEditData({
      status: agendamento.status,
      observacoes: agendamento.observacoes || ''
    });
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Salvar edição
  const handleSaveEdit = async () => {
    if (!selectedAgendamento) return;

    try {
      await updateAgendamento.mutateAsync({
        id: selectedAgendamento.id,
        status: editData.status,
        observacoes: editData.observacoes
      });
      setIsEditModalOpen(false);
      setSelectedAgendamento(null);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  // Deletar agendamento
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    try {
      await deleteAgendamento.mutateAsync(id);
      setIsDetailModalOpen(false);
      setSelectedAgendamento(null);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
    }
  };

  // Mudar status rapidamente
  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAgendamento.mutateAsync({
        id,
        status: newStatus
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  // Abrir modal de novo agendamento
  const handleOpenNew = () => {
    setNewAgendamentoData({
      alunoId: '',
      dataAgendamento: format(selectedDate, 'yyyy-MM-dd'),
      horaInicio: '',
      horaFim: '',
      tipo: 'presencial',
      observacoes: ''
    });
    setIsNewModalOpen(true);
  };

  // Criar novo agendamento
  const handleCreateAgendamento = async () => {
    if (!newAgendamentoData.alunoId || !newAgendamentoData.horaInicio || !newAgendamentoData.horaFim) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createAgendamento.mutateAsync({
        alunoId: newAgendamentoData.alunoId,
        dataAgendamento: newAgendamentoData.dataAgendamento,
        horaInicio: newAgendamentoData.horaInicio,
        horaFim: newAgendamentoData.horaFim,
        tipo: newAgendamentoData.tipo,
        observacoes: newAgendamentoData.observacoes
      } as any);
      setIsNewModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      agendado: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
      confirmado: 'bg-green-500/10 text-green-400 border-green-500/30',
      cancelado: 'bg-red-500/10 text-red-400 border-red-500/30',
      concluido: 'bg-gray-500/10 text-gray-400 border-gray-500/30'
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

  const getStatusLabel = (status: string) => {
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      concluido: 'Concluído'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTipoIcon = (tipo: string) => {
    const Icon = tipo === 'online' ? Video : MapPin;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header */}
        <PageHeader
          title="Agenda Profissional"
          description="Gerencie seus atendimentos presenciais e online"
          actions={
            <Button 
              size="sm" 
              onClick={handleOpenNew}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
              disabled={isLoading}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          }
        />

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

        {/* View Mode Toggle */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className={viewMode === 'day' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Dia
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                  }
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Semana
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Navigation */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'day' ? handlePreviousDay : handlePreviousWeek}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 text-center">
                {viewMode === 'day' ? (
                  <>
                    <h2 className="text-lg sm:text-2xl font-bold text-white">
                      {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">
                      <span>{format(selectedDate, "EEEE", { locale: ptBR })}</span>
                      {isToday(selectedDate) && (
                        <Badge className="ml-2 bg-blue-600 text-white">Hoje</Badge>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-lg sm:text-2xl font-bold text-white">
                      {format(weekStart, "d 'de' MMM", { locale: ptBR })} - {format(weekEnd, "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                    </h2>
                    <div className="text-xs sm:text-sm text-gray-400 mt-1">
                      Semana {format(selectedDate, 'w', { locale: ptBR })}
                    </div>
                  </>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={viewMode === 'day' ? handleNextDay : handleNextWeek}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                disabled={isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {!isToday(selectedDate) && (
              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ir para Hoje
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando agendamentos...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agendamentos do Dia */}
        {!isLoading && viewMode === 'day' && (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white">
                  Agendamentos do Dia ({agendamentosDoDia.length})
                </h3>
              </div>

              {agendamentosDoDia.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                    <CalendarIcon className="h-8 w-8 text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">Nenhum agendamento para este dia</p>
                  <p className="text-xs text-gray-600">
                    Use os botões de navegação para ver outros dias
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {agendamentosDoDia.map((agendamento: any) => {
                    const TipoIcon = getTipoIcon(agendamento.tipo || 'presencial');
                    
                    return (
                      <Card
                        key={agendamento.id}
                        className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer group"
                        onClick={() => handleOpenDetail(agendamento)}
                      >
                        <CardContent className="p-4 sm:p-5">
                          <div className="flex items-start gap-4">
                            {/* Horário */}
                            <div className="flex-shrink-0">
                              <div className="text-center">
                                <div className="text-xl sm:text-2xl font-bold text-white">
                                  {agendamento.horaInicio?.substring(0, 5) || '--:--'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {agendamento.horaFim?.substring(0, 5) || '--:--'}
                                </div>
                              </div>
                            </div>

                            {/* Divider */}
                            <div className="h-full w-px bg-gray-700" />

                            {/* Conteúdo */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                                      {agendamento.aluno?.nome || 'Aluno não encontrado'}
                                    </h4>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-400 truncate">
                                    {agendamento.aluno?.email || ''}
                                  </p>
                                </div>

                                <Badge 
                                  variant="outline" 
                                  className={`gap-1 text-xs flex-shrink-0 ${getStatusColor(agendamento.status)}`}
                                >
                                  {getStatusIcon(agendamento.status)}
                                  <span className="hidden sm:inline">{getStatusLabel(agendamento.status)}</span>
                                </Badge>
                              </div>

                              {agendamento.observacoes && (
                                <p className="text-xs sm:text-sm text-gray-500 mb-2 line-clamp-2">
                                  {agendamento.observacoes}
                                </p>
                              )}

                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <TipoIcon className="h-3 w-3" />
                                  <span className="capitalize">
                                    {agendamento.tipo || 'presencial'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Ações Rápidas */}
                            <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex flex-col gap-1">
                                {agendamento.status !== 'concluido' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleQuickStatusChange(agendamento.id, 'concluido');
                                    }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEdit(agendamento);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Visualização Semanal */}
        {!isLoading && viewMode === 'week' && (
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4">
            {agendamentosPorDia.map(({ date, agendamentos }) => {
              const isCurrentDay = isToday(date);
              const isSelectedDay = isSameDay(date, selectedDate);
              
              return (
                <Card 
                  key={date.toISOString()} 
                  className={`border-gray-800 bg-gray-900/50 backdrop-blur transition-all ${
                    isCurrentDay ? 'ring-2 ring-blue-500/50' : ''
                  } ${isSelectedDay ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <CardContent className="p-3 sm:p-4">
                    {/* Cabeçalho do Dia */}
                    <div className="text-center mb-3 pb-3 border-b border-gray-800">
                      <div className="text-xs text-gray-400 uppercase mb-1">
                        {format(date, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={`text-2xl font-bold ${isCurrentDay ? 'text-blue-400' : 'text-white'}`}>
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(date, 'MMM', { locale: ptBR })}
                      </div>
                      {isCurrentDay && (
                        <Badge className="mt-2 bg-blue-600 text-white text-xs">Hoje</Badge>
                      )}
                    </div>

                    {/* Lista de Agendamentos */}
                    <div className="space-y-2">
                      {agendamentos.length === 0 ? (
                        <div className="text-center py-4">
                          <CalendarIcon className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                          <p className="text-xs text-gray-600">Sem agendamentos</p>
                        </div>
                      ) : (
                        agendamentos.map((agendamento: any) => {
                          const TipoIcon = getTipoIcon(agendamento.tipo || 'presencial');
                          
                          return (
                            <Card
                              key={agendamento.id}
                              className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer group"
                              onClick={() => handleOpenDetail(agendamento)}
                            >
                              <CardContent className="p-2">
                                {/* Horário */}
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                  <span className="text-xs font-medium text-white">
                                    {agendamento.horaInicio?.substring(0, 5)}
                                  </span>
                                </div>

                                {/* Aluno */}
                                <div className="flex items-start gap-2 mb-2">
                                  <User className="h-3 w-3 text-gray-500 flex-shrink-0 mt-0.5" />
                                  <p className="text-xs text-gray-300 line-clamp-2 flex-1">
                                    {agendamento.aluno?.nome || 'N/A'}
                                  </p>
                                </div>

                                {/* Status e Tipo */}
                                <div className="flex items-center justify-between gap-2">
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] px-1.5 py-0.5 ${getStatusColor(agendamento.status)}`}
                                  >
                                    {getStatusIcon(agendamento.status)}
                                  </Badge>
                                  <TipoIcon className="h-3 w-3 text-gray-500" />
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })
                      )}
                    </div>

                    {/* Contador de Agendamentos */}
                    {agendamentos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                        <span className="text-xs text-gray-500">
                          {agendamentos.length} {agendamentos.length === 1 ? 'agendamento' : 'agendamentos'}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Informações completas do atendimento
            </DialogDescription>
          </DialogHeader>

          {selectedAgendamento && (
            <div className="space-y-6">
              {/* Informações do Aluno */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase">Aluno</h4>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedAgendamento.aluno?.nome?.substring(0, 2).toUpperCase() || 'NA'}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {selectedAgendamento.aluno?.nome || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {selectedAgendamento.aluno?.email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações do Agendamento */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Data</p>
                  <p className="text-sm text-white">
                    {format(new Date(selectedAgendamento.dataAgendamento), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Horário</p>
                  <p className="text-sm text-white">
                    {selectedAgendamento.horaInicio?.substring(0, 5)} - {selectedAgendamento.horaFim?.substring(0, 5)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Tipo</p>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const TipoIcon = getTipoIcon(selectedAgendamento.tipo || 'presencial');
                      return <TipoIcon className="h-4 w-4 text-gray-400" />;
                    })()}
                    <span className="text-sm text-white capitalize">
                      {selectedAgendamento.tipo || 'presencial'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Status</p>
                  <Badge 
                    variant="outline" 
                    className={`gap-1 ${getStatusColor(selectedAgendamento.status)}`}
                  >
                    {getStatusIcon(selectedAgendamento.status)}
                    {getStatusLabel(selectedAgendamento.status)}
                  </Badge>
                </div>
              </div>

              {/* Observações */}
              {selectedAgendamento.observacoes && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase">Observações</p>
                  <p className="text-sm text-white bg-gray-800/50 p-3 rounded-lg">
                    {selectedAgendamento.observacoes}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDetailModalOpen(false)}
              className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Fechar
            </Button>
            <Button
              variant="outline"
              onClick={() => selectedAgendamento && handleOpenEdit(selectedAgendamento)}
              className="border-blue-700 bg-blue-900/20 text-blue-400 hover:bg-blue-900/40"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAgendamento && handleDelete(selectedAgendamento.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Agendamento */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="max-w-lg bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Novo Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Crie um novo atendimento para um aluno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="aluno">Aluno *</Label>
              <Select
                value={newAgendamentoData.alunoId}
                onValueChange={(value) => setNewAgendamentoData({ ...newAgendamentoData, alunoId: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {alunosData.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id} className="text-white hover:bg-gray-700">
                      {aluno.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={newAgendamentoData.dataAgendamento}
                onChange={(e) => setNewAgendamentoData({ ...newAgendamentoData, dataAgendamento: e.target.value })}
                className="bg-gray-800 border-gray-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Hora Início *</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={newAgendamentoData.horaInicio}
                  onChange={(e) => setNewAgendamentoData({ ...newAgendamentoData, horaInicio: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora Fim *</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={newAgendamentoData.horaFim}
                  onChange={(e) => setNewAgendamentoData({ ...newAgendamentoData, horaFim: e.target.value })}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Atendimento</Label>
              <Select
                value={newAgendamentoData.tipo}
                onValueChange={(value) => setNewAgendamentoData({ ...newAgendamentoData, tipo: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="presencial" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Presencial
                    </div>
                  </SelectItem>
                  <SelectItem value="online" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Online
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes-new">Observações</Label>
              <Textarea
                id="observacoes-new"
                value={newAgendamentoData.observacoes}
                onChange={(e) => setNewAgendamentoData({ ...newAgendamentoData, observacoes: e.target.value })}
                placeholder="Adicione observações sobre o atendimento..."
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNewModalOpen(false)}
              className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateAgendamento}
              disabled={createAgendamento.isPending}
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

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Agendamento</DialogTitle>
            <DialogDescription className="text-gray-400">
              Atualize as informações do atendimento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={editData.status}
                onValueChange={(value) => setEditData({ ...editData, status: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={editData.observacoes}
                onChange={(e) => setEditData({ ...editData, observacoes: e.target.value })}
                placeholder="Adicione observações sobre o atendimento..."
                className="bg-gray-800 border-gray-700 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateAgendamento.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateAgendamento.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
