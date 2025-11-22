import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Clock, 
  Users, 
  Target, 
  Calendar, 
  AlertCircle,
  Utensils,
  Activity,
  CheckCircle,
  XCircle,
  Flame,
  Beef,
  Wheat,
  Droplet
} from 'lucide-react';
import { PlanoAlimentar, Aluno } from '@/pages/PlanosAlimentares';

interface PlanoDetalhesModalProps {
  isOpen: boolean;
  onClose: () => void;
  plano: PlanoAlimentar | null;
  alunos: Aluno[];
}

export function PlanoDetalhesModal({ isOpen, onClose, plano, alunos }: PlanoDetalhesModalProps) {
  if (!plano) return null;

  const alunosAtribuidos = alunos.filter(aluno => plano.alunosAtribuidos.includes(aluno.id));

  const getObjetivoColor = (objetivo: PlanoAlimentar['objetivo']) => {
    const colors = {
      emagrecimento: 'bg-red-500/10 text-red-400 border-red-500/20',
      ganho_massa: 'bg-green-500/10 text-green-400 border-green-500/20',
      manutencao: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      definicao: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    };
    return colors[objetivo];
  };

  const getCategoriaColor = (categoria: PlanoAlimentar['categoria']) => {
    const colors = {
      basico: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      intermediario: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      avancado: 'bg-orange-500/10 text-orange-400 border-orange-500/20'
    };
    return colors[categoria];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTotalMacros = () => {
    // Se não houver refeições, retorna as metas do plano
    if (!plano.refeicoes || plano.refeicoes.length === 0) {
      return {
        calorias: plano.calorias,
        proteinas: plano.proteinas,
        carboidratos: plano.carboidratos,
        gorduras: plano.gorduras
      };
    }

    const totais = plano.refeicoes.reduce((acc, refeicao) => {
      const refeicaoMacros = refeicao.alimentos.reduce((refAcc, alimento) => ({
        calorias: refAcc.calorias + alimento.calorias,
        proteinas: refAcc.proteinas + alimento.proteinas,
        carboidratos: refAcc.carboidratos + alimento.carboidratos,
        gorduras: refAcc.gorduras + alimento.gorduras
      }), { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });

      return {
        calorias: acc.calorias + refeicaoMacros.calorias,
        proteinas: acc.proteinas + refeicaoMacros.proteinas,
        carboidratos: acc.carboidratos + refeicaoMacros.carboidratos,
        gorduras: acc.gorduras + refeicaoMacros.gorduras
      };
    }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });

    return totais;
  };

  const macrosCalculados = calcularTotalMacros();
  const temRefeicoes = plano.refeicoes && plano.refeicoes.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
        <DialogHeader className="border-b border-gray-800 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-white mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Utensils className="h-5 w-5 text-white" />
                </div>
                {plano.nome}
              </DialogTitle>
              <p className="text-sm text-gray-400 line-clamp-2">{plano.descricao}</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <Badge className={`${getObjetivoColor(plano.objetivo)} border`}>
                  {plano.objetivo.replace('_', ' ')}
                </Badge>
                <Badge className={`${getCategoriaColor(plano.categoria)} border`}>
                  {plano.categoria}
                </Badge>
              </div>
              {plano.ativo ? (
                <div className="flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Ativo</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Inativo</span>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700 p-1">
            <TabsTrigger 
              value="resumo" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Resumo
            </TabsTrigger>
            <TabsTrigger 
              value="refeicoes"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Refeições
            </TabsTrigger>
            <TabsTrigger 
              value="alunos"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Alunos
            </TabsTrigger>
            <TabsTrigger 
              value="detalhes"
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400"
            >
              Detalhes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-4 mt-4">
            {/* Macronutrientes - Destaque Principal */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Flame className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Calorias</p>
                    <p className="text-2xl font-bold text-white">{Math.round(macrosCalculados.calorias)}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {temRefeicoes ? `Meta: ${plano.calorias} kcal` : 'Meta diária'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <Beef className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Proteínas</p>
                    <p className="text-2xl font-bold text-white">{Math.round(macrosCalculados.proteinas)}g</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {temRefeicoes ? `Meta: ${plano.proteinas}g` : 'Meta diária'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Wheat className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Carboidratos</p>
                    <p className="text-2xl font-bold text-white">{Math.round(macrosCalculados.carboidratos)}g</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {temRefeicoes ? `Meta: ${plano.carboidratos}g` : 'Meta diária'}
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Droplet className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Gorduras</p>
                    <p className="text-2xl font-bold text-white">{Math.round(macrosCalculados.gorduras)}g</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {temRefeicoes ? `Meta: ${plano.gorduras}g` : 'Meta diária'}
                </div>
              </div>
            </div>

            {!temRefeicoes && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-400 mb-1">Valores de Referência</p>
                    <p className="text-xs text-gray-400">
                      Os valores exibidos são as metas nutricionais do plano. Para ver valores calculados, adicione refeições detalhadas ao plano.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Informações Gerais */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Target className="h-5 w-5 text-blue-400" />
                  Informações do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                  <h4 className="font-medium mb-2 text-gray-300 text-sm">Descrição Completa</h4>
                  <p className="text-gray-400 text-sm whitespace-pre-line leading-relaxed">{plano.descricao}</p>
                </div>
                
                {plano.observacoes && (
                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <h4 className="font-medium mb-2 text-blue-400 text-sm flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Observações Importantes
                    </h4>
                    <p className="text-gray-300 text-sm">{plano.observacoes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <Calendar className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Criado em</p>
                    <p className="font-semibold text-white text-sm mt-1">{formatDate(plano.criadoEm)}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <Activity className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Atualizado</p>
                    <p className="font-semibold text-white text-sm mt-1">{formatDate(plano.atualizadoEm)}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <Utensils className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Refeições</p>
                    <p className="font-semibold text-white text-sm mt-1">{plano.refeicoes.length}</p>
                  </div>
                  <div className="text-center p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                    <Users className="h-5 w-5 mx-auto mb-2 text-gray-400" />
                    <p className="text-xs text-gray-500">Alunos</p>
                    <p className="font-semibold text-white text-sm mt-1">{alunosAtribuidos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restrições */}
            {plano.restricoes.length > 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                    Restrições Alimentares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plano.restricoes.map((restricao, index) => (
                      <Badge key={index} variant="outline" className="text-sm border-yellow-500/20 bg-yellow-500/10 text-yellow-400">
                        {restricao}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="refeicoes" className="space-y-3 mt-4">
            {plano.refeicoes.map((refeicao) => (
              <Card key={refeicao.id} className="bg-gray-800/50 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Clock className="h-4 w-4 text-blue-400" />
                        </div>
                        {refeicao.nome}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        {refeicao.horario} • {Math.round(refeicao.calorias)} kcal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {refeicao.alimentos.map((alimento) => (
                      <div key={alimento.id} className="flex justify-between items-center p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:bg-gray-900/70 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-white">{alimento.nome}</p>
                          <p className="text-sm text-gray-400">
                            {alimento.quantidade} {alimento.unidade}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">{Math.round(alimento.calorias)} kcal</p>
                          <p className="text-xs text-gray-500">
                            P: {Math.round(alimento.proteinas)}g • 
                            C: {Math.round(alimento.carboidratos)}g • 
                            G: {Math.round(alimento.gorduras)}g
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {refeicao.observacoes && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300">
                          <strong>Observações:</strong> {refeicao.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {plano.refeicoes.length === 0 && (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                    <Utensils className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Nenhuma refeição cadastrada neste plano.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alunos" className="space-y-3 mt-4">
            {alunosAtribuidos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {alunosAtribuidos.map((aluno) => (
                  <Card key={aluno.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white truncate">{aluno.nome}</p>
                          <p className="text-sm text-gray-400 truncate">{aluno.email}</p>
                          <div className="flex gap-2 mt-2">
                            {aluno.objetivo && (
                              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                                {aluno.objetivo}
                              </Badge>
                            )}
                            <Badge 
                              className={`text-xs ${aluno.ativo ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                            >
                              {aluno.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="text-center py-12">
                  <div className="h-16 w-16 rounded-2xl bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Nenhum aluno atribuído a este plano.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4 mt-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Informações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID do Plano</label>
                    <p className="font-mono text-sm text-gray-300 mt-1 break-all">{plano.id}</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
                    <p className={`font-medium mt-1 ${plano.ativo ? 'text-green-400' : 'text-red-400'}`}>
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</label>
                    <p className="text-gray-300 mt-1">{formatDate(plano.criadoEm)}</p>
                  </div>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-3">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Última Atualização</label>
                    <p className="text-gray-300 mt-1">{formatDate(plano.atualizadoEm)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-400 mb-3 block">Resumo Nutricional</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Total de Alimentos</p>
                      <p className="text-2xl font-bold text-white">
                        {plano.refeicoes.reduce((acc, ref) => acc + ref.alimentos.length, 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Média Kcal/Refeição</p>
                      <p className="text-2xl font-bold text-white">
                        {plano.refeicoes.length > 0 
                          ? Math.round(macrosCalculados.calorias / plano.refeicoes.length)
                          : 0}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">Proteína/Kg</p>
                      <p className="text-2xl font-bold text-white">
                        {(macrosCalculados.proteinas / 70).toFixed(1)}g
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Base: 70kg</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-400 mb-1">% Proteína</p>
                      <p className="text-2xl font-bold text-white">
                        {macrosCalculados.calorias > 0 
                          ? Math.round((macrosCalculados.proteinas * 4 / macrosCalculados.calorias) * 100)
                          : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}