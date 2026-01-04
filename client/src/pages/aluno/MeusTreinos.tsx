import { useState } from "react";
import { useLocation } from "wouter";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlunoProfile, useAlunoFichas, useHistoricoTreinos } from "@/hooks/useAlunoData";
import { useTreinoEmAndamento } from "@/hooks/useTreinoEmAndamento";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dumbbell,
  Loader2,
  Calendar,
  Play,
  ChevronDown,
  ChevronUp,
  Target,
  TrendingUp,
  Clock,
  Info,
  History,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Pause,
  Timer,
} from "lucide-react";

// Função para formatar tempo em HH:MM:SS
function formatarTempo(segundos: number): string {
  // Garantir que o valor seja positivo
  const segundosPositivos = Math.max(0, Math.floor(segundos));
  
  const horas = Math.floor(segundosPositivos / 3600);
  const minutos = Math.floor((segundosPositivos % 3600) / 60);
  const segs = segundosPositivos % 60;
  
  if (horas > 0) {
    return `${horas}h ${minutos.toString().padStart(2, "0")}m`;
  }
  return `${minutos}:${segs.toString().padStart(2, "0")}`;
}

export default function MeusTreinos() {
  const [, setLocation] = useLocation();
  const [expandedFichas, setExpandedFichas] = useState<Set<string>>(new Set());
  const [showDescartarDialog, setShowDescartarDialog] = useState(false);
  
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();

  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const { data: fichas, isLoading: loadingFichas } = useAlunoFichas(alunoId);
  
  // Hook para treino em andamento
  const { 
    treinoEmAndamento, 
    carregado: treinoCarregado,
    calcularTempoDecorrido,
    finalizarTreino 
  } = useTreinoEmAndamento(alunoId);
  
  // Calcular fichas por status ANTES de usar em hooks
  const fichasAtivas = fichas?.filter((f) => f.status === "ativo") || [];
  const fichasPausadas = fichas?.filter((f) => f.status === "pausado") || [];
  const fichasConcluidas = fichas?.filter((f) => f.status === "concluido") || [];
  const primeiraFichaAtiva = fichasAtivas[0];
  
  // Chamar hook SEMPRE, mesmo que o ID seja undefined
  const { data: historico } = useHistoricoTreinos(primeiraFichaAtiva?.id);

  const toggleFicha = (fichaId: string) => {
    setExpandedFichas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fichaId)) {
        newSet.delete(fichaId);
      } else {
        newSet.add(fichaId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-500/10 text-green-400 border-0";
      case "concluido":
        return "bg-blue-500/10 text-blue-400 border-0";
      case "pausado":
        return "bg-yellow-500/10 text-yellow-400 border-0";
      default:
        return "bg-gray-500/10 text-gray-400 border-0";
    }
  };

  const getGrupoMuscularColor = (grupo: string) => {
    const cores: Record<string, string> = {
      peito: "bg-red-500/10 text-red-400",
      costas: "bg-blue-500/10 text-blue-400",
      pernas: "bg-green-500/10 text-green-400",
      ombros: "bg-yellow-500/10 text-yellow-400",
      bíceps: "bg-purple-500/10 text-purple-400",
      tríceps: "bg-pink-500/10 text-pink-400",
      abdômen: "bg-orange-500/10 text-orange-400",
    };
    return cores[grupo.toLowerCase()] || "bg-gray-500/10 text-gray-400";
  };

  if (loadingProfile) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pt-3 md:pt-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">Meus Treinos</h1>
            <p className="text-sm text-gray-400">
              Suas fichas de treino atribuídas
            </p>
          </div>

          {/* Card de Treino em Andamento */}
          {treinoCarregado && treinoEmAndamento && (
            <Card className="border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 overflow-hidden">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                    {treinoEmAndamento.pausado ? (
                      <Pause className="h-6 w-6 text-white" />
                    ) : (
                      <Timer className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white text-base">
                        Treino em Andamento
                      </h3>
                      <Badge 
                        variant="outline" 
                        className={treinoEmAndamento.pausado 
                          ? "bg-yellow-500/10 text-yellow-400 border-0" 
                          : "bg-green-500/10 text-green-400 border-0"
                        }
                      >
                        {treinoEmAndamento.pausado ? "Pausado" : "Ativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      {treinoEmAndamento.nomeFicha}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatarTempo(calcularTempoDecorrido())}
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-3.5 w-3.5" />
                        {treinoEmAndamento.exercicios.filter(ex => 
                          ex.seriesRealizadas.every(s => s.concluida)
                        ).length}/{treinoEmAndamento.exercicios.length} exercícios
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {treinoEmAndamento.exercicios.reduce((acc, ex) => 
                          acc + ex.seriesRealizadas.filter(s => s.concluida).length, 0
                        )} séries concluídas
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-medium h-11"
                    onClick={() => setLocation(`/aluno/treino/${treinoEmAndamento.fichaAlunoId}`)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retomar Treino
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 h-11"
                    onClick={() => setShowDescartarDialog(true)}
                  >
                    Descartar
                  </Button>
                </div>
              </div>
              
              {/* Barra de progresso */}
              <div className="h-1 bg-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
                  style={{ 
                    width: `${Math.round(
                      (treinoEmAndamento.exercicios.reduce((acc, ex) => 
                        acc + ex.seriesRealizadas.filter(s => s.concluida).length, 0
                      ) / treinoEmAndamento.exercicios.reduce((acc, ex) => 
                        acc + ex.seriesRealizadas.length, 0
                      )) * 100
                    )}%` 
                  }}
                />
              </div>
            </Card>
          )}

          {/* Stats Cards - Layout 2x2 Mobile */}
          {!loadingFichas && fichas && fichas.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Total</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">{fichas.length}</p>
                    <p className="text-[9px] sm:text-xs text-gray-500">fichas</p>
                  </div>
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Ativos</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {fichasAtivas.length}
                    </p>
                    <p className="text-[9px] sm:text-xs text-gray-500">fichas</p>
                  </div>
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Pausados</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {fichasPausadas.length}
                    </p>
                    <p className="text-[9px] sm:text-xs text-gray-500">fichas</p>
                  </div>
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Concluídos</p>
                    <p className="text-lg sm:text-2xl font-bold text-white">
                      {fichasConcluidas.length}
                    </p>
                    <p className="text-[9px] sm:text-xs text-gray-500">fichas</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {loadingFichas ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : fichas && fichas.length > 0 ? (
            <div className="space-y-6">
              {/* Fichas Ativas */}
              {fichasAtivas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-base font-medium text-white">Treinos Ativos</h2>
                  </div>

                  <div className="space-y-3">
                    {fichasAtivas.map((ficha) => (
                      <Card key={ficha.id} className="border-gray-800 bg-gray-900/30">
                        {/* Header da Ficha */}
                        <div className="p-5 border-b border-gray-800">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Dumbbell className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white text-sm">
                                  {ficha.fichas_treino?.nome}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {ficha.fichas_treino?.descricao}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline" className={getStatusColor(ficha.status)}>
                              Ativo
                            </Badge>
                          </div>
                        </div>

                        {/* Info Grid */}
                        <div className="p-5 border-b border-gray-800">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                Início
                              </p>
                              <p className="text-sm font-medium text-white">
                                {new Date(ficha.data_inicio).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                Término
                              </p>
                              <p className="text-sm font-medium text-white">
                                {new Date(ficha.data_fim).toLocaleDateString("pt-BR", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                Objetivo
                              </p>
                              <p className="text-sm font-medium text-white capitalize">
                                {ficha.fichas_treino?.objetivo || "-"}
                              </p>
                            </div>
                            <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">
                                Nível
                              </p>
                              <p className="text-sm font-medium text-white capitalize">
                                {ficha.fichas_treino?.nivel || "-"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Observações */}
                        {ficha.observacoes && (
                          <div className="p-5 border-b border-gray-800">
                            <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-300">{ficha.observacoes}</p>
                            </div>
                          </div>
                        )}

                        {/* Exercícios */}
                        {ficha.fichas_treino?.exercicios_ficha &&
                          ficha.fichas_treino.exercicios_ficha.length > 0 && (
                            <div className="p-5 border-b border-gray-800">
                              <Button
                                variant="ghost"
                                className="w-full justify-between text-gray-300 hover:text-white hover:bg-gray-800/50 h-auto py-3"
                                onClick={() => toggleFicha(ficha.id)}
                              >
                                <span className="flex items-center gap-2 text-sm">
                                  <Dumbbell className="h-4 w-4" />
                                  {ficha.fichas_treino.exercicios_ficha.length} Exercícios
                                </span>
                                {expandedFichas.has(ficha.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>

                              {expandedFichas.has(ficha.id) && (
                                <div className="space-y-2 mt-3">
                                  {ficha.fichas_treino.exercicios_ficha
                                    .sort((a, b) => a.ordem - b.ordem)
                                    .map((exercicio, index) => (
                                      <div
                                        key={exercicio.id}
                                        className="p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-white">
                                              {index + 1}
                                            </span>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white text-sm">
                                              {exercicio.nome}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-400">
                                              <span className="font-medium text-gray-300">
                                                {exercicio.series}x{exercicio.repeticoes}
                                              </span>
                                              {exercicio.descanso && (
                                                <>
                                                  <span>•</span>
                                                  <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {exercicio.descanso}s
                                                  </span>
                                                </>
                                              )}
                                              {exercicio.grupo_muscular && (
                                                <>
                                                  <span>•</span>
                                                  <Badge
                                                    variant="outline"
                                                    className={`text-[10px] px-2 py-0 h-5 border-0 ${getGrupoMuscularColor(
                                                      exercicio.grupo_muscular
                                                    )}`}
                                                  >
                                                    {exercicio.grupo_muscular}
                                                  </Badge>
                                                </>
                                              )}
                                            </div>
                                            {(exercicio.observacoes || exercicio.tecnica) && (
                                              <div className="mt-2 space-y-1">
                                                {exercicio.observacoes && (
                                                  <p className="text-xs text-gray-400">
                                                    💡 {exercicio.observacoes}
                                                  </p>
                                                )}
                                                {exercicio.tecnica && (
                                                  <p className="text-xs text-gray-400">
                                                    ⚡ {exercicio.tecnica}
                                                  </p>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}

                        {/* Botão Iniciar */}
                        <div className="p-5">
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12"
                            onClick={() => setLocation(`/aluno/treino/${ficha.id}`)}
                          >
                            <Play className="h-5 w-5 mr-2" />
                            Iniciar Treino
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichas Pausadas */}
              {fichasPausadas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-yellow-600 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-base font-medium text-white">Treinos Pausados</h2>
                  </div>

                  <div className="space-y-3">
                    {fichasPausadas.map((ficha) => (
                      <Card key={ficha.id} className="border-gray-800 bg-gray-900/30 opacity-60">
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-yellow-600 flex items-center justify-center">
                              <Dumbbell className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white text-sm">
                                {ficha.fichas_treino?.nome}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {ficha.fichas_treino?.exercicios_ficha?.length || 0} exercícios
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(ficha.status)}>
                              Pausado
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Fichas Concluídas */}
              {fichasConcluidas.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-base font-medium text-white">Treinos Concluídos</h2>
                  </div>

                  <div className="space-y-3">
                    {fichasConcluidas.map((ficha) => (
                      <Card key={ficha.id} className="border-gray-800 bg-gray-900/30 opacity-50">
                        <div className="p-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white text-sm">
                                {ficha.fichas_treino?.nome}
                              </h3>
                              <p className="text-xs text-gray-400 mt-1">
                                Concluído em {new Date(ficha.data_fim).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                            <Badge variant="outline" className={getStatusColor(ficha.status)}>
                              Concluído
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico */}
              {historico && historico.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                      <History className="h-4 w-4 text-white" />
                    </div>
                    <h2 className="text-base font-medium text-white">Histórico de Treinos</h2>
                  </div>

                  <div className="space-y-3">
                    {historico.slice(0, 10).map((sessao: any, index: number) => {
                      const totalSeries = sessao.exercicios.reduce(
                        (acc: number, ex: any) => acc + (ex.series_realizadas?.length || 0),
                        0
                      );

                      const volumeTotal = sessao.exercicios.reduce((acc: number, ex: any) => {
                        return (
                          acc +
                          (ex.series_realizadas || []).reduce((sum: number, s: any) => {
                            const peso = parseFloat(s.carga) || 0;
                            return sum + peso * s.repeticoes;
                          }, 0)
                        );
                      }, 0);

                      // Processar exercícios e filtrar apenas séries realizadas
                      const exerciciosArray = sessao.exercicios
                        .map((ex: any) => {
                          // Filtrar apenas séries que foram realmente realizadas (com carga e repetições)
                          const seriesRealizadas = ex.series_realizadas?.filter((s: any) => 
                            s.carga && s.repeticoes && (s.carga !== '' && s.carga !== '0')
                          ) || [];
                          
                          return {
                            nome: ex.exercicios_ficha?.nome || "Exercício",
                            grupo_muscular: ex.exercicios_ficha?.grupo_muscular,
                            series: seriesRealizadas
                          };
                        })
                        .filter((ex: any) => ex.series.length > 0); // Filtrar exercícios que têm pelo menos uma série realizada

                      return (
                        <Card key={index} className="border-gray-800 bg-gray-900/30 overflow-hidden">
                          {/* Header - Sempre visível */}
                          <div 
                            className="p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                            onClick={() => toggleFicha(`historico-${index}`)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-white text-sm">
                                  {new Date(sessao.data).toLocaleDateString("pt-BR", {
                                    day: "2-digit",
                                    month: "long",
                                  })}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1">
                                  {exerciciosArray.length} exercícios • {totalSeries} séries • {volumeTotal.toFixed(0)}kg
                                </p>
                              </div>
                              {expandedFichas.has(`historico-${index}`) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              )}
                            </div>
                          </div>

                          {/* Conteúdo expansível - Exercícios agrupados */}
                          {expandedFichas.has(`historico-${index}`) && (
                            <div className="border-t border-gray-800 p-4 space-y-3 bg-gray-800/20">
                              {exerciciosArray.map((exercicio: any, exIndex: number) => (
                                <div
                                  key={exIndex}
                                  className="bg-gray-800/50 rounded-lg p-3 space-y-2"
                                >
                                  {/* Nome do exercício e grupo muscular */}
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="font-medium text-white text-sm flex-1">
                                      {exercicio.nome}
                                    </h4>
                                    {exercicio.grupo_muscular && (
                                      <Badge
                                        variant="outline"
                                        className={`text-[10px] px-2 py-0 h-5 border-0 flex-shrink-0 ${getGrupoMuscularColor(
                                          exercicio.grupo_muscular
                                        )}`}
                                      >
                                        {exercicio.grupo_muscular}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Séries realizadas */}
                                  <div className="space-y-1.5">
                                    {exercicio.series.map((serie: any, serieIndex: number) => (
                                      <div
                                        key={serieIndex}
                                        className="flex items-center gap-2 text-xs bg-gray-900/50 rounded px-2.5 py-1.5"
                                      >
                                        <span className="text-gray-500 font-medium w-12">
                                          Série {serieIndex + 1}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-white font-medium">
                                          {serie.carga}
                                        </span>
                                        <span className="text-gray-400">×</span>
                                        <span className="text-white font-medium">
                                          {serie.repeticoes} reps
                                        </span>
                                        {serie.observacoes && (
                                          <>
                                            <span className="text-gray-400">•</span>
                                            <span className="text-gray-400 text-[10px] truncate flex-1">
                                              {serie.observacoes}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>

                                  {/* Resumo do exercício */}
                                  <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1 border-t border-gray-700/50">
                                    <span>{exercicio.series.length} séries</span>
                                    <span>•</span>
                                    <span>
                                      Volume: {exercicio.series.reduce((sum: number, s: any) => {
                                        const peso = parseFloat(s.carga) || 0;
                                        return sum + (peso * s.repeticoes);
                                      }, 0).toFixed(0)}kg
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card className="border-gray-800 bg-gray-900/30">
              <div className="py-12 text-center">
                <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-300 mb-2">
                  Nenhum treino atribuído
                </h3>
                <p className="text-sm text-gray-400">
                  Aguarde seu treinador atribuir uma ficha de treino para você.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog de confirmação para descartar treino */}
      <ConfirmDialog
        open={showDescartarDialog}
        onOpenChange={setShowDescartarDialog}
        onConfirm={finalizarTreino}
        title="Descartar treino?"
        description="Tem certeza que deseja descartar este treino? Todo o progresso será perdido e não poderá ser recuperado."
        confirmText="Descartar"
        cancelText="Cancelar"
        variant="destructive"
      />
    </AlunoLayout>
  );
}
