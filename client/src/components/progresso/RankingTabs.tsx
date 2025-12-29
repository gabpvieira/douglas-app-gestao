import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, Calendar, Crown, Loader2 } from "lucide-react";
import { useRankingSemanal, useRankingGeral, AlunoDestaque } from "@/hooks/useProgressoTreinos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type TipoRanking = 'semanal' | 'geral';

const BADGE_CONFIG = {
  ouro: {
    emoji: '🥇',
    cor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    label: '1º Lugar'
  },
  prata: {
    emoji: '🥈',
    cor: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    label: '2º Lugar'
  },
  bronze: {
    emoji: '🥉',
    cor: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    label: '3º Lugar'
  },
  fogo: {
    emoji: '🔥',
    cor: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    label: 'Destaque'
  }
};

export default function RankingTabs() {
  const [tipoRanking, setTipoRanking] = useState<TipoRanking>('semanal');
  
  const { data: rankingSemanal, isLoading: loadingSemanal } = useRankingSemanal('dias');
  const { data: rankingGeral, isLoading: loadingGeral } = useRankingGeral();
  
  const isLoading = tipoRanking === 'semanal' ? loadingSemanal : loadingGeral;
  const ranking = tipoRanking === 'semanal' ? rankingSemanal : rankingGeral;
  
  // Filtrar top 3 para destaque
  const top3 = ranking?.slice(0, 3) || [];
  const restante = ranking?.slice(3) || [];
  
  return (
    <Card className="border-gray-800 bg-gradient-to-br from-purple-950/20 to-gray-900/30">
      <div className="p-4 sm:p-6">
        {/* Header com Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {tipoRanking === 'semanal' ? '🏆 Ranking Semanal' : '👑 Ranking Geral'}
              </h2>
              <p className="text-sm text-gray-400">
                {tipoRanking === 'semanal' 
                  ? 'Top alunos da semana atual' 
                  : 'Ranking acumulado de todos os tempos'}
              </p>
            </div>
          </div>
          
          {/* Tabs de alternância */}
          <div className="flex bg-gray-800/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTipoRanking('semanal')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
                tipoRanking === 'semanal'
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Semanal</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTipoRanking('geral')}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md transition-colors",
                tipoRanking === 'geral'
                  ? "bg-primary text-white"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Crown className="h-4 w-4" />
              <span className="text-sm">Geral</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !ranking || ranking.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum aluno no ranking ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 em destaque */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {top3.map((aluno) => {
                  const badgeConfig = aluno.badge ? BADGE_CONFIG[aluno.badge] : null;
                  
                  return (
                    <div
                      key={aluno.alunoId}
                      className={cn(
                        "p-4 rounded-xl border text-center transition-all",
                        aluno.posicao === 1 
                          ? "bg-gradient-to-br from-yellow-900/30 to-yellow-950/20 border-yellow-600/30" 
                          : aluno.posicao === 2
                            ? "bg-gradient-to-br from-gray-700/30 to-gray-800/20 border-gray-500/30"
                            : "bg-gradient-to-br from-orange-900/30 to-orange-950/20 border-orange-600/30"
                      )}
                    >
                      <div className="text-3xl mb-2">{badgeConfig?.emoji}</div>
                      
                      <Avatar className="h-14 w-14 mx-auto mb-2 ring-2 ring-offset-2 ring-offset-gray-900 ring-primary/50">
                        <AvatarImage src={aluno.fotoUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {aluno.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="font-semibold text-white truncate">{aluno.nome}</h3>
                      
                      <div className="mt-2 space-y-1">
                        <div className="text-2xl font-bold text-primary">
                          {aluno.pontuacao}
                        </div>
                        <div className="text-xs text-gray-400">
                          {tipoRanking === 'semanal' ? 'dias esta semana' : 'treinos no total'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Restante do ranking */}
            {restante.length > 0 && (
              <div className="space-y-2">
                {restante.map((aluno) => {
                  const badgeConfig = aluno.badge ? BADGE_CONFIG[aluno.badge] : null;
                  
                  return (
                    <div
                      key={aluno.alunoId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-300">
                        {aluno.posicao}
                      </div>
                      
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={aluno.fotoUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {aluno.nome.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{aluno.nome}</div>
                        <div className="text-xs text-gray-400">
                          {tipoRanking === 'semanal' 
                            ? `${aluno.diasTreinados} dias • ${aluno.treinosRealizados} treinos`
                            : `${aluno.diasTreinados} dias únicos`}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary">{aluno.pontuacao}</div>
                        {badgeConfig && (
                          <Badge variant="outline" className={cn("text-[10px]", badgeConfig.cor)}>
                            {badgeConfig.label}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
