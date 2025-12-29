import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Video, Users, Clock, Search, Filter, LayoutGrid, List, Play, Edit, Trash2, Target, X } from 'lucide-react';
import { TreinoVideoModal } from '@/components/TreinoVideoModal';
import { TreinoVideosList } from '@/components/TreinoVideosList';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { useTreinosVideo, useDeleteTreinoVideo, useUpdateTreinoVideo, useUploadTreinoVideo, useReplaceVideoFile } from '@/hooks/useTreinosVideo';
import { useAlunos } from '@/hooks/useAlunos';
import PageHeader from '@/components/PageHeader';
import { DIVISOES_AGRUPADAS, getDivisaoStyle } from '@/constants/divisoesTreino';

type ViewMode = 'grid' | 'list';

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
  thumbnailFile?: File;
  thumbnail?: string;
  alunosComAcesso: string[];
  dataCriacao: Date;
  ativo: boolean;
  tags: string[];
}

export function TreinosVideo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState<TreinoVideo | null>(null);
  const [treinoVisualizando, setTreinoVisualizando] = useState<TreinoVideo | null>(null);
  const [treinoParaDeletar, setTreinoParaDeletar] = useState<TreinoVideo | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroDivisao, setFiltroDivisao] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  const { data: videosSupabase = [], isLoading: loadingTreinos, refetch } = useTreinosVideo();
  const { data: alunosSupabase = [], isLoading: loadingAlunos } = useAlunos();
  const deleteTreino = useDeleteTreinoVideo();
  const updateTreino = useUpdateTreinoVideo();
  const uploadVideo = useUploadTreinoVideo();
  const replaceVideo = useReplaceVideoFile();
  
  const treinos: TreinoVideo[] = videosSupabase.map(video => {
    console.log('📹 Vídeo do Supabase:', {
      id: video.id,
      nome: video.nome,
      urlVideo: video.urlVideo,
      thumbnailUrl: video.thumbnailUrl,
      allKeys: Object.keys(video)
    });
    
    // Garantir que a data seja válida
    let dataCriacao = new Date();
    try {
      if (video.dataUpload) {
        const parsedDate = new Date(video.dataUpload);
        if (!isNaN(parsedDate.getTime())) {
          dataCriacao = parsedDate;
        }
      }
    } catch (e) {
      console.error('Data inválida para vídeo:', video.id, video.dataUpload);
    }
    
    // Usar thumbnailUrl já convertido pelo hook
    const thumbnailUrl = video.thumbnailUrl || undefined;
    
    console.log('🖼️ Thumbnail URL final:', thumbnailUrl);
    
    return {
      id: video.id,
      titulo: video.nome,
      descricao: video.descricao || '',
      divisaoMuscular: video.objetivo || '',
      nivel: 'intermediario' as const,
      duracao: video.duracao || 0,
      videoUrl: video.urlVideo,
      thumbnail: thumbnailUrl,
      alunosComAcesso: [],
      dataCriacao,
      ativo: true,
      tags: []
    };
  });
  
  const alunos: Aluno[] = alunosSupabase.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email
  }));

  const filteredTreinos = useMemo(() => {
    let resultado = treinos;
    
    // Filtro por divisão muscular
    if (filtroDivisao && filtroDivisao !== 'all') {
      resultado = resultado.filter(treino => treino.divisaoMuscular === filtroDivisao);
    }
    
    // Filtro por busca textual
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      resultado = resultado.filter(treino =>
        treino.titulo.toLowerCase().includes(search) ||
        treino.divisaoMuscular.toLowerCase().includes(search)
      );
    }
    
    return resultado;
  }, [treinos, searchTerm, filtroDivisao]);

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
        // Se tem arquivo novo, substituir o vídeo
        if (treinoData.videoFile) {
          await replaceVideo.mutateAsync({
            id: treinoEditando.id,
            data: {
              nome: treinoData.titulo || treinoEditando.titulo,
              objetivo: treinoData.divisaoMuscular,
              descricao: treinoData.descricao,
              duracao: treinoData.duracao,
              file: treinoData.videoFile,
              thumbnailFile: treinoData.thumbnailFile
            }
          });
        } else {
          // Apenas atualizar metadados
          await updateTreino.mutateAsync({
            id: treinoEditando.id,
            data: {
              nome: treinoData.titulo,
              objetivo: treinoData.divisaoMuscular,
              descricao: treinoData.descricao,
              duracao: treinoData.duracao
            }
          });
        }
      } else {
        // Novo vídeo
        if (!treinoData.videoFile) return;
        
        await uploadVideo.mutateAsync({
          nome: treinoData.titulo || 'Novo Treino',
          objetivo: treinoData.divisaoMuscular,
          descricao: treinoData.descricao,
          duracao: treinoData.duracao,
          file: treinoData.videoFile,
          thumbnailFile: treinoData.thumbnailFile
        });
      }
      
      await refetch();
      setIsModalOpen(false);
      setTreinoEditando(null);
    } catch (error) {
      console.error('Erro ao salvar treino:', error);
    }
  };

  const handleExcluirTreino = (id: string) => {
    const treino = treinos.find(t => t.id === id);
    if (!treino) return;
    
    setTreinoParaDeletar(treino);
    setConfirmDeleteOpen(true);
  };

  const confirmarDelecao = async () => {
    if (!treinoParaDeletar) return;

    try {
      await deleteTreino.mutateAsync(treinoParaDeletar.id);
      await refetch();
    } catch (error) {
      console.error('Erro ao deletar treino:', error);
    } finally {
      setTreinoParaDeletar(null);
    }
  };

  const handleToggleAtivo = (id: string) => {
    console.log('Toggle ativo:', id);
  };

  const handleGerenciarAcesso = (treinoId: string, alunosIds: string[]) => {
    console.log('Gerenciar acesso:', treinoId, alunosIds);
  };

  const handleVerVideo = (treino: TreinoVideo) => {
    setTreinoVisualizando(treino);
    setIsPlayerOpen(true);
  };

  const formatarDuracaoTotal = (segundosTotais: number) => {
    const horas = Math.floor(segundosTotais / 3600);
    const minutos = Math.floor((segundosTotais % 3600) / 60);
    const segundos = segundosTotais % 60;
    
    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    
    if (minutos > 0) {
      return segundos > 0 ? `${minutos}min ${segundos}s` : `${minutos}min`;
    }
    
    return `${segundos}s`;
  };

  const totalTreinos = treinos.length;
  const treinosAtivos = treinos.length;
  const totalAlunosComAcesso = alunos.length;
  const duracaoTotal = treinos.reduce((acc, t) => acc + (t.duracao || 0), 0);
  const duracaoMedia = totalTreinos > 0 ? Math.floor(duracaoTotal / totalTreinos) : 0;
  const loading = loadingTreinos || loadingAlunos || uploadVideo.isPending || updateTreino.isPending || replaceVideo.isPending;

  const formatarDuracao = (segundos: number) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    if (minutos > 0) {
      return segs > 0 ? `${minutos}min ${segs}s` : `${minutos}min`;
    }
    return `${segs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Treinos em Vídeo"
          description="Gerencie os treinos em vídeo e controle o acesso dos alunos"
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
                onClick={handleNovoTreino}
                data-testid="button-add-video"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Novo Treino</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards - Compact Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total de Treinos */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Video className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Total de Treinos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalTreinos}</p>
                <p className="text-[10px] text-gray-500">{treinosAtivos} ativos</p>
              </div>
            </div>
          </div>

          {/* Alunos com Acesso */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Alunos com Acesso</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{totalAlunosComAcesso}</p>
                <p className="text-[10px] text-gray-500">de {alunos.length} alunos</p>
              </div>
            </div>
          </div>

          {/* Duração Total */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Duração Total</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{formatarDuracaoTotal(duracaoTotal)}</p>
                <p className="text-[10px] text-gray-500">tempo total</p>
              </div>
            </div>
          </div>

          {/* Duração Média */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Duração Média</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{formatarDuracao(duracaoMedia)}</p>
                <p className="text-[10px] text-gray-500">por vídeo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Busca por texto */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  data-testid="input-search-videos"
                />
              </div>
              
              {/* Filtro por divisão muscular */}
              <div className="w-full sm:w-64">
                <Select
                  value={filtroDivisao}
                  onValueChange={setFiltroDivisao}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-10">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-gray-500" />
                      <SelectValue placeholder="Filtrar por divisão" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 max-h-80">
                    <SelectItem value="all" className="text-white hover:bg-gray-700 focus:bg-gray-700">
                      Todas as divisões
                    </SelectItem>
                    {DIVISOES_AGRUPADAS.map((grupo) => (
                      <SelectGroup key={grupo.label}>
                        <SelectLabel className="text-xs font-semibold text-gray-400 px-2 py-1.5 uppercase tracking-wider">
                          {grupo.label}
                        </SelectLabel>
                        {grupo.options.map((divisao) => (
                          <SelectItem 
                            key={divisao} 
                            value={divisao} 
                            className="text-white hover:bg-gray-700 focus:bg-gray-700 pl-4"
                          >
                            {divisao}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Botão limpar filtros */}
              {(searchTerm || filtroDivisao) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setFiltroDivisao('');
                  }}
                  className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 h-10 px-3"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            {/* Contador de resultados */}
            {(searchTerm || filtroDivisao) && (
              <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                <span>{filteredTreinos.length} {filteredTreinos.length === 1 ? 'resultado' : 'resultados'}</span>
                {filtroDivisao && filtroDivisao !== 'all' && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300 text-xs">
                    {filtroDivisao}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Videos List/Grid */}
        {loading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">Carregando treinos...</p>
            </CardContent>
          </Card>
        ) : filteredTreinos.length === 0 ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center p-6">
              <Video className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                {searchTerm ? 'Nenhum treino encontrado' : 'Nenhum treino cadastrado'}
              </h3>
              <p className="text-gray-400 mb-4 text-sm">
                {searchTerm 
                  ? 'Tente buscar por outro termo.'
                  : 'Comece adicionando o primeiro treino em vídeo.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleNovoTreino}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-add-first-video"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Treino
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          /* VISUALIZAÇÃO EM LISTA */
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-800">
                {filteredTreinos.map((treino) => (
                  <div
                    key={treino.id}
                    className="p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Thumbnail */}
                      <div 
                        className="relative w-full sm:w-40 h-32 sm:h-24 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 cursor-pointer group"
                        onClick={() => handleVerVideo(treino)}
                      >
                        {treino.thumbnail ? (
                          <img 
                            src={treino.thumbnail} 
                            alt={treino.titulo}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                        {treino.duracao > 0 && (
                          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-xs text-white">
                            {formatarDuracao(treino.duracao)}
                          </div>
                        )}
                      </div>

                      {/* Info e Ações */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate mb-1">{treino.titulo}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                            {treino.divisaoMuscular && (
                              <span className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {treino.divisaoMuscular}
                              </span>
                            )}
                            {treino.duracao > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatarDuracao(treino.duracao)}
                              </span>
                            )}
                          </div>
                          {treino.descricao && (
                            <p className="text-xs text-gray-500 line-clamp-2">{treino.descricao}</p>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                            onClick={() => handleVerVideo(treino)}
                          >
                            <Play className="h-3.5 w-3.5 sm:mr-2" />
                            <span className="hidden sm:inline">Assistir</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                            onClick={() => handleEditarTreino(treino)}
                          >
                            <Edit className="h-3.5 w-3.5 sm:mr-2" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs"
                            onClick={() => handleExcluirTreino(treino.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
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
            {filteredTreinos.map((treino) => (
              <Card 
                key={treino.id} 
                className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all overflow-hidden"
              >
                {/* Thumbnail */}
                <div 
                  className="relative w-full h-40 bg-gray-800 cursor-pointer group"
                  onClick={() => handleVerVideo(treino)}
                >
                  {treino.thumbnail ? (
                    <img 
                      src={treino.thumbnail} 
                      alt={treino.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Video className="h-10 w-10 text-gray-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                  {treino.duracao > 0 && (
                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white font-medium">
                      {formatarDuracao(treino.duracao)}
                    </div>
                  )}
                </div>

                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm text-white leading-tight line-clamp-2">
                    {treino.titulo}
                  </CardTitle>
                  {treino.divisaoMuscular && (
                    <CardDescription className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-1">
                      <Target className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{treino.divisaoMuscular}</span>
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-2 p-3 pt-0">
                  {treino.descricao && (
                    <p className="text-xs text-gray-500 line-clamp-2">{treino.descricao}</p>
                  )}

                  <div className="pt-2 border-t border-gray-800 space-y-1.5">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                      onClick={() => handleVerVideo(treino)}
                    >
                      <Play className="h-3 w-3 mr-1.5" />
                      Assistir
                    </Button>
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                        onClick={() => handleEditarTreino(treino)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-[10px]"
                        onClick={() => handleExcluirTreino(treino.id)}
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

        {/* Modal de Edição */}
        <TreinoVideoModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTreinoEditando(null);
          }}
          onSave={handleSalvarTreino}
          treino={treinoEditando}
          loading={uploadVideo.isPending || updateTreino.isPending || replaceVideo.isPending}
        />

        {/* Modal de Visualização */}
        {treinoVisualizando && (
          <VideoPlayerModal
            isOpen={isPlayerOpen}
            onClose={() => {
              setIsPlayerOpen(false);
              setTreinoVisualizando(null);
            }}
            videoId={treinoVisualizando.id}
            videoTitle={treinoVisualizando.titulo}
            videoDescription={treinoVisualizando.descricao}
            videoDuration={treinoVisualizando.duracao}
            videoObjective={treinoVisualizando.divisaoMuscular}
            videoDate={treinoVisualizando.dataCriacao?.toISOString?.() || new Date().toISOString()}
          />
        )}

        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          onConfirm={confirmarDelecao}
          title="Excluir Treino em Vídeo"
          description={
            treinoParaDeletar
              ? `Tem certeza que deseja excluir o treino "${treinoParaDeletar.titulo}"? Esta ação não pode ser desfeita.`
              : ''
          }
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  );
}
