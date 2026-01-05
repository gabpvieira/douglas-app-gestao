import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScheduleSession {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  type: "Treino Presencial" | "Avaliação Física" | "Consultoria";
  location: string;
  trainer: string;
  status: "confirmed" | "pending" | "cancelled";
  notes?: string;
}

export default function MySchedule() {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedSession, setSelectedSession] = useState<ScheduleSession | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // TODO: Replace with real data from API
  const sessions: ScheduleSession[] = [
    {
      id: 1,
      date: "2024-11-18",
      startTime: "09:00",
      endTime: "10:00",
      type: "Treino Presencial",
      location: "Academia FitLife - Sala 2",
      trainer: "Douglas Silva",
      status: "confirmed",
      notes: "Treino de pernas - trazer joelheira"
    },
    {
      id: 2,
      date: "2024-11-18",
      startTime: "14:00",
      endTime: "15:00",
      type: "Avaliação Física",
      location: "Academia FitLife - Sala de Avaliação",
      trainer: "Douglas Silva",
      status: "confirmed"
    },
    {
      id: 3,
      date: "2024-11-20",
      startTime: "10:00",
      endTime: "11:00",
      type: "Treino Presencial",
      location: "Academia FitLife - Sala 2",
      trainer: "Douglas Silva",
      status: "confirmed"
    },
    {
      id: 4,
      date: "2024-11-22",
      startTime: "09:00",
      endTime: "10:00",
      type: "Treino Presencial",
      location: "Academia FitLife - Sala 2",
      trainer: "Douglas Silva",
      status: "pending",
      notes: "Aguardando confirmação"
    },
    {
      id: 5,
      date: "2024-11-23",
      startTime: "15:00",
      endTime: "16:00",
      type: "Consultoria",
      location: "Online - Google Meet",
      trainer: "Douglas Silva",
      status: "confirmed"
    }
  ];

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const getSessionsForDay = (date: Date) => {
    return sessions.filter(session => 
      isSameDay(parseISO(session.date), date)
    ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const handlePreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  const handleCancelSession = (sessionId: number) => {
    // TODO: Implement API call to cancel session
    console.log("Cancel session:", sessionId);
    setShowCancelDialog(false);
    setSelectedSession(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <Badge className="bg-chart-2 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Confirmado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  const SessionCard = ({ session }: { session: ScheduleSession }) => (
    <Card 
      className={`p-4 hover-elevate cursor-pointer transition-all ${
        session.status === 'cancelled' ? 'opacity-50' : ''
      }`}
      onClick={() => setSelectedSession(session)}
      data-testid={`session-card-${session.id}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-semibold">
            {session.startTime} - {session.endTime}
          </span>
        </div>
        {getStatusBadge(session.status)}
      </div>
      
      <h4 className="font-medium mb-2">{session.type}</h4>
      
      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3" />
          {session.location}
        </div>
        <div className="flex items-center gap-2">
          <User className="w-3 h-3" />
          {session.trainer}
        </div>
      </div>

      {session.notes && (
        <div className="mt-3 p-2 bg-muted/50 rounded text-xs">
          💡 {session.notes}
        </div>
      )}
    </Card>
  );

  const confirmedCount = sessions.filter(s => s.status === 'confirmed').length;
  const pendingCount = sessions.filter(s => s.status === 'pending').length;
  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = parseISO(session.date);
    return sessionDate >= currentWeekStart && sessionDate < addDays(currentWeekStart, 7);
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minha Agenda</h1>
          <p className="text-muted-foreground">Visualize seus horários de treinos presenciais</p>
        </div>
        <Button data-testid="button-request-session">
          <Plus className="w-4 h-4 mr-2" />
          Solicitar Horário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Esta Semana</p>
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{thisWeekSessions.length}</p>
          <p className="text-xs text-muted-foreground mt-1">sessões agendadas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Confirmados</p>
            <CheckCircle2 className="w-5 h-5 text-chart-2" />
          </div>
          <p className="text-3xl font-bold">{confirmedCount}</p>
          <p className="text-xs text-muted-foreground mt-1">treinos confirmados</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{pendingCount}</p>
          <p className="text-xs text-muted-foreground mt-1">aguardando confirmação</p>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePreviousWeek}
            data-testid="button-previous-week"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentWeekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(currentWeekStart, 6), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h2>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNextWeek}
            data-testid="button-next-week"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          {weekDays.map((day, index) => {
            const daySessions = getSessionsForDay(day);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div 
                key={index} 
                className={`space-y-3 ${isToday ? 'md:col-span-1' : ''}`}
                data-testid={`day-column-${index}`}
              >
                <div className={`text-center p-3 rounded-lg ${
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  <p className="text-xs font-medium uppercase">
                    {format(day, "EEE", { locale: ptBR })}
                  </p>
                  <p className="text-2xl font-bold mt-1">
                    {format(day, "d")}
                  </p>
                  {isToday && (
                    <p className="text-xs mt-1">Hoje</p>
                  )}
                </div>

                <div className="space-y-2">
                  {daySessions.length > 0 ? (
                    daySessions.map(session => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Sem treinos
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Session Details Dialog */}
      <Dialog open={!!selectedSession && !showCancelDialog} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Detalhes da Sessão
            </DialogTitle>
            <DialogDescription>
              {selectedSession && format(parseISO(selectedSession.date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{selectedSession.type}</h3>
                {getStatusBadge(selectedSession.status)}
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {selectedSession.startTime} - {selectedSession.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium">{selectedSession.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Personal Trainer</p>
                    <p className="font-medium">{selectedSession.trainer}</p>
                  </div>
                </div>

                {selectedSession.notes && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium mb-1">Observações</p>
                    <p className="text-sm text-muted-foreground">{selectedSession.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedSession?.status !== 'cancelled' && (
              <Button 
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                data-testid="button-cancel-session"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Sessão
              </Button>
            )}
            <Button 
              variant="outline"
              onClick={() => setSelectedSession(null)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Cancelar Sessão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar esta sessão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {selectedSession && (
            <div className="py-4">
              <Card className="p-4 bg-muted/50">
                <p className="font-medium mb-2">{selectedSession.type}</p>
                <p className="text-sm text-muted-foreground">
                  {format(parseISO(selectedSession.date), "d 'de' MMMM", { locale: ptBR })} • {selectedSession.startTime} - {selectedSession.endTime}
                </p>
              </Card>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Não, manter sessão
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedSession && handleCancelSession(selectedSession.id)}
              data-testid="button-confirm-cancel"
            >
              Sim, cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
