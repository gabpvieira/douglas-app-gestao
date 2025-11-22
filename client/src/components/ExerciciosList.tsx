import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, GripVertical, Play } from 'lucide-react';

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
}

interface ExerciciosListProps {
  exercicios: Exercicio[];
  onEditarExercicio: (exercicio: Exercicio) => void;
  onExcluirExercicio: (ordem: number) => void;
  onReordenar: (exercicios: Exercicio[]) => void;
}

export function ExerciciosList({
  exercicios,
  onEditarExercicio,
  onExcluirExercicio,
  onReordenar
}: ExerciciosListProps) {
  if (exercicios.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
        <p className="text-gray-500 text-sm">
          Nenhum exercício adicionado ainda.
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Clique em "Adicionar Exercício" para começar.
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

  return (
    <div className="space-y-2">
      {exercicios.map((exercicio, index) => (
        <Card 
          key={exercicio.ordem}
          className="p-3 border-gray-800 bg-gray-800/30 hover:bg-gray-800/50 transition-all"
        >
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div className="flex items-center justify-center w-8 h-8 text-gray-500 cursor-move">
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Order Number */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-sm flex-shrink-0">
              {exercicio.ordem}
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
                    {exercicio.tecnica && (
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
                    onClick={() => onExcluirExercicio(exercicio.ordem)}
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
      ))}
    </div>
  );
}
