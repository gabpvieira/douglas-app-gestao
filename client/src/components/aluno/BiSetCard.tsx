import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Info, Check, Link2, ArrowDown, History } from "lucide-react";
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
  bisetGrupoId?: string;
  seriesRealizadas: SerieRealizada[];
}

interface BiSetCardProps {
  exercicioA: ExercicioExecucao;
  exercicioB: ExercicioExecucao;
  numero: number;
  onSerieCompleta: (exercicioId: string, numeroSerie: number) => void;
  onUpdateSerie: (
    exercicioId: string,
    numeroSerie: number,
    campo: "peso" | "repeticoes",
    valor: string | number
  ) => void;
}

export default function BiSetCard({
  exercicioA,
  exercicioB,
  numero,
  onSerieCompleta,
  onUpdateSerie,
}: BiSetCardProps) {
  const [mostrarDetalhesA, setMostrarDetalhesA] = useState(false);
  const [mostrarDetalhesB, setMostrarDetalhesB] = useState(false);
  const [videoModalOpenA, setVideoModalOpenA] = useState(false);
  const [videoModalOpenB, setVideoModalOpenB] = useState(false);

  const seriesConcluidasA = exercicioA.seriesRealizadas.filter((s) => s.concluida).length;
  const seriesConcluidasB = exercicioB.seriesRealizadas.filter((s) => s.concluida).length;
  const totalSeries = exercicioA.seriesRealizadas.length;
  
  // Bi-set completo quando ambos exercícios têm todas as séries concluídas
  const todosCompletos = seriesConcluidasA === totalSeries && seriesConcluidasB === totalSeries;
  
  // Calcular progresso do par (cada série do par conta como 1)
  const paresCompletos = Math.min(seriesConcluidasA, seriesConcluidasB);

  // Verificar se uma série do exercício B pode ser marcada
  // Só pode marcar B se a série correspondente de A já foi concluída
  const podeMarcarSerieB = (numeroSerie: number) => {
    const serieA = exercicioA.seriesRealizadas.find(s => s.numero === numeroSerie);
    return serieA?.concluida || false;
  };

  // Verificar se há cargas pré-preenchidas do treino anterior
  const temCargasAnterioresA = exercicioA.seriesRealizadas.some(
    (s) => s.peso && s.peso !== '' && s.peso !== '0' && !s.concluida
  );
  const temCargasAnterioresB = exercicioB.seriesRealizadas.some(
    (s) => s.peso && s.peso !== '' && s.peso !== '0' && !s.concluida
  );
  const temCargasAnteriores = temCargasAnterioresA || temCargasAnterioresB;

  return (
    <div
      className={`rounded-xl transition-all border-2 overflow-hidden ${
        todosCompletos 
          ? "bg-emerald-900/30 border-emerald-600/50" 
          : "bg-gradient-to-br from-orange-950/30 to-purple-950/30 border-orange-500/30"
      }`}
    >
      {/* Header do Bi-Set */}
      <div className={`px-4 py-2 flex items-center justify-between ${
        todosCompletos ? "bg-emerald-800/30" : "bg-orange-500/10"
      }`}>
        <div className="flex items-center gap-2">
          <Link2 className={`h-4 w-4 ${todosCompletos ? "text-emerald-400" : "text-orange-400"}`} />
          <span className={`text-sm font-semibold ${todosCompletos ? "text-emerald-400" : "text-orange-400"}`}>
            BI-SET
          </span>
          <span className="text-xs text-muted-foreground">
            {totalSeries} séries • {exercicioB.descanso}s descanso após o par
          </span>
        </div>
        <div className="flex items-center gap-2">
          {temCargasAnteriores && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <History className="h-3 w-3" />
              <span className="hidden sm:inline">Cargas anteriores</span>
            </span>
          )}
          <span className={`text-sm font-medium ${todosCompletos ? "text-emerald-400" : "text-muted-foreground"}`}>
            {paresCompletos}/{totalSeries} pares
          </span>
          {todosCompletos && <Check className="h-4 w-4 text-emerald-400" />}
        </div>
      </div>

      {/* Exercício A */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg bg-orange-600 text-white">
              A
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{exercicioA.nome}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {exercicioA.grupoMuscular}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercicioA.repeticoes} reps
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVideoModalOpenA(true)}
            className="text-primary hover:text-primary/80 flex-shrink-0"
          >
            <Play className="h-4 w-4 mr-1" />
            Vídeo
          </Button>
        </div>

        <ExercicioVideoModal
          open={videoModalOpenA}
          onClose={() => setVideoModalOpenA(false)}
          exercicio={{
            id: exercicioA.id,
            nome: exercicioA.nome,
            grupoMuscular: exercicioA.grupoMuscular,
            videoId: exercicioA.videoId,
            observacoes: exercicioA.observacoes,
            tecnica: exercicioA.tecnica,
          }}
        />

        {(exercicioA.observacoes || exercicioA.tecnica) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarDetalhesA(!mostrarDetalhesA)}
              className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
            >
              <Info className="h-3 w-3 mr-1" />
              {mostrarDetalhesA ? "Ocultar" : "Ver"} detalhes
            </Button>
            {mostrarDetalhesA && (
              <div className="mt-2 space-y-2 text-sm">
                {exercicioA.observacoes && (
                  <p className="text-muted-foreground bg-secondary p-3 rounded-lg">
                    💡 {exercicioA.observacoes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Séries do Exercício A */}
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <div>SET</div>
            <div>PESO (kg)</div>
            <div>REPS</div>
            <div></div>
          </div>

          {exercicioA.seriesRealizadas.map((serie) => {
            // Verificar se esta série tem carga pré-preenchida
            const temCargaPreenchida = serie.peso && serie.peso !== '' && serie.peso !== '0' && !serie.concluida;
            
            return (
              <div
                key={serie.numero}
                className={`grid grid-cols-[40px_1fr_1fr_44px] gap-2 items-center p-2 rounded-lg transition-all ${
                  serie.concluida ? "bg-orange-600" : "bg-secondary"
                }`}
              >
                <div className={`text-center font-bold ${serie.concluida ? "text-white" : "text-muted-foreground"}`}>
                  {serie.numero}
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={serie.peso}
                  onChange={(e) => onUpdateSerie(exercicioA.id, serie.numero, "peso", e.target.value)}
                  disabled={serie.concluida}
                  className={`text-center text-base font-semibold h-10 border-0 ${
                    serie.concluida 
                      ? "bg-orange-500/50 text-white placeholder:text-orange-200" 
                      : temCargaPreenchida
                        ? "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30"
                        : "bg-background text-foreground placeholder:text-muted-foreground"
                  }`}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={serie.repeticoes || ""}
                  onChange={(e) => onUpdateSerie(exercicioA.id, serie.numero, "repeticoes", parseInt(e.target.value) || 0)}
                  disabled={serie.concluida}
                  className={`text-center text-base font-semibold h-10 border-0 ${
                    serie.concluida 
                      ? "bg-orange-500/50 text-white placeholder:text-orange-200" 
                      : "bg-background text-foreground placeholder:text-muted-foreground"
                  }`}
                />
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={serie.concluida}
                    onCheckedChange={() => onSerieCompleta(exercicioA.id, serie.numero)}
                    className={`h-7 w-7 rounded-md border-2 transition-all ${
                      serie.concluida 
                        ? "bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-orange-600" 
                        : "border-gray-400 bg-gray-700/50 hover:border-orange-400 hover:bg-gray-600/50"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicador de sequência */}
      <div className="flex items-center justify-center py-2 px-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent"></div>
        <div className="flex items-center gap-2 px-4">
          <ArrowDown className="h-4 w-4 text-orange-400 animate-bounce" />
          <span className="text-xs text-orange-400 font-medium">SEM DESCANSO</span>
          <ArrowDown className="h-4 w-4 text-orange-400 animate-bounce" />
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
      </div>

      {/* Exercício B */}
      <div className="p-4 pt-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-lg bg-purple-600 text-white">
              B
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{exercicioB.nome}</h3>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                  {exercicioB.grupoMuscular}
                </span>
                <span className="text-sm text-muted-foreground">
                  {exercicioB.repeticoes} reps
                </span>
              </div>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setVideoModalOpenB(true)}
            className="text-primary hover:text-primary/80 flex-shrink-0"
          >
            <Play className="h-4 w-4 mr-1" />
            Vídeo
          </Button>
        </div>

        <ExercicioVideoModal
          open={videoModalOpenB}
          onClose={() => setVideoModalOpenB(false)}
          exercicio={{
            id: exercicioB.id,
            nome: exercicioB.nome,
            grupoMuscular: exercicioB.grupoMuscular,
            videoId: exercicioB.videoId,
            observacoes: exercicioB.observacoes,
            tecnica: exercicioB.tecnica,
          }}
        />

        {(exercicioB.observacoes || exercicioB.tecnica) && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMostrarDetalhesB(!mostrarDetalhesB)}
              className="text-muted-foreground hover:text-foreground text-xs h-7 px-2"
            >
              <Info className="h-3 w-3 mr-1" />
              {mostrarDetalhesB ? "Ocultar" : "Ver"} detalhes
            </Button>
            {mostrarDetalhesB && (
              <div className="mt-2 space-y-2 text-sm">
                {exercicioB.observacoes && (
                  <p className="text-muted-foreground bg-secondary p-3 rounded-lg">
                    💡 {exercicioB.observacoes}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Séries do Exercício B */}
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <div>SET</div>
            <div>PESO (kg)</div>
            <div>REPS</div>
            <div></div>
          </div>

          {exercicioB.seriesRealizadas.map((serie) => {
            const bloqueado = !podeMarcarSerieB(serie.numero);
            // Verificar se esta série tem carga pré-preenchida
            const temCargaPreenchida = serie.peso && serie.peso !== '' && serie.peso !== '0' && !serie.concluida;
            
            return (
              <div
                key={serie.numero}
                className={`grid grid-cols-[40px_1fr_1fr_44px] gap-2 items-center p-2 rounded-lg transition-all ${
                  serie.concluida 
                    ? "bg-purple-600" 
                    : bloqueado 
                      ? "bg-secondary/50 opacity-60" 
                      : "bg-secondary"
                }`}
              >
                <div className={`text-center font-bold ${
                  serie.concluida ? "text-white" : bloqueado ? "text-muted-foreground/50" : "text-muted-foreground"
                }`}>
                  {serie.numero}
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={serie.peso}
                  onChange={(e) => onUpdateSerie(exercicioB.id, serie.numero, "peso", e.target.value)}
                  disabled={serie.concluida || bloqueado}
                  className={`text-center text-base font-semibold h-10 border-0 ${
                    serie.concluida 
                      ? "bg-purple-500/50 text-white placeholder:text-purple-200" 
                      : bloqueado
                        ? "bg-background/50 text-muted-foreground/50"
                        : temCargaPreenchida
                          ? "bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30"
                          : "bg-background text-foreground placeholder:text-muted-foreground"
                  }`}
                />
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={serie.repeticoes || ""}
                  onChange={(e) => onUpdateSerie(exercicioB.id, serie.numero, "repeticoes", parseInt(e.target.value) || 0)}
                  disabled={serie.concluida || bloqueado}
                  className={`text-center text-base font-semibold h-10 border-0 ${
                    serie.concluida 
                      ? "bg-purple-500/50 text-white placeholder:text-purple-200" 
                      : bloqueado
                        ? "bg-background/50 text-muted-foreground/50"
                        : "bg-background text-foreground placeholder:text-muted-foreground"
                  }`}
                />
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={serie.concluida}
                    onCheckedChange={() => {
                      if (!bloqueado) {
                        onSerieCompleta(exercicioB.id, serie.numero);
                      }
                    }}
                    disabled={bloqueado}
                    className={`h-7 w-7 rounded-md border-2 transition-all ${
                      serie.concluida 
                        ? "bg-white border-white data-[state=checked]:bg-white data-[state=checked]:text-purple-600" 
                        : bloqueado
                          ? "border-gray-600 bg-gray-800/50 cursor-not-allowed"
                          : "border-gray-400 bg-gray-700/50 hover:border-purple-400 hover:bg-gray-600/50"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Dica sobre bloqueio */}
        {exercicioB.seriesRealizadas.some((s, i) => !s.concluida && !podeMarcarSerieB(s.numero)) && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            💡 Complete a série {exercicioA.seriesRealizadas.findIndex(s => !s.concluida) + 1} do exercício A primeiro
          </p>
        )}
      </div>

      {/* Progresso geral */}
      <div className={`px-4 py-3 border-t ${todosCompletos ? "border-emerald-700/50" : "border-orange-500/20"}`}>
        <div className="flex items-center justify-between text-sm">
          <span className={todosCompletos ? "text-emerald-300" : "text-muted-foreground"}>
            {paresCompletos}/{totalSeries} pares completos
          </span>
          {todosCompletos && (
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <Check className="h-4 w-4" />
              Bi-Set Concluído
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
