import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Scale, Activity, Ruler, Plus, Loader2, Calendar, Trash2 } from 'lucide-react';
import { useEvolucoes, useFotosProgresso, useAdicionarEvolucao, useDeletarEvolucao } from '@/hooks/useProgresso';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import AlunoLayout from '@/components/aluno/AlunoLayout';

export default function Progresso() {
  const { data: evolucoes = [], isLoading: loadingEvolucoes } = useEvolucoes();
  const { data: fotos = [], isLoading: loadingFotos } = useFotosProgresso();
  const adicionarEvolucao = useAdicionarEvolucao();
  const deletarEvolucao = useDeletarEvolucao();

  const [modalNovaEvolucao, setModalNovaEvolucao] = useState(false);

  const ultimaEvolucao = evolucoes[0];
  const penultimaEvolucao = evolucoes[1];

  const calcularVariacao = (atual?: number, anterior?: number) => {
    if (!atual || !anterior) return null;
    const variacao = atual - anterior;
    const percentual = ((variacao / anterior) * 100).toFixed(1);
    return { variacao, percentual };
  };

  const variacaoPeso = calcularVariacao(ultimaEvolucao?.peso, penultimaEvolucao?.peso);
  const variacaoGordura = calcularVariacao(ultimaEvolucao?.gorduraCorporal, penultimaEvolucao?.gorduraCorporal);
  const variacaoMassa = calcularVariacao(ultimaEvolucao?.massaMuscular, penultimaEvolucao?.massaMuscular);

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

  if (loadingEvolucoes || loadingFotos) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-100">Meu Progresso</h1>
            <p className="text-gray-400 mt-1">Acompanhe sua evolução física</p>
          </div>
          <Button onClick={() => setModalNovaEvolucao(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Nova Medição
          </Button>
        </div>

        {ultimaEvolucao && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Scale className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Peso Atual</p>
                      <p className="text-3xl font-bold text-gray-100">{ultimaEvolucao.peso?.toFixed(1) || '-'} kg</p>
                    </div>
                  </div>
                  {variacaoPeso && (
                    <div className={cn('flex items-center gap-1 text-sm font-medium', variacaoPeso.variacao > 0 ? 'text-red-500' : variacaoPeso.variacao < 0 ? 'text-green-500' : 'text-gray-500')}>
                      {variacaoPeso.variacao > 0 ? <TrendingUp className="h-4 w-4" /> : variacaoPeso.variacao < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      <span>{variacaoPeso.percentual}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Gordura Corporal</p>
                      <p className="text-3xl font-bold text-gray-100">{ultimaEvolucao.gorduraCorporal?.toFixed(1) || '-'}%</p>
                    </div>
                  </div>
                  {variacaoGordura && (
                    <div className={cn('flex items-center gap-1 text-sm font-medium', variacaoGordura.variacao > 0 ? 'text-red-500' : variacaoGordura.variacao < 0 ? 'text-green-500' : 'text-gray-500')}>
                      {variacaoGordura.variacao > 0 ? <TrendingUp className="h-4 w-4" /> : variacaoGordura.variacao < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      <span>{variacaoGordura.percentual}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Ruler className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Massa Muscular</p>
                      <p className="text-3xl font-bold text-gray-100">{ultimaEvolucao.massaMuscular?.toFixed(1) || '-'} kg</p>
                    </div>
                  </div>
                  {variacaoMassa && (
                    <div className={cn('flex items-center gap-1 text-sm font-medium', variacaoMassa.variacao > 0 ? 'text-green-500' : variacaoMassa.variacao < 0 ? 'text-red-500' : 'text-gray-500')}>
                      {variacaoMassa.variacao > 0 ? <TrendingUp className="h-4 w-4" /> : variacaoMassa.variacao < 0 ? <TrendingDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                      <span>{variacaoMassa.percentual}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Histórico de Medições</h2>
          {evolucoes.length === 0 ? (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <Scale className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">Nenhuma medição registrada</h3>
                  <p className="text-gray-400 mb-4">Comece a registrar suas medições para acompanhar seu progresso.</p>
                  <Button onClick={() => setModalNovaEvolucao(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Medição
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {evolucoes.map((evolucao) => (
                <Card key={evolucao.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <p className="font-semibold text-gray-100">
                            {new Date(evolucao.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {evolucao.peso && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Peso</p><p className="text-sm font-bold text-gray-100">{evolucao.peso} kg</p></div>}
                          {evolucao.gorduraCorporal && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Gordura</p><p className="text-sm font-bold text-gray-100">{evolucao.gorduraCorporal}%</p></div>}
                          {evolucao.massaMuscular && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Massa</p><p className="text-sm font-bold text-gray-100">{evolucao.massaMuscular} kg</p></div>}
                          {evolucao.peito && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Peito</p><p className="text-sm font-bold text-gray-100">{evolucao.peito} cm</p></div>}
                          {evolucao.cintura && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Cintura</p><p className="text-sm font-bold text-gray-100">{evolucao.cintura} cm</p></div>}
                          {evolucao.quadril && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Quadril</p><p className="text-sm font-bold text-gray-100">{evolucao.quadril} cm</p></div>}
                          {evolucao.braco && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Braço</p><p className="text-sm font-bold text-gray-100">{evolucao.braco} cm</p></div>}
                          {evolucao.coxa && <div className="p-2 bg-gray-800 rounded"><p className="text-xs text-gray-400">Coxa</p><p className="text-sm font-bold text-gray-100">{evolucao.coxa} cm</p></div>}
                        </div>
                        {evolucao.observacoes && (
                          <div className="mt-3 p-2 bg-blue-500/5 border border-blue-500/20 rounded">
                            <p className="text-sm text-gray-300">{evolucao.observacoes}</p>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => { if (confirm('Deseja realmente excluir esta medição?')) deletarEvolucao.mutate(evolucao.id); }} className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Dialog open={modalNovaEvolucao} onOpenChange={setModalNovaEvolucao}>
          <DialogContent className="bg-gray-900 border-gray-800 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Nova Medição</DialogTitle>
              <DialogDescription className="text-gray-400">Registre suas medidas e acompanhe sua evolução</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdicionarEvolucao} className="space-y-4">
              <div>
                <Label htmlFor="data" className="text-gray-300">Data da Medição</Label>
                <Input id="data" name="data" type="date" required max={new Date().toISOString().split('T')[0]} className="bg-gray-800 border-gray-700 text-gray-100" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="peso" className="text-gray-300">Peso (kg)</Label><Input id="peso" name="peso" type="number" step="0.1" placeholder="Ex: 75.5" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                <div><Label htmlFor="gordura" className="text-gray-300">Gordura (%)</Label><Input id="gordura" name="gordura" type="number" step="0.1" placeholder="Ex: 15.5" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                <div><Label htmlFor="massa" className="text-gray-300">Massa (kg)</Label><Input id="massa" name="massa" type="number" step="0.1" placeholder="Ex: 60.0" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
              </div>
              <div className="border-t border-gray-800 pt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Medidas (cm)</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div><Label htmlFor="peito" className="text-gray-300">Peito</Label><Input id="peito" name="peito" type="number" placeholder="Ex: 100" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                  <div><Label htmlFor="cintura" className="text-gray-300">Cintura</Label><Input id="cintura" name="cintura" type="number" placeholder="Ex: 80" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                  <div><Label htmlFor="quadril" className="text-gray-300">Quadril</Label><Input id="quadril" name="quadril" type="number" placeholder="Ex: 95" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                  <div><Label htmlFor="braco" className="text-gray-300">Braço</Label><Input id="braco" name="braco" type="number" placeholder="Ex: 35" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                  <div><Label htmlFor="coxa" className="text-gray-300">Coxa</Label><Input id="coxa" name="coxa" type="number" placeholder="Ex: 55" className="bg-gray-800 border-gray-700 text-gray-100" /></div>
                </div>
              </div>
              <div>
                <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
                <Textarea id="observacoes" name="observacoes" placeholder="Adicione observações..." rows={3} className="bg-gray-800 border-gray-700 text-gray-100" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setModalNovaEvolucao(false)}>Cancelar</Button>
                <Button type="submit" disabled={adicionarEvolucao.isPending} className="bg-blue-600 hover:bg-blue-700">
                  {adicionarEvolucao.isPending ? 'Salvando...' : 'Salvar Medição'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AlunoLayout>
  );
}
