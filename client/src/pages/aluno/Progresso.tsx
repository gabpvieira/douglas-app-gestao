import { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Scale, Activity, Ruler, Plus, Loader2, 
  Calendar, Trash2, Image as ImageIcon, LineChart, Camera, ChevronDown, ChevronUp, Dumbbell
} from 'lucide-react';
import { 
  useEvolucoes, useFotosProgresso, useAdicionarEvolucao, useDeletarEvolucao, useAvaliacoesFisicas 
} from '@/hooks/useProgresso';
import { useAlunoProfile } from '@/hooks/useAlunoData';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import AlunoLayout from '@/components/aluno/AlunoLayout';
import MonthlyTrainingCalendar from '@/components/aluno/MonthlyTrainingCalendar';

export default function Progresso() {
  const { data: evolucoes = [], isLoading: loadingEvolucoes } = useEvolucoes();
  const { data: fotos = [], isLoading: loadingFotos } = useFotosProgresso();
  const { data: profile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;
  const { data: avaliacoes = [], isLoading: loadingAvaliacoes } = useAvaliacoesFisicas();
  const adicionarEvolucao = useAdicionarEvolucao();
  const deletarEvolucao = useDeletarEvolucao();

  const [modalNovaEvolucao, setModalNovaEvolucao] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState<'medicoes' | 'avaliacoes' | 'fotos'>('medicoes');
  const [avaliacaoExpandida, setAvaliacaoExpandida] = useState<string | null>(null);
  const [fotoSelecionada, setFotoSelecionada] = useState<string | null>(null);
  const [comparacaoFotos, setComparacaoFotos] = useState<{ data1: string; data2: string } | null>(null);

  const ultimaEvolucao = evolucoes[0];
  const penultimaEvolucao = evolucoes[1];
  const ultimaAvaliacao = avaliacoes[0];
  const penultimaAvaliacao = avaliacoes[1];

  const calcularVariacao = (atual?: number, anterior?: number) => {
    if (!atual || !anterior) return null;
    const variacao = atual - anterior;
    const percentual = ((variacao / anterior) * 100).toFixed(1);
    return { variacao, percentual };
  };

  const variacaoPeso = calcularVariacao(
    ultimaAvaliacao?.peso || ultimaEvolucao?.peso, 
    penultimaAvaliacao?.peso || penultimaEvolucao?.peso
  );

  const variacaoGordura = calcularVariacao(
    ultimaAvaliacao?.percentual_gordura || ultimaEvolucao?.gorduraCorporal,
    penultimaAvaliacao?.percentual_gordura || penultimaEvolucao?.gorduraCorporal
  );
  const variacaoMassa = calcularVariacao(
    ultimaAvaliacao?.massa_magra || ultimaEvolucao?.massaMuscular,
    penultimaAvaliacao?.massa_magra || penultimaEvolucao?.massaMuscular
  );

  // Agrupar fotos por data
  const fotosPorData = fotos.reduce((acc: any, foto) => {
    if (!acc[foto.data]) {
      acc[foto.data] = [];
    }
    acc[foto.data].push(foto);
    return acc;
  }, {});

  const datasComFotos = Object.keys(fotosPorData).sort((a, b) => b.localeCompare(a));

  const handleAdicionarEvolucao = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await adicionarEvolucao.mutateAsync({
      data: formData.get('data') as string,
      peso: formData.get('peso') ? parseFloat(formData.get('peso') as string) : undefined,
      gorduraCorporal: formData.get('gordura') ? parseFloat(formData.get('gordura') as string) : undefined,
      massaMuscular: formData.get('massa') ? parseFloat(formData.get('massa') as string) : undefined,
      peito: formData.get('peito') ? parseInt(formData.get('peito') as string) : undefined,
      cintura: formData.get('cintura') ? parseInt(formData.get('cintura') as string) : undefined,
      quadril: formData.get('quadril') ? parseInt(formData.get('quadril') as string) : undefined,
      braco: formData.get('braco') ? parseInt(formData.get('braco') as string) : undefined,
      coxa: formData.get('coxa') ? parseInt(formData.get('coxa') as string) : undefined,
      observacoes: formData.get('observacoes') as string || undefined,
    });
    setModalNovaEvolucao(false);
  };

  if (loadingEvolucoes || loadingFotos || loadingAvaliacoes) {
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
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Meu Progresso</h1>
                <p className="text-sm text-gray-400">Acompanhe sua evolução física completa</p>
              </div>
              <Button onClick={() => setModalNovaEvolucao(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Medição
              </Button>
            </div>
          </div>

          {/* KPIs - Horizontal Compact Design */}
          {(ultimaEvolucao || ultimaAvaliacao) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Scale className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Peso Atual</p>
                    <p className="text-2xl font-bold text-white">
                      {(ultimaAvaliacao?.peso || ultimaEvolucao?.peso)?.toFixed(1) || '-'}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                  {variacaoPeso && (
                    <div className="flex flex-col items-end">
                      {variacaoPeso.variacao > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : variacaoPeso.variacao < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 mt-1">{variacaoPeso.percentual}%</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
                <div className="p-4 flex items-center gap-4">
                  <Activity className="w-10 h-10 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 mb-1">Gordura Corporal</p>
                    <p className="text-2xl font-bold text-white">
                      {(ultimaAvaliacao?.percentual_gordura || ultimaEvolucao?.gorduraCorporal)?.toFixed(1) || '-'}
                    </p>
                    <p className="text-xs text-gray-500">%</p>
                  </div>
                  {variacaoGordura && (
                    <div className="flex flex-col items-end">
                      {variacaoGordura.variacao > 0 ? (
                        <TrendingUp className="w-4 h-4 text-red-400" />
                      ) : variacaoGordura.variacao < 0 ? (
                        <TrendingDown className="w-4 h-4 text-green-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 mt-1">{variacaoGordura.percentual}%</span>
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
                      {(ultimaAvaliacao?.massa_magra || ultimaEvolucao?.massaMuscular)?.toFixed(1) || '-'}
                    </p>
                    <p className="text-xs text-gray-500">kg</p>
                  </div>
                  {variacaoMassa && (
                    <div className="flex flex-col items-end">
                      {variacaoMassa.variacao > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : variacaoMassa.variacao < 0 ? (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <Minus className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-xs text-gray-500 mt-1">{variacaoMassa.percentual}%</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* Calendário de Treinos do Mês */}
          {alunoId && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-6 w-6 rounded bg-emerald-600 flex items-center justify-center">
                  <Dumbbell className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Frequência de Treinos</h2>
              </div>
              <MonthlyTrainingCalendar alunoId={alunoId} />
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-800">
            <button
              onClick={() => setAbaSelecionada('medicoes')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                abaSelecionada === 'medicoes'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4" />
                Medições
              </div>
              {abaSelecionada === 'medicoes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setAbaSelecionada('avaliacoes')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                abaSelecionada === 'avaliacoes'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Avaliações Físicas
              </div>
              {abaSelecionada === 'avaliacoes' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
            <button
              onClick={() => setAbaSelecionada('fotos')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                abaSelecionada === 'fotos'
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                Fotos de Evolução
              </div>
              {abaSelecionada === 'fotos' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          </div>

          {/* Conteúdo das Abas */}
          {abaSelecionada === 'medicoes' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Histórico de Medições</h2>
              </div>

              {evolucoes.length === 0 ? (
                <Card className="border-gray-800 bg-gray-900/30">
                  <div className="py-12 text-center">
                    <Scale className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-gray-300 mb-2">Nenhuma medição registrada</h3>
                    <p className="text-sm text-gray-400 mb-4">Comece a registrar suas medições para acompanhar seu progresso.</p>
                    <Button onClick={() => setModalNovaEvolucao(true)} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeira Medição
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {evolucoes.map((evolucao) => (
                    <Card key={evolucao.id} className="border-gray-800 bg-gray-900/30">
                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                                <Calendar className="h-4 w-4 text-white" />
                              </div>
                              <p className="font-medium text-white text-sm">
                                {new Date(evolucao.data + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                  day: '2-digit', month: 'long', year: 'numeric' 
                                })}
                              </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {evolucao.peso && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Peso</p>
                                  <p className="text-sm font-bold text-white">{evolucao.peso} kg</p>
                                </div>
                              )}
                              {evolucao.gorduraCorporal && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Gordura</p>
                                  <p className="text-sm font-bold text-white">{evolucao.gorduraCorporal}%</p>
                                </div>
                              )}
                              {evolucao.massaMuscular && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Massa</p>
                                  <p className="text-sm font-bold text-white">{evolucao.massaMuscular} kg</p>
                                </div>
                              )}
                              {evolucao.peito && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Peito</p>
                                  <p className="text-sm font-bold text-white">{evolucao.peito} cm</p>
                                </div>
                              )}
                              {evolucao.cintura && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Cintura</p>
                                  <p className="text-sm font-bold text-white">{evolucao.cintura} cm</p>
                                </div>
                              )}
                              {evolucao.quadril && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Quadril</p>
                                  <p className="text-sm font-bold text-white">{evolucao.quadril} cm</p>
                                </div>
                              )}
                              {evolucao.braco && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Braço</p>
                                  <p className="text-sm font-bold text-white">{evolucao.braco} cm</p>
                                </div>
                              )}
                              {evolucao.coxa && (
                                <div className="p-3 bg-gray-800/50 rounded-lg">
                                  <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Coxa</p>
                                  <p className="text-sm font-bold text-white">{evolucao.coxa} cm</p>
                                </div>
                              )}
                            </div>
                            {evolucao.observacoes && (
                              <div className="mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                <p className="text-sm text-gray-300">{evolucao.observacoes}</p>
                              </div>
                            )}
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { 
                              if (confirm('Deseja realmente excluir esta medição?')) 
                                deletarEvolucao.mutate(evolucao.id); 
                            }} 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 ml-3"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {abaSelecionada === 'avaliacoes' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-base font-medium text-white">Avaliações Físicas Completas</h2>
              </div>

              {avaliacoes.length === 0 ? (
                <Card className="border-gray-800 bg-gray-900/30">
                  <div className="py-12 text-center">
                    <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-gray-300 mb-2">Nenhuma avaliação física registrada</h3>
                    <p className="text-sm text-gray-400">Seu personal trainer realizará avaliações físicas completas periodicamente.</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {avaliacoes.map((avaliacao) => (
                    <Card key={avaliacao.id} className="border-gray-800 bg-gray-900/30">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                              <Activity className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">
                                {new Date(avaliacao.data_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                  day: '2-digit', month: 'long', year: 'numeric' 
                                })}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {avaliacao.protocolo && (
                                  <Badge variant="outline" className="text-xs border-0 bg-blue-500/10 text-blue-400">
                                    {avaliacao.protocolo.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                )}
                                {avaliacao.fixada && (
                                  <Badge variant="outline" className="text-xs border-0 bg-yellow-500/10 text-yellow-400">
                                    Fixada
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAvaliacaoExpandida(avaliacaoExpandida === avaliacao.id ? null : avaliacao.id)}
                            className="text-gray-400 hover:text-white"
                          >
                            {avaliacaoExpandida === avaliacao.id ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        {/* Resumo Principal */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                          {avaliacao.peso && (
                            <div className="p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Peso</p>
                              <p className="text-lg font-bold text-white">{avaliacao.peso} kg</p>
                            </div>
                          )}
                          {avaliacao.percentual_gordura && (
                            <div className="p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">% Gordura</p>
                              <p className="text-lg font-bold text-orange-500">{avaliacao.percentual_gordura}%</p>
                            </div>
                          )}
                          {avaliacao.massa_magra && (
                            <div className="p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Massa Magra</p>
                              <p className="text-lg font-bold text-green-500">{avaliacao.massa_magra} kg</p>
                            </div>
                          )}
                          {avaliacao.imc && (
                            <div className="p-3 bg-gray-800/50 rounded-lg">
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">IMC</p>
                              <p className="text-lg font-bold text-blue-500">{avaliacao.imc}</p>
                            </div>
                          )}
                        </div>

                        {/* Detalhes Expandidos */}
                        {avaliacaoExpandida === avaliacao.id && (
                          <div className="space-y-4 pt-4 border-t border-gray-800">
                            {/* Circunferências */}
                            {(avaliacao.circunferencia_pescoco || avaliacao.circunferencia_torax || 
                              avaliacao.circunferencia_cintura || avaliacao.circunferencia_abdomen) && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-3">Circunferências (cm)</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {avaliacao.circunferencia_pescoco && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Pescoço</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_pescoco}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_torax && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Tórax</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_torax}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_cintura && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Cintura</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_cintura}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_abdomen && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Abdômen</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_abdomen}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_quadril && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Quadril</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_quadril}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_braco_direito && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Braço D</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_braco_direito}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_coxa_direita && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Coxa D</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_coxa_direita}</p>
                                    </div>
                                  )}
                                  {avaliacao.circunferencia_panturrilha_direita && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Panturrilha D</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.circunferencia_panturrilha_direita}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Dobras Cutâneas */}
                            {(avaliacao.dobra_triceps || avaliacao.dobra_peitoral || avaliacao.dobra_abdominal) && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-300 mb-3">Dobras Cutâneas (mm)</h4>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                  {avaliacao.dobra_triceps && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Tríceps</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_triceps}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_peitoral && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Peitoral</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_peitoral}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_subescapular && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Subescapular</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_subescapular}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_suprailiaca && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Supra-ilíaca</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_suprailiaca}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_abdominal && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Abdominal</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_abdominal}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_coxa && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Coxa</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_coxa}</p>
                                    </div>
                                  )}
                                  {avaliacao.dobra_axilar_media && (
                                    <div className="p-2 bg-gray-800/30 rounded text-center">
                                      <p className="text-[10px] text-gray-500 mb-1">Axilar Média</p>
                                      <p className="text-sm text-white font-medium">{avaliacao.dobra_axilar_media}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Observações */}
                            {avaliacao.observacoes && (
                              <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Observações</p>
                                <p className="text-sm text-gray-300">{avaliacao.observacoes}</p>
                              </div>
                            )}

                            {/* Objetivos */}
                            {avaliacao.objetivos && (
                              <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                <p className="text-xs text-gray-400 mb-1">Objetivos</p>
                                <p className="text-sm text-gray-300">{avaliacao.objetivos}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {abaSelecionada === 'fotos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-gray-700 flex items-center justify-center">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-base font-medium text-white">Fotos de Evolução</h2>
                </div>
                {datasComFotos.length >= 2 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (datasComFotos.length >= 2) {
                        setComparacaoFotos({
                          data1: datasComFotos[datasComFotos.length - 1],
                          data2: datasComFotos[0]
                        });
                      }
                    }}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Comparar Fotos
                  </Button>
                )}
              </div>

              {fotos.length === 0 ? (
                <Card className="border-gray-800 bg-gray-900/30">
                  <div className="py-12 text-center">
                    <Camera className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-base font-medium text-gray-300 mb-2">Nenhuma foto de progresso</h3>
                    <p className="text-sm text-gray-400">Seu personal trainer registrará fotos periodicamente para acompanhar sua evolução visual.</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-6">
                  {datasComFotos.map((data) => {
                    const fotosData = fotosPorData[data];
                    const fotoFront = fotosData.find((f: any) => f.tipo === 'front');
                    const fotoSide = fotosData.find((f: any) => f.tipo === 'side');
                    const fotoBack = fotosData.find((f: any) => f.tipo === 'back');

                    return (
                      <Card key={data} className="border-gray-800 bg-gray-900/30">
                        <div className="p-5">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                              <Calendar className="h-4 w-4 text-white" />
                            </div>
                            <p className="font-medium text-white text-sm">
                              {new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', { 
                                day: '2-digit', month: 'long', year: 'numeric' 
                              })}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {fotoFront && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-400 text-center">Frente</p>
                                <div 
                                  className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                  onClick={() => setFotoSelecionada(fotoFront.urlFoto)}
                                >
                                  <img 
                                    src={fotoFront.urlFoto} 
                                    alt="Foto Frente" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            {fotoSide && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-400 text-center">Lateral</p>
                                <div 
                                  className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                  onClick={() => setFotoSelecionada(fotoSide.urlFoto)}
                                >
                                  <img 
                                    src={fotoSide.urlFoto} 
                                    alt="Foto Lateral" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            {fotoBack && (
                              <div className="space-y-2">
                                <p className="text-xs text-gray-400 text-center">Costas</p>
                                <div 
                                  className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                                  onClick={() => setFotoSelecionada(fotoBack.urlFoto)}
                                >
                                  <img 
                                    src={fotoBack.urlFoto} 
                                    alt="Foto Costas" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Modal Nova Medição */}
          <Dialog open={modalNovaEvolucao} onOpenChange={setModalNovaEvolucao}>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white">Nova Medição</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Registre suas medidas e acompanhe sua evolução
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAdicionarEvolucao} className="space-y-4">
                <div>
                  <Label htmlFor="data" className="text-gray-300">Data da Medição</Label>
                  <Input 
                    id="data" 
                    name="data" 
                    type="date" 
                    required 
                    max={new Date().toISOString().split('T')[0]} 
                    className="bg-gray-800 border-gray-700 text-gray-100" 
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="peso" className="text-gray-300">Peso (kg)</Label>
                    <Input 
                      id="peso" 
                      name="peso" 
                      type="number" 
                      step="0.1" 
                      placeholder="Ex: 75.5" 
                      className="bg-gray-800 border-gray-700 text-gray-100" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="gordura" className="text-gray-300">Gordura (%)</Label>
                    <Input 
                      id="gordura" 
                      name="gordura" 
                      type="number" 
                      step="0.1" 
                      placeholder="Ex: 15.5" 
                      className="bg-gray-800 border-gray-700 text-gray-100" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="massa" className="text-gray-300">Massa (kg)</Label>
                    <Input 
                      id="massa" 
                      name="massa" 
                      type="number" 
                      step="0.1" 
                      placeholder="Ex: 60.0" 
                      className="bg-gray-800 border-gray-700 text-gray-100" 
                    />
                  </div>
                </div>
                <div className="border-t border-gray-800 pt-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Medidas (cm)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="peito" className="text-gray-300">Peito</Label>
                      <Input 
                        id="peito" 
                        name="peito" 
                        type="number" 
                        placeholder="Ex: 100" 
                        className="bg-gray-800 border-gray-700 text-gray-100" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="cintura" className="text-gray-300">Cintura</Label>
                      <Input 
                        id="cintura" 
                        name="cintura" 
                        type="number" 
                        placeholder="Ex: 80" 
                        className="bg-gray-800 border-gray-700 text-gray-100" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="quadril" className="text-gray-300">Quadril</Label>
                      <Input 
                        id="quadril" 
                        name="quadril" 
                        type="number" 
                        placeholder="Ex: 95" 
                        className="bg-gray-800 border-gray-700 text-gray-100" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="braco" className="text-gray-300">Braço</Label>
                      <Input 
                        id="braco" 
                        name="braco" 
                        type="number" 
                        placeholder="Ex: 35" 
                        className="bg-gray-800 border-gray-700 text-gray-100" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="coxa" className="text-gray-300">Coxa</Label>
                      <Input 
                        id="coxa" 
                        name="coxa" 
                        type="number" 
                        placeholder="Ex: 55" 
                        className="bg-gray-800 border-gray-700 text-gray-100" 
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
                  <Textarea 
                    id="observacoes" 
                    name="observacoes" 
                    placeholder="Adicione observações..." 
                    rows={3} 
                    className="bg-gray-800 border-gray-700 text-gray-100" 
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setModalNovaEvolucao(false)}
                    className="border-gray-700"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={adicionarEvolucao.isPending} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {adicionarEvolucao.isPending ? 'Salvando...' : 'Salvar Medição'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {/* Modal Foto Ampliada */}
          <Dialog open={!!fotoSelecionada} onOpenChange={() => setFotoSelecionada(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-3xl">
              <div className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                {fotoSelecionada && (
                  <img 
                    src={fotoSelecionada} 
                    alt="Foto Ampliada" 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal Comparação de Fotos */}
          <Dialog open={!!comparacaoFotos} onOpenChange={() => setComparacaoFotos(null)}>
            <DialogContent className="bg-gray-900 border-gray-800 max-w-6xl">
              <DialogHeader>
                <DialogTitle className="text-white">Comparação de Evolução</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Compare suas fotos de diferentes períodos
                </DialogDescription>
              </DialogHeader>
              {comparacaoFotos && (
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-300 text-center">
                      {new Date(comparacaoFotos.data1 + 'T00:00:00').toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: 'long', year: 'numeric' 
                      })}
                    </p>
                    <div className="space-y-2">
                      {fotosPorData[comparacaoFotos.data1]?.map((foto: any) => (
                        <div key={foto.id} className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                          <img 
                            src={foto.urlFoto} 
                            alt={`Foto ${foto.tipo}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-300 text-center">
                      {new Date(comparacaoFotos.data2 + 'T00:00:00').toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: 'long', year: 'numeric' 
                      })}
                    </p>
                    <div className="space-y-2">
                      {fotosPorData[comparacaoFotos.data2]?.map((foto: any) => (
                        <div key={foto.id} className="aspect-[3/4] bg-gray-800 rounded-lg overflow-hidden">
                          <img 
                            src={foto.urlFoto} 
                            alt={`Foto ${foto.tipo}`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AlunoLayout>
  );
}
