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
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 p-4 sm:p-6">
        <DialogHeader className="space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">{avaliacao.aluno?.nome}</span>
              </DialogTitle>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center gap-2">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate">
                  {avaliacao.data_avaliacao && format(new Date(avaliacao.data_avaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </p>
            </div>
            <Badge variant="outline" className="border-gray-700 text-gray-300 text-xs flex-shrink-0 self-start">
              {getProtocoloLabel(avaliacao.protocolo)}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="dados" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700 h-auto">
            <TabsTrigger value="dados" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Dados da Avaliação</span>
              <span className="sm:hidden">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="fixar" className="data-[state=active]:bg-gray-700 text-xs sm:text-sm py-2">
              <span className="hidden sm:inline">Fixar Avaliação</span>
              <span className="sm:hidden">Fixar</span>
            </TabsTrigger>
            <TabsTrigger value="deletar" className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-400 text-xs sm:text-sm py-2">
              Deletar
            </TabsTrigger>
          </TabsList>

          {/* ABA: DADOS DA AVALIAÇÃO */}
          <TabsContent value="dados" className="space-y-3 sm:space-y-4 mt-4">
            {/* Dados Básicos */}
            <Card className="border-gray-800 bg-gray-800/50">
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-sm sm:text-base text-white">Dados Básicos</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Peso</p>
                  <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.peso} kg</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Altura</p>
                  <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.altura} cm</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-1">IMC</p>
                  <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.imc}</p>
                </div>
                {avaliacao.idade && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Idade</p>
                    <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.idade} anos</p>
                  </div>
                )}
                {avaliacao.genero && (
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Gênero</p>
                    <p className="text-sm sm:text-lg font-semibold text-white capitalize truncate">{avaliacao.genero}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Composição Corporal */}
            {avaliacao.percentual_gordura && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Composição Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-1">% Gordura</p>
                    <p className="text-sm sm:text-lg font-semibold text-blue-400 truncate">{avaliacao.percentual_gordura}%</p>
                  </div>
                  {avaliacao.classificacao_gordura && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Classificação</p>
                      <Badge variant="outline" className="border-gray-700 text-xs truncate max-w-full">
                        {avaliacao.classificacao_gordura}
                      </Badge>
                    </div>
                  )}
                  {avaliacao.massa_magra && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Massa Magra</p>
                      <p className="text-sm sm:text-lg font-semibold text-green-500 truncate">{avaliacao.massa_magra} kg</p>
                    </div>
                  )}
                  {avaliacao.massa_gorda && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Massa Gorda</p>
                      <p className="text-sm sm:text-lg font-semibold text-red-500 truncate">{avaliacao.massa_gorda} kg</p>
                    </div>
                  )}
                  {avaliacao.densidade_corporal && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Densidade</p>
                      <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.densidade_corporal} g/ml</p>
                    </div>
                  )}
                  {avaliacao.peso_ideal && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Peso Ideal</p>
                      <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.peso_ideal} kg</p>
                    </div>
                  )}
                  {avaliacao.soma_dobras && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Soma Dobras</p>
                      <p className="text-sm sm:text-lg font-semibold text-white truncate">{avaliacao.soma_dobras} mm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Dobras Cutâneas */}
            {(avaliacao.dobra_triceps || avaliacao.dobra_subescapular || avaliacao.dobra_peitoral || 
              avaliacao.dobra_axilar_media || avaliacao.dobra_suprailiaca || avaliacao.dobra_abdominal || 
              avaliacao.dobra_coxa || avaliacao.dobra_biceps || avaliacao.dobra_panturrilha) && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base text-white">Dobras Cutâneas (mm)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6">
                  {avaliacao.dobra_triceps && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Tríceps</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_triceps} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_biceps && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Bíceps</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_biceps} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_subescapular && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Subescapular</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_subescapular} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_peitoral && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Peitoral</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_peitoral} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_axilar_media && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Axilar Média</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_axilar_media} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_suprailiaca && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Suprailíaca</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_suprailiaca} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_abdominal && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Abdominal</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_abdominal} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_coxa && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Coxa</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_coxa} mm</p>
                    </div>
                  )}
                  {avaliacao.dobra_panturrilha && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Panturrilha</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.dobra_panturrilha} mm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Circunferências */}
            {(avaliacao.circunferencia_torax || avaliacao.circunferencia_cintura || avaliacao.circunferencia_abdomen ||
              avaliacao.circunferencia_quadril || avaliacao.circunferencia_braco_direito || avaliacao.circunferencia_braco_esquerdo ||
              avaliacao.circunferencia_coxa_direita || avaliacao.circunferencia_coxa_esquerda || avaliacao.circunferencia_pescoco ||
              avaliacao.circunferencia_antebraco_direito || avaliacao.circunferencia_antebraco_esquerdo ||
              avaliacao.circunferencia_panturrilha_direita || avaliacao.circunferencia_panturrilha_esquerda) && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base text-white">Circunferências (cm)</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-6">
                  {avaliacao.circunferencia_pescoco && (
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 truncate">Pescoço</p>
                      <p className="text-xs sm:text-sm font-semibold text-white truncate">{avaliacao.circunferencia_pescoco} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_torax && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tórax</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_torax} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_cintura && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Cintura</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_cintura} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_abdomen && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Abdômen</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_abdomen} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_quadril && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Quadril</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_quadril} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_braco_direito && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Braço Direito</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_braco_direito} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_braco_esquerdo && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Braço Esquerdo</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_braco_esquerdo} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_antebraco_direito && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Antebraço Direito</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_antebraco_direito} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_antebraco_esquerdo && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Antebraço Esquerdo</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_antebraco_esquerdo} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_coxa_direita && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coxa Direita</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_coxa_direita} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_coxa_esquerda && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Coxa Esquerda</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_coxa_esquerda} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_panturrilha_direita && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Panturrilha Direita</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_panturrilha_direita} cm</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_panturrilha_esquerda && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Panturrilha Esquerda</p>
                      <p className="text-sm font-semibold text-white">{avaliacao.circunferencia_panturrilha_esquerda} cm</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Observações */}
            {avaliacao.observacoes && (
              <Card className="border-gray-800 bg-gray-800/50">
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-base text-white">Observações</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <p className="text-xs sm:text-sm text-gray-300 whitespace-pre-wrap break-words">{avaliacao.observacoes}</p>
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
