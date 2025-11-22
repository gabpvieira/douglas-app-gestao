import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, X, Play, Tag, Target, Clock, FileVideo, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateVideoThumbnail, blobToFile } from '@/utils/videoThumbnail';

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
  dataCriacao: Date;
  ativo: boolean;
  tags: string[];
}

interface TreinoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (treino: Partial<TreinoVideo>) => void;
  treino?: TreinoVideo | null;
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
    duracaoMinutos: 0,
    duracaoSegundos: 0,
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    videoUrl: '',
    tags: [] as string[],
    novaTag: ''
  });

  useEffect(() => {
    if (treino) {
      const minutos = Math.floor(treino.duracao / 60);
      const segundos = treino.duracao % 60;
      
      setFormData({
        titulo: treino.titulo,
        descricao: treino.descricao,
        divisaoMuscular: treino.divisaoMuscular,
        nivel: treino.nivel,
        duracaoMinutos: minutos,
        duracaoSegundos: segundos,
        videoFile: null,
        thumbnailFile: null,
        videoUrl: treino.videoUrl || '',
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
        duracaoMinutos: 0,
        duracaoSegundos: 0,
        videoFile: null,
        thumbnailFile: null,
        videoUrl: '',
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

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Gerar thumbnail automaticamente
    try {
      toast({
        title: "Gerando thumbnail...",
        description: "Aguarde enquanto criamos a capa do vídeo.",
      });

      const thumbnailBlob = await generateVideoThumbnail(file, 1);
      const thumbnailFile = blobToFile(thumbnailBlob, `thumb_${file.name}.jpg`);
      
      setFormData(prev => ({ ...prev, thumbnailFile }));
      
      toast({
        title: "Thumbnail gerada!",
        description: "Capa do vídeo criada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível gerar a capa automaticamente.",
        variant: "destructive",
      });
    }
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

    const duracaoTotal = (formData.duracaoMinutos * 60) + formData.duracaoSegundos;
    
    if (duracaoTotal <= 0) {
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
      duracao: duracaoTotal,
      tags: formData.tags,
    };

    if (formData.videoFile) {
      dadosParaSalvar.videoFile = formData.videoFile;
    }

    if (formData.thumbnailFile) {
      dadosParaSalvar.thumbnailFile = formData.thumbnailFile;
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
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-hidden bg-[#0f172a] border-slate-700/50 text-white p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-700/50">
          <DialogTitle className="text-2xl font-semibold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/10 rounded-lg">
              <FileVideo className="w-6 h-6 text-blue-500" />
            </div>
            {treino ? 'Editar Treino' : 'Novo Treino em Vídeo'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 gap-0 bg-slate-800/50 border-b border-slate-700/50 rounded-none h-auto p-0">
              <TabsTrigger 
                value="dados" 
                className="flex items-center justify-center gap-2 text-sm py-4 px-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none transition-all"
              >
                <Target className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Dados</span>
              </TabsTrigger>
              <TabsTrigger 
                value="video" 
                className="flex items-center justify-center gap-2 text-sm py-4 px-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none transition-all"
              >
                <Play className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Vídeo</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tags" 
                className="flex items-center justify-center gap-2 text-sm py-4 px-4 data-[state=active]:bg-slate-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none transition-all"
              >
                <Tag className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">Tags</span>
              </TabsTrigger>
            </TabsList>

            {/* Aba Dados */}
            <TabsContent value="dados" className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(92vh-280px)]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    Título do Treino
                    <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ex: Treino de Peito - Iniciante"
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                    data-testid="input-titulo"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="divisaoMuscular" className="text-sm font-medium text-slate-200 flex items-center gap-2">
                      Divisão Muscular
                      <span className="text-red-400">*</span>
                    </Label>
                    <Select
                      value={formData.divisaoMuscular}
                      onValueChange={(value) => handleInputChange('divisaoMuscular', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20" data-testid="select-divisao">
                        <SelectValue placeholder="Selecione a divisão" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {DIVISOES_MUSCULARES.map(divisao => (
                          <SelectItem key={divisao} value={divisao} className="text-white hover:bg-slate-700 focus:bg-slate-700">
                            {divisao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel" className="text-sm font-medium text-slate-200">Nível de Dificuldade</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value) => handleInputChange('nivel', value)}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white h-11 focus:border-blue-500 focus:ring-blue-500/20" data-testid="select-nivel">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="iniciante" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500"></span>
                            Iniciante
                          </span>
                        </SelectItem>
                        <SelectItem value="intermediario" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                            Intermediário
                          </span>
                        </SelectItem>
                        <SelectItem value="avancado" className="text-white hover:bg-slate-700 focus:bg-slate-700">
                          <span className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                            Avançado
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Duração
                    <span className="text-red-400">*</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="duracaoMinutos" className="text-xs text-slate-400">Minutos</Label>
                      <Input
                        id="duracaoMinutos"
                        type="number"
                        min="0"
                        max="999"
                        value={formData.duracaoMinutos || ''}
                        onChange={(e) => handleInputChange('duracaoMinutos', parseInt(e.target.value) || 0)}
                        placeholder="0"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                        data-testid="input-duracao-minutos"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="duracaoSegundos" className="text-xs text-slate-400">Segundos</Label>
                      <Input
                        id="duracaoSegundos"
                        type="number"
                        min="0"
                        max="59"
                        value={formData.duracaoSegundos || ''}
                        onChange={(e) => {
                          const valor = parseInt(e.target.value) || 0;
                          handleInputChange('duracaoSegundos', Math.min(59, Math.max(0, valor)));
                        }}
                        placeholder="0"
                        className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                        data-testid="input-duracao-segundos"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Duração total: {formData.duracaoMinutos}min {formData.duracaoSegundos}s
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao" className="text-sm font-medium text-slate-200">Descrição do Treino</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Descreva o treino, exercícios incluídos, objetivos e observações importantes..."
                    rows={4}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 resize-none focus:border-blue-500 focus:ring-blue-500/20"
                    data-testid="textarea-descricao"
                  />
                </div>
              </div>
            </TabsContent>

            {/* Aba Vídeo */}
            <TabsContent value="video" className="px-6 py-6 space-y-5 overflow-y-auto max-h-[calc(92vh-280px)]">
              {treino && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-start gap-3">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg">
                    <FileVideo className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-300 mb-1">Modo de Edição</p>
                    <p className="text-xs text-blue-200/80">
                      Você está editando um vídeo existente. Faça upload de um novo arquivo apenas se quiser substituir o vídeo atual.
                    </p>
                  </div>
                </div>
              )}
              
              <Card className="border-slate-700/50 bg-slate-800/30 overflow-hidden">
                <CardHeader className="p-5 bg-slate-800/50 border-b border-slate-700/50">
                  <CardTitle className="flex items-center gap-3 text-lg text-white">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                      <Upload className="h-5 w-5 text-blue-400" />
                    </div>
                    {treino ? 'Substituir Vídeo (Opcional)' : 'Upload de Vídeo'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoFile" className="text-sm font-medium text-slate-200">
                      {treino ? 'Novo Arquivo de Vídeo' : 'Arquivo de Vídeo'}
                      {!treino && <span className="text-red-400 ml-1">*</span>}
                    </Label>
                    <div className="relative">
                      <Input
                        id="videoFile"
                        type="file"
                        accept="video/mp4,video/webm,video/ogg,video/avi,video/mov,video/quicktime,video/x-msvideo,video/mpeg"
                        onChange={handleVideoUpload}
                        className="bg-slate-800/50 border-slate-600 text-white h-11 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                        data-testid="input-video-file"
                      />
                    </div>
                  </div>
                  
                  {formData.videoFile && (
                    <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2 bg-blue-600/10 rounded-lg">
                            <FileVideo className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{formData.videoFile.name}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, videoFile: null }));
                            setVideoPreview('');
                          }}
                          className="text-slate-400 hover:text-white hover:bg-slate-600 h-9 w-9 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-slate-700/20 border border-slate-600/30 rounded-lg p-4">
                    <p className="text-xs font-medium text-slate-300 mb-2">Requisitos do Vídeo</p>
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        <span>Formatos aceitos: MP4, WebM, OGG, AVI, MOV, MPEG</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        <span>Tamanho máximo: 500MB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                        <span>Recomendado: MP4 com resolução até 1080p</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {videoPreview && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-200">Preview do Vídeo</Label>
                  <div className="rounded-lg overflow-hidden border border-slate-700/50 bg-black">
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-h-80"
                    />
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Aba Tags */}
            <TabsContent value="tags" className="px-6 py-6 space-y-5 overflow-y-auto max-h-[calc(92vh-280px)]">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-200">Adicionar Tag Personalizada</Label>
                  <p className="text-xs text-slate-400 mt-1">Crie tags personalizadas para organizar seus treinos</p>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={formData.novaTag}
                    onChange={(e) => handleInputChange('novaTag', e.target.value)}
                    placeholder="Digite uma tag..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdicionarTag())}
                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 h-11"
                    data-testid="input-nova-tag"
                  />
                  <Button 
                    type="button" 
                    onClick={handleAdicionarTag}
                    className="bg-blue-600 hover:bg-blue-700 h-11 px-6"
                  >
                    Adicionar
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-200">Tags Selecionadas</Label>
                  {formData.tags.length > 0 && (
                    <span className="text-xs text-slate-400">{formData.tags.length} tag(s)</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-[60px] p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  {formData.tags.length === 0 ? (
                    <div className="w-full flex items-center justify-center py-4">
                      <p className="text-sm text-slate-500">Nenhuma tag adicionada ainda</p>
                    </div>
                  ) : (
                    formData.tags.map(tag => (
                      <Badge key={tag} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-3 py-1.5 text-xs font-medium">
                        {tag}
                        <X
                          className="h-3.5 w-3.5 cursor-pointer hover:text-slate-200 transition-colors"
                          onClick={() => handleRemoverTag(tag)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-slate-200">Tags Sugeridas</Label>
                  <p className="text-xs text-slate-400 mt-1">Clique para adicionar rapidamente</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAGS_SUGERIDAS
                    .filter(tag => !formData.tags.includes(tag))
                    .map(tag => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-slate-700 hover:border-slate-600 border-slate-600/50 text-slate-300 hover:text-white text-xs px-3 py-1.5 transition-all"
                        onClick={() => handleTagSugerida(tag)}
                      >
                        + {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 flex-row gap-3 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              disabled={loading}
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 h-11 px-6"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 px-8 shadow-lg shadow-blue-600/20"
              data-testid="button-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {treino ? 'Atualizando...' : 'Criando...'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  {treino ? 'Atualizar Treino' : 'Criar Treino'}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
