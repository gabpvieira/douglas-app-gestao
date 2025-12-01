/**
 * Página de Avaliações Físicas - Admin
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHeader from '@/components/PageHeader';
import NovaAvaliacaoModal from '@/components/avaliacoes/NovaAvaliacaoModal';
import { ModulosAdicionaisModal } from '@/components/avaliacoes/ModulosAdicionaisModal';
import { useAvaliacoes } from '@/hooks/useAvaliacoesFisicas';
import { Plus, Calendar, User, Activity, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AvaliacoesFisicas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modulosModalOpen, setModulosModalOpen] = useState(false);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<{ id: string; alunoId: string } | null>(null);
  const { data: avaliacoes, isLoading } = useAvaliacoes();

  const handleOpenModulos = (avaliacaoId: string, alunoId: string) => {
    setSelectedAvaliacao({ id: avaliacaoId, alunoId });
    setModulosModalOpen(true);
  };

  const getProtocoloBadge = (protocolo: string) => {
    if (protocolo === 'pollock_7_dobras') return '7 Dobras';
    if (protocolo === 'pollock_3_dobras') return '3 Dobras';
    return 'Manual';
  };

  const getClassificacaoColor = (classificacao?: string) => {
    if (!classificacao) return 'default';
    const lower = classificacao.toLowerCase();
    if (lower.includes('atleta') || lower.includes('excelente')) return 'default';
    if (lower.includes('bom')) return 'secondary';
    if (lower.includes('regular')) return 'outline';
    return 'destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Avaliações Físicas"
          description="Gerencie avaliações de composição corporal dos alunos"
          actions={
            <Button 
              onClick={() => setModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nova Avaliação</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          }
        />

        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">Carregando avaliações...</p>
            </CardContent>
          </Card>
        ) : avaliacoes && avaliacoes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {avaliacoes.map((avaliacao) => (
              <Card 
                key={avaliacao.id} 
                className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all cursor-pointer"
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-white">
                        <User className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{avaliacao.aluno?.nome}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 text-gray-400 text-xs sm:text-sm">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {avaliacao.dataAvaliacao && format(new Date(avaliacao.dataAvaliacao), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-gray-700 text-gray-300 text-xs flex-shrink-0 ml-2">
                      {getProtocoloBadge(avaliacao.protocolo || 'manual')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">Peso</p>
                      <p className="text-base sm:text-lg font-semibold text-white">{avaliacao.peso} kg</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500">IMC</p>
                      <p className="text-base sm:text-lg font-semibold text-white">{avaliacao.imc}</p>
                    </div>
                  </div>

                  {avaliacao.percentualGordura && (
                    <div className="space-y-2 pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-300">% Gordura</span>
                        </div>
                        <span className="text-base sm:text-lg font-bold text-white">{avaliacao.percentualGordura}%</span>
                      </div>
                      {avaliacao.classificacaoGordura && (
                        <Badge 
                          variant={getClassificacaoColor(avaliacao.classificacaoGordura)} 
                          className="w-full justify-center text-xs"
                        >
                          {avaliacao.classificacaoGordura}
                        </Badge>
                      )}
                    </div>
                  )}

                  {avaliacao.massaMagra && avaliacao.massaGorda && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Massa Magra</p>
                        <p className="text-sm font-semibold text-green-500">{avaliacao.massaMagra} kg</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500">Massa Gorda</p>
                        <p className="text-sm font-semibold text-red-500">{avaliacao.massaGorda} kg</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-gray-800">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
                      onClick={() => handleOpenModulos(avaliacao.id, avaliacao.alunoId)}
                    >
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Módulos Adicionais
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center p-6">
              <Activity className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">Nenhuma avaliação cadastrada</h3>
              <p className="text-gray-400 mb-4 text-sm">
                Comece criando a primeira avaliação física de um aluno.
              </p>
              <Button 
                onClick={() => setModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
            </CardContent>
          </Card>
        )}

        <NovaAvaliacaoModal
          open={modalOpen}
          onOpenChange={setModalOpen}
        />

        {selectedAvaliacao && (
          <ModulosAdicionaisModal
            open={modulosModalOpen}
            onOpenChange={setModulosModalOpen}
            avaliacaoId={selectedAvaliacao.id}
            alunoId={selectedAvaliacao.alunoId}
          />
        )}
      </div>
    </div>
  );
}
