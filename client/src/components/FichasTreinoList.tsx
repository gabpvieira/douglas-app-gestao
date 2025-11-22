import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, Eye, EyeOff, Dumbbell } from 'lucide-react';

interface Exercicio {
  id?: string;
  nome: string;
  grupoMuscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
}

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracaoSemanas: number;
  ativo: boolean;
  exercicios: Exercicio[];
  createdAt: Date;
}

interface FichasTreinoListProps {
  fichas: FichaTreino[];
  onEditarFicha: (ficha: FichaTreino) => void;
  onExcluirFicha: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onAtribuirFicha: (ficha: FichaTreino) => void;
}

const nivelColors = {
  iniciante: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediario: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  avancado: 'bg-red-500/20 text-red-400 border-red-500/30'
};

const nivelLabels = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado'
};

export function FichasTreinoList({
  fichas,
  onEditarFicha,
  onExcluirFicha,
  onToggleAtivo,
  onAtribuirFicha
}: FichasTreinoListProps) {
  return (
    <div className="space-y-3">
      {fichas.map((ficha) => (
        <Card 
          key={ficha.id}
          className="p-4 border-gray-800 bg-gray-800/30 hover:bg-gray-800/50 transition-all"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Icon */}
            <div className="hidden lg:flex h-12 w-12 rounded-xl items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-2">
                <h3 className="text-base sm:text-lg font-semibold text-white truncate">
                  {ficha.nome}
                </h3>
                {!ficha.ativo && (
                  <Badge variant="outline" className="bg-gray-700/50 text-gray-400 border-gray-600 text-xs">
                    Inativa
                  </Badge>
                )}
              </div>
              
              <p className="text-xs sm:text-sm text-gray-400 mb-3 line-clamp-2">
                {ficha.descricao}
              </p>

              <div className="flex flex-wrap gap-2">
                <Badge className={`${nivelColors[ficha.nivel]} text-xs`}>
                  {nivelLabels[ficha.nivel]}
                </Badge>
                <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                  {ficha.objetivo}
                </Badge>
                <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                  {ficha.duracaoSemanas} semanas
                </Badge>
                <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600 text-xs">
                  {ficha.exercicios.length} exercícios
                </Badge>
              </div>
            </div>

            {/* Actions */}
            <div className="flex lg:flex-col gap-2 flex-wrap lg:flex-nowrap">
              <Button
                size="sm"
                onClick={() => onAtribuirFicha(ficha)}
                className="flex-1 lg:flex-none bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs"
              >
                <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Atribuir
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEditarFicha(ficha)}
                className="flex-1 lg:flex-none border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
              >
                <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                Editar
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleAtivo(ficha.id)}
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
              >
                {ficha.ativo ? (
                  <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onExcluirFicha(ficha.id)}
                className="border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-xs"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
