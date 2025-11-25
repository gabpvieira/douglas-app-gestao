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

  // Filtrar agendamentos
  const agendamentosFiltrados = agendamentos.filter(ag => {
    if (filtroStatus === 'todos') return true;
    return ag.status === filtroStatus;
  });

  // Separar agendamentos por período
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const proximos = agendamentosFiltrados.filter(ag => {
    const dataAg = new Date(ag.dataAgendamento);
    return dataAg >= hoje && ag.status !== 'cancelado' && ag.status !== 'concluido';
  });

  const passados = agendamentosFiltrados.filter(ag => {
    const dataAg = new Date(ag.dataAgendamento);
    return dataAg < hoje || ag.status === 'concluido';
  });

  const cancelados = agendamentosFiltrados.filter(ag => ag.status === 'cancelado');

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Minha Agenda</h1>
          <p className="text-gray-400 mt-1">Gerencie seus agendamentos e horários</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Próximos</p>
                  <p className="text-2xl font-bold text-gray-100">{proximos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Confirmados</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {agendamentos.filter(a => a.status === 'confirmado').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Realizados</p>
                  <p className="text-2xl font-bold text-gray-100">{passados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Cancelados</p>
                  <p className="text-2xl font-bold text-gray-100">{cancelados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              {['todos', 'agendado', 'confirmado', 'concluido', 'cancelado'].map((status) => (
                <Button
                  key={status}
                  variant={filtroStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFiltroStatus(status)}
                  className={cn(
                    'transition-all',
                    filtroStatus === status && 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {status === 'todos' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        {proximos.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">Próximos Agendamentos</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <h2 className="text-xl font-bold text-gray-100">Histórico</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
            <h2 className="text-xl font-bold text-gray-100">Cancelados</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-400">
                  {filtroStatus === 'todos' 
                    ? 'Você ainda não possui agendamentos.'
                    : `Você não possui agendamentos com status "${filtroStatus}".`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modal Reagendar */}
        <Dialog open={modalReagendar.open} onOpenChange={(open) => setModalReagendar({ open })}>
          <DialogContent className="bg-gray-900 border-gray-800">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Solicitar Reagendamento</DialogTitle>
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
              <DialogTitle className="text-gray-100">Comunicar Falta</DialogTitle>
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
      'bg-gray-900 border-gray-800 transition-all',
      'hover:border-gray-700',
      isPast && 'opacity-60'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', config.bg)}>
              {agendamento.tipo === 'presencial' ? (
                <MapPin className={cn('w-5 h-5', config.text)} />
              ) : (
                <Video className={cn('w-5 h-5', config.text)} />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-100 capitalize">{dataFormatada}</p>
              <p className="text-sm text-gray-400">
                {agendamento.horaInicio} - {agendamento.horaFim}
              </p>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-full border',
            config.bg,
            config.text,
            config.border
          )}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Duração: {
              (() => {
                const [h1, m1] = agendamento.horaInicio.split(':').map(Number);
                const [h2, m2] = agendamento.horaFim.split(':').map(Number);
                const duracao = (h2 * 60 + m2) - (h1 * 60 + m1);
                return `${duracao} minutos`;
              })()
            }</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            {agendamento.tipo === 'presencial' ? (
              <>
                <MapPin className="w-4 h-4" />
                <span>Atendimento Presencial</span>
              </>
            ) : (
              <>
                <Video className="w-4 h-4" />
                <span>Atendimento Online</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {agendamento.observacoes && (
        <CardContent className="pt-0 pb-3">
          <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
            <p className="text-xs font-medium text-gray-400 mb-1">Observações:</p>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{agendamento.observacoes}</p>
          </div>
        </CardContent>
      )}

      {!isPast && agendamento.status !== 'cancelado' && (
        <CardContent className="pt-0">
          <div className="flex gap-2 pt-3 border-t border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={onReagendar}
              className="flex-1"
            >
              Reagendar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onComunicarFalta}
              className="flex-1 text-red-500 hover:text-red-400 hover:bg-red-500/10"
            >
              Comunicar Falta
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
