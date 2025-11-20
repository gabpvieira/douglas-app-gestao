import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
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
  Users,
  Play,
  Clock,
  Calendar
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
}

export function TreinoVideosList({
  treinos,
  alunos,
  onEditarTreino,
  onExcluirTreino,
  onToggleAtivo,
  onGerenciarAcesso
}: TreinosVideosListProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
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
    <div className="space-y-3 sm:space-y-4">
      {treinos.map((treino) => (
        <Card 
          key={treino.id} 
          className={`border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-colors ${!treino.ativo ? 'opacity-60' : ''}`}
          data-testid={`card-video-${treino.id}`}
        >
          <CardContent className="p-3 sm:p-4">
            {/* Mobile Layout */}
            <div className="flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-white text-sm sm:text-base" data-testid={`text-video-title-${treino.id}`}>
                      {treino.titulo}
                    </h3>
                    <Badge className={`${getNivelColor(treino.nivel)} text-[10px] sm:text-xs`}>
                      {getNivelLabel(treino.nivel)}
                    </Badge>
                    {!treino.ativo && (
                      <Badge variant="secondary" className="text-[10px] sm:text-xs">Inativo</Badge>
                    )}
                  </div>
                  
                  {treino.descricao && (
                    <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-2">
                      {treino.descricao}
                    </p>
                  )}
                </div>

                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-gray-400 hover:text-white hover:bg-gray-700 h-7 w-7 sm:h-8 sm:w-8 p-0"
                      data-testid={`button-menu-${treino.id}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
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

              {/* Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{treino.divisaoMuscular}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{treino.duracao} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span>{treino.alunosComAcesso.length} aluno(s)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                  <span className="truncate">{treino.videoUrl ? 'URL' : 'Arquivo'}</span>
                </div>
              </div>

              {/* Tags */}
              {treino.tags && treino.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {treino.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-[10px] border-gray-600 text-gray-400"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Alunos com Acesso */}
              {treino.alunosComAcesso.length > 0 && (
                <div className="pt-2 border-t border-gray-700">
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-2">Alunos com acesso:</p>
                  <div className="flex flex-wrap gap-1">
                    {treino.alunosComAcesso.slice(0, 5).map((alunoId) => {
                      const aluno = alunos.find(a => a.id === alunoId);
                      if (!aluno) return null;
                      return (
                        <div 
                          key={alunoId}
                          className="flex items-center gap-1 bg-gray-700/50 rounded-full px-2 py-1"
                        >
                          <Avatar className="h-4 w-4 sm:h-5 sm:w-5">
                            <AvatarFallback className="bg-gray-600 text-white text-[8px] sm:text-[10px]">
                              {getInitials(aluno.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[10px] text-gray-300 max-w-[80px] truncate">
                            {aluno.nome.split(' ')[0]}
                          </span>
                        </div>
                      );
                    })}
                    {treino.alunosComAcesso.length > 5 && (
                      <div className="flex items-center gap-1 bg-gray-700/50 rounded-full px-2 py-1">
                        <span className="text-[10px] text-gray-300">
                          +{treino.alunosComAcesso.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
