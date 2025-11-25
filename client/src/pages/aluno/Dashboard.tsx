import { Link } from "wouter";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useAlunoProfile,
  useAlunoFichas,
  useAlunoPlanoAlimentar,
  useAlunoAgendamentos,
  useAlunoEvolucao,
} from "@/hooks/useAlunoData";
import {
  Dumbbell,
  Apple,
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";

export default function AlunoDashboard() {
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  
  // Extrair aluno_id corretamente (alunos pode ser array ou objeto)
  const alunoId = Array.isArray(profile?.alunos) 
    ? profile?.alunos[0]?.id 
    : profile?.alunos?.id;

  console.log("👤 Profile:", profile);
  console.log("🆔 Aluno ID:", alunoId);

  const { data: fichas, isLoading: loadingFichas } = useAlunoFichas(alunoId);
  const { data: plano, isLoading: loadingPlano } = useAlunoPlanoAlimentar(alunoId);
  const { data: agendamentos, isLoading: loadingAgendamentos } = useAlunoAgendamentos(alunoId);
  const { data: evolucoes, isLoading: loadingEvolucao } = useAlunoEvolucao(alunoId);

  const fichasAtivas = fichas?.filter((f) => f.status === "ativo") || [];
  const proximosAgendamentos = agendamentos?.slice(0, 3) || [];
  const ultimaEvolucao = evolucoes?.[0];

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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">
            Olá, {profile?.nome?.split(" ")[0]}! 👋
          </h1>
          <p className="text-gray-400 mt-1">
            Bem-vindo ao seu painel de treinos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Treinos Ativos */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Treinos Ativos</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {loadingFichas ? "-" : fichasAtivas.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Próximos Agendamentos */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Agendamentos</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {loadingAgendamentos ? "-" : proximosAgendamentos.length}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peso Atual */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Peso Atual</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {loadingEvolucao ? "-" : ultimaEvolucao?.peso ? `${ultimaEvolucao.peso}kg` : "-"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plano Alimentar */}
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Calorias/Dia</p>
                  <p className="text-3xl font-bold text-gray-100 mt-1">
                    {loadingPlano ? "-" : plano?.dados_json?.calorias_totais || "-"}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Apple className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Meus Treinos */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100">Meus Treinos</CardTitle>
              <Link href="/aluno/treinos">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingFichas ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : fichasAtivas.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhum treino ativo no momento
                </p>
              ) : (
                <div className="space-y-3">
                  {fichasAtivas.map((ficha) => (
                    <div
                      key={ficha.id}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-100">
                            {ficha.fichas_treino?.nome}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {ficha.fichas_treino?.exercicios_ficha?.length || 0} exercícios
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Até {new Date(ficha.data_fim).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximos Agendamentos */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100">Próximos Agendamentos</CardTitle>
              <Link href="/aluno/agenda">
                <Button variant="ghost" size="sm">
                  Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loadingAgendamentos ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : proximosAgendamentos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  Nenhum agendamento próximo
                </p>
              ) : (
                <div className="space-y-3">
                  {proximosAgendamentos.map((agendamento) => (
                    <div
                      key={agendamento.id}
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span className="font-semibold text-gray-100">
                              {new Date(agendamento.data_agendamento).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {agendamento.hora_inicio.slice(0, 5)} - {agendamento.hora_fim.slice(0, 5)}
                          </p>
                          {agendamento.observacoes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {agendamento.observacoes}
                            </p>
                          )}
                        </div>
                        <Badge
                          variant="outline"
                          className={
                            agendamento.status === "confirmado"
                              ? "bg-green-500/10 text-green-500 border-green-500/20"
                              : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                          }
                        >
                          {agendamento.status === "confirmado" ? "Confirmado" : "Agendado"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plano Alimentar */}
        {plano && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-gray-100">Plano Alimentar Atual</CardTitle>
              <Link href="/aluno/nutricao">
                <Button variant="ghost" size="sm">
                  Ver detalhes <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-100">{plano.titulo}</h3>
                  <p className="text-sm text-gray-400 mt-1">{plano.observacoes}</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400">Calorias</p>
                    <p className="text-lg font-bold text-gray-100 mt-1">
                      {plano.dados_json?.calorias_totais || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400">Proteínas</p>
                    <p className="text-lg font-bold text-gray-100 mt-1">
                      {plano.dados_json?.proteinas || 0}g
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400">Carboidratos</p>
                    <p className="text-lg font-bold text-gray-100 mt-1">
                      {plano.dados_json?.carboidratos || 0}g
                    </p>
                  </div>
                  <div className="p-3 bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-400">Gorduras</p>
                    <p className="text-lg font-bold text-gray-100 mt-1">
                      {plano.dados_json?.gorduras || 0}g
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AlunoLayout>
  );
}
