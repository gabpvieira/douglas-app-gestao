import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Play, Users, Tag, Target, Clock, FileVideo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

interface TreinoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treino: Partial<TreinoVideo>) => void;
  treino?: TreinoVideo | null;
  alunos: Aluno[];
  loading?: boolean;
}

const DIVISOES_MUSCULARES = [
  'Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 
  'Abdômen', 'Glúteos', 'Cardio', 'Funcional', 'Corpo Inteiro'
];

const TAGS_SUGERIDAS = [
  'hipertrofia', 'força', 'resistência', 'definição', 'queima de gordura',
  'iniciante', 'intermediário', 'avançado', 'musculação', 'funcional',
  'cardio', 'HIIT', 'alongamento', 'mobilidade', 'reabilitação'
];

export function TreinoVideoModal({
  isOpen,
  onClose,
  onSave,
  treino,
  alunos,
  loading = false
}: TreinoVideoModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dados');
  const [videoPreview, setVideoPreview] = useState<string>('');
  
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    divisaoMuscular: '',
    nivel: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    duracao: 0,
    videoFile: null as File | null,
    videoUrl: '',
    alunosComAcesso: [] as string[],
    tags: [] as string[],
    novaTag: ''
  });

  useEffect(() => {
    if (treino) {
      setFormData({
        titulo: treino.titulo,
        descricao: treino.descricao,
        divisaoMuscular: treino.divisaoMuscular,
        nivel: treino.nivel,
        duracao: treino.duracao,
        videoFile: null,
        videoUrl: treino.videoUrl || '',
        alunosComAcesso: treino.alunosComAcesso,
        tags: treino.tags,
        novaTag: ''
      });
      setVideoPreview(treino.videoUrl || '');
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        divisaoMuscular: '',
        nivel: 'iniciante',
        duracao: 0,
        videoFile: null,
        videoUrl: '',
        alunosComAcesso: [],
        tags: [],
        novaTag: ''
      });
      setVideoPreview('');
    }
    setActiveTab('dados');
  }, [treino, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime', 'video/x-msvideo', 'video/mpeg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Use MP4, WebM, OGG, AVI, MOV ou MPEG.",
        variant: "destructive",
      });
      return;
    }

    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Arquivo muito grande",
        description: "Tamanho máximo: 500MB.",
        variant: "destructive",
      });
      return;
    }

    setFormData(prev => ({ ...prev, videoFile: file, videoUrl: '' }));
    setVideoPreview(URL.createObjectURL(file));
    
    toast({
      title: "Vídeo carregado",
      description: `"${file.name}" pronto para upload.`,
    });
  };

  const handleAlunoToggle = (alunoId: string) => {
    setFormData(prev => ({
      ...prev,
      alunosComAcesso: prev.alunosComAcesso.includes(alunoId)
        ? prev.alunosComAcesso.filter(id => id !== alunoId)
        : [...prev.alunosComAcesso, alunoId]
    }));
  };

  const handleAdicionarTag = () => {
    const tag = formData.novaTag.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
        novaTag: ''
      }));
    }
  };

  const handleRemoverTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleTagSugerida = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast({ title: "Erro", description: "Título é obrigatório", variant: "destructive" });
      return;
    }

    if (!formData.divisaoMuscular) {
      toast({ title: "Erro", description: "Divisão muscular é obrigatória", variant: "destructive" });
      return;
    }

    if (formData.duracao <= 0) {
      toast({ title: "Erro", description: "Duração deve ser maior que zero", variant: "destructive" });
      return;
    }

    if (!formData.videoFile && !formData.videoUrl && !treino) {
      toast({ title: "Erro", description: "É necessário fazer upload de um vídeo", variant: "destructive" });
      return;
    }

    const dadosParaSalvar: Partial<TreinoVideo> = {
      titulo: formData.titulo.trim(),
      descricao: formData.descricao.trim(),
      divisaoMuscular: formData.divisaoMuscular,
      nivel: formData.nivel,
      duracao: formData.duracao,
      alunosComAcesso: formData.alunosComAcesso,
      tags: formData.tags,
    };

    if (formData.videoFile) {
      dadosParaSalvar.videoFile = formData.videoFile;
    }

    onSave(dadosParaSalvar);
  };

  const handleClose = () => {
    if (videoPreview && videoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(videoPreview);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <FileVideo className="w-5 h-5" />
            {treino ? 'Editar Treino' : 'Novo Treino em Vídeo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-gray-800 border-gray-700 p-1 sm:p-1.5">
              <TabsTrigger 
                value="dados" 
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
              >
                <Target className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Dados</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
              >
                <Play className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Vídeo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="alunos" 
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
              >
                <Users className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Alunos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tags" 
                className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
              >
                <Tag className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Tags</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Dados */}
            <TabsContent value="dados" className="space-y-3 sm:space-y-4 mt-8 sm:mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="titulo" className="text-gray-300">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ex: Treino de Peito - Iniciante"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-titulo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="divisaoMuscular" className="text-gray-300">Divisão Muscular *</Label>
                  <Select
                    value={formData.divisaoMuscular}
                    onValueChange={(value) => handleInputChange('divisaoMuscular', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid="select-divisao">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {DIVISOES_MUSCULARES.map(divisao => (
                        <SelectItem key={divisao} value={divisao} className="text-white hover:bg-gray-700">
                          {divisao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-gray-300">Nível</Label>
                  <Select
                    value={formData.nivel}
                    onValueChange={(value) => handleInputChange('nivel', value)}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white" data-testid="select-nivel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="iniciante" className="text-white hover:bg-gray-700">Iniciante</SelectItem>
                      <SelectItem value="intermediario" className="text-white hover:bg-gray-700">Intermediário</SelectItem>
                      <SelectItem value="avancado" className="text-white hover:bg-gray-700">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="duracao" className="text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Duração (minutos) *
                  </Label>
                  <Input
                    id="duracao"
                    type="number"
                    min="1"
                    value={formData.duracao || ''}
                    onChange={(e) => handleInputChange('duracao', parseInt(e.target.value) || 0)}
                    placeholder="45"
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-duracao"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="descricao" className="text-gray-300">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva o treino, exercícios incluídos, objetivos..."
                    rows={3}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                    data-testid="textarea-descricao"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Vídeo */}
            <TabsContent value="video" className="space-y-3 sm:space-y-4 mt-8 sm:mt-6">
              <Card className="border-gray-700 bg-gray-800/50">
                <CardHeader className="p-3 sm:p-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-white">
                    <Upload className="h-4 w-4" />
                    Upload de Vídeo
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 space-y-3">
                  <div>
                    <Label htmlFor="videoFile" className="text-gray-300">Arquivo de Vídeo</Label>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime,video/x-msvideo,video/mpeg"
                      onChange={handleVideoUpload}
                      className="mt-2 bg-gray-800 border-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                      data-testid="input-video-file"
                    />
                  </div>
                  
                  {formData.videoFile && (
                    <div className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{formData.videoFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, videoFile: null }));
                            setVideoPreview('');
                          }}
                          className="text-gray-400 hover:text-white hover:bg-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-400 space-y-1 bg-gray-700/30 p-2 rounded">
                    <p>• Formatos: MP4, WebM, OGG, AVI, MOV, MPEG</p>
                    <p>• Tamanho máximo: 500MB</p>
                    <p>• Recomendado: MP4 até 1080p</p>
                  </div>
                </CardContent>
              </Card>

              {videoPreview && (
                <div className="space-y-2">
                  <Label className="text-gray-300">Preview do Vídeo</Label>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-64 rounded-lg bg-black"
                  />
                </div>
              )}
            </TabsContent>

            {/* Aba Alunos */}
            <TabsContent value="alunos" className="space-y-3 sm:space-y-4 mt-8 sm:mt-6">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-gray-300">Alunos com Acesso</Label>
                <span className="text-xs sm:text-sm text-gray-400">
                  {formData.alunosComAcesso.length} de {alunos.length}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-h-96 overflow-y-auto">
                {alunos.map(aluno => (
                  <Card key={aluno.id} className="p-2 sm:p-3 border-gray-700 bg-gray-800/50 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <Checkbox
                        checked={formData.alunosComAcesso.includes(aluno.id)}
                        onCheckedChange={() => handleAlunoToggle(aluno.id)}
                        className="border-gray-600"
                        data-testid={`checkbox-aluno-${aluno.id}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white text-sm truncate">{aluno.nome}</p>
                        <p className="text-xs text-gray-400 truncate">{aluno.email}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {alunos.length === 0 && (
                <p className="text-center text-gray-500 py-8 text-sm">
                  Nenhum aluno cadastrado
                </p>
              )}
            </TabsContent>

            {/* Aba Tags */}
            <TabsContent value="tags" className="space-y-3 sm:space-y-4 mt-8 sm:mt-6">
              <div className="space-y-2">
                <Label className="text-gray-300">Adicionar Tag</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.novaTag}
                    onChange={(e) => handleInputChange('novaTag', e.target.value)}
                    placeholder="Digite uma tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarTag())}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    data-testid="input-nova-tag"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAdicionarTag}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tags Selecionadas</Label>
                <div className="flex flex-wrap gap-1 sm:gap-2 min-h-[40px] p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  {formData.tags.length === 0 ? (
                    <p className="text-xs sm:text-sm text-gray-500">Nenhuma tag adicionada</p>
                  ) : (
                    formData.tags.map(tag => (
                      <Badge key={tag} className="bg-blue-600 text-white flex items-center gap-1 text-xs">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-gray-300"
                          onClick={() => handleRemoverTag(tag)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Tags Sugeridas</Label>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {TAGS_SUGERIDAS
                    .filter(tag => !formData.tags.includes(tag))
                    .map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-gray-700 border-gray-600 text-gray-300 text-xs"
                        onClick={() => handleTagSugerida(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-3 pt-4 border-t border-gray-700">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              data-testid="button-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {treino ? 'Atualizando...' : 'Enviando...'}
                </span>
              ) : (
                treino ? 'Atualizar' : 'Criar Treino'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
