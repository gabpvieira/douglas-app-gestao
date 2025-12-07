import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { format, parse, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AgendaDiariaViewProps {
  selectedDate: Date;
  agendamentos: any[];
  currentTime: Date;
  onAgendamentoClick: (agendamento: any) => void;
  onDeleteClick: (id: string, e?: React.MouseEvent) => void;
  getStatusColor: (status: string) => string;
  getTipoIcon: (tipo: string) => any;
}

export function AgendaDiariaView({
  selectedDate,
  agendamentos,
  currentTime,
  onAgendamentoClick,
  onDeleteClick,
}: AgendaDiariaViewProps) {
  // Debug: Log dos agendamentos recebidos
  console.log('🔍 AgendaDiariaView - Agendamentos recebidos:', {
    count: agendamentos.length,
    agendamentos: agendamentos.map(a => ({
      id: a.id,
      aluno: a.aluno?.nome,
      horaInicio: a.horaInicio,
      horaFim: a.horaFim,
      dataAgendamento: a.dataAgendamento
    }))
  });

  // Gerar horários do dia (6h às 22h)
  const timeSlots = Array.from({ length: 17 }, (_, i) => i + 6);

  // Calcular posição do indicador de horário atual
  const getCurrentTimePosition = () => {
    if (!isToday(selectedDate)) return null;
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < 6 || hours >= 23) return null;
    const position = ((hours - 6) * 60 + minutes) / 60;
    return position * 64; // 64px por hora
  };

  const currentTimePosition = getCurrentTimePosition();

  // Função para obter cor do card baseado no status
  const getCardColor = (status: string) => {
    const colors = {
      agendado: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      confirmado: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      concluido: 'bg-gradient-to-r from-amber-500 to-amber-600',
      cancelado: 'bg-gradient-to-r from-red-500 to-red-600',
    };
    return colors[status as keyof typeof colors] || colors.agendado;
  };

  return (
    <div className="bg-black rounded-lg border border-gray-800">
      <div className="flex">
        {/* Time Column */}
        <div className="w-16 flex-shrink-0 bg-black">
          {/* Empty space for header */}
          <div className="h-14" />

          {timeSlots.map((hour) => (
            <div
              key={hour}
              className="h-16 flex items-start justify-end pr-3 pt-1"
            >
              <span className="text-xs text-gray-500 font-medium">
                {hour.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* Schedule Column */}
        <div className="flex-1 relative bg-black border-l border-gray-800 overflow-hidden">
          {/* Header */}
          <div className="h-14 flex items-center justify-center border-b border-gray-800">
            <span className="text-sm font-semibold text-white capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          {/* Time Grid Background */}
          <div className="relative overflow-y-auto" style={{ height: '1088px', maxHeight: 'calc(100vh - 400px)' }}>
            {timeSlots.map((hour, index) => (
              <div
                key={hour}
                className={`h-16 ${index !== timeSlots.length - 1 ? 'border-b border-gray-800/30' : ''}`}
              />
            ))}

            {/* Current Time Indicator */}
            {currentTimePosition !== null && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none"
                style={{ top: `${currentTimePosition}px` }}
              >
                <div className="flex items-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1" />
                  <div className="flex-1 h-0.5 bg-red-500" />
                </div>
              </div>
            )}

            {/* Agendamentos Layer */}
            <div className="absolute inset-0 pointer-events-none">
              {agendamentos.length === 0 ? (
                <div className="flex items-center justify-center h-full pointer-events-auto">
                  <p className="text-gray-600 text-sm">
                    Nenhum agendamento para este dia
                  </p>
                </div>
              ) : (
                agendamentos.map((agendamento: any) => {
                  // Parse das horas
                  let startHour = 0;
                  let startMinute = 0;
                  let endHour = 0;
                  let endMinute = 0;

                  try {
                    // Tentar diferentes formatos de hora
                    if (agendamento.horaInicio) {
                      const horaInicio = agendamento.horaInicio.includes(':')
                        ? agendamento.horaInicio
                        : `${agendamento.horaInicio}:00:00`;
                      const startTime = parse(horaInicio, 'HH:mm:ss', new Date());
                      startHour = startTime.getHours();
                      startMinute = startTime.getMinutes();
                    }

                    if (agendamento.horaFim) {
                      const horaFim = agendamento.horaFim.includes(':')
                        ? agendamento.horaFim
                        : `${agendamento.horaFim}:00:00`;
                      const endTime = parse(horaFim, 'HH:mm:ss', new Date());
                      endHour = endTime.getHours();
                      endMinute = endTime.getMinutes();
                    }
                  } catch (error) {
                    console.error('Erro ao fazer parse das horas:', error);
                    return null;
                  }

                  // Verificar se está no range visível
                  if (startHour < 6 || startHour >= 23) {
                    return null;
                  }

                  // Calcular posição e altura
                  const topPosition = ((startHour - 6) * 60 + startMinute) / 60 * 64;
                  const durationMinutes =
                    (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                  const heightPx = Math.max((durationMinutes / 60) * 64 - 4, 48);

                  return (
                    <div
                      key={agendamento.id}
                      className="absolute left-3 right-3 group cursor-pointer z-20 pointer-events-auto"
                      style={{
                        top: `${topPosition}px`,
                        height: `${heightPx}px`,
                      }}
                      onClick={() => onAgendamentoClick(agendamento)}
                    >
                      <div
                        className={`h-full rounded-lg p-2 transition-all hover:brightness-110 ${getCardColor(agendamento.status)} relative border-l-4 ${
                          agendamento.status === 'confirmado' || agendamento.status === 'agendado'
                            ? 'border-emerald-400'
                            : agendamento.status === 'concluido'
                              ? 'border-amber-400'
                              : 'border-red-400'
                        }`}
                      >
                        {/* Conteúdo do Card */}
                        <div className="relative z-10 h-full flex flex-col">
                          {/* Header compacto com todas as informações */}
                          <div className="flex-shrink-0">
                            {/* Linha 1: Horário e botão delete */}
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="text-[10px] font-bold text-white/90 tracking-wide leading-none">
                                {agendamento.horaInicio?.substring(0, 5)} - {agendamento.horaFim?.substring(0, 5)}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10 text-white rounded flex-shrink-0"
                                onClick={(e) => onDeleteClick(agendamento.id, e)}
                              >
                                <Trash2 className="h-2.5 w-2.5" />
                              </Button>
                            </div>

                            {/* Linha 2: Nome do aluno */}
                            <h3 className="text-xs font-semibold text-white truncate leading-tight mb-0.5">
                              {agendamento.aluno?.nome || 'N/A'}
                            </h3>

                            {/* Linha 3: Tipo de atendimento */}
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] text-white/70 capitalize leading-none">
                                {agendamento.tipo === 'online' ? '🎥 Online' : '📍 Presencial'}
                              </span>
                            </div>
                          </div>

                          {/* Observações (se houver espaço) */}
                          {agendamento.observacoes && heightPx > 75 && (
                            <p className="text-[9px] text-white/60 line-clamp-2 leading-tight mt-2 flex-1">
                              {agendamento.observacoes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
