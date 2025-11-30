import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Dumbbell, Users, Calendar, Search, Filter, Edit, Trash2, UserPlus } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { FichaTreinoModal } from '@/components/FichaTreinoModal';
import { FichasTreinoList } from '@/components/FichasTreinoList';
import { AtribuirFichaModal } from '@/components/AtribuirFichaModal';
import { VerAlunosFichaModal } from '@/components/VerAlunosFichaModal';
import { useFichasTreino, useCreateFichaTreino, useUpdateFichaTreino, useDeleteFichaTreino, useAtribuirFicha, useFichasStats } from '@/hooks/useFichasTreino';
import { useToast } from '@/hooks/use-toast';

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

  const filteredFichas = fichas.filter(ficha =>
    ficha.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.objetivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.nivel.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Fichas de Treino"
          description="Crie e gerencie fichas de treino personalizadas para seus alunos"
          actions={
            <Button 
              onClick={handleNovaFicha}
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Nova Ficha</span>
              <span className="sm:hidden">Nova</span>
            </Button>
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

        {/* Filters */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Buscar por nome, objetivo ou nível..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-xs sm:text-sm"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fichas List */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-white">
              Lista de Fichas ({filteredFichas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {filteredFichas.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Nenhuma ficha encontrada.' : 'Nenhuma ficha cadastrada.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleNovaFicha}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Ficha
                  </Button>
                )}
              </div>
            ) : (
              <FichasTreinoList
                fichas={filteredFichas}
                onEditarFicha={handleEditarFicha}
                onExcluirFicha={handleExcluirFicha}
                onToggleAtivo={handleToggleAtivo}
                onAtribuirFicha={handleAtribuirFicha}
                onVerAlunos={handleVerAlunos}
              />
            )}
          </CardContent>
        </Card>

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
