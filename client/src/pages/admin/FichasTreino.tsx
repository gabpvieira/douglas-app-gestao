import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Dumbbell, Users, Calendar, Search, Filter, Edit, Trash2, UserPlus, LayoutGrid, List, Eye, Target, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { FichaTreinoModal } from '@/components/FichaTreinoModal';
import { FichasTreinoList } from '@/components/FichasTreinoList';
import { AtribuirFichaModal } from '@/components/AtribuirFichaModal';
import { VerAlunosFichaModal } from '@/components/VerAlunosFichaModal';
import { useFichasTreino, useCreateFichaTreino, useUpdateFichaTreino, useDeleteFichaTreino, useAtribuirFicha, useFichasStats } from '@/hooks/useFichasTreino';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'grid' | 'list';

interface Exercicio {
  id?: string;
  nome: string;
  grupoMuscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string;
}

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracaoSemanas: number;
  ativo: boolean;
  exercicios: Exercicio[];
  createdAt: Date;
  updatedAt: Date;
}

export default function FichasTreino() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAtribuirModalOpen, setIsAtribuirModalOpen] = useState(false);
  const [isVerAlunosModalOpen, setIsVerAlunosModalOpen] = useState(false);
  const [fichaEditando, setFichaEditando] = useState<any>(null);
  const [fichaParaAtribuir, setFichaParaAtribuir] = useState<any>(null);
  const [fichaVerAlunos, setFichaVerAlunos] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();
  
  // Buscar fichas do Supabase
  const { data: fichasSupabase = [], isLoading, refetch } = useFichasTreino();
  const { data: stats } = useFichasStats();
  const createFicha = useCreateFichaTreino();
  const updateFicha = useUpdateFichaTreino();
  const deleteFicha = useDeleteFichaTreino();
  const atribuirFicha = useAtribuirFicha();
  
  // Converter dados do Supabase para formato do frontend
  const fichas = fichasSupabase.map((ficha: any) => ({
    id: ficha.id,
    nome: ficha.nome,
    descricao: ficha.descricao || '',
    objetivo: ficha.objetivo || '',
    nivel: ficha.nivel,
    duracaoSemanas: ficha.duracao_semanas,
    ativo: ficha.ativo === 'true',
    exercicios: ficha.exercicios?.map((ex: any) => ({
      id: ex.id,
      nome: ex.nome,
      grupoMuscular: ex.grupo_muscular,
      ordem: ex.ordem,
      series: ex.series,
      repeticoes: ex.repeticoes,
      descanso: ex.descanso,
      observacoes: ex.observacoes,
      tecnica: ex.tecnica,
      videoId: ex.video_id
    })) || [],
    createdAt: new Date(ficha.created_at),
    updatedAt: new Date(ficha.updated_at)
  }));

  const filteredFichas = useMemo(() => {
    if (!searchTerm.trim()) return fichas;
    
    const search = searchTerm.toLowerCase();
    return fichas.filter(ficha =>
      ficha.nome.toLowerCase().includes(search) ||
      ficha.objetivo.toLowerCase().includes(search) ||
      ficha.nivel.toLowerCase().includes(search)
    );
  }, [fichas, searchTerm]);

  const handleNovaFicha = () => {
    setFichaEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarFicha = (ficha: FichaTreino) => {
    setFichaEditando(ficha);
    setIsModalOpen(true);
  };

  const handleSalvarFicha = async (fichaData: Partial<any>) => {
    try {
      // Converter dados para formato do backend
      const dataToSend = {
        nome: fichaData.nome,
        descricao: fichaData.descricao,
        objetivo: fichaData.objetivo,
        nivel: fichaData.nivel,
        duracao_semanas: fichaData.duracaoSemanas,
        ativo: fichaData.ativo !== undefined ? (fichaData.ativo ? 'true' : 'false') : 'true',
        exercicios: fichaData.exercicios?.map((ex: any) => ({
          nome: ex.nome,
          grupo_muscular: ex.grupoMuscular,
          ordem: ex.ordem,
          series: ex.series,
          repeticoes: ex.repeticoes,
          descanso: ex.descanso,
          observacoes: ex.observacoes,
          tecnica: ex.tecnica,
          video_id: ex.videoId
        }))
      };

      if (fichaEditando) {
        // Atualizar ficha existente
        await updateFicha.mutateAsync({ id: fichaEditando.id, data: dataToSend });
        toast({
          title: "Ficha atualizada!",
          description: "A ficha de treino foi atualizada com sucesso.",
        });
      } else {
        // Criar nova ficha
        await createFicha.mutateAsync(dataToSend);
        toast({
          title: "Ficha criada!",
          description: "A ficha de treino foi criada com sucesso.",
        });
      }
      
      setIsModalOpen(false);
      setFichaEditando(null);
      refetch();
    } catch (error) {
      console.error('Erro ao salvar ficha:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a ficha. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleExcluirFicha = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta ficha de treino?')) {
      try {
        await deleteFicha.mutateAsync(id);
        toast({
          title: "Ficha excluída!",
          description: "A ficha de treino foi excluída com sucesso.",
        });
        refetch();
      } catch (error) {
        console.error('Erro ao excluir ficha:', error);
        toast({
          title: "Erro ao excluir",
          description: "Ocorreu um erro ao excluir a ficha. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleAtivo = async (id: string) => {
    try {
      const ficha = fichas.find(f => f.id === id);
      if (!ficha) return;
      
      await updateFicha.mutateAsync({
        id,
        data: {
          ativo: ficha.ativo ? 'false' : 'true'
        }
      });
      
      toast({
        title: ficha.ativo ? "Ficha desativada" : "Ficha ativada",
        description: `A ficha foi ${ficha.ativo ? 'desativada' : 'ativada'} com sucesso.`,
      });
      
      refetch();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao alterar o status da ficha.",
        variant: "destructive"
      });
    }
  };

  const handleAtribuirFicha = (ficha: FichaTreino) => {
    setFichaParaAtribuir(ficha);
    setIsAtribuirModalOpen(true);
  };

  const handleVerAlunos = (ficha: FichaTreino) => {
    setFichaVerAlunos(ficha);
    setIsVerAlunosModalOpen(true);
  };

  const handleConfirmarAtribuicao = async (alunosIds: string[], dataInicio: string, dataFim?: string, observacoes?: string) => {
    if (!fichaParaAtribuir) return;
    
    try {
      // Atribuir para cada aluno selecionado
      for (const alunoId of alunosIds) {
        await atribuirFicha.mutateAsync({
          fichaId: fichaParaAtribuir.id,
          data: {
            aluno_id: alunoId,
            data_inicio: dataInicio,
            data_fim: dataFim,
            observacoes,
            status: 'ativo'
          }
        });
      }
      
      toast({
        title: "Ficha atribuída!",
        description: `A ficha foi atribuída para ${alunosIds.length} aluno(s) com sucesso.`,
      });
      
      setIsAtribuirModalOpen(false);
      setFichaParaAtribuir(null);
    } catch (error) {
      console.error('Erro ao atribuir ficha:', error);
      toast({
        title: "Erro ao atribuir",
        description: "Ocorreu um erro ao atribuir a ficha. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Usar estatísticas do backend (mais precisas)
  const totalFichas = stats?.totalFichas ?? fichas.length;
  const fichasAtivas = stats?.fichasAtivas ?? fichas.filter(f => f.ativo).length;
  const totalExercicios = stats?.totalExercicios ?? fichas.reduce((acc, f) => acc + f.exercicios.length, 0);
  const alunosComFichas = stats?.alunosComFichas ?? 0;

  const getNivelBadgeColor = (nivel: string) => {
    if (nivel === 'iniciante') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (nivel === 'intermediario') return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    if (nivel === 'avancado') return 'bg-red-500/10 text-red-500 border-red-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getNivelLabel = (nivel: string) => {
    if (nivel === 'iniciante') return 'Iniciante';
    if (nivel === 'intermediario') return 'Intermediário';
    if (nivel === 'avancado') return 'Avançado';
    return nivel;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Fichas de Treino"
          description="Crie e gerencie fichas de treino personalizadas para seus alunos"
          actions={
            <div className="flex items-center gap-2">
              {/* Toggle View Mode */}
              <div className="flex items-center gap-1 border border-gray-700 rounded-lg p-1 bg-gray-800/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-7 sm:h-8 px-2 sm:px-3 ${
                    viewMode === 'grid'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-7 sm:h-8 px-2 sm:px-3 ${
                    viewMode === 'list'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleNovaFicha}
                className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Nova Ficha</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total de Fichas</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{totalFichas}</p>
                <p className="text-[10px] sm:text-sm text-green-400 mt-1">
                  {fichasAtivas} ativas
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Dumbbell className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total Exercícios</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{totalExercicios}</p>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-1">
                  cadastrados
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Alunos com Fichas</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{alunosComFichas}</p>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-1">
                  alunos ativos
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtro de Busca */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Buscar por nome, objetivo ou nível..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>
            {searchTerm && (
              <p className="text-xs text-gray-400 mt-2">
                {filteredFichas.length} {filteredFichas.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Fichas List/Grid */}
        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">Carregando fichas...</p>
            </CardContent>
          </Card>
        ) : filteredFichas.length === 0 ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center p-6">
              <Dumbbell className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                {searchTerm ? 'Nenhuma ficha encontrada' : 'Nenhuma ficha cadastrada'}
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                {searchTerm 
                  ? 'Tente buscar por outro termo.'
                  : 'Comece criando a primeira ficha de treino.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleNovaFicha}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ficha
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          /* VISUALIZAÇÃO EM LISTA */
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-800">
                {filteredFichas.map((ficha) => (
                  <div
                    key={ficha.id}
                    className="p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                      {/* Nome e Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Dumbbell className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          <h3 className="font-semibold text-white truncate">{ficha.nome}</h3>
                          {!ficha.ativo && (
                            <Badge variant="outline" className="border-gray-700 text-gray-500 text-xs">
                              Inativa
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          <Badge variant="outline" className={`${getNivelBadgeColor(ficha.nivel)} text-xs`}>
                            {getNivelLabel(ficha.nivel)}
                          </Badge>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {ficha.objetivo || 'Sem objetivo'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {ficha.duracaoSemanas} semanas
                          </span>
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {ficha.exercicios.length} exercícios
                          </span>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                          onClick={() => handleToggleAtivo(ficha.id)}
                        >
                          {ficha.ativo ? 'Desativar' : 'Ativar'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                          onClick={() => handleVerAlunos(ficha)}
                        >
                          <Users className="h-3.5 w-3.5 sm:mr-2" />
                          <span className="hidden sm:inline">Ver Alunos</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                          onClick={() => handleAtribuirFicha(ficha)}
                        >
                          <UserPlus className="h-3.5 w-3.5 sm:mr-2" />
                          <span className="hidden sm:inline">Atribuir</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                          onClick={() => handleEditarFicha(ficha)}
                        >
                          <Edit className="h-3.5 w-3.5 sm:mr-2" />
                          <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs"
                          onClick={() => handleExcluirFicha(ficha.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
            {filteredFichas.map((ficha) => (
              <Card 
                key={ficha.id} 
                className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all"
              >
                <CardHeader className="p-3 pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm flex items-center gap-1.5 text-white leading-tight">
                      <Dumbbell className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                      <span className="truncate">{ficha.nome}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                      <Badge variant="outline" className={`${getNivelBadgeColor(ficha.nivel)} text-[10px] px-1.5 py-0 h-5`}>
                        {getNivelLabel(ficha.nivel)}
                      </Badge>
                      {!ficha.ativo && (
                        <Badge variant="outline" className="border-gray-700 text-gray-500 text-[10px] px-1.5 py-0 h-5">
                          Inativa
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 p-3 pt-0">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Target className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{ficha.objetivo || 'Sem objetivo'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span>{ficha.duracaoSemanas} sem</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <TrendingUp className="h-3 w-3 flex-shrink-0" />
                        <span>{ficha.exercicios.length} ex</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800 space-y-1.5">
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleToggleAtivo(ficha.id)}
                      >
                        {ficha.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleVerAlunos(ficha)}
                      >
                        <Users className="h-3 w-3 mr-1" />
                        Alunos
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                      onClick={() => handleAtribuirFicha(ficha)}
                    >
                      <UserPlus className="h-3 w-3 mr-1.5" />
                      Atribuir
                    </Button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleEditarFicha(ficha)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-[10px]"
                        onClick={() => handleExcluirFicha(ficha.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Modal de Criação/Edição */}
        <FichaTreinoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setFichaEditando(null);
          }}
          onSave={handleSalvarFicha}
          ficha={fichaEditando}
        />

        {/* Modal de Atribuição */}
        {fichaParaAtribuir && (
          <AtribuirFichaModal
            isOpen={isAtribuirModalOpen}
            onClose={() => {
              setIsAtribuirModalOpen(false);
              setFichaParaAtribuir(null);
            }}
            onConfirm={handleConfirmarAtribuicao}
            ficha={fichaParaAtribuir}
          />
        )}

        {/* Modal Ver Alunos */}
        {fichaVerAlunos && (
          <VerAlunosFichaModal
            isOpen={isVerAlunosModalOpen}
            onClose={() => {
              setIsVerAlunosModalOpen(false);
              setFichaVerAlunos(null);
            }}
            ficha={fichaVerAlunos}
          />
        )}
      </div>
    </div>
  );
}
