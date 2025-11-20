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
  XCircle
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
      emagrecimento: 'bg-red-100 text-red-800',
      ganho_massa: 'bg-green-100 text-green-800',
      manutencao: 'bg-blue-100 text-blue-800',
      definicao: 'bg-purple-100 text-purple-800'
    };
    return colors[objetivo];
  };

  const getCategoriaColor = (categoria: PlanoAlimentar['categoria']) => {
    const colors = {
      basico: 'bg-gray-100 text-gray-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-orange-100 text-orange-800'
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {plano.nome}
              {plano.ativo ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </DialogTitle>
            <div className="flex gap-2">
              <Badge className={getObjetivoColor(plano.objetivo)}>
                {plano.objetivo.replace('_', ' ')}
              </Badge>
              <Badge className={getCategoriaColor(plano.categoria)}>
                {plano.categoria}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="refeicoes">Refeições</TabsTrigger>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Informações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-gray-600">{plano.descricao}</p>
                </div>
                
                {plano.observacoes && (
                  <div>
                    <h4 className="font-medium mb-2">Observações</h4>
                    <p className="text-gray-600">{plano.observacoes}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600">Criado em</p>
                    <p className="font-semibold">{formatDate(plano.criadoEm)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Activity className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600">Atualizado em</p>
                    <p className="font-semibold">{formatDate(plano.atualizadoEm)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Utensils className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600">Refeições</p>
                    <p className="font-semibold">{plano.refeicoes.length}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-600">Alunos</p>
                    <p className="font-semibold">{alunosAtribuidos.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Macronutrientes */}
            <Card>
              <CardHeader>
                <CardTitle>Macronutrientes</CardTitle>
                <CardDescription>Valores nutricionais do plano</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {Math.round(macrosCalculados.calorias)}
                    </div>
                    <div className="text-sm text-gray-600">Calorias</div>
                    <div className="text-xs text-gray-500">
                      (Meta: {plano.calorias})
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {Math.round(macrosCalculados.proteinas)}g
                    </div>
                    <div className="text-sm text-gray-600">Proteínas</div>
                    <div className="text-xs text-gray-500">
                      (Meta: {plano.proteinas}g)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {Math.round(macrosCalculados.carboidratos)}g
                    </div>
                    <div className="text-sm text-gray-600">Carboidratos</div>
                    <div className="text-xs text-gray-500">
                      (Meta: {plano.carboidratos}g)
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {Math.round(macrosCalculados.gorduras)}g
                    </div>
                    <div className="text-sm text-gray-600">Gorduras</div>
                    <div className="text-xs text-gray-500">
                      (Meta: {plano.gorduras}g)
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Restrições */}
            {plano.restricoes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Restrições Alimentares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {plano.restricoes.map((restricao, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {restricao}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="refeicoes" className="space-y-4">
            {plano.refeicoes.map((refeicao) => (
              <Card key={refeicao.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {refeicao.nome}
                      </CardTitle>
                      <CardDescription>
                        Horário: {refeicao.horario} • {Math.round(refeicao.calorias)} kcal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {refeicao.alimentos.map((alimento) => (
                      <div key={alimento.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{alimento.nome}</p>
                          <p className="text-sm text-gray-600">
                            {alimento.quantidade} {alimento.unidade}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{Math.round(alimento.calorias)} kcal</p>
                          <p className="text-xs text-gray-600">
                            P: {Math.round(alimento.proteinas)}g • 
                            C: {Math.round(alimento.carboidratos)}g • 
                            G: {Math.round(alimento.gorduras)}g
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {refeicao.observacoes && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Observações:</strong> {refeicao.observacoes}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {plano.refeicoes.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma refeição cadastrada neste plano.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            {alunosAtribuidos.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alunosAtribuidos.map((aluno) => (
                  <Card key={aluno.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{aluno.nome}</p>
                          <p className="text-sm text-gray-600">{aluno.email}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {aluno.objetivo}
                            </Badge>
                            <Badge 
                              variant={aluno.ativo ? "default" : "secondary"} 
                              className="text-xs"
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
              <Card>
                <CardContent className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum aluno atribuído a este plano.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="detalhes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">ID do Plano</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">{plano.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className={`font-medium ${plano.ativo ? 'text-green-600' : 'text-red-600'}`}>
                      {plano.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Data de Criação</label>
                    <p>{formatDate(plano.criadoEm)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Última Atualização</label>
                    <p>{formatDate(plano.atualizadoEm)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Resumo Nutricional</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total de Alimentos</p>
                        <p className="font-semibold">
                          {plano.refeicoes.reduce((acc, ref) => acc + ref.alimentos.length, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Média Kcal/Refeição</p>
                        <p className="font-semibold">
                          {plano.refeicoes.length > 0 
                            ? Math.round(macrosCalculados.calorias / plano.refeicoes.length)
                            : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Proteína/Kg</p>
                        <p className="font-semibold">
                          {/* Assumindo peso médio de 70kg para cálculo */}
                          {(macrosCalculados.proteinas / 70).toFixed(1)}g
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">% Proteína</p>
                        <p className="font-semibold">
                          {macrosCalculados.calorias > 0 
                            ? Math.round((macrosCalculados.proteinas * 4 / macrosCalculados.calorias) * 100)
                            : 0}%
                        </p>
                      </div>
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