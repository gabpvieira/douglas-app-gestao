import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricasAluno, useHistoricoTreinos } from "@/hooks/useProgressoTreinos";
import { Flame, Trophy, TrendingUp, Clock, Dumbbell, Loader2, Calendar, CalendarDays, Target, Zap } from "lucide-react";
import WeekProgressTracker from "./WeekProgressTracker";
import CalendarioMensal from "./CalendarioMensal";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface AlunoProgressoModalProps {
  aluno: MetricasAluno;
  onClose: () => void;
}

type VisualizacaoCalendario = 'semanal' | 'mensal';

export default function AlunoProgressoModal({ aluno, onClose }: AlunoProgressoModalProps) {
  const [visualizacao, setVisualizacao] = useState<VisualizacaoCalendario>('semanal');
  const { data: historico, isLoading: loadingHistorico } = useHistoricoTreinos(aluno.alunoId, 30);
  
  // Usar os índices reais dos dias treinados (já no formato BR: 0=seg, 6=dom)
  const diasTreinadosIndices = aluno.diasTreinadosSemanaIndices || [];
  
  const treinosPorData = historico?.reduce((acc: any, treino: any) => {
    const data = new Date(treino.data_realizacao).toLocaleDateString('pt-BR');
    if (!acc[data]) acc[data] = [];
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
          
          {/* Resumo Geral */}
          <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-r from-primary/10 to-purple-600/10 border border-primary/20">
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-3">📊 Resumo Geral</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">{aluno.totalTreinosRealizados}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Total de Treinos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-green-500">{aluno.diasTreinadosMes}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Dias no Mês</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500">{aluno.diasTreinadosSemana}</div>
                <div className="text-[10px] sm:text-xs text-gray-400">Dias na Semana</div>
              </div>
            </div>
          </div>

          {/* Estatísticas da Semana */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">📈 Estatísticas da Semana</h4>
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
          
          {/* Calendário com Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h4 className="text-xs sm:text-sm font-medium text-gray-400">📅 Calendário de Treinos</h4>
              
              <div className="flex bg-gray-800/50 rounded-lg p-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisualizacao('semanal')}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 h-7 rounded-md transition-colors text-xs",
                    visualizacao === 'semanal'
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  Semana
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setVisualizacao('mensal')}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 h-7 rounded-md transition-colors text-xs",
                    visualizacao === 'mensal'
                      ? "bg-primary text-white"
                      : "text-gray-400 hover:text-white"
                  )}
                >
                  <CalendarDays className="h-3 w-3" />
                  Mês
                </Button>
              </div>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-gray-800/50 border border-gray-700">
              {visualizacao === 'semanal' ? (
                <WeekProgressTracker diasTreinados={diasTreinadosIndices} compact />
              ) : (
                <CalendarioMensal alunoId={aluno.alunoId} />
              )}
            </div>
          </div>

          {/* Conquistas */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">🏆 Conquistas</h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-[10px] sm:text-xs text-gray-400">Sequência Atual</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-orange-500">
                  {aluno.sequenciaAtual} dias
                </div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-[10px] sm:text-xs text-gray-400">Melhor Sequência</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-yellow-500">
                  {aluno.melhorSequencia} dias
                </div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-500" />
                  <span className="text-[10px] sm:text-xs text-gray-400">Taxa de Frequência</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-blue-500">
                  {aluno.taxaFrequencia.toFixed(0)}%
                </div>
              </div>
              
              <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <span className="text-[10px] sm:text-xs text-gray-400">Média/Treino</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-purple-500">
                  {aluno.mediaExerciciosPorTreino.toFixed(1)} ex.
                </div>
              </div>
            </div>
          </div>
          
          {/* Histórico de Treinos */}
          <div>
            <h4 className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3">📋 Últimos Treinos</h4>
            
            {loadingHistorico ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : !historico || historico.length === 0 ? (
              <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700 text-center">
                <Dumbbell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Nenhum treino registrado</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {Object.entries(treinosPorData || {}).slice(0, 5).map(([data, treinos]: [string, any[]]) => (
                  <div 
                    key={data}
                    className="p-2 sm:p-3 rounded-lg bg-gray-800/50 border border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs sm:text-sm font-medium text-white">{data}</span>
                      <Badge variant="outline" className="text-[10px] sm:text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        {treinos.length} exercício{treinos.length > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {treinos.slice(0, 3).map((treino: any, idx: number) => (
                        <span 
                          key={idx}
                          className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400"
                        >
                          {treino.exercicios_ficha?.nome || 'Exercício'}
                        </span>
                      ))}
                      {treinos.length > 3 && (
                        <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-500">
                          +{treinos.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Último treino */}
          {aluno.ultimoTreino && (
            <div className="pt-2 border-t border-gray-800">
              <p className="text-xs text-gray-500 text-center">
                Último treino: {formatDistanceToNow(aluno.ultimoTreino, { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
