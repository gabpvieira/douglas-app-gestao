import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Info, Check } from "lucide-react";
import ExercicioVideoModal from "./ExercicioVideoModal";

interface SerieRealizada {
  numero: number;
  peso: string;
  repeticoes: number;
  concluida: boolean;
}

interface ExercicioExecucao {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string | null;
  seriesRealizadas: SerieRealizada[];
}

interface ExercicioCardProps {
  exercicio: ExercicioExecucao;
  numero: number;
  onSerieCompleta: (exercicioId: string, numeroSerie: number) => void;
  onUpdateSerie: (
    exercicioId: string,
    numeroSerie: number,
    campo: "peso" | "repeticoes",
    valor: string | number
  ) => void;
}

export default function ExercicioCard({
  exercicio,
  numero,
  onSerieCompleta,
  onUpdateSerie,
}: ExercicioCardProps) {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const seriesConcluidas = exercicio.seriesRealizadas.filter((s) => s.concluida).length;
  const todosCompletos = seriesConcluidas === exercicio.seriesRealizadas.length;

  return (
    <div
      className={`rounded-xl transition-all border ${
        todosCompletos ? "bg-emerald-900/30 border-emerald-800/50" : "bg-card border-border"
      }`}
    >
      {/* Header do Exercício */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                todosCompletos
                  ? "bg-emerald-600 text-white"
                  : "bg-secondary text-primary"
              }`}
            >
              {todosCompletos ? <Check className="h-5 w-5" /> : numero}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{exercicio.nome}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {exercicio.grupoMuscular}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercicio.series} × {exercicio.repeticoes}
                </span>
                {exercicio.descanso > 0 && (
                  <span className="text-xs text-muted-foreground/60">• {exercicio.descanso}s</span>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVideoModalOpen(true)}
            className="text-primary hover:text-primary/80 flex-shrink-0"
          >
            <Play className="h-4 w-4 mr-1" />
            Vídeo
          </Button>
        </div>

        {/* Modal de Vídeo */}
        <ExercicioVideoModal
          open={videoModalOpen}
          onClose={() => setVideoModalOpen(false)}
          exercicio={{
            id: exercicio.id,
            nome: exercicio.nome,
            grupoMuscular: exercicio.grupoMuscular,
            videoId: exercicio.videoId,
            observacoes: exercicio.observacoes,
            tecnica: exercicio.tecnica,
          }}
        />

        {/* Detalhes (Observações e Técnica) */}
        {(exercicio.observacoes || exercicio.tecnica) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
            >
              <Info className="h-3 w-3 mr-1" />
              {mostrarDetalhes ? "Ocultar" : "Ver"} detalhes
            </Button>
            {mostrarDetalhes && (
              <div className="mt-2 space-y-2 text-sm">
                {exercicio.observacoes && (
                  <p className="text-muted-foreground bg-secondary p-3 rounded-lg">
                    💡 {exercicio.observacoes}
                  </p>
                )}
                {exercicio.tecnica && (
                  <p className="text-muted-foreground bg-secondary p-3 rounded-lg">
                    ⚡ {exercicio.tecnica}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tabela de Séries */}
      <div className="px-4 pb-4">
        <div className="space-y-2">
          {/* Header da Tabela */}
          <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <div>SET</div>
            <div>PESO (kg)</div>
            <div>REPS</div>
            <div></div>
          </div>

          {/* Linhas de Séries */}
          {exercicio.seriesRealizadas.map((serie) => (
            <div
              key={serie.numero}
              className={`grid grid-cols-[40px_1fr_1fr_44px] gap-2 items-center p-2 rounded-lg transition-all ${
                serie.concluida
                  ? "bg-emerald-600"
                  : "bg-secondary"
              }`}
            >
              {/* Número da Série */}
              <div className={`text-center font-bold ${serie.concluida ? "text-white" : "text-muted-foreground"}`}>
                {serie.numero}
              </div>

              {/* Input Peso */}
              <Input
                type="number"
                inputMode="decimal"
                placeholder="0"
                value={serie.peso}
                onChange={(e) =>
                  onUpdateSerie(exercicio.id, serie.numero, "peso", e.target.value)
                }
                disabled={serie.concluida}
                className={`text-center text-base font-semibold h-10 border-0 ${
                  serie.concluida 
                    ? "bg-emerald-500/50 text-white placeholder:text-emerald-200" 
                    : "bg-background text-foreground placeholder:text-muted-foreground"
                }`}
              />

              {/* Input Repetições */}
              <Input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={serie.repeticoes || ""}
                onChange={(e) =>
                  onUpdateSerie(
                    exercicio.id,
                    serie.numero,
                    "repeticoes",
                    parseInt(e.target.value) || 0
                  )
                }
                disabled={serie.concluida}
                className={`text-center text-base font-semibold h-10 border-0 ${
                  serie.concluida 
                    ? "bg-emerald-500/50 text-white placeholder:text-emerald-200" 
                    : "bg-background text-foreground placeholder:text-muted-foreground"
                }`}
              />

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={serie.concluida}
                  onCheckedChange={() => onSerieCompleta(exercicio.id, serie.numero)}
                  className={`h-7 w-7 rounded-md border-2 transition-all ${
                    serie.concluida 
                      ? "bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-emerald-600" 
                      : "border-gray-400 bg-gray-700/50 hover:border-blue-400 hover:bg-gray-600/50"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Progresso */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className={todosCompletos ? "text-emerald-300" : "text-muted-foreground"}>
            {seriesConcluidas}/{exercicio.seriesRealizadas.length} séries completas
          </span>
          {todosCompletos && (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-4 w-4" />
              Concluído
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
