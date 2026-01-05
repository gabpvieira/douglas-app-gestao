import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeekProgressTrackerProps {
  diasTreinados: number[]; // Array com índices dos dias (0-6)
  compact?: boolean;
  showLabels?: boolean;
}

// Semana inicia na SEGUNDA-FEIRA (padrão brasileiro)
const DIAS_SEMANA = [
  { label: "S", nome: "Segunda" },
  { label: "T", nome: "Terça" },
  { label: "Q", nome: "Quarta" },
  { label: "Q", nome: "Quinta" },
  { label: "S", nome: "Sexta" },
  { label: "S", nome: "Sábado" },
  { label: "D", nome: "Domingo" },
];

export default function WeekProgressTracker({ 
  diasTreinados, 
  compact = false,
  showLabels = true 
}: WeekProgressTrackerProps) {
  return (
    <div className={cn(
      "flex justify-center gap-2",
      compact ? "py-2" : "py-4"
    )}>
      {DIAS_SEMANA.map((dia, index) => {
        const treinouNesteDia = diasTreinados.includes(index);
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "rounded-full flex items-center justify-center border-2 transition-all",
                compact ? "w-8 h-8" : "w-10 h-10",
                treinouNesteDia
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-transparent border-primary/30 text-muted-foreground"
              )}
            >
              {treinouNesteDia ? (
                <Check className={cn("", compact ? "w-4 h-4" : "w-5 h-5")} />
              ) : null}
            </div>
            {showLabels && (
              <span className={cn(
                "font-medium",
                compact ? "text-[10px]" : "text-xs",
                treinouNesteDia ? "text-primary" : "text-muted-foreground"
              )}>
                {dia.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
