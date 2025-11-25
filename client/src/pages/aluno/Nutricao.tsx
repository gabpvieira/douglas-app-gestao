import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlunoProfile, useAlunoPlanoAlimentar } from "@/hooks/useAlunoData";
import {
  Apple,
  Loader2,
  Clock,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function Nutricao() {
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const { data: plano, isLoading: loadingPlano } = useAlunoPlanoAlimentar(alunoId);
  const [refeicoesExpandidas, setRefeicoesExpandidas] = useState<Set<string>>(new Set());

  const toggleRefeicao = (refeicaoId: string) => {
    setRefeicoesExpandidas((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(refeicaoId)) {
        newSet.delete(refeicaoId);
      } else {
        newSet.add(refeicaoId);
      }
      return newSet;
    });
  };

  if (loadingProfile || loadingPlano) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  if (!plano) {
    return (
      <AlunoLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Nutrição</h1>
            <p className="text-gray-400 mt-1">Seu plano alimentar personalizado</p>
          </div>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-12">
              <div className="text-center">
                <Apple className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  Nenhum plano alimentar atribuído
                </h3>
                <p className="text-gray-400">
                  Aguarde seu nutricionista criar um plano alimentar para você.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AlunoLayout>
    );
  }

  // Calcular totais das refeições
  const refeicoes = plano.refeicoes_plano || [];
  const totaisDia = refeicoes.reduce(
    (acc, ref) => {
      const alimentos = ref.alimentos_refeicao || [];
      const totaisRef = alimentos.reduce(
        (sum, alimento) => ({
          calorias: sum.calorias + (parseFloat(alimento.calorias as any) || 0),
          proteinas: sum.proteinas + (parseFloat(alimento.proteinas as any) || 0),
          carboidratos: sum.carboidratos + (parseFloat(alimento.carboidratos as any) || 0),
          gorduras: sum.gorduras + (parseFloat(alimento.gorduras as any) || 0),
        }),
        { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
      );
      return {
        calorias: acc.calorias + totaisRef.calorias,
        proteinas: acc.proteinas + totaisRef.proteinas,
        carboidratos: acc.carboidratos + totaisRef.carboidratos,
        gorduras: acc.gorduras + totaisRef.gorduras,
      };
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  return (
    <AlunoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Nutrição</h1>
          <p className="text-gray-400 mt-1">Seu plano alimentar personalizado</p>
        </div>

        {/* Título do Plano */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-100">{plano.titulo}</CardTitle>
                {plano.observacoes && (
                  <div className="flex gap-2 mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                    <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{plano.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Macros Totais do Dia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                  <Flame className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Calorias</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {totaisDia.calorias.toFixed(0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Beef className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Proteínas</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {totaisDia.proteinas.toFixed(0)}g
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                  <Wheat className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Carboidratos</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {totaisDia.carboidratos.toFixed(0)}g
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Droplet className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Gorduras</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {totaisDia.gorduras.toFixed(0)}g
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refeições */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Refeições do Dia</h2>
          {refeicoes
            .sort((a, b) => a.ordem - b.ordem)
            .map((refeicao) => {
              const alimentos = refeicao.alimentos_refeicao || [];
              const totaisRefeicao = alimentos.reduce(
                (sum, alimento) => ({
                  calorias: sum.calorias + (parseFloat(alimento.calorias as any) || 0),
                  proteinas: sum.proteinas + (parseFloat(alimento.proteinas as any) || 0),
                  carboidratos:
                    sum.carboidratos + (parseFloat(alimento.carboidratos as any) || 0),
                  gorduras: sum.gorduras + (parseFloat(alimento.gorduras as any) || 0),
                }),
                { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
              );

              const isExpanded = refeicoesExpandidas.has(refeicao.id);

              return (
                <Card key={refeicao.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-100">{refeicao.nome}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {refeicao.horario.slice(0, 5)} • {totaisRefeicao.calorias.toFixed(0)}{" "}
                            kcal
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRefeicao(refeicao.id)}
                        className="text-gray-400"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </Button>
                    </div>

                    {/* Macros da Refeição */}
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">Kcal</p>
                        <p className="text-sm font-bold text-orange-500">
                          {totaisRefeicao.calorias.toFixed(0)}
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">Prot</p>
                        <p className="text-sm font-bold text-red-500">
                          {totaisRefeicao.proteinas.toFixed(0)}g
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">Carb</p>
                        <p className="text-sm font-bold text-yellow-500">
                          {totaisRefeicao.carboidratos.toFixed(0)}g
                        </p>
                      </div>
                      <div className="text-center p-2 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">Gord</p>
                        <p className="text-sm font-bold text-blue-500">
                          {totaisRefeicao.gorduras.toFixed(0)}g
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && alimentos.length > 0 && (
                    <CardContent>
                      <div className="space-y-2">
                        {alimentos
                          .sort((a, b) => a.ordem - b.ordem)
                          .map((alimento) => (
                            <div
                              key={alimento.id}
                              className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-100">{alimento.nome}</h4>
                                  <p className="text-sm text-gray-400 mt-1">
                                    {alimento.quantidade} {alimento.unidade}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span>{alimento.calorias} kcal</span>
                                    <span>•</span>
                                    <span>P: {alimento.proteinas}g</span>
                                    <span>•</span>
                                    <span>C: {alimento.carboidratos}g</span>
                                    <span>•</span>
                                    <span>G: {alimento.gorduras}g</span>
                                  </div>
                                </div>
                                {alimento.categoria && (
                                  <Badge variant="outline" className="text-xs">
                                    {alimento.categoria}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>

                      {refeicao.observacoes && (
                        <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                          <p className="text-sm text-gray-400">💡 {refeicao.observacoes}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              );
            })}
        </div>
      </div>
    </AlunoLayout>
  );
}
