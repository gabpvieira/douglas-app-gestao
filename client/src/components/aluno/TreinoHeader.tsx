import { ArrowLeft, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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

  return (
    <Card className="bg-gray-900 border-gray-800 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onVoltar}
            className="text-gray-400 hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-100">{nomeFicha}</h1>
            <p className="text-sm text-gray-400">
              {exerciciosConcluidos}/{totalExercicios} exercícios
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-500 tabular-nums">
              {formatarTempo(tempoDecorrido)}
            </div>
            <p className="text-xs text-gray-400">
              {pausado ? "Pausado" : "Em andamento"}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={onPausar}
            className={pausado ? "text-green-500" : "text-yellow-500"}
          >
            {pausado ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mt-3">
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{
              width: `${totalExercicios > 0 ? (exerciciosConcluidos / totalExercicios) * 100 : 0}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
}
