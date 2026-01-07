import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Play, Link2, Unlink } from 'lucide-react';
import { agruparExerciciosPorBiset, isBiSetGroup, BiSetGroup } from '@/hooks/useFichasTreino';

interface Exercicio {
  id?: string;
  nome: string;
  grupoMuscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string;
  bisetGrupoId?: string;
}

interface ExerciciosListProps {
  exercicios: Exercicio[];
  onEditarExercicio: (exercicio: Exercicio) => void;
  onExcluirExercicio: (exercicioId: string) => void;
  onReordenar: (exercicios: Exercicio[]) => void;
  onDesfazerBiset?: (grupoId: string) => void;
  onEditarBiset?: (grupoId: string) => void;
}

export function ExerciciosList({
  exercicios,
  onEditarExercicio,
  onExcluirExercicio,
  onReordenar,
  onDesfazerBiset,
  onEditarBiset
}: ExerciciosListProps) {
  if (exercicios.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
        <p className="text-gray-500 text-sm">
          Nenhum exercício adicionado ainda.
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Clique em "Adicionar Exercício" ou "Criar Bi-Set" para começar.
        </p>
      </div>
    );
  }

  const formatarDescanso = (segundos: number) => {
    if (segundos >= 60) {
      const minutos = Math.floor(segundos / 60);
      const segs = segundos % 60;
      return segs > 0 ? `${minutos}min ${segs}s` : `${minutos}min`;
    }
    return `${segundos}s`;
  };

  // Converter para formato snake_case para a função de agrupamento
  const exerciciosSnakeCase = exercicios.map(ex => ({
    id: ex.id,
    nome: ex.nome,
    grupo_muscular: ex.grupoMuscular,
    ordem: ex.ordem,
    series: ex.series,
    repeticoes: ex.repeticoes,
    descanso: ex.descanso,
    observacoes: ex.observacoes,
    tecnica: ex.tecnica,
    video_id: ex.videoId,
    biset_grupo_id: ex.bisetGrupoId
  }));

  const itensAgrupados = agruparExerciciosPorBiset(exerciciosSnakeCase);

  // Calcular ordem visual
  let ordemVisual = 0;

  return (
    <div className="space-y-2">
      {itensAgrupados.map((item) => {
        if (isBiSetGroup(item)) {
          ordemVisual++;
          const biset = item as BiSetGroup;
          return (
            <BiSetCard
              key={biset.grupoId}
              biset={biset}
              ordemVisual={ordemVisual}
              formatarDescanso={formatarDescanso}
              onEditarExercicio={onEditarExercicio}
              onExcluirExercicio={onExcluirExercicio}
              onDesfazerBiset={onDesfazerBiset}
              onEditarBiset={onEditarBiset}
            />
          );
        } else {
          ordemVisual++;
          // Converter de volta para camelCase
          const exSnake = item as any;
          const exercicio: Exercicio = {
            id: exSnake.id,
            nome: exSnake.nome,
            grupoMuscular: exSnake.grupo_muscular,
            ordem: exSnake.ordem,
            series: exSnake.series,
            repeticoes: exSnake.repeticoes,
            descanso: exSnake.descanso,
            observacoes: exSnake.observacoes,
            tecnica: exSnake.tecnica,
            videoId: exSnake.video_id,
            bisetGrupoId: exSnake.biset_grupo_id
          };
          const exercicioKey = exercicio.id || `temp-${exercicio.ordem}`;
          
          return (
            <ExercicioCard
              key={exercicioKey}
              exercicio={exercicio}
              ordemVisual={ordemVisual}
              formatarDescanso={formatarDescanso}
              onEditarExercicio={onEditarExercicio}
              onExcluirExercicio={onExcluirExercicio}
            />
          );
        }
      })}
    </div>
  );
}

// Card para exercício individual
function ExercicioCard({
  exercicio,
  ordemVisual,
  formatarDescanso,
  onEditarExercicio,
  onExcluirExercicio
}: {
  exercicio: Exercicio;
  ordemVisual: number;
  formatarDescanso: (s: number) => string;
  onEditarExercicio: (ex: Exercicio) => void;
  onExcluirExercicio: (id: string) => void;
}) {
  const exercicioKey = exercicio.id || `temp-${exercicio.ordem}`;
  
  return (
    <Card className="p-3 border-gray-800 bg-gray-800/30 hover:bg-gray-800/50 transition-all">
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div className="flex items-center justify-center w-8 h-8 text-gray-500 cursor-move">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Order Number */}
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex-shrink-0">
          {ordemVisual}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white mb-1">
                {exercicio.nome}
              </h4>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {exercicio.grupoMuscular}
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {exercicio.series}x {exercicio.repeticoes}
                </Badge>
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  {formatarDescanso(exercicio.descanso)}
                </Badge>
                {exercicio.tecnica && exercicio.tecnica !== 'Bi-Set' && (
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                    {exercicio.tecnica}
                  </Badge>
                )}
                {exercicio.videoId && (
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                    <Play className="w-3 h-3 mr-1" />
                    Vídeo
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-1 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditarExercicio(exercicio)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onExcluirExercicio(exercicioKey)}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/30"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {exercicio.observacoes && (
            <p className="text-xs text-gray-400 mt-2">
              💡 {exercicio.observacoes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

// Card para Bi-Set agrupado
function BiSetCard({
  biset,
  ordemVisual,
  formatarDescanso,
  onEditarExercicio,
  onExcluirExercicio,
  onDesfazerBiset,
  onEditarBiset
}: {
  biset: BiSetGroup;
  ordemVisual: number;
  formatarDescanso: (s: number) => string;
  onEditarExercicio: (ex: Exercicio) => void;
  onExcluirExercicio: (id: string) => void;
  onDesfazerBiset?: (grupoId: string) => void;
  onEditarBiset?: (grupoId: string) => void;
}) {
  // Converter de volta para camelCase
  const exercicioA: Exercicio = {
    id: (biset.exercicioA as any).id,
    nome: (biset.exercicioA as any).nome,
    grupoMuscular: (biset.exercicioA as any).grupo_muscular,
    ordem: (biset.exercicioA as any).ordem,
    series: (biset.exercicioA as any).series,
    repeticoes: (biset.exercicioA as any).repeticoes,
    descanso: (biset.exercicioA as any).descanso,
    observacoes: (biset.exercicioA as any).observacoes,
    tecnica: (biset.exercicioA as any).tecnica,
    videoId: (biset.exercicioA as any).video_id,
    bisetGrupoId: (biset.exercicioA as any).biset_grupo_id
  };
  
  const exercicioB: Exercicio = {
    id: (biset.exercicioB as any).id,
    nome: (biset.exercicioB as any).nome,
    grupoMuscular: (biset.exercicioB as any).grupo_muscular,
    ordem: (biset.exercicioB as any).ordem,
    series: (biset.exercicioB as any).series,
    repeticoes: (biset.exercicioB as any).repeticoes,
    descanso: (biset.exercicioB as any).descanso,
    observacoes: (biset.exercicioB as any).observacoes,
    tecnica: (biset.exercicioB as any).tecnica,
    videoId: (biset.exercicioB as any).video_id,
    bisetGrupoId: (biset.exercicioB as any).biset_grupo_id
  };

  return (
    <Card className="border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-purple-500/5 hover:from-orange-500/10 hover:to-purple-500/10 transition-all overflow-hidden">
      {/* Header do Bi-Set */}
      <div className="flex items-center justify-between px-3 py-2 bg-orange-500/10 border-b border-orange-500/20">
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-semibold text-orange-400">BI-SET</span>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
            {biset.series} séries
          </Badge>
          <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
            {formatarDescanso(biset.descanso)} descanso
          </Badge>
        </div>
        <div className="flex gap-1">
          {onEditarBiset && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEditarBiset(biset.grupoId)}
              className="h-7 px-2 text-gray-400 hover:text-white hover:bg-gray-700 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          )}
          {onDesfazerBiset && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDesfazerBiset(biset.grupoId)}
              className="h-7 px-2 text-gray-400 hover:text-orange-400 hover:bg-orange-950/30 text-xs"
            >
              <Unlink className="w-3 h-3 mr-1" />
              Desfazer
            </Button>
          )}
        </div>
      </div>

      {/* Exercícios do Bi-Set */}
      <div className="p-3 space-y-2">
        {/* Exercício A */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 text-gray-500 cursor-move">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-600 text-white font-bold text-sm flex-shrink-0">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {exercicioA.nome}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    {exercicioA.grupoMuscular}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {exercicioA.repeticoes} reps
                  </Badge>
                  {exercicioA.videoId && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Vídeo
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditarExercicio(exercicioA)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Indicador de sequência */}
        <div className="flex items-center gap-2 pl-11">
          <div className="flex-1 h-px bg-gradient-to-r from-orange-500/50 to-purple-500/50"></div>
          <span className="text-xs text-gray-500">sem descanso</span>
          <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-orange-500/50"></div>
        </div>

        {/* Exercício B */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-8 h-8 text-gray-500 cursor-move">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-600 text-white font-bold text-sm flex-shrink-0">
            B
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-white mb-1">
                  {exercicioB.nome}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                    {exercicioB.grupoMuscular}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                    {exercicioB.repeticoes} reps
                  </Badge>
                  {exercicioB.videoId && (
                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Vídeo
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEditarExercicio(exercicioB)}
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
