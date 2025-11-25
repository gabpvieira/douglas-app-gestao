import { useState } from "react";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlunoProfile, useAlunoFichas, useHistoricoTreinos } from "@/hooks/useAlunoData";
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
  CheckCircle2
} from "lucide-react";

export default function MeusTreinos() {
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  
  // Extrair aluno_id corretamente (alunos pode ser array ou objeto)
  const alunoId = Array.isArray(profile?.alunos) 
    ? profile?.alunos[0]?.id 
    : profile?.alunos?.id;

  console.log("👤 Profile (Treinos):", profile);
  console.log("🆔 Aluno ID (Treinos):", alunoId);

  const { data: fichas, isLoading: loadingFichas } = useAlunoFichas(alunoId);
  const [expandedFichas, setExpandedFichas] = useState<Set<string>>(new Set());

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
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "concluido":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "pausado":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "concluido":
        return "Concluído";
      case "pausado":
        return "Pausado";
      default:
        return status;
    }
  };

  const getGrupoMuscularColor = (grupo: string) => {
    const cores: Record<string, string> = {
      peito: "bg-red-500/10 text-red-500 border-red-500/20",
      costas: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      pernas: "bg-green-500/10 text-green-500 border-green-500/20",
      ombros: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      bíceps: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      tríceps: "bg-pink-500/10 text-pink-500 border-pink-500/20",
      abdômen: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    };
    return cores[grupo.toLowerCase()] || "bg-gray-500/10 text-gray-500 border-gray-500/20";
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

  // Filtrar fichas por status
  const fichasAtivas = fichas?.filter((f) => f.status === "ativo") || [];
  const fichasPausadas = fichas?.filter((f) => f.status === "pausado") || [];
  const fichasConcluidas = fichas?.filter((f) => f.status === "concluido") || [];
  
  // Buscar histórico da primeira ficha ativa
  const primeiraFichaAtiva = fichasAtivas[0];
  const { data: historico, isLoading: loadingHistorico } = useHistoricoTreinos(primeiraFichaAtiva?.id);

  return (
    <AlunoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Meus Treinos</h1>
          <p className="text-gray-400 mt-1">
            Suas fichas de treino atribuídas
          </p>
        </div>

        {/* Stats */}
        {!loadingFichas && fichas && fichas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Play className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Ativos</p>
                    <p className="text-2xl font-bold text-gray-100">{fichasAtivas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Pausados</p>
                    <p className="text-2xl font-bold text-gray-100">{fichasPausadas.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Concluídos</p>
                    <p className="text-2xl font-bold text-gray-100">{fichasConcluidas.length}</p>
                  </div>
                </div>
              </CardContent>
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
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-500" />
                  Treinos Ativos
                </h2>
                <div className="grid gap-4">
                  {fichasAtivas.map((ficha) => (
                    <Card key={ficha.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <Dumbbell className="h-6 w-6 text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-gray-100 text-lg">
                                {ficha.fichas_treino?.nome}
                              </CardTitle>
                              <p className="text-sm text-gray-400 mt-1">
                                {ficha.fichas_treino?.descricao}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(ficha.status)}>
                            {getStatusLabel(ficha.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Info da Ficha */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">Início</p>
                              <p className="text-gray-300">{new Date(ficha.data_inicio).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">Término</p>
                              <p className="text-gray-300">{new Date(ficha.data_fim).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Target className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">Objetivo</p>
                              <p className="text-gray-300 capitalize">{ficha.fichas_treino?.objetivo || "-"}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="text-gray-500 text-xs">Nível</p>
                              <p className="text-gray-300 capitalize">{ficha.fichas_treino?.nivel || "-"}</p>
                            </div>
                          </div>
                        </div>

                        {/* Botão Iniciar Treino */}
                        <Button
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6"
                          onClick={() => window.location.href = `/aluno/treino/${ficha.id}`}
                        >
                          <Play className="h-5 w-5 mr-2" />
                          Iniciar Treino
                        </Button>

                        {/* Observações */}
                        {ficha.observacoes && (
                          <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                            <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-gray-300">{ficha.observacoes}</p>
                          </div>
                        )}

                        {/* Exercícios */}
                        {ficha.fichas_treino?.exercicios_ficha && ficha.fichas_treino.exercicios_ficha.length > 0 && (
                          <div className="space-y-3">
                            <Button
                              variant="ghost"
                              className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                              onClick={() => toggleFicha(ficha.id)}
                            >
                              <span className="flex items-center gap-2">
                                <Play className="h-4 w-4" />
                                {ficha.fichas_treino.exercicios_ficha.length} Exercícios
                              </span>
                              {expandedFichas.has(ficha.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>

                            {expandedFichas.has(ficha.id) && (
                              <div className="space-y-2 pt-2">
                                {ficha.fichas_treino.exercicios_ficha
                                  .sort((a, b) => a.ordem - b.ordem)
                                  .map((exercicio, index) => (
                                    <div
                                      key={exercicio.id}
                                      className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                                    >
                                      <div className="flex items-start gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                                          <span className="text-sm font-bold text-blue-500">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="font-semibold text-gray-100">{exercicio.nome}</h4>
                                          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                                            <span className="font-medium text-gray-300">
                                              {exercicio.series} séries × {exercicio.repeticoes} reps
                                            </span>
                                            {exercicio.descanso && (
                                              <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {exercicio.descanso}s
                                              </span>
                                            )}
                                          </div>
                                          {exercicio.grupo_muscular && (
                                            <Badge 
                                              variant="outline" 
                                              className={`mt-2 text-xs ${getGrupoMuscularColor(exercicio.grupo_muscular)}`}
                                            >
                                              {exercicio.grupo_muscular}
                                            </Badge>
                                          )}
                                          {(exercicio.observacoes || exercicio.tecnica) && (
                                            <div className="mt-3 space-y-1">
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Fichas Pausadas */}
            {fichasPausadas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Treinos Pausados
                </h2>
                <div className="grid gap-4">
                  {fichasPausadas.map((ficha) => (
                    <Card key={ficha.id} className="bg-gray-900 border-gray-800 opacity-75">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                              <Dumbbell className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                              <CardTitle className="text-gray-100">
                                {ficha.fichas_treino?.nome}
                              </CardTitle>
                              <p className="text-sm text-gray-400 mt-1">
                                {ficha.fichas_treino?.descricao}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(ficha.status)}>
                            {getStatusLabel(ficha.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>Início: {new Date(ficha.data_inicio).toLocaleDateString("pt-BR")}</span>
                          <span>•</span>
                          <span>{ficha.fichas_treino?.exercicios_ficha?.length || 0} exercícios</span>
                        </div>
                        {ficha.observacoes && (
                          <p className="text-sm text-gray-400 mt-3 p-3 bg-gray-800 rounded-lg">
                            {ficha.observacoes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Fichas Concluídas */}
            {fichasConcluidas.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Treinos Concluídos
                </h2>
                <div className="grid gap-4">
                  {fichasConcluidas.map((ficha) => (
                    <Card key={ficha.id} className="bg-gray-900 border-gray-800 opacity-60">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                              <Dumbbell className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                              <CardTitle className="text-gray-100">
                                {ficha.fichas_treino?.nome}
                              </CardTitle>
                              <p className="text-sm text-gray-400 mt-1">
                                Concluído em {new Date(ficha.data_fim).toLocaleDateString("pt-BR")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className={getStatusColor(ficha.status)}>
                            {getStatusLabel(ficha.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Histórico de Treinos */}
            {historico && historico.length > 0 && (
              <div className="space-y-4 mt-8">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                  <History className="h-5 w-5 text-gray-400" />
                  Histórico de Treinos
                </h2>
                <div className="space-y-3">
                  {historico.map((sessao: any, index: number) => {
                    const dataFormatada = new Date(sessao.data).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });

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

                    return (
                      <Card key={index} className="bg-gray-900 border-gray-800">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-100 capitalize">
                                  {dataFormatada}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                  {sessao.exercicios.length} exercícios • {totalSeries} séries •{" "}
                                  {volumeTotal.toFixed(0)}kg volume
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {sessao.exercicios.map((exercicio: any) => (
                              <div
                                key={exercicio.id}
                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="font-medium text-gray-100">
                                    {exercicio.exercicios_ficha?.nome || "Exercício"}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                                    <span>{exercicio.series_realizadas?.length || 0} séries</span>
                                    {exercicio.series_realizadas && exercicio.series_realizadas.length > 0 && (
                                      <span>
                                        {exercicio.series_realizadas
                                          .map((s: any) => `${s.carga}kg × ${s.repeticoes}`)
                                          .join(", ")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {exercicio.exercicios_ficha?.grupo_muscular && (
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${getGrupoMuscularColor(
                                      exercicio.exercicios_ficha.grupo_muscular
                                    )}`}
                                  >
                                    {exercicio.exercicios_ficha.grupo_muscular}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Nenhum treino atribuído
                </h3>
                <p className="text-gray-400">
                  Aguarde seu treinador atribuir uma ficha de treino para você.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AlunoLayout>
  );
}
