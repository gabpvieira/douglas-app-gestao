/**
 * Página de Avaliações Físicas - Admin
 */

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import PageHeader from '@/components/PageHeader';
import NovaAvaliacaoModal from '@/components/avaliacoes/NovaAvaliacaoModal';
import { ModulosAdicionaisModal } from '@/components/avaliacoes/ModulosAdicionaisModal';
import DetalhesAvaliacaoModal from '@/components/avaliacoes/DetalhesAvaliacaoModal';
import { useAvaliacoes } from '@/hooks/useAvaliacoesFisicas';
import { Plus, Calendar, User, Activity, FileText, LayoutGrid, List, Search, Eye, Pin } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'grid' | 'list';

export default function AvaliacoesFisicas() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modulosModalOpen, setModulosModalOpen] = useState(false);
  const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
  const [selectedAvaliacaoId, setSelectedAvaliacaoId] = useState<string | null>(null);
  const [selectedAvaliacao, setSelectedAvaliacao] = useState<{ id: string; alunoId: string } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [pinnedAvaliacoes, setPinnedAvaliacoes] = useState<Set<string>>(new Set());
  
  const { data: avaliacoes, isLoading } = useAvaliacoes();

  // Filtrar avaliações por nome do aluno
  const filteredAvaliacoes = useMemo(() => {
    if (!avaliacoes) return [];
    if (!searchTerm.trim()) return avaliacoes;
    
    const search = searchTerm.toLowerCase();
    return avaliacoes.filter(av => 
      av.aluno?.nome.toLowerCase().includes(search)
    );
  }, [avaliacoes, searchTerm]);

  const handleOpenModulos = (avaliacaoId: string, alunoId: string) => {
    setSelectedAvaliacao({ id: avaliacaoId, alunoId });
    setModulosModalOpen(true);
  };

  const handleOpenDetalhes = (avaliacaoId: string) => {
    setSelectedAvaliacaoId(avaliacaoId);
    setDetalhesModalOpen(true);
  };

  const handleTogglePin = (avaliacaoId: string) => {
    setPinnedAvaliacoes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(avaliacaoId)) {
        newSet.delete(avaliacaoId);
      } else {
        newSet.add(avaliacaoId);
      }
      return newSet;
    });
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
            <div className="flex items-center gap-2">
              {/* Toggle View Mode - Desktop only */}
              <div className="hidden lg:flex items-center gap-1 border border-gray-700 rounded-lg p-1 bg-gray-800/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-8 px-3 ${
                    viewMode === 'grid'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-8 px-3 ${
                    viewMode === 'list'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={() => setModalOpen(true)}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Nova Avaliação</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          }
        />

        {/* Filtro de Busca */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-2">
                {filteredAvaliacoes.length} {filteredAvaliacoes.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">Carregando avaliações...</p>
            </CardContent>
          </Card>
        ) : filteredAvaliacoes && filteredAvaliacoes.length > 0 ? (
          viewMode === 'list' ? (
            /* VISUALIZAÇÃO EM LISTA */
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-800">
                  {filteredAvaliacoes.map((avaliacao) => (
                    <div
                      key={avaliacao.id}
                      className="p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between gap-4">
                        {/* Aluno e Data */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {pinnedAvaliacoes.has(avaliacao.id) && (
                              <Pin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            )}
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <h3 className="font-semibold text-white truncate">{avaliacao.aluno?.nome}</h3>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Calendar className="h-3 w-3" />
                            <span>{avaliacao.dataAvaliacao && format(new Date(avaliacao.dataAvaliacao), "dd/MM/yyyy", { locale: ptBR })}</span>
                            <Badge variant="outline" className="border-gray-700 text-gray-300 text-xs">
                              {getProtocoloBadge(avaliacao.protocolo || 'manual')}
                            </Badge>
                          </div>
                        </div>

                        {/* Métricas */}
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">Peso</p>
                            <p className="text-sm font-semibold text-white">{avaliacao.peso} kg</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-1">IMC</p>
                            <p className="text-sm font-semibold text-white">{avaliacao.imc}</p>
                          </div>
                          {avaliacao.percentualGordura && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">% Gordura</p>
                              <p className="text-sm font-semibold text-blue-400">{avaliacao.percentualGordura}%</p>
                            </div>
                          )}
                          {avaliacao.massaMagra && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Massa Magra</p>
                              <p className="text-sm font-semibold text-green-500">{avaliacao.massaMagra} kg</p>
                            </div>
                          )}
                          {avaliacao.massaGorda && (
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Massa Gorda</p>
                              <p className="text-sm font-semibold text-red-500">{avaliacao.massaGorda} kg</p>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white flex-shrink-0"
                            onClick={() => handleOpenDetalhes(avaliacao.id)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white flex-shrink-0"
                            onClick={() => handleOpenModulos(avaliacao.id, avaliacao.alunoId)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Módulos
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* VISUALIZAÇÃO EM GRID COMPACTO */
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filteredAvaliacoes.map((avaliacao) => (
                <Card 
                  key={avaliacao.id} 
                  className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all cursor-pointer"
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-sm flex items-center gap-1.5 text-white leading-tight">
                        {pinnedAvaliacoes.has(avaliacao.id) && (
                          <Pin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                        )}
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{avaliacao.aluno?.nome}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {avaliacao.dataAvaliacao && format(new Date(avaliacao.dataAvaliacao), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <Badge variant="outline" className="border-gray-700 text-gray-300 text-[10px] px-1.5 py-0 h-5 flex-shrink-0">
                          {getProtocoloBadge(avaliacao.protocolo || 'manual')}
                        </Badge>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 p-3 pt-0">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500">Peso</p>
                        <p className="text-sm font-semibold text-white">{avaliacao.peso} kg</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-gray-500">IMC</p>
                        <p className="text-sm font-semibold text-white">{avaliacao.imc}</p>
                      </div>
                    </div>

                    {avaliacao.percentualGordura && (
                      <div className="space-y-1.5 pt-2 border-t border-gray-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-xs font-medium text-gray-300">% Gordura</span>
                          </div>
                          <span className="text-sm font-bold text-white">{avaliacao.percentualGordura}%</span>
                        </div>
                        {avaliacao.classificacaoGordura && (
                          <Badge 
                            variant={getClassificacaoColor(avaliacao.classificacaoGordura)} 
                            className="w-full justify-center text-[10px] py-0.5"
                          >
                            {avaliacao.classificacaoGordura}
                          </Badge>
                        )}
                      </div>
                    )}

                    {avaliacao.massaMagra && avaliacao.massaGorda && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800">
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500">M. Magra</p>
                          <p className="text-xs font-semibold text-green-500">{avaliacao.massaMagra} kg</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] text-gray-500">M. Gorda</p>
                          <p className="text-xs font-semibold text-red-500">{avaliacao.massaGorda} kg</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-gray-800 space-y-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleOpenDetalhes(avaliacao.id)}
                      >
                        <Eye className="h-3 w-3 mr-1.5" />
                        Ver Detalhes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleOpenModulos(avaliacao.id, avaliacao.alunoId)}
                      >
                        <FileText className="h-3 w-3 mr-1.5" />
                        Módulos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center p-6">
              <Activity className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                {searchTerm ? 'Nenhuma avaliação encontrada' : 'Nenhuma avaliação cadastrada'}
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                {searchTerm 
                  ? 'Tente buscar por outro nome de aluno.'
                  : 'Comece criando a primeira avaliação física de um aluno.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => setModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Avaliação
                </Button>
              )}
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

        {selectedAvaliacaoId && (
          <DetalhesAvaliacaoModal
            open={detalhesModalOpen}
            onOpenChange={setDetalhesModalOpen}
            avaliacaoId={selectedAvaliacaoId}
            isPinned={pinnedAvaliacoes.has(selectedAvaliacaoId)}
            onTogglePin={() => handleTogglePin(selectedAvaliacaoId)}
          />
        )}
      </div>
    </div>
  );
}
