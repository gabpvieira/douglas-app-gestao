import { useState } from 'react';
import { Calendar, Clock, MapPin, Video, AlertCircle, CheckCircle2, XCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useAgendamentosAluno, useSolicitarReagendamento, useComunicarFalta } from '@/hooks/useAgendaAluno';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import AlunoLayout from '@/components/aluno/AlunoLayout';

export default function AgendaAluno() {
  const { data: agendamentos = [], isLoading } = useAgendamentosAluno();
  const solicitarReagendamento = useSolicitarReagendamento();
  const comunicarFalta = useComunicarFalta();

  const [modalReagendar, setModalReagendar] = useState<{ open: boolean; agendamento?: any }>({ open: false });
  const [modalFalta, setModalFalta] = useState<{ open: boolean; agendamento?: any }>({ open: false });
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Marcar automaticamente agendamentos passados como concluídos
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const agendamentosProcessados = agendamentos.map(ag => {
    const dataAg = new Date(ag.dataAgendamento);
    // Se a data já passou e o status não é cancelado, marcar como concluído
    if (dataAg < hoje && ag.status !== 'cancelado' && ag.status !== 'concluido') {
      return { ...ag, status: 'concluido', autoCompleted: true };
    }
    return ag;
  });

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentosProcessados.filter(ag => {
    // No filtro "todos", ocultar os concluídos automaticamente
    if (filtroStatus === 'todos') {
      return ag.status !== 'concluido' && ag.status !== 'cancelado';
    }
    return ag.status === filtroStatus;
  });

  // Separar agendamentos por período
  const proximos = agendamentosFiltrados.filter(ag => {
    const dataAg = new Date(ag.dataAgendamento);
    return dataAg >= hoje && ag.status !== 'cancelado' && ag.status !== 'concluido';
  });

  const passados = agendamentosProcessados.filter(ag => {
    const dataAg = new Date(ag.dataAgendamento);
    return (dataAg < hoje || ag.status === 'concluido') && ag.status !== 'cancelado';
  });

  const cancelados = agendamentosProcessados.filter(ag => ag.status === 'cancelado');

  // Handlers
  const handleReagendar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await solicitarReagendamento.mutateAsync({
      agendamentoId: modalReagendar.agendamento.id,
      novaData: formData.get('novaData') as string,
      novaHoraInicio: formData.get('novaHora') as string,
      motivo: formData.get('motivo') as string,
    });

    setModalReagendar({ open: false });
  };

  const handleComunicarFalta = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await comunicarFalta.mutateAsync({
      agendamentoId: modalFalta.agendamento.id,
      motivo: formData.get('motivo') as string,
    });

    setModalFalta({ open: false });
  };

  if (isLoading) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pt-3 md:pt-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">Minha Agenda</h1>
            <p className="text-sm text-gray-400">Gerencie seus agendamentos e horários</p>
          </div>

          {/* KPIs - Layout 2x2 Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Próximos</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{proximos.length}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">agenda</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Confirmados</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {agendamentosProcessados.filter(a => a.status === 'confirmado').length}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">agenda</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Realizados</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{passados.length}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">agenda</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Cancelados</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{cancelados.length}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">agenda</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2">
            {['todos', 'agendado', 'confirmado', 'concluido', 'cancelado'].map((status) => (
              <Button
                key={status}
                variant={filtroStatus === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFiltroStatus(status)}
                className={
                  filtroStatus === status
                    ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                    : "bg-gray-900/30 border-gray-800 text-gray-300 hover:bg-gray-900/50"
                }
              >
                {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {/* Próximos Agendamentos */}
          {proximos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Próximos Agendamentos</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {proximos.map((agendamento) => (
                  <AgendamentoCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    onReagendar={() => setModalReagendar({ open: true, agendamento })}
                    onComunicarFalta={() => setModalFalta({ open: true, agendamento })}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Agendamentos Passados */}
          {passados.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Histórico</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {passados.map((agendamento) => (
                  <AgendamentoCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}

          {/* Cancelados */}
          {cancelados.length > 0 && filtroStatus === 'cancelado' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Cancelados</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {cancelados.map((agendamento) => (
                  <AgendamentoCard
                    key={agendamento.id}
                    agendamento={agendamento}
                    isPast
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {agendamentosFiltrados.length === 0 && (
            <Card className="border-gray-800 bg-gray-900/30">
              <div className="py-12 text-center">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-300 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-sm text-gray-400">
                  {filtroStatus === 'todos' 
                    ? 'Você ainda não possui agendamentos.'
                    : `Você não possui agendamentos com status "${filtroStatus}".`
                  }
                </p>
              </div>
            </Card>
          )}

          {/* Modal Reagendar */}
          <Dialog open={modalReagendar.open} onOpenChange={(open) => setModalReagendar({ open })}>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Solicitar Reagendamento</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Preencha os dados para solicitar um novo horário. O profissional irá avaliar e confirmar.
                </DialogDescription>
              </DialogHeader>
            <form onSubmit={handleReagendar} className="space-y-4">
              <div>
                <Label htmlFor="novaData" className="text-gray-300">Nova Data</Label>
                <Input
                  id="novaData"
                  name="novaData"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="novaHora" className="text-gray-300">Novo Horário</Label>
                <Input
                  id="novaHora"
                  name="novaHora"
                  type="time"
                  required
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="motivo" className="text-gray-300">Motivo do Reagendamento</Label>
                <Textarea
                  id="motivo"
                  name="motivo"
                  placeholder="Explique o motivo da solicitação..."
                  required
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalReagendar({ open: false })}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={solicitarReagendamento.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {solicitarReagendamento.isPending ? 'Enviando...' : 'Solicitar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

          {/* Modal Comunicar Falta */}
          <Dialog open={modalFalta.open} onOpenChange={(open) => setModalFalta({ open })}>
            <DialogContent className="bg-gray-900 border-gray-800">
              <DialogHeader>
                <DialogTitle className="text-white">Comunicar Falta</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Informe o motivo da sua ausência. É importante avisar com antecedência.
                </DialogDescription>
              </DialogHeader>
            <form onSubmit={handleComunicarFalta} className="space-y-4">
              <div>
                <Label htmlFor="motivo" className="text-gray-300">Motivo da Falta</Label>
                <Textarea
                  id="motivo"
                  name="motivo"
                  placeholder="Explique o motivo da sua ausência..."
                  required
                  rows={4}
                  className="bg-gray-800 border-gray-700 text-gray-100"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalFalta({ open: false })}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={comunicarFalta.isPending}
                  variant="destructive"
                >
                  {comunicarFalta.isPending ? 'Enviando...' : 'Confirmar Falta'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </AlunoLayout>
  );
}

// Componente do Card de Agendamento
function AgendamentoCard({ 
  agendamento, 
  onReagendar, 
  onComunicarFalta,
  isPast = false 
}: { 
  agendamento: any; 
  onReagendar?: () => void;
  onComunicarFalta?: () => void;
  isPast?: boolean;
}) {
  const statusConfig = {
    agendado: {
      icon: AlertCircle,
      bg: 'bg-blue-500/10',
      text: 'text-blue-500',
      border: 'border-blue-500/20',
      label: 'Agendado'
    },
    confirmado: {
      icon: CheckCircle2,
      bg: 'bg-green-500/10',
      text: 'text-green-500',
      border: 'border-green-500/20',
      label: 'Confirmado'
    },
    cancelado: {
      icon: XCircle,
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'border-red-500/20',
      label: 'Cancelado'
    },
    concluido: {
      icon: CheckCircle2,
      bg: 'bg-gray-500/10',
      text: 'text-gray-500',
      border: 'border-gray-500/20',
      label: 'Concluído'
    }
  };

  const config = statusConfig[agendamento.status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  const dataFormatada = new Date(agendamento.dataAgendamento + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Card className={cn(
      'border-gray-800 transition-colors',
      isPast ? 'bg-gray-900/20' : 'bg-gray-900/30 hover:bg-gray-900/40'
    )}>
      <div className="p-3 border-b border-gray-800">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <div className={cn('h-8 w-8 rounded flex items-center justify-center flex-shrink-0', 
              agendamento.status === 'confirmado' ? 'bg-green-600' :
              agendamento.status === 'cancelado' ? 'bg-red-600' :
              agendamento.status === 'concluido' ? 'bg-gray-600' : 'bg-blue-600'
            )}>
              {agendamento.tipo === 'presencial' ? (
                <MapPin className="w-4 h-4 text-white" />
              ) : (
                <Video className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-medium text-xs capitalize", isPast ? "text-gray-400" : "text-white")}>
                {dataFormatada}
              </p>
              <p className="text-[11px] text-gray-500">
                {agendamento.horaInicio} - {agendamento.horaFim}
              </p>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-1 px-1.5 py-0.5 rounded border-0 flex-shrink-0',
            agendamento.status === 'confirmado' ? 'bg-green-500/10 text-green-400' :
            agendamento.status === 'cancelado' ? 'bg-red-500/10 text-red-400' :
            agendamento.status === 'concluido' ? 'bg-gray-500/10 text-gray-400' : 'bg-blue-500/10 text-blue-400'
          )}>
            <StatusIcon className="w-3 h-3" />
            <span className="text-[10px] font-medium">{config.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Duração</p>
            <p className={cn("text-xs font-medium", isPast ? "text-gray-400" : "text-white")}>
              {(() => {
                const [h1, m1] = agendamento.horaInicio.split(':').map(Number);
                const [h2, m2] = agendamento.horaFim.split(':').map(Number);
                const duracao = (h2 * 60 + m2) - (h1 * 60 + m1);
                return `${duracao} min`;
              })()}
            </p>
          </div>
          <div className="text-center p-2 bg-gray-800/50 rounded">
            <p className="text-[9px] text-gray-400 uppercase tracking-wide mb-0.5">Tipo</p>
            <p className={cn("text-xs font-medium", isPast ? "text-gray-400" : "text-white")}>
              {agendamento.tipo === 'presencial' ? 'Presencial' : 'Online'}
            </p>
          </div>
        </div>
      </div>

      {agendamento.observacoes && (
        <div className="p-3 border-b border-gray-800">
          <div className={cn(
            "p-2 rounded",
            isPast 
              ? "bg-gray-800/30 border border-gray-700/50" 
              : "bg-blue-500/5 border border-blue-500/20"
          )}>
            <p className="text-[10px] font-medium text-gray-400 mb-1">Observações:</p>
            <p className={cn("text-xs whitespace-pre-wrap", isPast ? "text-gray-400" : "text-gray-300")}>
              {agendamento.observacoes}
            </p>
          </div>
        </div>
      )}

      {!isPast && agendamento.status !== 'cancelado' && (
        <div className="p-3">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReagendar}
              className="flex-1 h-8 text-xs bg-gray-900/30 border-gray-800 text-gray-300 hover:bg-gray-900/50"
            >
              Reagendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onComunicarFalta}
              className="flex-1 h-8 text-xs bg-red-500/10 border-0 text-red-400 hover:bg-red-500/20"
            >
              Comunicar Falta
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
