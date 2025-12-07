import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Users, Calendar, Trash2, User, Mail, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useFichaAtribuicoes, useRemoverAtribuicao } from '@/hooks/useFichasTreino';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface VerAlunosFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
  ficha: {
    id: string;
    nome: string;
    descricao: string;
    objetivo: string;
    nivel: 'iniciante' | 'intermediario' | 'avancado';
  };
}

const statusColors = {
  ativo: 'bg-green-500/20 text-green-400 border-green-500/50',
  concluido: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  pausado: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  cancelado: 'bg-red-500/20 text-red-400 border-red-500/50'
};

const statusLabels = {
  ativo: 'Ativo',
  concluido: 'Concluído',
  pausado: 'Pausado',
  cancelado: 'Cancelado'
};

const statusIcons = {
  ativo: CheckCircle,
  concluido: CheckCircle,
  pausado: Clock,
  cancelado: XCircle
};

export function VerAlunosFichaModal({ isOpen, onClose, ficha }: VerAlunosFichaModalProps) {
  const { data: atribuicoes = [], isLoading } = useFichaAtribuicoes(ficha.id);
  const removerAtribuicao = useRemoverAtribuicao();
  const { toast } = useToast();
  const [atribuicaoParaRemover, setAtribuicaoParaRemover] = useState<{ id: string; nomeAluno: string } | null>(null);
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false);

  const handleRemoverAtribuicao = (atribuicaoId: string, nomeAluno: string) => {
    setAtribuicaoParaRemover({ id: atribuicaoId, nomeAluno });
    setConfirmRemoveOpen(true);
  };

  const confirmarRemocao = async () => {
    if (!atribuicaoParaRemover) return;

    try {
      await removerAtribuicao.mutateAsync({
        fichaId: ficha.id,
        atribuicaoId: atribuicaoParaRemover.id
      });

      toast({
        title: "Atribuição removida",
        description: `A ficha foi removida de ${atribuicaoParaRemover.nomeAluno} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao remover atribuição:', error);
      toast({
        title: "Erro ao remover",
        description: "Ocorreu um erro ao remover a atribuição. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setAtribuicaoParaRemover(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-xl text-white flex items-center gap-2">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            <span className="line-clamp-1">Alunos com a Ficha: {ficha.nome}</span>
          </DialogTitle>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-2">
            {ficha.descricao}
          </p>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
          {isLoading ? (
            <div className="text-center py-6 sm:py-8">
              <p className="text-sm sm:text-base text-gray-400">Carregando alunos...</p>
            </div>
          ) : atribuicoes.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-400">Nenhum aluno com esta ficha atribuída.</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Use o botão "Atribuir" para adicionar alunos a esta ficha.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-400">
                  {atribuicoes.length} {atribuicoes.length === 1 ? 'aluno' : 'alunos'}
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {atribuicoes.map((atribuicao: any) => {
                  const StatusIcon = statusIcons[atribuicao.status as keyof typeof statusIcons] || CheckCircle;
                  
                  return (
                    <Card 
                      key={atribuicao.id}
                      className="border-gray-800 bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                    >
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                            {/* Avatar */}
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                <h4 className="text-sm sm:text-base font-semibold text-white truncate">
                                  {atribuicao.aluno.nome}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`${statusColors[atribuicao.status as keyof typeof statusColors]} text-[10px] sm:text-xs flex items-center gap-1 w-fit`}
                                >
                                  <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                  {statusLabels[atribuicao.status as keyof typeof statusLabels]}
                                </Badge>
                              </div>

                              <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-400 mb-2">
                                <Mail className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{atribuicao.aluno.email}</span>
                              </div>

                              {/* Datas */}
                              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 flex-shrink-0" />
                                  <span>
                                    Início: {format(new Date(atribuicao.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}
                                  </span>
                                </div>
                                {atribuicao.data_fim && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 flex-shrink-0" />
                                    <span>
                                      Fim: {format(new Date(atribuicao.data_fim), 'dd/MM/yyyy', { locale: ptBR })}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Observações */}
                              {atribuicao.observacoes && (
                                <p className="text-[10px] sm:text-xs text-gray-500 mt-2 line-clamp-2">
                                  {atribuicao.observacoes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoverAtribuicao(atribuicao.id, atribuicao.aluno.nome)}
                            className="border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 flex-shrink-0 w-full sm:w-auto text-xs sm:text-sm h-8 sm:h-9"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-0 mr-2" />
                            <span className="sm:hidden">Remover Atribuição</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white w-full sm:w-auto text-sm"
          >
            Fechar
          </Button>
        </div>

        <ConfirmDialog
          open={confirmRemoveOpen}
          onOpenChange={setConfirmRemoveOpen}
          onConfirm={confirmarRemocao}
          title="Remover Atribuição"
          description={
            atribuicaoParaRemover
              ? `Tem certeza que deseja remover a ficha de ${atribuicaoParaRemover.nomeAluno}?`
              : ''
          }
          confirmText="Remover"
          cancelText="Cancelar"
          variant="destructive"
        />
      </DialogContent>
    </Dialog>
  );
}
