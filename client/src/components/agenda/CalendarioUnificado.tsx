import { useState, useMemo, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Video, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay, parseISO, isToday as isTodayFn, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Agendamento {
  id: string;
  aluno?: {
    nome: string;
    email?: string;
  };
  dataAgendamento: string;
  horaInicio: string;
  horaFim: string;
  status: "agendado" | "confirmado" | "cancelado" | "concluido";
  tipo?: string;
  observacoes?: string;
}

interface CalendarioUnificadoProps {
  agendamentos: Agendamento[];
  onAgendamentoClick: (agendamento: Agendamento) => void;
  onTimeSlotClick?: (date: Date, time: string) => void;
  viewMode: 'day' | 'week' | 'month';
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h às 20h
const QUARTER_HOURS = Array.from({ length: 52 }, (_, i) => 8 + (i * 0.25)); // 8h às 20h em intervalos de 15min
const PIXELS_PER_HOUR = 80; // Reduzido de 120 para 80 para visualização mais compacta

// Cores flat design
const statusColors = {
  agendado: {
    bg: "bg-blue-500",
    text: "text-white",
    hover: "hover:bg-blue-600"
  },
  confirmado: {
    bg: "bg-emerald-500",
    text: "text-white",
    hover: "hover:bg-emerald-600"
  },
  cancelado: {
    bg: "bg-red-500",
    text: "text-white",
    hover: "hover:bg-red-600"
  },
  concluido: {
    bg: "bg-gray-500",
    text: "text-white",
    hover: "hover:bg-gray-600"
  }
};

export const CalendarioUnificado = memo(function CalendarioUnificado({ 
  agendamentos, 
  onAgendamentoClick, 
  onTimeSlotClick,
  viewMode
}: CalendarioUnificadoProps) {
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);

  // Debug: Log dos agendamentos recebidos
  useEffect(() => {
    console.log('📅 CalendarioUnificado - Agendamentos recebidos:', {
      total: agendamentos.length,
      viewMode,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      sample: agendamentos[0]
    });
  }, [agendamentos, viewMode, selectedDate]);

  // Scroll automático para hora atual
  useEffect(() => {
    if (scrollContainerRef && viewMode === 'day') {
      setTimeout(() => {
        const currentHour = new Date().getHours();
        const hourIndex = currentHour - 8;
        if (hourIndex >= 0) {
          const scrollPosition = hourIndex * PIXELS_PER_HOUR - 100;
          scrollContainerRef.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
        }
      }, 100);
    }
  }, [scrollContainerRef, viewMode, selectedDate]);

  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToPreviousWeek = () => {
    setSelectedDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setSelectedDate(prev => addDays(prev, 7));
  };

  const goToPreviousMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const handlePrevious = () => {
    if (viewMode === 'day') goToPreviousDay();
    else if (viewMode === 'week') goToPreviousWeek();
    else goToPreviousMonth();
  };

  const handleNext = () => {
    if (viewMode === 'day') goToNextDay();
    else if (viewMode === 'week') goToNextWeek();
    else goToNextMonth();
  };

  // Filtrar agendamentos do dia selecionado
  const dayAppointments = useMemo(() => {
    const filtered = agendamentos.filter(apt => {
      try {
        // Tentar diferentes formatos de data
        let aptDate: Date;
        if (apt.dataAgendamento.includes('T')) {
          aptDate = parseISO(apt.dataAgendamento);
        } else {
          aptDate = parseISO(apt.dataAgendamento + 'T00:00:00');
        }
        const matches = isSameDay(aptDate, selectedDate);
        
        if (matches) {
          console.log('✅ Agendamento do dia:', {
            id: apt.id,
            aluno: apt.aluno?.nome,
            data: apt.dataAgendamento,
            horaInicio: apt.horaInicio,
            horaFim: apt.horaFim
          });
        }
        
        return matches;
      } catch (error) {
        console.error('❌ Erro ao processar data:', apt.dataAgendamento, error);
        return false;
      }
    });
    
    console.log('📊 Agendamentos filtrados para o dia:', {
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      total: filtered.length,
      agendamentos: filtered
    });
    
    return filtered;
  }, [agendamentos, selectedDate]);

  // Calcular posição e altura do card
  const getAppointmentStyle = (appointment: Agendamento) => {
    try {
      // Extrair hora e minuto do formato HH:MM ou HH:MM:SS
      const horaInicio = appointment.horaInicio.substring(0, 5); // Pega apenas HH:MM
      const horaFim = appointment.horaFim.substring(0, 5);
      
      const [startHour, startMinute] = horaInicio.split(':').map(Number);
      const [endHour, endMinute] = horaFim.split(':').map(Number);
      
      const top = ((startHour - 8) * PIXELS_PER_HOUR) + (startMinute / 60 * PIXELS_PER_HOUR);
      const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      const height = (durationMinutes / 60) * PIXELS_PER_HOUR;

      console.log('📐 Calculando posição:', {
        appointment: appointment.id,
        horaInicio,
        horaFim,
        top,
        height
      });

      return { top, height };
    } catch (error) {
      console.error('❌ Erro ao calcular posição:', error, appointment);
      return { top: 0, height: 60 };
    }
  };

  // Detectar sobreposições e calcular largura/offset
  const getAppointmentLayout = (appointment: Agendamento, allAppointments: Agendamento[]) => {
    try {
      const horaInicio = appointment.horaInicio.substring(0, 5);
      const horaFim = appointment.horaFim.substring(0, 5);
      
      const [aptStartHour, aptStartMinute] = horaInicio.split(':').map(Number);
      const [aptEndHour, aptEndMinute] = horaFim.split(':').map(Number);
      const aptStart = aptStartHour * 60 + aptStartMinute;
      const aptEnd = aptEndHour * 60 + aptEndMinute;

      // Encontrar agendamentos sobrepostos
      const overlapping = allAppointments.filter(other => {
        if (other.id === appointment.id) return false;
        try {
          const otherInicio = other.horaInicio.substring(0, 5);
          const otherFim = other.horaFim.substring(0, 5);
          
          const [otherStartHour, otherStartMinute] = otherInicio.split(':').map(Number);
          const [otherEndHour, otherEndMinute] = otherFim.split(':').map(Number);
          const otherStart = otherStartHour * 60 + otherStartMinute;
          const otherEnd = otherEndHour * 60 + otherEndMinute;
          
          return (aptStart < otherEnd && aptEnd > otherStart);
        } catch {
          return false;
        }
      });

      const totalOverlapping = overlapping.length + 1;
      const index = overlapping.filter(other => {
        try {
          const otherInicio = other.horaInicio.substring(0, 5);
          const [otherStartHour, otherStartMinute] = otherInicio.split(':').map(Number);
          const otherStart = otherStartHour * 60 + otherStartMinute;
          return otherStart < aptStart;
        } catch {
          return false;
        }
      }).length;

      return {
        width: `${100 / totalOverlapping}%`,
        left: `${(index * 100) / totalOverlapping}%`
      };
    } catch (error) {
      console.error('❌ Erro ao calcular layout:', error, appointment);
      return { width: '100%', left: '0%' };
    }
  };

  const isToday = isTodayFn(selectedDate);

  // Renderizar visualização de dia
  const renderDayView = () => (
    <div 
      ref={setScrollContainerRef}
      className="flex-1 overflow-visible"
    >
      <div className="relative">
        <div className="flex">
          {/* Coluna de Horários */}
          <div className="w-16 flex-shrink-0 border-r border-gray-800" style={{ backgroundColor: 'rgba(10, 15, 29, 0.3)' }}>
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[80px] px-2 text-xs font-semibold text-gray-400 flex items-start pt-1 border-t border-gray-800"
              >
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Coluna de Agendamentos */}
          <div className="flex-1 relative border-r border-gray-800">
            {/* Grid de Horários */}
            <div className="relative">
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[80px] hover:bg-gray-800/20 cursor-pointer transition-colors border-t border-gray-800"
                  onClick={() => {
                    if (onTimeSlotClick) {
                      onTimeSlotClick(selectedDate, `${String(hour).padStart(2, '0')}:00`);
                    }
                  }}
                />
              ))}

              {/* Mensagem quando não há agendamentos */}
              {dayAppointments.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-gray-600 text-sm text-center">
                    Nenhum agendamento para este dia
                  </div>
                </div>
              )}

              {/* Agendamentos */}
              {dayAppointments.map(appointment => {
                const { top, height } = getAppointmentStyle(appointment);
                const { width, left } = getAppointmentLayout(appointment, dayAppointments);
                const colors = statusColors[appointment.status];
                
                const horaInicio = appointment.horaInicio.substring(0, 5);
                const horaFim = appointment.horaFim.substring(0, 5);
                const [startHour, startMinute] = horaInicio.split(':').map(Number);
                const [endHour, endMinute] = horaFim.split(':').map(Number);
                
                const showFullInfo = height >= 60;
                const showService = height >= 40;

                return (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "absolute rounded-lg cursor-pointer transition-all overflow-hidden",
                      colors.bg,
                      colors.text,
                      colors.hover,
                      "shadow-sm"
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      width,
                      left,
                      minHeight: '30px'
                    }}
                    onClick={() => onAgendamentoClick(appointment)}
                  >
                    <div className="flex flex-col h-full p-2 text-xs leading-tight">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-semibold text-xs truncate flex-1">
                          {appointment.aluno?.nome || 'N/A'}
                        </div>
                        <div className="font-bold text-[10px] whitespace-nowrap flex-shrink-0">
                          {String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')}-
                          {String(endHour).padStart(2, '0')}:{String(endMinute).padStart(2, '0')}
                        </div>
                      </div>
                      
                      {showService && appointment.tipo && (
                        <div className="flex items-center gap-1 text-[10px] opacity-90 truncate">
                          {appointment.tipo === 'online' ? (
                            <>
                              <Video className="h-3 w-3 flex-shrink-0" />
                              <span>Online</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="h-3 w-3 flex-shrink-0" />
                              <span>Presencial</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {showFullInfo && appointment.observacoes && (
                        <div className="text-[10px] opacity-80 truncate mt-0.5">
                          {appointment.observacoes}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Linha de Hora Atual */}
              {isToday && (() => {
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                
                if (currentHour >= 8 && currentHour < 23) {
                  const top = ((currentHour - 8) * PIXELS_PER_HOUR) + (currentMinute / 60 * PIXELS_PER_HOUR);
                  
                  return (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none"
                      style={{ top: `${top}px` }}
                    >
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <div className="flex-1 h-0.5 bg-red-500" />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar visualização de semana
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { locale: ptBR });
    const weekEnd = endOfWeek(selectedDate, { locale: ptBR });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="flex-1 overflow-x-auto overflow-y-auto">
        <div className="min-w-[800px]">
          <div className="flex">
            {/* Coluna de Horários */}
            <div className="w-12 sm:w-16 flex-shrink-0 border-r border-gray-800" style={{ backgroundColor: 'rgba(10, 15, 29, 0.3)' }}>
              <div className="h-10 sm:h-12 border-b border-gray-800" />
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] sm:h-[80px] px-1 sm:px-2 text-[10px] sm:text-[11px] font-medium text-gray-400 flex items-start pt-1 border-t border-gray-800"
                >
                  {String(hour).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {/* Colunas dos Dias */}
            {weekDays.map((day) => {
              const dayAgendamentos = agendamentos.filter(apt => {
                try {
                  let aptDate: Date;
                  if (apt.dataAgendamento.includes('T')) {
                    aptDate = parseISO(apt.dataAgendamento);
                  } else {
                    aptDate = parseISO(apt.dataAgendamento + 'T00:00:00');
                  }
                  return isSameDay(aptDate, day);
                } catch {
                  return false;
                }
              });
              const isDayToday = isTodayFn(day);

              return (
                <div key={day.toISOString()} className="flex-1 min-w-[100px] border-r border-gray-800 last:border-r-0">
                  {/* Header do Dia */}
                  <div className={cn(
                    "h-10 sm:h-12 border-b border-gray-800 flex flex-col items-center justify-center",
                    isDayToday && "bg-blue-500/10"
                  )}>
                    <div className="text-[9px] sm:text-[10px] text-gray-400 uppercase">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={cn(
                      "text-base sm:text-lg font-bold",
                      isDayToday ? "text-blue-400" : "text-white"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>

                  {/* Grid de Horários */}
                  <div className="relative">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="h-[60px] sm:h-[80px] hover:bg-gray-800/20 cursor-pointer transition-colors border-t border-gray-800"
                        onClick={() => {
                          if (onTimeSlotClick) {
                            onTimeSlotClick(day, `${String(hour).padStart(2, '0')}:00`);
                          }
                        }}
                      />
                    ))}

                    {/* Agendamentos do Dia */}
                    {dayAgendamentos.map(appointment => {
                      try {
                        const horaInicio = appointment.horaInicio.substring(0, 5);
                        const horaFim = appointment.horaFim.substring(0, 5);
                        const [startHour, startMinute] = horaInicio.split(':').map(Number);
                        const [endHour, endMinute] = horaFim.split(':').map(Number);
                        
                        const top = ((startHour - 8) * 60) + (startMinute / 60 * 60);
                        const topSm = ((startHour - 8) * 80) + (startMinute / 60 * 80);
                        const durationMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                        const height = (durationMinutes / 60) * 60;
                        const heightSm = (durationMinutes / 60) * 80;
                        const colors = statusColors[appointment.status];

                        return (
                          <motion.div
                            key={appointment.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={cn(
                              "absolute left-0.5 right-0.5 sm:left-1 sm:right-1 rounded cursor-pointer transition-all overflow-hidden",
                              colors.bg,
                              colors.text,
                              colors.hover,
                              "shadow-sm"
                            )}
                            style={{
                              top: `${top}px`,
                              height: `${Math.max(height, 30)}px`,
                              minHeight: '30px'
                            }}
                            onClick={() => onAgendamentoClick(appointment)}
                          >
                            <div className="p-0.5 sm:p-1 text-[9px] sm:text-[10px] leading-tight">
                              <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
                                {appointment.tipo === 'online' ? (
                                  <Video className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                                ) : (
                                  <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                                )}
                                <div className="font-bold truncate flex-1">
                                  {appointment.aluno?.nome || 'N/A'}
                                </div>
                              </div>
                              <div className="text-[8px] sm:text-[9px] opacity-90">
                                {horaInicio}
                              </div>
                            </div>
                          </motion.div>
                        );
                      } catch (error) {
                        console.error('❌ Erro ao renderizar agendamento:', error, appointment);
                        return null;
                      }
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Renderizar visualização de mês
  const renderMonthView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart, { locale: ptBR });
    const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="flex-1 p-2 sm:p-4 overflow-auto">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia, index) => (
            <div
              key={dia}
              className="text-center text-[10px] sm:text-xs font-semibold text-gray-400 uppercase py-1 sm:py-2"
            >
              {/* Mobile: apenas primeira letra */}
              <span className="sm:hidden">{dia.charAt(0)}</span>
              {/* Desktop: nome completo */}
              <span className="hidden sm:inline">{dia}</span>
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 auto-rows-fr">
          {calendarDays.map((day) => {
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isDayToday = isTodayFn(day);
            const dayAgendamentos = agendamentos.filter(apt => {
              try {
                let aptDate: Date;
                if (apt.dataAgendamento.includes('T')) {
                  aptDate = parseISO(apt.dataAgendamento);
                } else {
                  aptDate = parseISO(apt.dataAgendamento + 'T00:00:00');
                }
                return isSameDay(aptDate, day);
              } catch {
                return false;
              }
            }).sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 rounded border transition-all flex flex-col",
                  isCurrentMonth
                    ? "bg-gray-800/30 border-gray-700"
                    : "border-gray-800/50 opacity-40",
                  isDayToday && "ring-1 sm:ring-2 ring-blue-500"
                )}
              >
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-semibold",
                      isDayToday ? "text-blue-400" : isCurrentMonth ? "text-white" : "text-gray-600"
                    )}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayAgendamentos.length > 0 && (
                    <span className="text-[9px] sm:text-xs font-medium text-blue-400 bg-blue-500/20 px-1 sm:px-1.5 py-0.5 rounded-full">
                      {dayAgendamentos.length}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 sm:space-y-1 flex-1 overflow-y-auto max-h-[60px] sm:max-h-[100px]">
                  {/* Mobile: mostrar apenas 2 agendamentos */}
                  {dayAgendamentos.slice(0, window.innerWidth < 640 ? 2 : 4).map((appointment) => {
                    const colors = statusColors[appointment.status];
                    return (
                      <div
                        key={appointment.id}
                        onClick={() => onAgendamentoClick(appointment)}
                        className={cn(
                          "p-1 sm:p-1.5 rounded text-xs cursor-pointer transition-all",
                          colors.bg,
                          colors.text,
                          colors.hover
                        )}
                      >
                        <div className="flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] font-medium">
                          {appointment.tipo === 'online' ? (
                            <Video className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                          ) : (
                            <MapPin className="h-2 w-2 sm:h-2.5 sm:w-2.5 flex-shrink-0" />
                          )}
                          <span className="truncate">
                            {/* Mobile: apenas hora */}
                            <span className="sm:hidden">{appointment.horaInicio.substring(0, 5)}</span>
                            {/* Desktop: hora + nome */}
                            <span className="hidden sm:inline">
                              {appointment.horaInicio.substring(0, 5)} - {appointment.aluno?.nome || 'N/A'}
                            </span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayAgendamentos.length > (window.innerWidth < 640 ? 2 : 4) && (
                    <div className="text-[9px] sm:text-[10px] text-gray-500 text-center py-0.5 sm:py-1">
                      +{dayAgendamentos.length - (window.innerWidth < 640 ? 2 : 4)} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-gray-800" style={{ backgroundColor: '#0a0f1d' }}>
      {/* Header - Navegação de Data */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800" style={{ backgroundColor: 'rgba(10, 15, 29, 0.5)' }}>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            className="h-8 w-8 p-0 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <h2 className="text-lg font-semibold text-white">
              {viewMode === 'day' && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              {viewMode === 'week' && `${format(startOfWeek(selectedDate, { locale: ptBR }), "d 'de' MMM", { locale: ptBR })} - ${format(endOfWeek(selectedDate, { locale: ptBR }), "d 'de' MMM", { locale: ptBR })}`}
              {viewMode === 'month' && format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
            </h2>
            {isToday && viewMode === 'day' && (
              <span className="text-xs font-medium text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">
                Hoje
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="h-8 w-8 p-0 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Hoje
          </Button>
        )}
      </div>

      {/* Calendário Grid */}
      {viewMode === 'day' && renderDayView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'month' && renderMonthView()}
    </div>
  );
});
