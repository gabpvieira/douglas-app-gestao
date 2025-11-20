import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Search,
  Filter,
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
import { toast } from 'sonner';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
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
  criadoEm: Date;
  atualizadoEm: Date;
}

interface TreinosVideosListProps {
  treinos: TreinoVideo[];
  alunos: Aluno[];
  onEdit: (treino: TreinoVideo) => void;
  onDelete: (id: string) => void;
  onToggleAtivo: (id: string) => void;
  onManageAcesso: (treinoId: string, alunosIds: string[]) => void;
}

const TreinoVideosList: React.FC<TreinosVideosListProps> = ({
  treinos,
  alunos,
  onEdit,
  onDelete,
  onToggleAtivo,
  onManageAcesso
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivisao, setSelectedDivisao] = useState('');
  const [selectedNivel, setSelectedNivel] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const divisoesMusculares = [
    'Peito',
    'Costas',
    'Pernas',
    'Ombros',
    'Braços',
    'Abdômen',
    'Glúteos',
    'Cardio',
    'Funcional',
    'Corpo Inteiro'
  ];

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    treinos.forEach(treino => {
      treino.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [treinos]);

  const filteredTreinos = useMemo(() => {
    return treinos.filter(treino => {
      const matchesSearch = treino.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           treino.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDivisao = !selectedDivisao || treino.divisaoMuscular === selectedDivisao;
      const matchesNivel = !selectedNivel || treino.nivel === selectedNivel;
      const matchesStatus = !selectedStatus || 
                           (selectedStatus === 'ativo' && treino.ativo) ||
                           (selectedStatus === 'inativo' && !treino.ativo);
      const matchesTag = !selectedTag || treino.tags.includes(selectedTag);

      return matchesSearch && matchesDivisao && matchesNivel && matchesStatus && matchesTag;
    }).sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  }, [treinos, searchTerm, selectedDivisao, selectedNivel, selectedStatus, selectedTag]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      setIsLoading(true);
      try {
        onDelete(id);
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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDivisao('');
    setSelectedNivel('');
    setSelectedStatus('');
    setSelectedTag('');
  };

  const getAlunosNomes = (alunosIds: string[]) => {
    return alunosIds
      .map(id => alunos.find(aluno => aluno.id === id)?.nome)
      .filter(Boolean)
      .join(', ');
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'iniciante':
        return 'bg-green-100 text-green-800';
      case 'intermediario':
        return 'bg-yellow-100 text-yellow-800';
      case 'avancado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar treinos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Divisão Muscular</Label>
              <Select value={selectedDivisao} onValueChange={setSelectedDivisao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {divisoesMusculares.map((divisao) => (
                    <SelectItem key={divisao} value={divisao}>
                      {divisao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nível</Label>
              <Select value={selectedNivel} onValueChange={setSelectedNivel}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="iniciante">Iniciante</SelectItem>
                  <SelectItem value="intermediario">Intermediário</SelectItem>
                  <SelectItem value="avancado">Avançado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={selectedTag} onValueChange={setSelectedTag}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de treinos */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : filteredTreinos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum treino encontrado</h3>
              <p className="text-muted-foreground">
                {treinos.length === 0 
                  ? 'Comece criando seu primeiro treino em vídeo.'
                  : 'Tente ajustar os filtros para encontrar o que procura.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTreinos.map((treino) => (
            <Card key={treino.id} className={`transition-all ${!treino.ativo ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{treino.titulo}</h3>
                          <Badge className={getNivelColor(treino.nivel)}>
                            {treino.nivel}
                          </Badge>
                          {!treino.ativo && (
                            <Badge variant="secondary">Inativo</Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground mb-3">
                          {treino.descricao}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {treino.divisaoMuscular}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {treino.duracao} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {treino.alunosComAcesso.length} aluno(s)
                          </div>
                          <div className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            {treino.videoUrl ? 'URL' : treino.videoFile ? 'Arquivo' : 'Sem vídeo'}
                          </div>
                        </div>

                        {treino.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {treino.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {treino.alunosComAcesso.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground">
                              <strong>Alunos com acesso:</strong> {getAlunosNomes(treino.alunosComAcesso)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleAtivo(treino.id)}
                      disabled={isLoading}
                    >
                      {treino.ativo ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(treino)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(treino.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {filteredTreinos.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredTreinos.length} de {treinos.length} treino(s)
        </div>
      )}
    </div>
  );
};

export default TreinoVideosList;