import { useState, useMemo, memo, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, isSameDay, parseISO, isToday as isTodayFn } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  duration: number;
}

interface Barber {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  scheduled_at: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  service?: Service;
  barber?: Barber;
}

interface ProCalendarProps {
  appointments: Appointment[];
  barbers?: Barber[];
  onAppointmentClick: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: Date, time: string, barberId?: string) => void;
  showMultipleBarbers?: boolean;
}

const HOURS = Array.from({ length: 15 }, (_, i) => i + 8); // 8h às 22h
const QUARTER_HOURS = Array.from({ length: 60 }, (_, i) => 8 + (i * 0.25)); // 8h às 22h em intervalos de 15min
const PIXELS_PER_HOUR = 120; // Altura por hora (aumentado de 80 para 120)
const PIXELS_PER_QUARTER = PIXELS_PER_HOUR / 4; // 30px por 15 minutos

// Cores flat design - ZapCorte Style
const statusColors = {
  pending: {
    bg: "bg-amber-400",
    text: "text-white",
    hover: "hover:bg-amber-500"
  },
  confirmed: {
    bg: "bg-primary",
    text: "text-white",
    hover: "hover:bg-primary/90"
  },
  cancelled: {
    bg: "bg-red-400",
    text: "text-white",
    hover: "hover:bg-red-500"
  },
  completed: {
    bg: "bg-primary",
    text: "text-white",
    hover: "hover:bg-primary/90"
  }
};

/**
 * Calendário PRO unificado - Flat Design Clean
 * Usado tanto no Dashboard quanto em Agendamentos
 * Requirements: Design unificado para usuários PRO
 */
export const ProCalendar = memo(function ProCalendar({ 
  appointments, 
  barbers = [],
  onAppointmentClick, 
  onTimeSlotClick,
  showMultipleBarbers = false 
}: ProCalendarProps) {
  
  // Log para debug
  console.log('ProCalendar - showMultipleBarbers:', showMultipleBarbers);
  console.log('ProCalendar - barbers:', barbers);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null);

  // Scroll automático para hora atual
  useEffect(() => {
    if (scrollContainerRef) {
      setTimeout(() => {
        const currentHour = new Date().getHours();
        const hourIndex = currentHour - 8;
        if (hourIndex >= 0) {
          const scrollPosition = hourIndex * PIXELS_PER_HOUR - 100;
          scrollContainerRef.scrollTo({ top: Math.max(0, scrollPosition), behavior: 'smooth' });
        }
      }, 100);
    }
  }, [scrollContainerRef]);

  const goToPreviousDay = () => {
    setSelectedDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prev => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Filtrar agendamentos do dia selecionado
  const dayAppointments = useMemo(() => {
    return appointments.filter(apt => {
      const aptDate = parseISO(apt.scheduled_at);
      return isSameDay(aptDate, selectedDate);
    });
  }, [appointments, selectedDate]);

  // Organizar agendamentos por barbeiro (se múltiplos barbeiros)
  const appointmentsByBarber = useMemo(() => {
    console.log('Organizando agendamentos - showMultipleBarbers:', showMultipleBarbers);
    console.log('Barbeiros disponíveis:', barbers);
    
    if (!showMultipleBarbers || barbers.length === 0) {
      console.log('Modo single barber');
      return [{ barber: null, appointments: dayAppointments }];
    }

    const organized = barbers.map(barber => ({
      barber,
      appointments: dayAppointments.filter(apt => apt.barber?.id === barber.id)
    }));
    
    console.log('Agendamentos organizados por barbeiro:', organized);
    return organized;
  }, [dayAppointments, barbers, showMultipleBarbers]);

  // Calcular posição e altura do card
  const getAppointmentStyle = (appointment: Appointment) => {
    const startTime = parseISO(appointment.scheduled_at);
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    
    const top = ((startHour - 8) * PIXELS_PER_HOUR) + (startMinute / 60 * PIXELS_PER_HOUR);
    const duration = appointment.service?.duration || 30;
    const height = (duration / 60) * PIXELS_PER_HOUR;

    return { top, height };
  };

  // Detectar sobreposições e calcular largura/offset
  const getAppointmentLayout = (appointment: Appointment, barberAppointments: Appointment[]) => {
    const aptStart = parseISO(appointment.scheduled_at).getTime();
    const aptDuration = appointment.service?.duration || 30;
    const aptEnd = aptStart + aptDuration * 60000;

    // Encontrar agendamentos sobrepostos
    const overlapping = barberAppointments.filter(other => {
      if (other.id === appointment.id) return false;
      const otherStart = parseISO(other.scheduled_at).getTime();
      const otherDuration = other.service?.duration || 30;
      const otherEnd = otherStart + otherDuration * 60000;
      
      return (aptStart < otherEnd && aptEnd > otherStart);
    });

    const totalOverlapping = overlapping.length + 1;
    const index = overlapping.filter(other => 
      parseISO(other.scheduled_at).getTime() < aptStart
    ).length;

    return {
      width: `${100 / totalOverlapping}%`,
      left: `${(index * 100) / totalOverlapping}%`
    };
  };

  const isToday = isTodayFn(selectedDate);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header - Navegação de Data */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>
            {isToday && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                Hoje
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8"
          >
            Hoje
          </Button>
        )}
      </div>

      {/* Calendário Grid */}
      <div 
        ref={setScrollContainerRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="relative">
          {/* Grid de Horários e Barbeiros */}
          <div className="flex">
            {/* Coluna de Horários - 15 em 15 minutos */}
            <div className="w-16 flex-shrink-0 border-r bg-muted/30">
              {QUARTER_HOURS.map((time, index) => {
                const hour = Math.floor(time);
                const minute = Math.round((time - hour) * 60);
                const isFullHour = minute === 0;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "h-[30px] px-2 text-[11px] font-medium text-muted-foreground flex items-center",
                      isFullHour ? "border-t border-border" : "border-t border-border/30"
                    )}
                  >
                    <span className={cn(isFullHour ? "font-semibold" : "font-normal")}>
                      {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Colunas de Barbeiros */}
            {appointmentsByBarber.map(({ barber, appointments: barberAppointments }, index) => (
              <div
                key={barber?.id || 'single'}
                className="flex-1 relative border-r last:border-r-0"
              >
                {/* Header do Barbeiro (se múltiplos) */}
                {showMultipleBarbers && barber && (
                  <div className="sticky top-0 z-10 bg-card border-b px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">
                          {barber.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">{barber.name}</span>
                    </div>
                  </div>
                )}

                {/* Grid de Horários - 15 em 15 minutos */}
                <div className="relative">
                  {QUARTER_HOURS.map((time, index) => {
                    const hour = Math.floor(time);
                    const minute = Math.round((time - hour) * 60);
                    const isFullHour = minute === 0;
                    
                    return (
                      <div
                        key={index}
                        className={cn(
                          "h-[30px] hover:bg-muted/20 cursor-pointer transition-colors",
                          isFullHour ? "border-t border-border" : "border-t border-border/30"
                        )}
                        onClick={() => {
                          if (onTimeSlotClick) {
                            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                            onTimeSlotClick(selectedDate, timeString, barber?.id);
                          }
                        }}
                      />
                    );
                  })}

                  {/* Agendamentos */}
                  {barberAppointments.map(appointment => {
                    const { top, height } = getAppointmentStyle(appointment);
                    const { width, left } = getAppointmentLayout(appointment, barberAppointments);
                    const colors = statusColors[appointment.status];
                    
                    // Calcular horário de término
                    const startTime = parseISO(appointment.scheduled_at);
                    const duration = appointment.service?.duration || 30;
                    const endTime = new Date(startTime.getTime() + duration * 60000);
                    
                    // Determinar o que mostrar baseado na altura
                    const showFullInfo = height >= 60; // Mostra tudo se altura >= 60px
                    const showService = height >= 40; // Mostra serviço se altura >= 40px
                    const showOnlyName = height < 40; // Só nome se altura < 40px

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
                        onClick={() => onAppointmentClick(appointment)}
                      >
                        <div className="flex flex-col h-full p-2 text-xs leading-tight">
                          {/* Header: Nome e Horário */}
                          <div className="flex items-start justify-between gap-2 mb-1">
                            {/* Nome do Cliente - Sempre visível */}
                            <div className="font-semibold text-xs truncate flex-1">
                              {appointment.customer_name}
                            </div>
                            
                            {/* Horário de Início e Fim - Canto direito */}
                            <div className="font-bold text-[10px] whitespace-nowrap flex-shrink-0">
                              {format(startTime, 'HH:mm')}-{format(endTime, 'HH:mm')}
                            </div>
                          </div>
                          
                          {/* Serviço - Só se houver espaço */}
                          {showService && appointment.service && (
                            <div className="text-[10px] opacity-90 truncate">
                              {appointment.service.name}
                            </div>
                          )}
                          
                          {/* Barbeiro - Só se houver espaço e múltiplos barbeiros desabilitado */}
                          {showFullInfo && !showMultipleBarbers && appointment.barber && (
                            <div className="text-[10px] opacity-80 truncate mt-0.5">
                              {appointment.barber.name}
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
