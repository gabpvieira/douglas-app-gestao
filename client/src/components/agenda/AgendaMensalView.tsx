import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Trash2 } from 'lucide-react';
import {
  format,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isToday,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaMensalViewProps {
  selectedDate: Date;
  agendamentos: any[];
  onAgendamentoClick: (agendamento: any) => void;
  onDeleteClick: (id: string, e?: React.MouseEvent) => void;
  getStatusColor: (status: string) => string;
  getTipoIcon: (tipo: string) => any;
}

export function AgendaMensalView({
  selectedDate,
  agendamentos,
  onAgendamentoClick,
  onDeleteClick,
  getStatusColor,
  getTipoIcon,
}: AgendaMensalViewProps) {
  // Calcular dias do calendário (incluindo dias do mês anterior e próximo)
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  // Agrupar agendamentos por dia
  const agendamentosPorDia = calendarDays.map((day) => ({
    date: day,
    isCurrentMonth: isSameMonth(day, selectedDate),
    agendamentos: agendamentos
      .filter((a: any) => isSameDay(new Date(a.dataAgendamento), day))
      .sort((a: any, b: any) => {
        const horaA = a.horaInicio || '00:00';
        const horaB = b.horaInicio || '00:00';
        return horaA.localeCompare(horaB);
      }),
  }));

  return (
    <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
      <CardContent className="p-4 sm:p-6">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
            <div
              key={dia}
              className="text-center text-xs font-semibold text-gray-400 uppercase py-2"
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-2">
          {agendamentosPorDia.map(
            ({ date, isCurrentMonth, agendamentos: agendamentosDia }) => {
              const isCurrentDay = isToday(date);
              const hasAgendamentos = agendamentosDia.length > 0;

              return (
                <div
                  key={date.toISOString()}
                  className={`
                    min-h-[100px] sm:min-h-[120px] p-2 rounded-lg border transition-all
                    ${
                      isCurrentMonth
                        ? 'bg-gray-800/30 border-gray-700'
                        : 'bg-gray-900/20 border-gray-800/50 opacity-40'
                    }
                    ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                    ${hasAgendamentos && isCurrentMonth ? 'hover:bg-gray-800/50 cursor-pointer' : ''}
                  `}
                >
                  {/* Número do dia */}
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`
                        text-sm font-semibold
                        ${isCurrentDay ? 'text-blue-400' : isCurrentMonth ? 'text-white' : 'text-gray-600'}
                      `}
                    >
                      {format(date, 'd')}
                    </span>
                    {hasAgendamentos && (
                      <Badge className="h-5 px-1.5 text-[10px] bg-blue-600/20 text-blue-400 border-blue-500/30">
                        {agendamentosDia.length}
                      </Badge>
                    )}
                  </div>

                  {/* Lista de agendamentos */}
                  <div className="space-y-1">
                    {agendamentosDia.slice(0, 3).map((agendamento: any) => {
                      const TipoIcon = getTipoIcon(
                        agendamento.tipo || 'presencial'
                      );

                      return (
                        <div
                          key={agendamento.id}
                          onClick={() => onAgendamentoClick(agendamento)}
                          className={`
                            group relative p-1.5 rounded text-xs cursor-pointer transition-all
                            ${getStatusColor(agendamento.status).replace('border-', 'border-l-2 border-l-')}
                            hover:bg-gray-700/50
                          `}
                        >
                          <div className="flex items-center gap-1 mb-0.5">
                            <Clock className="h-2.5 w-2.5 text-gray-400 flex-shrink-0" />
                            <span className="text-[10px] text-gray-300 font-medium">
                              {agendamento.horaInicio?.substring(0, 5)}
                            </span>
                            <TipoIcon className="h-2.5 w-2.5 text-gray-500 ml-auto" />
                          </div>
                          <p className="text-[10px] text-gray-400 truncate">
                            {agendamento.aluno?.nome || 'N/A'}
                          </p>

                          {/* Botão de deletar (aparece no hover) */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute top-0 right-0 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-600 text-white"
                            onClick={(e) => onDeleteClick(agendamento.id, e)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      );
                    })}

                    {/* Indicador de mais agendamentos */}
                    {agendamentosDia.length > 3 && (
                      <div className="text-[10px] text-gray-500 text-center py-1">
                        +{agendamentosDia.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </CardContent>
    </Card>
  );
}
