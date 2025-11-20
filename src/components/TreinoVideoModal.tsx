import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Upload, X, Play, Link, Users, Tag } from 'lucide-react';
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

interface TreinoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treino: Omit<TreinoVideo, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  treino?: TreinoVideo | null;
  alunos: Aluno[];
}

const TreinoVideoModal: React.FC<TreinoVideoModalProps> = ({
  isOpen,
  onClose,
  onSave,
  treino,
  alunos
}) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    videoUrl: '',
    divisaoMuscular: '',
    nivel: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    duracao: 0,
    tags: [] as string[],
    ativo: true,
    alunosComAcesso: [] as string[]
  });

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [newTag, setNewTag] = useState('');
  const [activeTab, setActiveTab] = useState('dados');

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

  useEffect(() => {
    if (treino) {
      setFormData({
        titulo: treino.titulo,
        descricao: treino.descricao,
        videoUrl: treino.videoUrl || '',
        divisaoMuscular: treino.divisaoMuscular,
        nivel: treino.nivel,
        duracao: treino.duracao,
        tags: treino.tags,
        ativo: treino.ativo,
        alunosComAcesso: treino.alunosComAcesso
      });
      if (treino.videoUrl) {
        setVideoPreview(treino.videoUrl);
      }
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        videoUrl: '',
        divisaoMuscular: '',
        nivel: 'iniciante',
        duracao: 0,
        tags: [],
        ativo: true,
        alunosComAcesso: []
      });
      setVideoFile(null);
      setVideoPreview('');
    }
    setNewTag('');
    setActiveTab('dados');
  }, [treino, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('video/')) {
        setVideoFile(file);
        const url = URL.createObjectURL(file);
        setVideoPreview(url);
        setFormData(prev => ({ ...prev, videoUrl: '' }));
        toast.success('Vídeo carregado com sucesso!');
      } else {
        toast.error('Por favor, selecione um arquivo de vídeo válido.');
      }
    }
  };

  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({ ...prev, videoUrl: url }));
    if (url) {
      setVideoFile(null);
      setVideoPreview(url);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleToggleAluno = (alunoId: string) => {
    setFormData(prev => ({
      ...prev,
      alunosComAcesso: prev.alunosComAcesso.includes(alunoId)
        ? prev.alunosComAcesso.filter(id => id !== alunoId)
        : [...prev.alunosComAcesso, alunoId]
    }));
  };

  const handleSubmit = () => {
    if (!formData.titulo.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    if (!formData.divisaoMuscular) {
      toast.error('Divisão muscular é obrigatória');
      return;
    }

    if (formData.duracao <= 0) {
      toast.error('Duração deve ser maior que zero');
      return;
    }

    if (!formData.videoUrl && !videoFile) {
      toast.error('É necessário adicionar um vídeo (URL ou arquivo)');
      return;
    }

    const treinoData = {
      ...formData,
      videoFile: videoFile || undefined
    };

    onSave(treinoData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {treino ? 'Editar Treino' : 'Novo Treino em Vídeo'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="video">Vídeo</TabsTrigger>
            <TabsTrigger value="alunos">Alunos</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="dados" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  placeholder="Ex: Treino de Peito - Iniciante"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="divisaoMuscular">Divisão Muscular *</Label>
                <Select
                  value={formData.divisaoMuscular}
                  onValueChange={(value) => handleInputChange('divisaoMuscular', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a divisão" />
                  </SelectTrigger>
                  <SelectContent>
                    {divisoesMusculares.map((divisao) => (
                      <SelectItem key={divisao} value={divisao}>
                        {divisao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">Nível</Label>
                <Select
                  value={formData.nivel}
                  onValueChange={(value) => handleInputChange('nivel', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração (minutos) *</Label>
                <Input
                  id="duracao"
                  type="number"
                  value={formData.duracao}
                  onChange={(e) => handleInputChange('duracao', parseInt(e.target.value) || 0)}
                  placeholder="45"
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => handleInputChange('descricao', e.target.value)}
                placeholder="Descreva o treino..."
                rows={4}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => handleInputChange('ativo', checked)}
              />
              <Label htmlFor="ativo">Treino ativo</Label>
            </div>
          </TabsContent>

          <TabsContent value="video" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload de Vídeo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="videoFile">Arquivo de Vídeo</Label>
                        <Input
                          id="videoFile"
                          type="file"
                          accept="video/*"
                          onChange={handleVideoUpload}
                          className="mt-2"
                        />
                        {videoFile && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Arquivo selecionado: {videoFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      URL do Vídeo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => handleVideoUrlChange(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {videoPreview && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Preview do Vídeo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        {videoFile ? (
                          <video
                            src={videoPreview}
                            controls
                            className="w-full h-full rounded-lg"
                          />
                        ) : (
                          <div className="text-center">
                            <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              Preview do vídeo da URL
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alunos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gerenciar Acesso dos Alunos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alunos.filter(aluno => aluno.ativo).map((aluno) => (
                    <div key={aluno.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`aluno-${aluno.id}`}
                        checked={formData.alunosComAcesso.includes(aluno.id)}
                        onCheckedChange={() => handleToggleAluno(aluno.id)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`aluno-${aluno.id}`} className="font-medium">
                          {aluno.nome}
                        </Label>
                        <p className="text-sm text-muted-foreground">{aluno.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {formData.alunosComAcesso.length} aluno(s) selecionado(s)
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tags" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags do Treino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Digite uma tag..."
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      Adicionar
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>

                  {formData.tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma tag adicionada
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            {treino ? 'Atualizar' : 'Criar'} Treino
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TreinoVideoModal;