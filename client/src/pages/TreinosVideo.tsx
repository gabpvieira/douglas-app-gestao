import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Users, Clock, Search, Filter } from 'lucide-react';
import { TreinoVideoModal } from '@/components/TreinoVideoModal';
import { TreinoVideosList } from '@/components/TreinoVideosList';
import { useTreinosVideo, useDeleteTreinoVideo, useUpdateTreinoVideo, useUploadTreinoVideo } from '@/hooks/useTreinosVideo';
import { useAlunos } from '@/hooks/useAlunos';
import PageHeader from '@/components/PageHeader';

interface Aluno {
  id: string;
  nome: string;
  email: string;
}

interface TreinoVideo {
  id: string;
  titulo: string;
  descricao: string;
  divisaoMuscular: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  videoUrl?: string;
  videoFile?: File;
  thumbnail?: string;
  alunosComAcesso: string[];
  dataCriacao: Date;
  ativo: boolean;
  tags: string[];
}

export function TreinosVideo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState<TreinoVideo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: videosSupabase = [], isLoading: loadingTreinos, refetch } = useTreinosVideo();
  const { data: alunosSupabase = [], isLoading: loadingAlunos } = useAlunos();
  const deleteTreino = useDeleteTreinoVideo();
  const updateTreino = useUpdateTreinoVideo();
  const uploadVideo = useUploadTreinoVideo();
  
  const treinos: TreinoVideo[] = videosSupabase.map(video => ({
    id: video.id,
    titulo: video.nome,
    descricao: video.descricao || '',
    divisaoMuscular: video.objetivo || '',
    nivel: 'intermediario' as const,
    duracao: video.duracao || 0,
    videoUrl: video.urlVideo,
    thumbnail: video.thumbnailUrl || undefined,
    alunosComAcesso: [],
    dataCriacao: new Date(video.dataUpload),
    ativo: true,
    tags: []
  }));
  
  const alunos: Aluno[] = alunosSupabase.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email
  }));

  const filteredTreinos = treinos.filter(treino =>
    treino.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    treino.divisaoMuscular.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNovoTreino = () => {
    setTreinoEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarTreino = (treino: TreinoVideo) => {
    setTreinoEditando(treino);
    setIsModalOpen(true);
  };

  const handleSalvarTreino = async (treinoData: Partial<TreinoVideo>) => {
    try {
      if (treinoEditando) {
        await updateTreino.mutateAsync({
          id: treinoEditando.id,
          data: {
            nome: treinoData.titulo,
            objetivo: treinoData.divisaoMuscular,
            descricao: treinoData.descricao,
            duracao: treinoData.duracao
          }
        });
      } else {
        if (!treinoData.videoFile) return;
        
        await uploadVideo.mutateAsync({
          nome: treinoData.titulo || 'Novo Treino',
          objetivo: treinoData.divisaoMuscular,
          descricao: treinoData.descricao,
          duracao: treinoData.duracao,
          file: treinoData.videoFile
        });
      }
      
      await refetch();
      setIsModalOpen(false);
      setTreinoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
    }
  };

  const handleExcluirTreino = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      await deleteTreino.mutateAsync(id);
      await refetch();
    }
  };

  const handleToggleAtivo = (id: string) => {
    console.log('Toggle ativo:', id);
  };

  const handleGerenciarAcesso = (treinoId: string, alunosIds: string[]) => {
    console.log('Gerenciar acesso:', treinoId, alunosIds);
  };

  const totalTreinos = treinos.length;
  const treinosAtivos = treinos.length;
  const totalAlunosComAcesso = alunos.length;
  const duracaoTotal = treinos.reduce((acc, t) => acc + (t.duracao || 0), 0);
  const loading = loadingTreinos || loadingAlunos;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Treinos em Vídeo"
          description="Gerencie os treinos em vídeo e controle o acesso dos alunos"
          actions={
            <Button 
              onClick={handleNovoTreino}
              data-testid="button-add-video"
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Novo Treino</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total de Treinos</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{totalTreinos}</p>
                <p className="text-[10px] sm:text-sm text-green-400 mt-1">
                  {treinosAtivos} ativos
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <Video className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Alunos com Acesso</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{totalAlunosComAcesso}</p>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-1">
                  de {alunos.length} alunos
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Duração Total</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{duracaoTotal} min</p>
                <p className="text-[10px] sm:text-sm text-gray-400 mt-1">
                  tempo total de vídeos
                </p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
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
                  placeholder="Buscar por título ou divisão muscular..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-xs sm:text-sm"
                  data-testid="input-search-videos"
                />
              </div>
              <Button 
                variant="outline" 
                data-testid="button-filter-videos" 
                className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm"
              >
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-white">
              Lista de Treinos ({filteredTreinos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Carregando treinos...</p>
              </div>
            ) : filteredTreinos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  {searchTerm ? 'Nenhum treino encontrado.' : 'Nenhum treino cadastrado.'}
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={handleNovoTreino}
                    className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    data-testid="button-add-first-video"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Treino
                  </Button>
                )}
              </div>
            ) : (
              <TreinoVideosList
                treinos={filteredTreinos}
                alunos={alunos}
                onEditarTreino={handleEditarTreino}
                onExcluirTreino={handleExcluirTreino}
                onToggleAtivo={handleToggleAtivo}
                onGerenciarAcesso={handleGerenciarAcesso}
              />
            )}
          </CardContent>
        </Card>

        {/* Modal */}
        <TreinoVideoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTreinoEditando(null);
          }}
          onSave={handleSalvarTreino}
          treino={treinoEditando}
          alunos={alunos}
          loading={uploadVideo.isPending || updateTreino.isPending}
        />
      </div>
    </div>
  );
}
