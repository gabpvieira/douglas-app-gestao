import { useState } from "react";
import { ChevronLeft, ChevronRight, Dumbbell, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMonthlyTrainingDays } from "@/hooks/useWorkoutProgress";

interface MonthlyTrainingCalendarProps {
  alunoId: string;
}

const DIAS_SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function MonthlyTrainingCalendar({ alunoId }: MonthlyTrainingCalendarProps) {
  const [mesAtual, setMesAtual] = useState(new Date());

  const ano = mesAtual.getFullYear();
  const mes = mesAtual.getMonth();

  // Usar novo hook que busca da tabela workout_progress_backup
  const { data: diasTreinados = new Set<number>(), isLoading: loading } = useMonthlyTrainingDays(
    alunoId,
    ano,
    mes + 1 // API usa 1-12, JS usa 0-11
  );

  const totalTreinosMes = diasTreinados.size;

  // Primeiro dia do mês e total de dias
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();

  const navegarMes = (direcao: number) => {
    setMesAtual(prev => new Date(prev.getFullYear(), prev.getMonth() + direcao, 1));
  };

  const hoje = new Date();
  const ehMesAtual = hoje.getMonth() === mes && hoje.getFullYear() === ano;

  // Calcular streak (sequência de dias consecutivos)
  const calcularStreak = () => {
    if (diasTreinados.size === 0) return 0;
    
    const diasOrdenados = Array.from(diasTreinados).sort((a, b) => b - a);
    let streak = 0;
    let diaAtual = hoje.getDate();
    
    // Se não treinou hoje, começar do dia anterior
    if (!diasTreinados.has(diaAtual) && ehMesAtual) {
      diaAtual--;
    }
    
    for (const dia of diasOrdenados) {
      if (dia === diaAtual) {
        streak++;
        diaAtual--;
      } else if (dia < diaAtual) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calcularStreak();

  // Gerar células do calendário
  const celulas = [];
  
  // Células vazias antes do primeiro dia
  for (let i = 0; i < diaSemanaInicio; i++) {
    celulas.push(<div key={`empty-${i}`} className="aspect-square" />);
  }
  
  // Dias do mês
  for (let dia = 1; dia <= diasNoMes; dia++) {
    const treinou = diasTreinados.has(dia);
    const ehHoje = ehMesAtual && dia === hoje.getDate();
    const passado = ehMesAtual ? dia < hoje.getDate() : mesAtual < hoje;
    
    celulas.push(
      <div
        key={dia}
        className={cn(
          "aspect-square flex items-center justify-center text-xs font-medium rounded-full transition-all",
          treinou && "bg-emerald-500 text-white",
          !treinou && passado && "text-gray-600",
          !treinou && !passado && "text-gray-400",
          ehHoje && !treinou && "ring-2 ring-primary ring-offset-1 ring-offset-gray-900",
          ehHoje && treinou && "ring-2 ring-emerald-300 ring-offset-1 ring-offset-gray-900"
        )}
      >
        {treinou ? (
          <Dumbbell className="w-3 h-3" />
        ) : (
          dia
        )}
      </div>
    );
  }

  return (
    <Card className="border-gray-800 bg-gray-900/30 p-4">
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navegarMes(-1)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h3 className="text-sm font-semibold text-white">
            {MESES[mes]} {ano}
          </h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navegarMes(1)}
          disabled={ehMesAtual}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Estatísticas do mês */}
      <div className="flex items-center justify-center gap-6 mb-4 py-2 bg-gray-800/30 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalTreinosMes}</p>
          <p className="text-[10px] text-gray-400 uppercase">Treinos</p>
        </div>
        {streak > 0 && (
          <div className="text-center flex items-center gap-1">
            <Flame className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-2xl font-bold text-orange-400">{streak}</p>
              <p className="text-[10px] text-gray-400 uppercase">Sequência</p>
            </div>
          </div>
        )}
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DIAS_SEMANA.map((dia, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-gray-500 py-1">
            {dia}
          </div>
        ))}
      </div>

      {/* Calendário */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-800/50 rounded-full animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {celulas}
        </div>
      )}

      {/* Legenda */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-gray-800">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex items-center justify-center">
            <Dumbbell className="w-2 h-2 text-white" />
          </div>
          <span className="text-[10px] text-gray-400">Treinou</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full ring-2 ring-primary ring-offset-1 ring-offset-gray-900" />
          <span className="text-[10px] text-gray-400">Hoje</span>
        </div>
      </div>
    </Card>
  );
}
