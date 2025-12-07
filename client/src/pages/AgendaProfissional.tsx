import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  User,
  MapPin,
  Video,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  useAgendamentos,
  useUpdateAgendamento,
  useDeleteAgendamento,
  useCreateAgendamento,
} from '@/hooks/useAgenda';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/PageHeader';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CalendarioUnificado } from '@/components/agenda/CalendarioUnificado';

type ViewMode = 'day' | 'week' | 'month';

export default function AgendaProfissional() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedAgendamento, setSelectedAgendamento] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [agendamentoToDelete, setAgendamentoToDelete] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    status: '',
    observacoes: '',
  });
  const [newAgendamentoData, setNewAgendamentoData] = useState({
    alunoId: '',
    dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: '',
    horaFim: '',
    tipo: 'presencial',
    observacoes: '',
  });
  const { toast } = useToast();

  // Buscar dados - buscar 3 meses (anterior, atual e próximo) para cobrir todos os casos
  const today = new Date();
  const startDate = format(startOfMonth(addMonths(today, -1)), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(addMonths(today, 13)), 'yyyy-MM-dd'); // +13 meses para cobrir 2025

  console.log('📅 AgendaProfissional - Buscando agendamentos:', {
    startDate,
    endDate,
    today: format(today, 'yyyy-MM-dd')
  });

  const { data: agendamentosData, isLoading: loadingAgendamentos } =
    useAgendamentos(startDate, endDate);
  const { data: alunosData = [], isLoading: loadingAlunos } = useAlunos();

  const agendamentos = (agendamentosData || []) as any[];

  console.log('📊 AgendaProfissional - Dados recebidos:', {
    agendamentos: agendamentos.length,
    isLoading: loadingAgendamentos,
    sample: agendamentos[0]
  });

  const updateAgendamento = useUpdateAgendamento();
  const deleteAgendamento = useDeleteAgendamento();
  const createAgendamento = useCreateAgendamento();

  const isLoading = loadingAgendamentos || loadingAlunos;

  // Estatísticas
  const stats = {
    total: agendamentos.length,
    agendados: agendamentos.filter((a: any) => a.status === 'agendado').length,
    confirmados: agendamentos.filter((a: any) => a.status === 'confirmado').length,
    concluidos: agendamentos.filter((a: any) => a.status === 'concluido').length,
  };



  // Modais
  const handleOpenDetail = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setIsDetailModalOpen(true);
  };

  const handleOpenEdit = (agendamento: any) => {
    setSelectedAgendamento(agendamento);
    setEditData({
      status: agendamento.status,
      observacoes: agendamento.observacoes || '',
    });
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedAgendamento) return;

    try {
      await updateAgendamento.mutateAsync({
        id: selectedAgendamento.id,
        status: editData.status,
        observacoes: editData.observacoes,
      });
      setIsEditModalOpen(false);
      setSelectedAgendamento(null);
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
    }
  };

  const handleDeleteClick = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setAgendamentoToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!agendamentoToDelete) return;

    try {
      await deleteAgendamento.mutateAsync(agendamentoToDelete);
      setIsDetailModalOpen(false);
      setSelectedAgendamento(null);
      setIsDeleteDialogOpen(false);
      setAgendamentoToDelete(null);
    } catch (error) {
      console.error('Erro ao deletar agendamento:', error);
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateAgendamento.mutateAsync({
        id,
        status: newStatus,
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const handleOpenNew = () => {
    setNewAgendamentoData({
      alunoId: '',
      dataAgendamento: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '',
      horaFim: '',
      tipo: 'presencial',
      observacoes: '',
    });
    setIsNewModalOpen(true);
  };

  const handleTimeSlotClick = (date: Date, time: string) => {
    setNewAgendamentoData({
      alunoId: '',
      dataAgendamento: format(date, 'yyyy-MM-dd'),
      horaInicio: time,
      horaFim: '',
      tipo: 'presencial',
      observacoes: '',
    });
    setIsNewModalOpen(true);
  };

  const handleCreateAgendamento = async () => {
    if (
      !newAgendamentoData.alunoId ||
      !newAgendamentoData.horaInicio ||
      !newAgendamentoData.horaFim
    ) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
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
        observacoes: newAgendamentoData.observacoes,
      } as any);
      setIsNewModalOpen(false);
      toast({
        title: 'Sucesso',
        description: 'Agendamento criado com sucesso',
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
      concluido: 'bg-gray-500/10 text-gray-400 border-gray-500/30',
    };
    return colors[status as keyof typeof colors] || colors.agendado;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      agendado: AlertCircle,
      confirmado: CheckCircle2,
      cancelado: XCircle,
      concluido: CheckCircle2,
    };
    const Icon = icons[status as keyof typeof icons] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      agendado: 'Agendado',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      concluido: 'Concluído',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTipoIcon = (tipo: string) => {
    const Icon = tipo === 'online' ? Video : MapPin;
    return Icon;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-8">
        {/* Header */}
        <PageHeader
          title="Agenda Profissional"
          description="Gerencie seus atendimentos presenciais e online"
          actions={
            <Button
              size="sm"
              onClick={handleOpenNew}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              disabled={isLoading}
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Novo Agendamento</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          }
        />

        {/* Stats Cards - Compact Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
                <p className="text-[10px] text-gray-500">agendamentos</p>
              </div>
            </div>
          </div>

          {/* Agendados */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Agendados</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.agendados}</p>
                <p className="text-[10px] text-gray-500">aguardando</p>
              </div>
            </div>
          </div>

          {/* Confirmados */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Confirmados</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.confirmados}</p>
                <p className="text-[10px] text-gray-500">próximos</p>
              </div>
            </div>
          </div>

          {/* Concluídos */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Concluídos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.concluidos}</p>
                <p className="text-[10px] text-gray-500">este período</p>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('day')}
                className={
                  viewMode === 'day'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              >
                Dia
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('week')}
                className={
                  viewMode === 'week'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              >
                Semana
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('month')}
                className={
                  viewMode === 'month'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              >
                Mês
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calendário Unificado */}
        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-3 text-gray-400">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Carregando agendamentos...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-1">
            <CalendarioUnificado
              agendamentos={agendamentos}
              onAgendamentoClick={handleOpenDetail}
              onTimeSlotClick={handleTimeSlotClick}
              viewMode={viewMode}
            />
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
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-400 uppercase">Aluno</h4>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
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
                  <Badge variant="outline" className={`gap-1 ${getStatusColor(selectedAgendamento.status)}`}>
                    {getStatusIcon(selectedAgendamento.status)}
                    {getStatusLabel(selectedAgendamento.status)}
                  </Badge>
                </div>
              </div>

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
              onClick={() => selectedAgendamento && handleDeleteClick(selectedAgendamento.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Deletar
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
                onValueChange={(value) =>
                  setNewAgendamentoData({ ...newAgendamentoData, alunoId: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {alunosData.map((aluno) => (
                    <SelectItem
                      key={aluno.id}
                      value={aluno.id}
                      className="text-white hover:bg-gray-700"
                    >
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
                onChange={(e) =>
                  setNewAgendamentoData({ ...newAgendamentoData, dataAgendamento: e.target.value })
                }
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
                  onChange={(e) =>
                    setNewAgendamentoData({ ...newAgendamentoData, horaInicio: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="horaFim">Hora Fim *</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={newAgendamentoData.horaFim}
                  onChange={(e) =>
                    setNewAgendamentoData({ ...newAgendamentoData, horaFim: e.target.value })
                  }
                  className="bg-gray-800 border-gray-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Atendimento</Label>
              <Select
                value={newAgendamentoData.tipo}
                onValueChange={(value) =>
                  setNewAgendamentoData({ ...newAgendamentoData, tipo: value })
                }
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="presencial" className="text-white hover:bg-gray-700">
                    Presencial
                  </SelectItem>
                  <SelectItem value="online" className="text-white hover:bg-gray-700">
                    Online
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes-new">Observações</Label>
              <Textarea
                id="observacoes-new"
                value={newAgendamentoData.observacoes}
                onChange={(e) =>
                  setNewAgendamentoData({ ...newAgendamentoData, observacoes: e.target.value })
                }
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Deletar Agendamento"
        description="Tem certeza que deseja deletar este agendamento? Esta ação não pode ser desfeita."
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </div>
  );
}
