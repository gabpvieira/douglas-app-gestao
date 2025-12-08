import { useLocation } from "wouter";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAlunoProfile,
  useAlunoFichas,
  useAlunoPlanoAlimentar,
  useAlunoAgendamentos,
} from "@/hooks/useAlunoData";
import {
  Dumbbell,
  Apple,
  Calendar,
  TrendingUp,
  ArrowRight,
  Loader2,
  Play,
  Video,
  Activity,
  Target,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AlunoDashboard() {
  const [, setLocation] = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();

  // Extrair aluno_id corretamente
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const { data: fichas, isLoading: loadingFichas } = useAlunoFichas(alunoId);
  const { data: plano, isLoading: loadingPlano } = useAlunoPlanoAlimentar(alunoId);
  const { data: agendamentos, isLoading: loadingAgendamentos } = useAlunoAgendamentos(alunoId);

  // Buscar última avaliação física
  const [ultimaAvaliacao, setUltimaAvaliacao] = useState<any>(null);
  const [loadingAvaliacao, setLoadingAvaliacao] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (alunoId) {
      supabase
        .from("avaliacoes_fisicas")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data_avaliacao", { ascending: false })
        .limit(1)
        .maybeSingle()
        .then(({ data }) => {
          setUltimaAvaliacao(data);
          setLoadingAvaliacao(false);
        });
    }
  }, [alunoId]);

  const fichasAtivas = fichas?.filter((f) => f.status === "ativo") || [];
  const proximosAgendamentos = agendamentos?.slice(0, 3) || [];

  const getGreeting = () => {
    const hour = currentTime.getHours();
    const firstName = profile?.nome?.split(" ")[0] || "Aluno";

    if (hour >= 5 && hour < 12) {
      return `Bom dia, ${firstName}! 💪`;
    } else if (hour >= 12 && hour < 18) {
      return `Boa tarde, ${firstName}! 🔥`;
    } else {
      return `Boa noite, ${firstName}! 🌙`;
    }
  };

  const getSubGreeting = () => {
    const hour = currentTime.getHours();

    if (hour >= 5 && hour < 12) {
      return "Pronto para treinar hoje?";
    } else if (hour >= 12 && hour < 18) {
      return "Vamos manter o foco nos objetivos!";
    } else {
      return "Hora de revisar seu progresso!";
    }
  };

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const stats = [
    {
      title: "Treinos Ativos",
      value: loadingFichas ? "..." : String(fichasAtivas.length),
      change: loadingFichas ? "..." : "fichas",
      icon: <Dumbbell className="w-5 h-5" />,
      color: "bg-blue-600",
      onClick: () => setLocation("/aluno/treinos"),
    },
    {
      title: "Agendamentos",
      value: loadingAgendamentos ? "..." : String(proximosAgendamentos.length),
      change: loadingAgendamentos ? "..." : "próximos",
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-blue-600",
      onClick: () => setLocation("/aluno/agenda"),
    },
    {
      title: "Peso Atual",
      value: loadingAvaliacao ? "..." : ultimaAvaliacao?.peso ? `${ultimaAvaliacao.peso}` : "-",
      change: loadingAvaliacao ? "..." : "kg",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-blue-600",
      onClick: () => setLocation("/aluno/progresso"),
    },
    {
      title: "Calorias/Dia",
      value: loadingPlano ? "..." : plano?.dados_json?.calorias_totais || "-",
      change: loadingPlano ? "..." : "kcal",
      icon: <Apple className="w-5 h-5" />,
      color: "bg-blue-600",
      onClick: () => setLocation("/aluno/nutricao"),
    },
  ];

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Greeting Section */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-semibold text-white mb-1">
                {getGreeting()}
              </h2>
              <p className="text-sm text-gray-400">
                {getFormattedTime()} • {currentTime.toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </p>
              <p className="text-sm text-gray-300 mt-2">{getSubGreeting()}</p>
            </div>
          </div>

          {/* Stats Cards - Flat Design */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-blue-950/30 hover:bg-blue-950/40 transition-colors cursor-pointer"
                onClick={stat.onClick}
              >
                <div className="p-4 flex flex-col items-center text-center">
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-white mb-1.5">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-blue-400">
                    {stat.change}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Quick Actions - Minimal Flat Design */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card
              className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setLocation("/aluno/treinos")}
            >
              <div className="p-5 flex flex-col items-center text-center">
                <Play className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Iniciar Treino</h3>
                <p className="text-xs text-gray-500">Começar agora</p>
              </div>
            </Card>

            <Card
              className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setLocation("/aluno/videos")}
            >
              <div className="p-5 flex flex-col items-center text-center">
                <Video className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Vídeos</h3>
                <p className="text-xs text-gray-500">Biblioteca</p>
              </div>
            </Card>

            <Card
              className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setLocation("/aluno/progresso")}
            >
              <div className="p-5 flex flex-col items-center text-center">
                <Activity className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Progresso</h3>
                <p className="text-xs text-gray-500">Ver evolução</p>
              </div>
            </Card>

            <Card
              className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
              onClick={() => setLocation("/aluno/agenda")}
            >
              <div className="p-5 flex flex-col items-center text-center">
                <Calendar className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Agendar</h3>
                <p className="text-xs text-gray-500">Horários</p>
              </div>
            </Card>
          </div>

          {/* Meus Treinos - Flat Design */}
          <Card className="border-gray-800 bg-gray-900/30">
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium text-white">Meus Treinos</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/aluno/treinos")}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Ver todos
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {loadingFichas ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                </div>
              ) : fichasAtivas.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Nenhum treino ativo no momento
                </div>
              ) : (
                fichasAtivas.map((ficha) => (
                  <div
                    key={ficha.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/aluno/treino/${ficha.id}`)}
                  >
                    <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <Dumbbell className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {ficha.fichas_treino?.nome}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {ficha.fichas_treino?.exercicios_ficha?.length || 0} exercícios •{" "}
                        Até {new Date(ficha.data_fim).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs border-0 bg-green-500/10 text-green-400"
                    >
                      Ativo
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Próximos Agendamentos - Flat Design */}
          <Card className="border-gray-800 bg-gray-900/30">
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-base font-medium text-white">Próximos Agendamentos</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/aluno/agenda")}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Ver todos
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>

            <div className="divide-y divide-gray-800">
              {loadingAgendamentos ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                </div>
              ) : proximosAgendamentos.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Nenhum agendamento próximo
                </div>
              ) : (
                proximosAgendamentos.map((agendamento) => (
                  <div
                    key={agendamento.id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {new Date(agendamento.data_agendamento).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {agendamento.hora_inicio.slice(0, 5)} - {agendamento.hora_fim.slice(0, 5)}
                        {agendamento.observacoes && ` • ${agendamento.observacoes}`}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs border-0 ${
                        agendamento.status === "confirmado"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {agendamento.status === "confirmado" ? "Confirmado" : "Agendado"}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Plano Alimentar - Flat Design */}
          {plano && (
            <Card className="border-gray-800 bg-gray-900/30">
              <div className="p-5 border-b border-gray-800">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-base font-medium text-white">Plano Alimentar</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/aluno/nutricao")}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Ver detalhes
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-medium text-white text-sm mb-1">{plano.titulo}</h3>
                {plano.observacoes && (
                  <p className="text-xs text-gray-400 mb-4">{plano.observacoes}</p>
                )}

                <div className="grid grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Calorias</p>
                    <p className="text-lg font-bold text-orange-500">
                      {plano.dados_json?.calorias_totais || 0}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Proteínas</p>
                    <p className="text-lg font-bold text-red-500">
                      {plano.dados_json?.proteinas || 0}g
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Carbos</p>
                    <p className="text-lg font-bold text-yellow-500">
                      {plano.dados_json?.carboidratos || 0}g
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Gorduras</p>
                    <p className="text-lg font-bold text-blue-500">
                      {plano.dados_json?.gorduras || 0}g
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </AlunoLayout>
  );
}
