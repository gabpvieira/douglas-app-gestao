import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Play,
  Clock,
  Calendar,
  Video
} from 'lucide-react';

interface Aluno {
  id: string;
  nome: string;
  email: string;
}

interface TreinoVideo {
  id: string;
  titulo: string;
  descricao: string;
  videoUrl?: string;
  videoFile?: File;
  thumbnail?: string;
  divisaoMuscular: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracao: number;
  tags: string[];
  ativo: boolean;
  alunosComAcesso: string[];
  dataCriacao: Date;
}

interface TreinosVideosListProps {
  treinos: TreinoVideo[];
  alunos: Aluno[];
  onEditarTreino: (treino: TreinoVideo) => void;
  onExcluirTreino: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onGerenciarAcesso: (treinoId: string, alunosIds: string[]) => void;
  onVerVideo: (treino: TreinoVideo) => void;
}

export function TreinoVideosList({
  treinos,
  alunos,
  onEditarTreino,
  onExcluirTreino,
  onToggleAtivo,
  onGerenciarAcesso,
  onVerVideo
}: TreinosVideosListProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatarDuracao = (segundosTotais: number) => {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;
    
    if (minutos === 0) {
      return `${segundos}s`;
    }
    
    if (segundos === 0) {
      return `${minutos}min`;
    }
    
    return `${minutos}min ${segundos}s`;
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante':
        return 'bg-green-500 text-white';
      case 'intermediario':
        return 'bg-yellow-500 text-white';
      case 'avancado':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getNivelLabel = (nivel: string) => {
    switch (nivel) {
      case 'iniciante':
        return 'Iniciante';
      case 'intermediario':
        return 'Intermediário';
      case 'avancado':
        return 'Avançado';
      default:
        return nivel;
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setIsLoading(true);
      try {
        onExcluirTreino(id);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleToggleAtivo = async (id: string) => {
    setIsLoading(true);
    try {
      onToggleAtivo(id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {treinos.map((treino) => (
        <Card 
          key={treino.id} 
          className={`group border-gray-800 bg-gray-900/50 hover:bg-gray-900/70 transition-all duration-300 overflow-hidden ${!treino.ativo ? 'opacity-60' : ''}`}
          data-testid={`card-video-${treino.id}`}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
            {treino.thumbnail ? (
              <img 
                src={treino.thumbnail} 
                alt={treino.titulo}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  console.error('Erro ao carregar thumbnail:', treino.thumbnail);
                  // Esconder imagem e mostrar ícone
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900';
                    fallback.innerHTML = '<svg class="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>';
                    parent.insertBefore(fallback, e.currentTarget);
                  }
                }}
                onLoad={() => {
                  console.log('✅ Thumbnail carregada:', treino.thumbnail);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Video className="w-12 h-12 text-gray-600" />
              </div>
            )}
            
            {/* Overlay com Play Button */}
            <div 
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer"
              onClick={() => onVerVideo(treino)}
            >
              <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center hover:scale-110 transition-transform">
                <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatarDuracao(treino.duracao)}
            </div>

            {/* Status Badge */}
            {!treino.ativo && (
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">Inativo</Badge>
              </div>
            )}

            {/* Actions Menu */}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                    data-testid={`button-menu-${treino.id}`}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    onClick={() => onVerVideo(treino)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    data-testid={`button-view-${treino.id}`}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Ver Vídeo
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onEditarTreino(treino)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    data-testid={`button-edit-${treino.id}`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleToggleAtivo(treino.id)}
                    disabled={isLoading}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                    data-testid={`button-toggle-${treino.id}`}
                  >
                    {treino.ativo ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(treino.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    data-testid={`button-delete-${treino.id}`}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Content */}
          <CardContent className="p-4">
            {/* Title and Level */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white text-base line-clamp-2 flex-1" data-testid={`text-video-title-${treino.id}`}>
                  {treino.titulo}
                </h3>
                <Badge className={`${getNivelColor(treino.nivel)} text-xs flex-shrink-0`}>
                  {getNivelLabel(treino.nivel)}
                </Badge>
              </div>
              
              {treino.descricao && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {treino.descricao}
                </p>
              )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{treino.divisaoMuscular}</span>
              </div>
            </div>

            {/* Tags */}
            {treino.tags && treino.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {treino.tags.slice(0, 3).map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="text-xs border-gray-700 text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
                {treino.tags.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-gray-700 text-gray-400"
                  >
                    +{treino.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
