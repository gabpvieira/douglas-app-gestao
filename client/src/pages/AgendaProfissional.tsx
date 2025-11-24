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
  Phone
} from 'lucide-react';
import { format, addDays, subDays, isSameDay, startOfMonth, endOfMonth, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAgendamentos, useUpdateAgendamento, useDeleteAgendamento } from '@/hooks/useAgenda';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';

export default function AgendaProfissional() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState({
    status: '',
    observacoes: ''
  });
  const { toast } = useToast();

  // Buscar dados reais do Supabase
  const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
  
  const { data: agendamentosData = [], isLoading: loadingAgendamentos } = useAgendamentos(startDate, endDate);
  const { data: alunosData = [], isLoading: loadingAlunos } = useAlunos();
  
  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();

  const isLoading = loadingAgendamentos || loadingAlunos;

  // Filtrar agendamentos do dia selecionado
  const agendamentosDoDia = agendamentosData
    .filter(a => isSameDay(new Date(a.dataAgendamento), selectedDate))
    .sort((a, b) => {
      const horaA = (a as any).horaInicio || '00:00';
      const horaB = (b as any).horaInicio || '00:00';
      return horaA.localeCompare(horaB);
    });

  // Calcular estatísticas
  const stats = {
    total: agendamentosData.length,
    agendados: agendamentosData.filter(a => a.status === 'agendado').length,
    confirmados: agendamentosData.filter(a => a.status === 'confirmado').length,
    concluidos: agendamentosData.filter(a => a.status === 'concluido').length
  };

  // Navegação de datas
  const handlePreviousDay = () => {
    setSelectedDate(subDays(selectedDate, 1));
  };

  const handleNextDay = () => {
    setSelectedDate(addDays(selectedDate, 1));
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

        {/* Date Navigation */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousDay}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
                disabled={isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 text-center">
                <h2 className="text-lg sm:text-2xl font-bold text-white">
                  {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <div className="text-xs sm:text-sm text-gray-400 mt-1">
                  <span>{format(selectedDate, "EEEE", { locale: ptBR })}</span>
                  {isToday(selectedDate) && (
                    <Badge className="ml-2 bg-blue-600 text-white">Hoje</Badge>
                  )}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDay}
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
        {!isLoading && (
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
