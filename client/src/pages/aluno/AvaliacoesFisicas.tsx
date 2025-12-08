import { useState } from "react";
import { useLocation } from "wouter";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAlunoProfile } from "@/hooks/useAlunoData";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Loader2,
  Calendar,
  TrendingUp,
  TrendingDown,
  Scale,
  Ruler,
  Target,
  Eye,
  ChevronRight,
} from "lucide-react";

export default function AvaliacoesFisicas() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();

  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  // Buscar avaliações físicas
  const { data: avaliacoes, isLoading: loadingAvaliacoes } = useQuery({
    queryKey: ["avaliacoes-fisicas-aluno", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("avaliacoes_fisicas")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data_avaliacao", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });

  const [selectedAvaliacao, setSelectedAvaliacao] = useState<any>(null);

  if (loadingProfile || loadingAvaliacoes) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  const avaliacaoFixada = avaliacoes?.find((a) => a.fixada);
  const ultimaAvaliacao = avaliacoes?.[0];
  const penultimaAvaliacao = avaliacoes?.[1];

  const calcularVariacao = (atual?: string, anterior?: string) => {
    if (!atual || !anterior) return null;
    const valorAtual = parseFloat(atual);
    const valorAnterior = parseFloat(anterior);
    const variacao = valorAtual - valorAnterior;
    const percentual = ((variacao / valorAnterior) * 100).toFixed(1);
    return { variacao: variacao.toFixed(1), percentual };
  };

  const variacaoPeso = calcularVariacao(ultimaAvaliacao?.peso, penultimaAvaliacao?.peso);
  const variacaoGordura = calcularVariacao(
    ultimaAvaliacao?.percentual_gordura,
    penultimaAvaliacao?.percentual_gordura
  );
  const variacaoMassaMagra = calcularVariacao(
    ultimaAvaliacao?.massa_magra,
    penultimaAvaliacao?.massa_magra
  );

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">Avaliações Físicas</h1>
            <p className="text-sm text-gray-400">
              Acompanhe sua evolução através das avaliações
            </p>
          </div>

          {/* KPIs - Horizontal Compact Design */}
          {ultimaAvaliacao && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Scale className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Peso Atual</p>
                    <p className="text-2xl font-bold text-white">
                      {ultimaAvaliacao.peso || "-"}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                  {variacaoPeso && (
                    <div className="flex flex-col items-end">
                      {parseFloat(variacaoPeso.variacao) > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {variacaoPeso.percentual}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Activity className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">% Gordura</p>
                    <p className="text-2xl font-bold text-white">
                      {ultimaAvaliacao.percentual_gordura || "-"}
                    </p>
                    <p className="text-xs text-gray-500">%</p>
                  </div>
                  {variacaoGordura && (
                    <div className="flex flex-col items-end">
                      {parseFloat(variacaoGordura.variacao) > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {variacaoGordura.percentual}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Ruler className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Massa Magra</p>
                    <p className="text-2xl font-bold text-white">
                      {ultimaAvaliacao.massa_magra || "-"}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                  {variacaoMassaMagra && (
                    <div className="flex flex-col items-end">
                      {parseFloat(variacaoMassaMagra.variacao) > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-xs text-gray-500">
                        {variacaoMassaMagra.percentual}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Target className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">IMC</p>
                    <p className="text-2xl font-bold text-white">
                      {ultimaAvaliacao.imc || "-"}
                    </p>
                    <p className="text-xs text-gray-500">kg/m²</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Avaliação Fixada */}
          {avaliacaoFixada && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Avaliação de Referência</h2>
              </div>

              <Card className="border-gray-800 bg-gray-900/30">
                <div className="p-5 border-b border-gray-800">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-white text-sm">
                          {new Date(avaliacaoFixada.data_avaliacao).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <p className="text-xs text-gray-400 mt-1">
                          Protocolo: {avaliacaoFixada.protocolo || "Não especificado"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-0">
                      Fixada
                    </Badge>
                  </div>
                </div>

                <div className="p-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Peso</p>
                      <p className="text-lg font-bold text-white">{avaliacaoFixada.peso || "-"} kg</p>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Gordura</p>
                      <p className="text-lg font-bold text-orange-500">
                        {avaliacaoFixada.percentual_gordura || "-"}%
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Massa Magra</p>
                      <p className="text-lg font-bold text-green-500">
                        {avaliacaoFixada.massa_magra || "-"} kg
                      </p>
                    </div>
                    <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">IMC</p>
                      <p className="text-lg font-bold text-blue-500">
                        {avaliacaoFixada.imc || "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Histórico de Avaliações */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-medium text-white">Histórico de Avaliações</h2>
            </div>

            {!avaliacoes || avaliacoes.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/30">
                <div className="py-12 text-center">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-300 mb-2">
                    Nenhuma avaliação registrada
                  </h3>
                  <p className="text-sm text-gray-400">
                    Aguarde seu treinador realizar sua primeira avaliação física.
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3">
                {avaliacoes.map((avaliacao) => (
                  <Card
                    key={avaliacao.id}
                    className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedAvaliacao(avaliacao)}
                  >
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                            <Activity className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-white text-sm">
                              {new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                              })}
                            </h3>
                            <p className="text-xs text-gray-400 mt-1">
                              {avaliacao.peso && `${avaliacao.peso}kg`}
                              {avaliacao.percentual_gordura && ` • ${avaliacao.percentual_gordura}% BF`}
                              {avaliacao.massa_magra && ` • ${avaliacao.massa_magra}kg MM`}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AlunoLayout>
  );
}
