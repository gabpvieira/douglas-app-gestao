import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useFichaAtribuicoes, useRemoverAtribuicao } from "@/hooks/useFichasTreino";
import { Calendar, Trash2, Users, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FichaAlunosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fichaId: string;
  fichaNome: string;
}

export default function FichaAlunosModal({ 
  open, 
  onOpenChange, 
  fichaId,
  fichaNome 
}: FichaAlunosModalProps) {
  const { data: atribuicoes = [], isLoading } = useFichaAtribuicoes(fichaId);
  const removerAtribuicao = useRemoverAtribuicao();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500 text-white';
      case 'concluido': return 'bg-blue-500 text-white';
      case 'pausado': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'concluido': return 'Concluído';
      case 'pausado': return 'Pausado';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calcularDiasAtivos = (dataInicio: string) => {
    const inicio = new Date(dataInicio);
    const hoje = new Date();
    const diff = hoje.getTime() - inicio.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const handleRemover = async (atribuicaoId: string) => {
    if (confirm('Tem certeza que deseja remover esta atribuição?')) {
      await removerAtribuicao.mutateAsync({ fichaId, atribuicaoId });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto bg-gray-900 border-gray-800 w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader className="pb-4 border-b border-gray-800">
          <DialogTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Alunos com esta Ficha
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-1">{fichaNome}</p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">Carregando alunos...</p>
            </div>
          ) : atribuicoes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">Nenhum aluno com esta ficha ainda</p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2">Clique em "Atribuir a Aluno" para começar</p>
            </div>
          ) : (
            <>
              {/* Estatísticas */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 mb-4">
                <Card className="bg-blue-900/20 border-blue-700/30">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                      <div>
                        <p className="text-xs text-blue-300">Total</p>
                        <p className="text-lg sm:text-2xl font-bold text-white">{atribuicoes.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-900/20 border-green-700/30">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                      <div>
                        <p className="text-xs text-green-300">Ativos</p>
                        <p className="text-lg sm:text-2xl font-bold text-white">
                          {atribuicoes.filter((a: any) => a.status === 'ativo').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-900/20 border-purple-700/30 col-span-2 sm:col-span-1">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-300">Concluídos</p>
                        <p className="text-lg sm:text-2xl font-bold text-white">
                          {atribuicoes.filter((a: any) => a.status === 'concluido').length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Alunos */}
              <div className="space-y-3">
                {atribuicoes.map((atribuicao: any) => (
                  <Card key={atribuicao.id} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        {/* Info do Aluno */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-blue-500 flex-shrink-0">
                            <AvatarImage src={atribuicao.aluno?.foto_url} />
                            <AvatarFallback className="bg-gray-700 text-white text-sm">
                              {getInitials(atribuicao.aluno?.nome || 'NA')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                              {atribuicao.aluno?.nome}
                            </h4>
                            <p className="text-xs text-gray-400 truncate">
                              {atribuicao.aluno?.email}
                            </p>
                            
                            {/* Datas e Status - Mobile */}
                            <div className="flex flex-wrap gap-2 mt-2 sm:hidden">
                              <Badge className={`${getStatusColor(atribuicao.status)} text-[10px]`}>
                                {getStatusLabel(atribuicao.status)}
                              </Badge>
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(atribuicao.data_inicio)}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {calcularDiasAtivos(atribuicao.data_inicio)} dias
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Datas e Status - Desktop */}
                        <div className="hidden sm:flex items-center gap-3">
                          <div className="text-right">
                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                              <Calendar className="w-3 h-3" />
                              Início
                            </div>
                            <p className="text-sm font-medium text-white">
                              {formatDate(atribuicao.data_inicio)}
                            </p>
                          </div>

                          {atribuicao.data_fim && (
                            <div className="text-right">
                              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                <Calendar className="w-3 h-3" />
                                Fim
                              </div>
                              <p className="text-sm font-medium text-white">
                                {formatDate(atribuicao.data_fim)}
                              </p>
                            </div>
                          )}

                          <div className="text-right">
                            <p className="text-xs text-gray-400 mb-1">Tempo Ativo</p>
                            <p className="text-sm font-medium text-white">
                              {calcularDiasAtivos(atribuicao.data_inicio)} dias
                            </p>
                          </div>

                          <Badge className={`${getStatusColor(atribuicao.status)} text-xs`}>
                            {getStatusLabel(atribuicao.status)}
                          </Badge>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemover(atribuicao.id)}
                            disabled={removerAtribuicao.isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Botão Remover - Mobile */}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemover(atribuicao.id)}
                          disabled={removerAtribuicao.isPending}
                          className="sm:hidden text-red-400 hover:text-red-300 hover:bg-red-900/20 w-full text-xs"
                        >
                          <Trash2 className="w-3 h-3 mr-2" />
                          Remover Atribuição
                        </Button>
                      </div>

                      {/* Observações */}
                      {atribuicao.observacoes && (
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <p className="text-xs text-gray-400 mb-1">Observações:</p>
                          <p className="text-sm text-gray-300">{atribuicao.observacoes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-800 mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300 w-full sm:w-auto"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
