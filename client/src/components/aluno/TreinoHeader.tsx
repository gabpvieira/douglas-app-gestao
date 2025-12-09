import { ArrowLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TreinoHeaderProps {
  nomeFicha: string;
  tempoDecorrido: number;
  exerciciosConcluidos: number;
  totalExercicios: number;
  pausado: boolean;
  onPausar: () => void;
  onVoltar: () => void;
}

export default function TreinoHeader({
  nomeFicha,
  tempoDecorrido,
  exerciciosConcluidos,
  totalExercicios,
  pausado,
  onPausar,
  onVoltar,
}: TreinoHeaderProps) {
  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, "0")}:${segs.toString().padStart(2, "0")}`;
    }
    return `${minutos}:${segs.toString().padStart(2, "0")}`;
  };

  const progresso = totalExercicios > 0 ? (exerciciosConcluidos / totalExercicios) * 100 : 0;

  return (
    <div className="bg-zinc-900 rounded-xl p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={onVoltar}
            className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="font-semibold text-zinc-100 truncate">{nomeFicha}</h1>
            <p className="text-sm text-zinc-500">
              {exerciciosConcluidos}/{totalExercicios} exercícios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div className="text-xl font-bold text-blue-400 tabular-nums">
              {formatarTempo(tempoDecorrido)}
            </div>
            <p className="text-xs text-zinc-500">
              {pausado ? "Pausado" : "Em andamento"}
            </p>
          </div>
          <Button
            size="icon"
            onClick={onPausar}
            className={`h-10 w-10 rounded-lg ${
              pausado 
                ? "bg-emerald-600 hover:bg-emerald-500 text-white" 
                : "bg-amber-600 hover:bg-amber-500 text-white"
            }`}
          >
            {pausado ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mt-3">
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300 rounded-full"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
    </div>
  );
}
