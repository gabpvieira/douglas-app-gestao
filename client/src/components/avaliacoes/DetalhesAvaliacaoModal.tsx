/**
 * Modal de Detalhes da Avaliação Física
 * Com abas para visualizar dados, deletar e fixar
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Calendar, 
  Activity, 
  Ruler, 
  Weight, 
  Trash2, 
  Pin,
  PinOff,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAvaliacaoById, useDeleteAvaliacao } from '@/hooks/useAvaliacoesFisicas';
import { useState } from 'react';

interface DetalhesAvaliacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacaoId: string;
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export default function DetalhesAvaliacaoModal({
  open,
  onOpenChange,
  avaliacaoId,
  isPinned = false,
  onTogglePin,
}: DetalhesAvaliacaoModalProps) {
  const { data: avaliacao, isLoading } = useAvaliacaoById(avaliacaoId);
  const deleteAvaliacao = useDeleteAvaliacao();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteAvaliacao.mutateAsync(avaliacaoId);
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
    }
  };

  const getProtocoloLabel = (protocolo?: string) => {
    if (protocolo === 'pollock_7_dobras') return 'Pollock 7 Dobras';
    if (protocolo === 'pollock_3_dobras') return 'Pollock 3 Dobras';
    return 'Manual';
  };

  if (isLoading || !avaliacao) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="py-12 text-center">
            <p className="text-gray-400">Carregando...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                {avaliacao.aluno?.nome}
              </DialogTitle>
              <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {avaliacao.dataAvaliacao && format(new Date(avaliacao.dataAvaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Badge variant="outline" className="border-gray-700 text-gray-300">
              {getProtocoloLabel(avaliacao.protocolo)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="dados" className="data-[state=active]:bg-gray-700">
              Dados da Avaliação
            </TabsTrigger>
            <TabsTrigger value="fixar" className="data-[state=active]:bg-gray-700">
              Fixar Avaliação
            </TabsTrigger>
            <TabsTrigger value="deletar" className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-400">
              Deletar
            </TabsTrigger>
          </TabsList>

          {/* ABA: DADOS DA AVALIAÇÃO */}
          <TabsContent value="dados" className="space-y-4 mt-4">
            {/* Dados Básicos */}
            <Card className="border-gray-800 bg-gray-800/50">
              <CardHeader>
                <CardTitle className="text-base text-white">Dados Básicos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Peso</p>
                  <p className="text-lg font-semibold text-white">{avaliacao.peso} kg</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Altura</p>
                  <p className="text-lg font-semibold text-white">{avaliacao.altura} cm</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">IMC</p>
                  <p className="text-lg font-semibold text-white">{avaliacao.imc}</p>
                </div>
                {avaliacao.idade && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Idade</p>
                    <p className="text-lg font-semibold text-white">{avaliacao.idade} anos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Composição Corporal */}
            {avaliacao.percentualGordura && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Composição Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">% Gordura</p>
                    <p className="text-lg font-semibold text-blue-400">{avaliacao.percentualGordura}%</p>
                  </div>
                  {avaliacao.classificacaoGordura && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Classificação</p>
                      <Badge variant="outline" className="border-gray-700">
                        {avaliacao.classificacaoGordura}
                      </Badge>
                    </div>
                  )}
                  {avaliacao.massaMagra && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Massa Magra</p>
                      <p className="text-lg font-semibold text-green-500">{avaliacao.massaMagra} kg</p>
                    </div>
                  )}
                  {avaliacao.massaGorda && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Massa Gorda</p>
                      <p className="text-lg font-semibold text-red-500">{avaliacao.massaGorda} kg</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dobras Cutâneas */}
            {(avaliacao.dobraTriceps || avaliacao.dobraSubescapular) && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white">Dobras Cutâneas (mm)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {avaliacao.dobraTriceps && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tríceps</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraTriceps} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraSubescapular && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Subescapular</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraSubescapular} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraPeitoral && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Peitoral</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraPeitoral} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraAxilarMedia && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Axilar Média</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraAxilarMedia} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraSuprailiaca && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Suprailíaca</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraSuprailiaca} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraAbdominal && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Abdominal</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraAbdominal} mm</p>
                    </div>
                  )}
                  {avaliacao.dobraCoxa && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coxa</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.dobraCoxa} mm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Circunferências */}
            {(avaliacao.circunferenciaTorax || avaliacao.circunferenciaCintura) && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white">Circunferências (cm)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {avaliacao.circunferenciaTorax && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tórax</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaTorax} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaCintura && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cintura</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaCintura} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaAbdomen && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Abdômen</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaAbdomen} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaQuadril && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quadril</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaQuadril} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaBracoDireito && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Braço Direito</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaBracoDireito} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaBracoEsquerdo && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Braço Esquerdo</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaBracoEsquerdo} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaCoxaDireita && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coxa Direita</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaCoxaDireita} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferenciaCoxaEsquerda && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coxa Esquerda</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferenciaCoxaEsquerda} cm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {avaliacao.observacoes && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader>
                  <CardTitle className="text-base text-white">Observações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{avaliacao.observacoes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ABA: FIXAR AVALIAÇÃO */}
          <TabsContent value="fixar" className="space-y-4 mt-4">
            <Card className="border-gray-800 bg-gray-800/50">
              <CardContent className="py-8 text-center">
                {isPinned ? (
                  <>
                    <PinOff className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Avaliação Fixada</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Esta avaliação está fixada no perfil do aluno e será exibida em destaque.
                    </p>
                    <Button
                      onClick={onTogglePin}
                      variant="outline"
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <PinOff className="h-4 w-4 mr-2" />
                      Desafixar Avaliação
                    </Button>
                  </>
                ) : (
                  <>
                    <Pin className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-white">Fixar Avaliação</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Fixe esta avaliação para destacá-la no perfil do aluno. Apenas uma avaliação pode ser fixada por vez.
                    </p>
                    <Button
                      onClick={onTogglePin}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Pin className="h-4 w-4 mr-2" />
                      Fixar Esta Avaliação
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA: DELETAR */}
          <TabsContent value="deletar" className="space-y-4 mt-4">
            <Card className="border-red-900/50 bg-red-950/20">
              <CardContent className="py-8 text-center">
                <AlertTriangle className="h-16 w-16 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">Deletar Avaliação</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Esta ação é irreversível. Todos os dados desta avaliação serão permanentemente removidos.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Deletar Avaliação
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <p className="text-red-400 font-semibold">
                      Tem certeza? Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                        className="border-gray-700"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleDelete}
                        disabled={deleteAvaliacao.isPending}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deleteAvaliacao.isPending ? 'Deletando...' : 'Sim, Deletar'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
