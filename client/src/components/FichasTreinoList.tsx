import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, UserPlus, Eye, EyeOff, Dumbbell, Users, Calendar, Target } from 'lucide-react';

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
  onVerAlunos?: (ficha: FichaTreino) => void;
}

const nivelColors = {
  iniciante: 'bg-green-500 text-white',
  intermediario: 'bg-yellow-500 text-white',
  avancado: 'bg-red-500 text-white'
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
  onAtribuirFicha,
  onVerAlunos
}: FichasTreinoListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {fichas.map((ficha) => (
        <Card 
          key={ficha.id}
          className="border-gray-800 bg-gradient-to-br from-gray-800/50 to-gray-800/30 hover:from-gray-800/70 hover:to-gray-800/50 transition-all overflow-hidden"
        >
          <CardContent className="p-3 sm:p-5">
            {/* Header */}
            <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 shadow-lg">
                <Dumbbell className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm sm:text-lg font-bold text-white truncate">
                    {ficha.nome}
                  </h3>
                  {!ficha.ativo && (
                    <Badge variant="outline" className="bg-gray-700/50 text-gray-400 border-gray-600 text-[9px] sm:text-[10px] flex-shrink-0 px-1.5 py-0">
                      Inativa
                    </Badge>
                  )}
                </div>
                
                <p className="text-[11px] sm:text-sm text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                  {ficha.descricao}
                </p>

                {/* Badges Info */}
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  <Badge className={`${nivelColors[ficha.nivel]} text-[9px] sm:text-xs px-1.5 py-0`}>
                    {nivelLabels[ficha.nivel]}
                  </Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-700/50 text-[9px] sm:text-xs px-1.5 py-0">
                    <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    {ficha.objetivo}
                  </Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-700/50 text-[9px] sm:text-xs px-1.5 py-0">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    {ficha.duracaoSemanas} sem
                  </Badge>
                  <Badge variant="outline" className="bg-gray-700/50 text-gray-300 border-gray-600 text-[9px] sm:text-xs px-1.5 py-0">
                    <Dumbbell className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                    {ficha.exercicios.length} ex
                  </Badge>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-4 border-t border-gray-700">
              {/* Primeira linha - Ações principais */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  onClick={() => onAtribuirFicha(ficha)}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs h-8 sm:h-9"
                >
                  <UserPlus className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Atribuir</span>
                </Button>
                
                {onVerAlunos && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onVerAlunos(ficha)}
                    className="border-blue-700 bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 hover:text-blue-200 text-xs h-8 sm:h-9"
                  >
                    <Users className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Ver Alunos</span>
                  </Button>
                )}
              </div>
              
              {/* Segunda linha - Ações secundárias */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditarFicha(ficha)}
                  className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs h-8 sm:h-9"
                  title="Editar"
                >
                  <Edit className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleAtivo(ficha.id)}
                  className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs h-8 sm:h-9"
                  title={ficha.ativo ? "Desativar" : "Ativar"}
                >
                  {ficha.ativo ? (
                    <>
                      <EyeOff className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Desativar</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 sm:mr-1" />
                      <span className="hidden sm:inline">Ativar</span>
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onExcluirFicha(ficha.id)}
                  className="border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 text-xs h-8 sm:h-9"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Excluir</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
