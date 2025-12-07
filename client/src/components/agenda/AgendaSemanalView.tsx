import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { format, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaSemanalViewProps {
  selectedDate: Date;
  agendamentos: any[];
  onAgendamentoClick: (agendamento: any) => void;
  onDeleteClick: (id: string, e?: React.MouseEvent) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  getTipoIcon: (tipo: string) => any;
}

export function AgendaSemanalView({
  selectedDate,
  agendamentos,
  onAgendamentoClick,
  onDeleteClick,
  getStatusColor,
  getStatusIcon,
  getTipoIcon,
}: AgendaSemanalViewProps) {
  const weekStart = startOfWeek(selectedDate, { locale: ptBR });
  const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Agrupar agendamentos por dia
  const agendamentosPorDia = weekDays.map((day) => ({
    date: day,
    agendamentos: agendamentos
      .filter((a: any) => isSameDay(new Date(a.dataAgendamento), day))
      .sort((a: any, b: any) => {
        const horaA = a.horaInicio || '00:00';
        const horaB = b.horaInicio || '00:00';
        return horaA.localeCompare(horaB);
      }),
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 sm:gap-4">
      {agendamentosPorDia.map(({ date, agendamentos: agendamentosDia }) => {
        const isCurrentDay = isToday(date);

        return (
          <Card
            key={date.toISOString()}
            className={`border-gray-800 bg-gray-900/50 backdrop-blur transition-all ${
              isCurrentDay ? 'ring-2 ring-blue-500/50' : ''
            }`}
          >
            <CardContent className="p-3 sm:p-4">
              {/* Cabeçalho do Dia */}
              <div className="text-center mb-3 pb-3 border-b border-gray-800">
                <div className="text-xs text-gray-400 uppercase mb-1">
                  {format(date, 'EEE', { locale: ptBR })}
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isCurrentDay ? 'text-blue-400' : 'text-white'
                  }`}
                >
                  {format(date, 'd')}
                </div>
                <div className="text-xs text-gray-500">
                  {format(date, 'MMM', { locale: ptBR })}
                </div>
                {isCurrentDay && (
                  <Badge className="mt-2 bg-blue-600 text-white text-xs">
                    Hoje
                  </Badge>
                )}
              </div>

              {/* Lista de Agendamentos */}
              <div className="space-y-2">
                {agendamentosDia.length === 0 ? (
                  <div className="text-center py-4">
                    <CalendarIcon className="h-6 w-6 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-600">Sem agendamentos</p>
                  </div>
                ) : (
                  agendamentosDia.map((agendamento: any) => {
                    const TipoIcon = getTipoIcon(
                      agendamento.tipo || 'presencial'
                    );

                    return (
                      <Card
                        key={agendamento.id}
                        className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-all cursor-pointer group"
                        onClick={() => onAgendamentoClick(agendamento)}
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
                            <div className="flex items-center gap-1">
                              <TipoIcon className="h-3 w-3 text-gray-500" />
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-red-600/80 hover:bg-red-600 text-white"
                                onClick={(e) =>
                                  onDeleteClick(agendamento.id, e)
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>

              {/* Contador de Agendamentos */}
              {agendamentosDia.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800 text-center">
                  <span className="text-xs text-gray-500">
                    {agendamentosDia.length}{' '}
                    {agendamentosDia.length === 1
                      ? 'agendamento'
                      : 'agendamentos'}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
