import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Dumbbell, Loader2 } from "lucide-react";
import { useTreinosMes, TreinosPorDia } from "@/hooks/useProgressoTreinos";
import { cn } from "@/lib/utils";

interface CalendarioMensalProps {
  alunoId: string;
  compact?: boolean;
}

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function CalendarioMensal({ alunoId, compact = false }: CalendarioMensalProps) {
  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());
  
  const { data: treinosMes, isLoading } = useTreinosMes(alunoId, anoAtual, mesAtual);
  
  // Navegar entre meses
  const mesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(anoAtual - 1);
    } else {
      setMesAtual(mesAtual - 1);
    }
  };
  
  const mesSeguinte = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(anoAtual + 1);
    } else {
      setMesAtual(mesAtual + 1);
    }
  };
  
  // Gerar dias do mês
  const primeiroDia = new Date(anoAtual, mesAtual, 1);
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
  const diasNoMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  
  // Criar mapa de treinos por data
  const treinosMap = new Map<string, number>();
  treinosMes?.forEach((treino: TreinosPorDia) => {
    treinosMap.set(treino.data, treino.quantidade);
  });
  
  // Gerar array de dias
  const dias: (number | null)[] = [];
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null);
  }
  for (let i = 1; i <= diasNoMes; i++) {
    dias.push(i);
  }
  
  // Verificar se é o mês atual (para não permitir navegar para o futuro)
  const ehMesAtual = mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
  
  // Contar total de dias com treino no mês
  const totalDiasTreino = treinosMes?.length || 0;
  const totalTreinosMes = treinosMes?.reduce((acc, t) => acc + t.quantidade, 0) || 0;
  
  return (
    <div className="space-y-3">
      {/* Header com navegação */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={mesAnterior}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h4 className={cn(
            "font-semibold text-white",
            compact ? "text-sm" : "text-base"
          )}>
            {MESES[mesAtual]} {anoAtual}
          </h4>
          {!compact && (
            <p className="text-xs text-gray-400">
              {totalDiasTreino} dias • {totalTreinosMes} treinos
            </p>
          )}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={mesSeguinte}
          disabled={ehMesAtual}
          className="h-8 w-8 p-0 text-gray-400 hover:text-white disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1">
            {DIAS_SEMANA.map((dia) => (
              <div
                key={dia}
                className={cn(
                  "text-center font-medium text-gray-500",
                  compact ? "text-[10px] py-1" : "text-xs py-2"
                )}
              >
                {compact ? dia.charAt(0) : dia}
              </div>
            ))}
          </div>
          
          {/* Grid de dias */}
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia, index) => {
              if (dia === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const dataStr = `${anoAtual}-${String(mesAtual + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
              const qtdTreinos = treinosMap.get(dataStr) || 0;
              const temTreino = qtdTreinos > 0;
              const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear();
              const ehFuturo = new Date(anoAtual, mesAtual, dia) > hoje;
              
              return (
                <div
                  key={dia}
                  className={cn(
                    "aspect-square rounded-md flex flex-col items-center justify-center relative transition-colors",
                    compact ? "text-xs" : "text-sm",
                    ehHoje && "ring-2 ring-primary ring-offset-1 ring-offset-gray-900",
                    temTreino 
                      ? "bg-green-600/20 text-green-400 border border-green-600/30" 
                      : ehFuturo
                        ? "bg-gray-800/30 text-gray-600"
                        : "bg-gray-800/50 text-gray-400",
                  )}
                >
                  <span className={cn(
                    "font-medium",
                    temTreino && "text-green-400"
                  )}>
                    {dia}
                  </span>
                  
                  {temTreino && !compact && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Dumbbell className="h-2.5 w-2.5" />
                      {qtdTreinos > 1 && (
                        <span className="text-[10px]">{qtdTreinos}</span>
                      )}
                    </div>
                  )}
                  
                  {temTreino && compact && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
      
      {/* Legenda */}
      {!compact && (
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-green-600/20 border border-green-600/30" />
            <span>Com treino</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-800/50" />
            <span>Sem treino</span>
          </div>
        </div>
      )}
    </div>
  );
}
