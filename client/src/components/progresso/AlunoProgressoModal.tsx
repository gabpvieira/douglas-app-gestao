import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MetricasAluno, useHistoricoTreinos } from "@/hooks/useProgressoTreinos";
import { Flame, Trophy, TrendingUp, Clock, Dumbbell, Loader2 } from "lucide-react";
import WeekProgressTracker from "./WeekProgressTracker";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlunoProgressoModalProps {
  aluno: MetricasAluno;
  onClose: () => void;
}

export default function AlunoProgressoModal({ aluno, onClose }: AlunoProgressoModalProps) {
  const { data: historico, isLoading: loadingHistorico } = useHistoricoTreinos(aluno.alunoId, 30);
  
  // Calcular dias treinados da semana
  const diasTreinadosIndices: number[] = [];
  for (let i = 0; i < aluno.diasTreinadosSemana; i++) {
    diasTreinadosIndices.push(i);
  }
  
  // Agrupar treinos por data
  const treinosPorData = historico?.reduce((acc: any, treino: any) => {
    const data = new Date(treino.data_realizacao).toLocaleDateString('pt-BR');
    if (!acc[data]) {
      acc[data] = [];
    }
    acc[data].push(treino);
    return acc;
  }, {});
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 p-4 sm:p-6 w-[calc(100vw-2rem)] sm:w-full left-[50%] translate-x-[-50%]">
        <DialogHeader>
          <DialogTitle className="text-white text-lg sm:text-xl">Progresso do Aluno</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Header do Aluno */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <Avatar className="h-12 w-12 sm:h-16 sm:w-16">
              <AvatarImage src={aluno.fotoUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg sm:text-xl">
                {aluno.nome.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 truncate">{aluno.nome}</h3>
              <p className="text-xs sm:text-sm text-gray-400 truncate">{aluno.email}</p>
            </div>
            
            {aluno.sequenciaAtual >= 5 && (
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs sm:text-sm whitespace-nowrap">
                <Flame className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {aluno.sequenciaAtual} dias
              </Badge>
            )}
          </div>
          
          {/* Estatísticas da Semana */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">📊 Estatísticas da Semana</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">{aluno.diasTreinadosSemana}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Dias</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">{aluno.treinosRealizadosSemana}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Treinos</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">{aluno.exerciciosCompletadosSemana}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Exercícios</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 mx-auto mb-1 sm:mb-2" />
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {(aluno.mediaExerciciosPorTreino * 3).toFixed(0)}min
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400">Tempo</div>
              </div>
            </div>
          </div>
          
          {/* Calendário Semanal */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">📅 Calendário Semanal</h4>
            <div className="p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              <WeekProgressTracker diasTreinados={diasTreinadosIndices} compact />
            </div>
          </div>
          
          {/* Conquistas */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">🏆 Conquistas</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">Sequência Atual</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">{aluno.sequenciaAtual} dias</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">Melhor Sequência</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">{aluno.melhorSequencia} dias</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">Total de Treinos</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">{aluno.totalTreinosRealizados}</div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-400">Taxa de Frequência</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-white">{aluno.taxaFrequencia.toFixed(0)}%</div>
              </div>
            </div>
          </div>
          
          {/* Últimos Treinos */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">📋 Últimos Treinos (30 dias)</h4>
            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto">
              {loadingHistorico ? (
                <div className="flex items-center justify-center py-6 sm:py-8">
                  <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
                </div>
              ) : !treinosPorData || Object.keys(treinosPorData).length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-xs sm:text-sm text-gray-500">
                  Nenhum treino realizado nos últimos 30 dias
                </div>
              ) : (
                Object.entries(treinosPorData).map(([data, treinos]: [string, any]) => (
                  <div key={data} className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center justify-between mb-1 sm:mb-2 gap-2">
                      <span className="text-xs sm:text-sm font-medium text-white truncate">{data}</span>
                      <Badge variant="outline" className="text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0">
                        {treinos.length} ex.
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {treinos.slice(0, 3).map((treino: any, idx: number) => (
                        <div key={idx} className="text-[10px] sm:text-xs text-gray-400 truncate">
                          • {treino.exercicios_ficha?.nome} - {treino.series_realizadas} séries
                        </div>
                      ))}
                      {treinos.length > 3 && (
                        <div className="text-[10px] sm:text-xs text-gray-500">
                          + {treinos.length - 3} exercícios
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Info adicional */}
          {aluno.ultimoTreino && (
            <div className="text-xs sm:text-sm text-gray-400 text-center pt-2">
              Último treino: {formatDistanceToNow(aluno.ultimoTreino, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
