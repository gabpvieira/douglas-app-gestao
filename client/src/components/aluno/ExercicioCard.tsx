import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Plus, Info } from "lucide-react";

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

  const seriesConcluidas = exercicio.seriesRealizadas.filter((s) => s.concluida).length;
  const todosCompletos = seriesConcluidas === exercicio.seriesRealizadas.length;

  return (
    <Card
      className={`bg-gray-900 border-gray-800 transition-all ${
        todosCompletos ? "border-green-500/30 bg-green-500/5" : ""
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                todosCompletos
                  ? "bg-green-500/20 text-green-500"
                  : "bg-blue-500/20 text-blue-500"
              }`}
            >
              <span className="text-lg font-bold">{numero}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-100">{exercicio.nome}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {exercicio.grupoMuscular}
                </Badge>
                <span className="text-sm text-gray-400">
                  {exercicio.series} × {exercicio.repeticoes}
                </span>
                {exercicio.descanso > 0 && (
                  <span className="text-xs text-gray-500">• {exercicio.descanso}s descanso</span>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-500">
            <Play className="h-4 w-4 mr-1" />
            Vídeo
          </Button>
        </div>

        {/* Detalhes (Observações e Técnica) */}
        {(exercicio.observacoes || exercicio.tecnica) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarDetalhes(!mostrarDetalhes)}
              className="text-gray-400 hover:text-gray-100 text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              {mostrarDetalhes ? "Ocultar" : "Ver"} detalhes
            </Button>
            {mostrarDetalhes && (
              <div className="mt-2 space-y-2 text-sm">
                {exercicio.observacoes && (
                  <p className="text-gray-400 bg-gray-800 p-2 rounded">
                    💡 {exercicio.observacoes}
                  </p>
                )}
                {exercicio.tecnica && (
                  <p className="text-gray-400 bg-gray-800 p-2 rounded">
                    ⚡ {exercicio.tecnica}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Tabela de Séries */}
        <div className="space-y-2">
          {/* Header da Tabela */}
          <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-xs font-semibold text-gray-400 px-2">
            <div>SET</div>
            <div>PESO (kg)</div>
            <div>REPS</div>
            <div></div>
          </div>

          {/* Linhas de Séries */}
          {exercicio.seriesRealizadas.map((serie) => (
            <div
              key={serie.numero}
              className={`grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center p-2 rounded-lg transition-colors ${
                serie.concluida
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-gray-800 border border-gray-700"
              }`}
            >
              {/* Número da Série */}
              <div className="text-center font-bold text-gray-300">{serie.numero}</div>

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
                className={`text-center text-lg font-semibold bg-gray-900 border-gray-700 ${
                  serie.concluida ? "opacity-60" : ""
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
                className={`text-center text-lg font-semibold bg-gray-900 border-gray-700 ${
                  serie.concluida ? "opacity-60" : ""
                }`}
              />

              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={serie.concluida}
                  onCheckedChange={() => onSerieCompleta(exercicio.id, serie.numero)}
                  className="h-6 w-6 border-2"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Progresso */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {seriesConcluidas}/{exercicio.seriesRealizadas.length} séries completas
          </span>
          {todosCompletos && (
            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
              ✓ Concluído
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
