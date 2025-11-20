import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, Video, Users, Eye } from 'lucide-react';
import { toast } from 'sonner';
import TreinoVideosList from './TreinoVideosList';
import TreinoVideoModal from './TreinoVideoModal';

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
  duracao: number; // em minutos
  tags: string[];
  ativo: boolean;
  alunosComAcesso: string[]; // IDs dos alunos
  criadoEm: Date;
  atualizadoEm: Date;
}

const TreinosVideo: React.FC = () => {
  const [treinos, setTreinos] = useState<TreinoVideo[]>([
    {
      id: '1',
      titulo: 'Treino de Peito - Iniciante',
      descricao: 'Treino completo para desenvolvimento do peitoral para iniciantes',
      videoUrl: 'https://example.com/video1.mp4',
      divisaoMuscular: 'Peito',
      nivel: 'iniciante',
      duracao: 45,
      tags: ['peito', 'iniciante', 'musculação'],
      ativo: true,
      alunosComAcesso: ['1', '2'],
      criadoEm: new Date('2024-01-15'),
      atualizadoEm: new Date('2024-01-15')
    },
    {
      id: '2',
      titulo: 'Treino de Costas - Avançado',
      descricao: 'Treino intenso para desenvolvimento das costas',
      videoUrl: 'https://example.com/video2.mp4',
      divisaoMuscular: 'Costas',
      nivel: 'avancado',
      duracao: 60,
      tags: ['costas', 'avançado', 'força'],
      ativo: true,
      alunosComAcesso: ['1'],
      criadoEm: new Date('2024-01-10'),
      atualizadoEm: new Date('2024-01-12')
    },
    {
      id: '3',
      titulo: 'Treino de Pernas - Intermediário',
      descricao: 'Treino completo para membros inferiores',
      divisaoMuscular: 'Pernas',
      nivel: 'intermediario',
      duracao: 50,
      tags: ['pernas', 'intermediário', 'quadríceps'],
      ativo: false,
      alunosComAcesso: [],
      criadoEm: new Date('2024-01-08'),
      atualizadoEm: new Date('2024-01-08')
    }
  ]);

  const [alunos] = useState<Aluno[]>([
    {
      id: '1',
      nome: 'João Silva',
      email: 'joao@email.com',
      telefone: '(11) 99999-9999',
      ativo: true
    },
    {
      id: '2',
      nome: 'Maria Santos',
      email: 'maria@email.com',
      telefone: '(11) 88888-8888',
      ativo: true
    },
    {
      id: '3',
      nome: 'Pedro Costa',
      email: 'pedro@email.com',
      telefone: '(11) 77777-7777',
      ativo: false
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreino, setEditingTreino] = useState<TreinoVideo | null>(null);

  const handleCreateTreino = () => {
    setEditingTreino(null);
    setIsModalOpen(true);
  };

  const handleEditTreino = (treino: TreinoVideo) => {
    setEditingTreino(treino);
    setIsModalOpen(true);
  };

  const handleSaveTreino = (treinoData: Omit<TreinoVideo, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (editingTreino) {
      // Editando treino existente
      setTreinos(prev => prev.map(treino => 
        treino.id === editingTreino.id 
          ? { ...treinoData, id: editingTreino.id, criadoEm: editingTreino.criadoEm, atualizadoEm: new Date() }
          : treino
      ));
      toast.success('Treino atualizado com sucesso!');
    } else {
      // Criando novo treino
      const novoTreino: TreinoVideo = {
        ...treinoData,
        id: Date.now().toString(),
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };
      setTreinos(prev => [...prev, novoTreino]);
      toast.success('Treino criado com sucesso!');
    }
    setIsModalOpen(false);
    setEditingTreino(null);
  };

  const handleDeleteTreino = (id: string) => {
    setTreinos(prev => prev.filter(treino => treino.id !== id));
    toast.success('Treino excluído com sucesso!');
  };

  const handleToggleAtivo = (id: string) => {
    setTreinos(prev => prev.map(treino => 
      treino.id === id 
        ? { ...treino, ativo: !treino.ativo, atualizadoEm: new Date() }
        : treino
    ));
    const treino = treinos.find(t => t.id === id);
    toast.success(`Treino ${treino?.ativo ? 'desativado' : 'ativado'} com sucesso!`);
  };

  const handleManageAcesso = (treinoId: string, alunosIds: string[]) => {
    setTreinos(prev => prev.map(treino => 
      treino.id === treinoId 
        ? { ...treino, alunosComAcesso: alunosIds, atualizadoEm: new Date() }
        : treino
    ));
    toast.success('Acesso dos alunos atualizado com sucesso!');
  };

  const treinosAtivos = treinos.filter(t => t.ativo).length;
  const totalVisualizacoes = treinos.reduce((acc, treino) => acc + treino.alunosComAcesso.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Treinos em Vídeo</h1>
          <p className="text-muted-foreground">
            Gerencie os treinos em vídeo disponíveis para seus alunos
          </p>
        </div>
        <Button onClick={handleCreateTreino} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Treino
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treinos.length}</div>
            <p className="text-xs text-muted-foreground">
              {treinosAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos com Acesso</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisualizacoes}</div>
            <p className="text-xs text-muted-foreground">
              Acessos distribuídos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de treinos */}
      <TreinoVideosList
        treinos={treinos}
        alunos={alunos}
        onEdit={handleEditTreino}
        onDelete={handleDeleteTreino}
        onToggleAtivo={handleToggleAtivo}
        onManageAcesso={handleManageAcesso}
      />

      {/* Modal para criar/editar treino */}
      <TreinoVideoModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTreino(null);
        }}
        onSave={handleSaveTreino}
        treino={editingTreino}
        alunos={alunos}
      />
    </div>
  );
};

export default TreinosVideo;