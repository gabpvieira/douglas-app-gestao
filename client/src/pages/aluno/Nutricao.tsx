import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlunoProfile, useAlunoPlanoAlimentar } from "@/hooks/useAlunoData";
import PlanoAlimentarPDF from "@/components/PlanoAlimentarPDF";
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
        <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20">
          <div className="w-full space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h1 className="text-2xl font-semibold text-white mb-1">Nutrição</h1>
              <p className="text-sm text-gray-400">Seu plano alimentar personalizado</p>
            </div>

            <Card className="border-gray-800 bg-gray-900/30">
              <div className="py-12 text-center">
                <Apple className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-300 mb-2">
                  Nenhum plano alimentar atribuído
                </h3>
                <p className="text-sm text-gray-400">
                  Aguarde seu nutricionista criar um plano alimentar para você.
                </p>
              </div>
            </Card>
          </div>
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

  // Extrair nome do aluno
  const nomeAluno = profile?.nome || 'Aluno';

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pt-3 md:pt-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Nutrição</h1>
                <p className="text-sm text-gray-400">Seu plano alimentar personalizado</p>
              </div>
              {/* Botão de Exportação Premium */}
              <PlanoAlimentarPDF 
                plano={plano} 
                nomeAluno={nomeAluno}
                isPremium={true}
              />
            </div>
          </div>

          {/* Título do Plano */}
          <Card className="border-gray-800 bg-gray-900/30">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                  <Apple className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">{plano.titulo}</h2>
              </div>
              {plano.observacoes && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-gray-300">{plano.observacoes}</p>
                </div>
              )}
            </div>
          </Card>

          {/* KPIs - Layout 2x2 Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Calorias</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">
                    {totaisDia.calorias.toFixed(0)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">kcal/dia</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Beef className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Proteínas</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">
                    {totaisDia.proteinas.toFixed(0)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">gramas</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Wheat className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Carboidratos</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">
                    {totaisDia.carboidratos.toFixed(0)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">gramas</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Droplet className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1">Gorduras</p>
                  <p className="text-lg sm:text-2xl font-bold text-white truncate">
                    {totaisDia.gorduras.toFixed(0)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">gramas</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Refeições */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center">
                <Apple className="h-4 w-4 text-white" />
              </div>
              <h2 className="text-base font-medium text-white">Refeições do Dia</h2>
            </div>

            <div className="space-y-3">
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
                    <Card key={refeicao.id} className="border-gray-800 bg-gray-900/30">
                      {/* Header da Refeição - Clicável */}
                      <button
                        onClick={() => toggleRefeicao(refeicao.id)}
                        className="w-full p-5 text-left hover:bg-gray-900/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                              <Clock className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-white text-sm">{refeicao.nome}</h3>
                              <p className="text-xs text-gray-400 mt-1">
                                {refeicao.horario.slice(0, 5)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Macros Inline - Responsivo */}
                          <div className="hidden sm:flex items-center gap-3 text-xs">
                            <div className="text-center">
                              <p className="text-orange-500 font-bold">{totaisRefeicao.calorias.toFixed(0)}</p>
                              <p className="text-gray-500">kcal</p>
                            </div>
                            <div className="text-center">
                              <p className="text-red-500 font-bold">{totaisRefeicao.proteinas.toFixed(0)}g</p>
                              <p className="text-gray-500">prot</p>
                            </div>
                            <div className="text-center">
                              <p className="text-yellow-500 font-bold">{totaisRefeicao.carboidratos.toFixed(0)}g</p>
                              <p className="text-gray-500">carb</p>
                            </div>
                            <div className="text-center">
                              <p className="text-blue-500 font-bold">{totaisRefeicao.gorduras.toFixed(0)}g</p>
                              <p className="text-gray-500">gord</p>
                            </div>
                          </div>

                          {/* Ícone de Expandir */}
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Macros Mobile - Apenas quando fechado */}
                        {!isExpanded && (
                          <div className="sm:hidden flex items-center gap-3 mt-3 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-orange-500 font-bold">{totaisRefeicao.calorias.toFixed(0)}</span>
                              <span className="text-gray-500">kcal</span>
                            </div>
                            <span className="text-gray-700">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-red-500 font-bold">{totaisRefeicao.proteinas.toFixed(0)}g</span>
                              <span className="text-gray-500">P</span>
                            </div>
                            <span className="text-gray-700">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-yellow-500 font-bold">{totaisRefeicao.carboidratos.toFixed(0)}g</span>
                              <span className="text-gray-500">C</span>
                            </div>
                            <span className="text-gray-700">•</span>
                            <div className="flex items-center gap-1">
                              <span className="text-blue-500 font-bold">{totaisRefeicao.gorduras.toFixed(0)}g</span>
                              <span className="text-gray-500">G</span>
                            </div>
                          </div>
                        )}
                      </button>

                      {/* Lista de Alimentos - Expandido */}
                      {isExpanded && alimentos.length > 0 && (
                        <div className="border-t border-gray-800">
                          {/* Macros Totais - Mobile quando expandido */}
                          <div className="sm:hidden p-4 bg-gray-800/30 border-b border-gray-800">
                            <div className="grid grid-cols-4 gap-2">
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Kcal</p>
                                <p className="text-sm font-bold text-orange-500">
                                  {totaisRefeicao.calorias.toFixed(0)}
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Prot</p>
                                <p className="text-sm font-bold text-red-500">
                                  {totaisRefeicao.proteinas.toFixed(0)}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Carb</p>
                                <p className="text-sm font-bold text-yellow-500">
                                  {totaisRefeicao.carboidratos.toFixed(0)}g
                                </p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-400 mb-1">Gord</p>
                                <p className="text-sm font-bold text-blue-500">
                                  {totaisRefeicao.gorduras.toFixed(0)}g
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Lista de Alimentos */}
                          <div className="divide-y divide-gray-800">
                            {alimentos
                              .sort((a, b) => a.ordem - b.ordem)
                              .map((alimento) => (
                                <div
                                  key={alimento.id}
                                  className="p-4 hover:bg-gray-800/30 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="font-medium text-white text-sm flex-1">
                                          {alimento.nome}
                                        </h4>
                                        {alimento.categoria && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] bg-gray-700/30 text-gray-400 border-0 flex-shrink-0"
                                          >
                                            {alimento.categoria}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-gray-400 mb-2">
                                        {alimento.quantidade} {alimento.unidade}
                                      </p>
                                      
                                      {/* Macros do Alimento - Grid Responsivo */}
                                      <div className="grid grid-cols-4 gap-2 text-xs">
                                        <div>
                                          <span className="text-gray-500">Kcal: </span>
                                          <span className="text-orange-400 font-medium">{alimento.calorias}</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">P: </span>
                                          <span className="text-red-400 font-medium">{alimento.proteinas}g</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">C: </span>
                                          <span className="text-yellow-400 font-medium">{alimento.carboidratos}g</span>
                                        </div>
                                        <div>
                                          <span className="text-gray-500">G: </span>
                                          <span className="text-blue-400 font-medium">{alimento.gorduras}g</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>

                          {/* Observações da Refeição */}
                          {refeicao.observacoes && (
                            <div className="p-4 bg-blue-500/5 border-t border-blue-500/20">
                              <p className="text-sm text-gray-300">💡 {refeicao.observacoes}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Card>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </AlunoLayout>
  );
}
