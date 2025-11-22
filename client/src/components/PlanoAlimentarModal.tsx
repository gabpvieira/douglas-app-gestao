import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, Clock, Calculator, Target, AlertCircle, Zap, Calendar, TrendingUp, Users } from 'lucide-react';
import { PlanoAlimentar, Refeicao, Alimento, Aluno } from '@/pages/PlanosAlimentares';

interface PlanoAlimentarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plano: Omit<PlanoAlimentar, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  plano?: PlanoAlimentar | null;
  alunos: Aluno[];
}

export function PlanoAlimentarModal({ isOpen, onClose, onSave, plano, alunos }: PlanoAlimentarModalProps) {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    objetivo: 'emagrecimento' as PlanoAlimentar['objetivo'],
    calorias: 0,
    proteinas: 0,
    carboidratos: 0,
    gorduras: 0,
    categoria: 'basico' as PlanoAlimentar['categoria'],
    restricoes: [] as string[],
    observacoes: '',
    ativo: true,
    alunosAtribuidos: [] as string[],
    duracao: 30, // em dias
    frequencia: 'diaria' as 'diaria' | 'semanal' | 'personalizada',
    nivelDificuldade: 'iniciante' as 'iniciante' | 'intermediario' | 'avancado',
    metaCalorica: 2000,
    metaProteina: 150,
    metaCarboidrato: 250,
    metaGordura: 70,
    hidratacao: 2.5, // litros por dia
    suplementacao: [] as string[]
  });

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [novaRestricao, setNovaRestricao] = useState('');
  const [novoSuplemento, setNovoSuplemento] = useState('');
  const [activeTab, setActiveTab] = useState('informacoes');

  // Banco de alimentos pré-definidos
  const alimentosDisponiveis: Omit<Alimento, 'id' | 'quantidade'>[] = [
    { nome: 'Peito de Frango', unidade: 'g', calorias: 1.65, proteinas: 0.31, carboidratos: 0, gorduras: 0.036, categoria: 'proteinas' },
    { nome: 'Ovo', unidade: 'unidade', calorias: 70, proteinas: 6, carboidratos: 0.6, gorduras: 5, categoria: 'proteinas' },
    { nome: 'Salmão', unidade: 'g', calorias: 2.08, proteinas: 0.25, carboidratos: 0, gorduras: 0.12, categoria: 'proteinas' },
    { nome: 'Carne Vermelha Magra', unidade: 'g', calorias: 2.5, proteinas: 0.26, carboidratos: 0, gorduras: 0.15, categoria: 'proteinas' },
    { nome: 'Arroz Integral', unidade: 'g', calorias: 1.23, proteinas: 0.03, carboidratos: 0.25, gorduras: 0.01, categoria: 'cereais' },
    { nome: 'Arroz Branco', unidade: 'g', calorias: 1.30, proteinas: 0.027, carboidratos: 0.28, gorduras: 0.003, categoria: 'cereais' },
    { nome: 'Batata Doce', unidade: 'g', calorias: 0.86, proteinas: 0.02, carboidratos: 0.20, gorduras: 0.001, categoria: 'carboidratos' },
    { nome: 'Batata Inglesa', unidade: 'g', calorias: 0.77, proteinas: 0.02, carboidratos: 0.17, gorduras: 0.001, categoria: 'carboidratos' },
    { nome: 'Aveia', unidade: 'g', calorias: 3.9, proteinas: 0.13, carboidratos: 0.67, gorduras: 0.07, categoria: 'cereais' },
    { nome: 'Quinoa', unidade: 'g', calorias: 3.68, proteinas: 0.14, carboidratos: 0.64, gorduras: 0.06, categoria: 'cereais' },
    { nome: 'Banana', unidade: 'unidade', calorias: 89, proteinas: 1, carboidratos: 23, gorduras: 0.3, categoria: 'frutas' },
    { nome: 'Maçã', unidade: 'unidade', calorias: 52, proteinas: 0.3, carboidratos: 14, gorduras: 0.2, categoria: 'frutas' },
    { nome: 'Abacate', unidade: 'unidade', calorias: 160, proteinas: 2, carboidratos: 9, gorduras: 15, categoria: 'frutas' },
    { nome: 'Brócolis', unidade: 'g', calorias: 0.34, proteinas: 0.028, carboidratos: 0.07, gorduras: 0.004, categoria: 'vegetais' },
    { nome: 'Espinafre', unidade: 'g', calorias: 0.23, proteinas: 0.029, carboidratos: 0.036, gorduras: 0.004, categoria: 'vegetais' },
    { nome: 'Azeite de Oliva', unidade: 'ml', calorias: 8.84, proteinas: 0, carboidratos: 0, gorduras: 1, categoria: 'gorduras' },
    { nome: 'Castanha do Pará', unidade: 'unidade', calorias: 33, proteinas: 0.7, carboidratos: 0.6, gorduras: 3.3, categoria: 'gorduras' },
    { nome: 'Whey Protein', unidade: 'g', calorias: 4, proteinas: 0.83, carboidratos: 0.067, gorduras: 0.033, categoria: 'suplementos' },
    { nome: 'Creatina', unidade: 'g', calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0, categoria: 'suplementos' }
  ];

  const suplementosDisponiveis = [
    'Whey Protein', 'Creatina', 'BCAA', 'Glutamina', 'Multivitamínico', 
    'Ômega 3', 'Vitamina D', 'Magnésio', 'Zinco', 'Cafeína'
  ];

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome,
        descricao: plano.descricao,
        objetivo: plano.objetivo,
        calorias: plano.calorias,
        proteinas: plano.proteinas,
        carboidratos: plano.carboidratos,
        gorduras: plano.gorduras,
        categoria: plano.categoria,
        restricoes: plano.restricoes,
        observacoes: plano.observacoes || '',
        ativo: plano.ativo,
        alunosAtribuidos: plano.alunosAtribuidos,
        duracao: 30,
        frequencia: 'diaria',
        nivelDificuldade: 'iniciante',
        metaCalorica: plano.calorias,
        metaProteina: plano.proteinas,
        metaCarboidrato: plano.carboidratos,
        metaGordura: plano.gorduras,
        hidratacao: 2.5,
        suplementacao: []
      });
      setRefeicoes(plano.refeicoes);
    } else {
      // Reset para novo plano
      setFormData({
        nome: '',
        descricao: '',
        objetivo: 'emagrecimento',
        calorias: 0,
        proteinas: 0,
        carboidratos: 0,
        gorduras: 0,
        categoria: 'basico',
        restricoes: [],
        observacoes: '',
        ativo: true,
        alunosAtribuidos: [],
        duracao: 30,
        frequencia: 'diaria',
        nivelDificuldade: 'iniciante',
        metaCalorica: 2000,
        metaProteina: 150,
        metaCarboidrato: 250,
        metaGordura: 70,
        hidratacao: 2.5,
        suplementacao: []
      });
      setRefeicoes([]);
    }
    setActiveTab('informacoes');
  }, [plano, isOpen]);

  const calcularMacros = () => {
    const totalCalorias = refeicoes.reduce((acc, ref) => acc + ref.calorias, 0);
    const totalProteinas = refeicoes.reduce((acc, ref) => 
      acc + ref.alimentos.reduce((accAlim, alim) => accAlim + (alim.proteinas * alim.quantidade), 0), 0
    );
    const totalCarboidratos = refeicoes.reduce((acc, ref) => 
      acc + ref.alimentos.reduce((accAlim, alim) => accAlim + (alim.carboidratos * alim.quantidade), 0), 0
    );
    const totalGorduras = refeicoes.reduce((acc, ref) => 
      acc + ref.alimentos.reduce((accAlim, alim) => accAlim + (alim.gorduras * alim.quantidade), 0), 0
    );

    setFormData(prev => ({
      ...prev,
      calorias: Math.round(totalCalorias),
      proteinas: Math.round(totalProteinas),
      carboidratos: Math.round(totalCarboidratos),
      gorduras: Math.round(totalGorduras)
    }));
  };

  const adicionarRefeicao = () => {
    const novaRefeicao: Refeicao = {
      id: Date.now().toString(),
      nome: '',
      horario: '',
      alimentos: [],
      calorias: 0,
      observacoes: ''
    };
    setRefeicoes(prev => [...prev, novaRefeicao]);
  };

  const removerRefeicao = (id: string) => {
    setRefeicoes(prev => prev.filter(ref => ref.id !== id));
  };

  const atualizarRefeicao = (id: string, campo: keyof Refeicao, valor: any) => {
    setRefeicoes(prev => prev.map(ref => 
      ref.id === id ? { ...ref, [campo]: valor } : ref
    ));
  };

  const adicionarAlimento = (refeicaoId: string) => {
    const alimentoBase = alimentosDisponiveis[0];
    const novoAlimento: Alimento = {
      id: Date.now().toString(),
      nome: alimentoBase.nome,
      quantidade: 100,
      unidade: alimentoBase.unidade,
      calorias: alimentoBase.calorias * 100,
      proteinas: alimentoBase.proteinas * 100,
      carboidratos: alimentoBase.carboidratos * 100,
      gorduras: alimentoBase.gorduras * 100,
      categoria: alimentoBase.categoria
    };

    setRefeicoes(prev => prev.map(ref => 
      ref.id === refeicaoId 
        ? { ...ref, alimentos: [...ref.alimentos, novoAlimento] }
        : ref
    ));
  };

  const removerAlimento = (refeicaoId: string, alimentoId: string) => {
    setRefeicoes(prev => prev.map(ref => 
      ref.id === refeicaoId 
        ? { ...ref, alimentos: ref.alimentos.filter(alim => alim.id !== alimentoId) }
        : ref
    ));
  };

  const atualizarAlimento = (refeicaoId: string, alimentoId: string, campo: keyof Alimento, valor: any) => {
    setRefeicoes(prev => prev.map(ref => 
      ref.id === refeicaoId 
        ? {
            ...ref,
            alimentos: ref.alimentos.map(alim => {
              if (alim.id === alimentoId) {
                const alimentoAtualizado = { ...alim, [campo]: valor };
                
                // Se mudou o nome do alimento, atualizar os valores nutricionais
                if (campo === 'nome') {
                  const alimentoBase = alimentosDisponiveis.find(a => a.nome === valor);
                  if (alimentoBase) {
                    alimentoAtualizado.unidade = alimentoBase.unidade;
                    alimentoAtualizado.calorias = alimentoBase.calorias * alimentoAtualizado.quantidade;
                    alimentoAtualizado.proteinas = alimentoBase.proteinas * alimentoAtualizado.quantidade;
                    alimentoAtualizado.carboidratos = alimentoBase.carboidratos * alimentoAtualizado.quantidade;
                    alimentoAtualizado.gorduras = alimentoBase.gorduras * alimentoAtualizado.quantidade;
                    alimentoAtualizado.categoria = alimentoBase.categoria;
                  }
                }
                
                // Se mudou a quantidade, recalcular valores nutricionais
                if (campo === 'quantidade') {
                  const alimentoBase = alimentosDisponiveis.find(a => a.nome === alim.nome);
                  if (alimentoBase) {
                    alimentoAtualizado.calorias = alimentoBase.calorias * valor;
                    alimentoAtualizado.proteinas = alimentoBase.proteinas * valor;
                    alimentoAtualizado.carboidratos = alimentoBase.carboidratos * valor;
                    alimentoAtualizado.gorduras = alimentoBase.gorduras * valor;
                  }
                }
                
                return alimentoAtualizado;
              }
              return alim;
            })
          }
        : ref
    ));
  };

  const calcularCaloriasRefeicao = (refeicaoId: string) => {
    const refeicao = refeicoes.find(ref => ref.id === refeicaoId);
    if (!refeicao) return;

    const totalCalorias = refeicao.alimentos.reduce((acc, alim) => acc + alim.calorias, 0);
    atualizarRefeicao(refeicaoId, 'calorias', Math.round(totalCalorias));
  };

  const adicionarRestricao = () => {
    if (novaRestricao.trim() && !formData.restricoes.includes(novaRestricao.trim())) {
      setFormData(prev => ({
        ...prev,
        restricoes: [...prev.restricoes, novaRestricao.trim()]
      }));
      setNovaRestricao('');
    }
  };

  const removerRestricao = (restricao: string) => {
    setFormData(prev => ({
      ...prev,
      restricoes: prev.restricoes.filter(r => r !== restricao)
    }));
  };

  const adicionarSuplemento = () => {
    if (novoSuplemento.trim() && !formData.suplementacao.includes(novoSuplemento.trim())) {
      setFormData(prev => ({
        ...prev,
        suplementacao: [...prev.suplementacao, novoSuplemento.trim()]
      }));
      setNovoSuplemento('');
    }
  };

  const removerSuplemento = (suplemento: string) => {
    setFormData(prev => ({
      ...prev,
      suplementacao: prev.suplementacao.filter(s => s !== suplemento)
    }));
  };

  const handleSave = () => {
    // Calcular macros diretamente dos alimentos para garantir valores atualizados
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;
    
    refeicoes.forEach(ref => {
      ref.alimentos.forEach(alim => {
        totalCalorias += alim.calorias;
        totalProteinas += alim.proteinas;
        totalCarboidratos += alim.carboidratos;
        totalGorduras += alim.gorduras;
      });
    });
    
    const planoParaSalvar = {
      ...formData,
      calorias: Math.round(totalCalorias),
      proteinas: Math.round(totalProteinas),
      carboidratos: Math.round(totalCarboidratos),
      gorduras: Math.round(totalGorduras),
      refeicoes
    };
    
    console.log('Salvando plano:', planoParaSalvar);
    onSave(planoParaSalvar);
  };

  const gerarPlanoAutomatico = () => {
    const objetivoConfig = {
      emagrecimento: { calorias: 1500, proteinas: 120, carboidratos: 150, gorduras: 50 },
      ganho_massa: { calorias: 2800, proteinas: 200, carboidratos: 350, gorduras: 90 },
      manutencao: { calorias: 2000, proteinas: 150, carboidratos: 250, gorduras: 70 },
      definicao: { calorias: 1800, proteinas: 160, carboidratos: 180, gorduras: 60 }
    };

    const config = objetivoConfig[formData.objetivo];
    
    const refeicoesAutomaticas: Refeicao[] = [
      {
        id: '1',
        nome: 'Café da Manhã',
        horario: '07:00',
        calorias: Math.round(config.calorias * 0.25),
        alimentos: [
          {
            id: 'a1',
            nome: 'Aveia',
            quantidade: 30,
            unidade: 'g',
            calorias: 117,
            proteinas: 4,
            carboidratos: 20,
            gorduras: 2,
            categoria: 'cereais'
          },
          {
            id: 'a2',
            nome: 'Banana',
            quantidade: 1,
            unidade: 'unidade',
            calorias: 89,
            proteinas: 1,
            carboidratos: 23,
            gorduras: 0.3,
            categoria: 'frutas'
          }
        ],
        observacoes: ''
      },
      {
        id: '2',
        nome: 'Almoço',
        horario: '12:00',
        calorias: Math.round(config.calorias * 0.35),
        alimentos: [
          {
            id: 'a3',
            nome: 'Peito de Frango',
            quantidade: 150,
            unidade: 'g',
            calorias: 248,
            proteinas: 46,
            carboidratos: 0,
            gorduras: 5,
            categoria: 'proteinas'
          },
          {
            id: 'a4',
            nome: 'Arroz Integral',
            quantidade: 100,
            unidade: 'g',
            calorias: 123,
            proteinas: 3,
            carboidratos: 25,
            gorduras: 1,
            categoria: 'cereais'
          }
        ],
        observacoes: ''
      },
      {
        id: '3',
        nome: 'Jantar',
        horario: '19:00',
        calorias: Math.round(config.calorias * 0.30),
        alimentos: [
          {
            id: 'a5',
            nome: 'Ovo',
            quantidade: 2,
            unidade: 'unidade',
            calorias: 140,
            proteinas: 12,
            carboidratos: 1.2,
            gorduras: 10,
            categoria: 'proteinas'
          },
          {
            id: 'a6',
            nome: 'Batata Doce',
            quantidade: 150,
            unidade: 'g',
            calorias: 129,
            proteinas: 3,
            carboidratos: 30,
            gorduras: 0.15,
            categoria: 'carboidratos'
          }
        ],
        observacoes: ''
      }
    ];

    setRefeicoes(refeicoesAutomaticas);
    setFormData(prev => ({
      ...prev,
      calorias: config.calorias,
      proteinas: config.proteinas,
      carboidratos: config.carboidratos,
      gorduras: config.gorduras,
      metaCalorica: config.calorias,
      metaProteina: config.proteinas,
      metaCarboidrato: config.carboidratos,
      metaGordura: config.gorduras
    }));
    
    // Mudar para a aba de refeições para mostrar o resultado
    setActiveTab('refeicoes');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900/95 backdrop-blur border-gray-800 text-white">
        <DialogHeader className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Target className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold text-white">
                {plano ? 'Editar Plano Alimentar' : 'Novo Plano Alimentar'}
              </DialogTitle>
              <p className="text-xs text-gray-400 line-clamp-1">
                {plano ? 'Atualize as informações do plano' : 'Crie um novo plano personalizado'}
              </p>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50 border border-gray-700 p-0.5 gap-0.5">
            <TabsTrigger 
              value="informacoes" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs py-2"
            >
              Informações
            </TabsTrigger>
            <TabsTrigger 
              value="metas" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs py-2"
            >
              Metas
            </TabsTrigger>
            <TabsTrigger 
              value="refeicoes" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs py-2"
            >
              Refeições
            </TabsTrigger>
            <TabsTrigger 
              value="atribuicoes" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-400 text-xs py-2"
            >
              Atribuições
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-3 mt-3">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  Informações Básicas
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Configure as informações principais do plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="nome" className="text-gray-200 text-xs">Nome do Plano</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      placeholder="Ex: Plano Emagrecimento Básico"
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="objetivo" className="text-gray-200 text-xs">Objetivo</Label>
                    <Select value={formData.objetivo} onValueChange={(value) => setFormData(prev => ({ ...prev, objetivo: value as PlanoAlimentar['objetivo'] }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                        <SelectValue placeholder="Selecione o objetivo" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="emagrecimento">Emagrecimento</SelectItem>
                        <SelectItem value="ganho_massa">Ganho de Massa</SelectItem>
                        <SelectItem value="manutencao">Manutenção</SelectItem>
                        <SelectItem value="definicao">Definição</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="categoria" className="text-gray-200 text-xs">Categoria</Label>
                    <Select value={formData.categoria} onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value as PlanoAlimentar['categoria'] }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="basico">Básico</SelectItem>
                        <SelectItem value="intermediario">Intermediário</SelectItem>
                        <SelectItem value="avancado">Avançado</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duracao" className="text-gray-200 text-xs">Duração (dias)</Label>
                    <Input
                      id="duracao"
                      type="number"
                      value={formData.duracao}
                      onChange={(e) => setFormData(prev => ({ ...prev, duracao: parseInt(e.target.value) || 30 }))}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="frequencia" className="text-gray-200 text-xs">Frequência</Label>
                    <Select value={formData.frequencia} onValueChange={(value) => setFormData(prev => ({ ...prev, frequencia: value as 'diaria' | 'semanal' | 'personalizada' }))}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="diaria">Diária</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="personalizada">Personalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="nivelDificuldade" className="text-gray-200 text-xs">Nível de Dificuldade</Label>
                  <Select value={formData.nivelDificuldade} onValueChange={(value) => setFormData(prev => ({ ...prev, nivelDificuldade: value as 'iniciante' | 'intermediario' | 'avancado' }))}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="descricao" className="text-gray-200 text-xs">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Descreva o plano alimentar..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm"
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="observacoes" className="text-gray-200 text-xs">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações adicionais..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  Restrições Alimentares
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Adicione restrições e alergias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={novaRestricao}
                    onChange={(e) => setNovaRestricao(e.target.value)}
                    placeholder="Ex: Lactose, Glúten..."
                    className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-9 text-sm"
                    onKeyPress={(e) => e.key === 'Enter' && adicionarRestricao()}
                  />
                  <Button onClick={adicionarRestricao} size="sm" className="bg-blue-600 hover:bg-blue-700 h-9 px-3">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.restricoes.map((restricao, index) => (
                    <Badge key={index} variant="secondary" className="bg-red-600/20 border-red-600/30 text-red-400 text-xs">
                      {restricao}
                      <button
                        onClick={() => removerRestricao(restricao)}
                        className="ml-1.5 hover:text-red-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-green-400" />
                  Suplementação
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Adicione suplementos recomendados
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Select value={novoSuplemento} onValueChange={setNovoSuplemento}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-9 text-sm">
                      <SelectValue placeholder="Selecione um suplemento" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      {suplementosDisponiveis.map((suplemento) => (
                        <SelectItem key={suplemento} value={suplemento}>
                          {suplemento}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={adicionarSuplemento} size="sm" className="bg-green-600 hover:bg-green-700 h-9 px-3">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.suplementacao.map((suplemento, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-600/20 border-green-600/30 text-green-400 text-xs">
                      {suplemento}
                      <button
                        onClick={() => removerSuplemento(suplemento)}
                        className="ml-1.5 hover:text-green-200"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metas" className="space-y-3 mt-3">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Target className="h-4 w-4 text-blue-400" />
                  Metas Nutricionais
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Defina as metas diárias de macronutrientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="metaCalorica" className="text-gray-200 text-xs">Calorias (kcal)</Label>
                    <Input
                      id="metaCalorica"
                      type="number"
                      value={formData.metaCalorica}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaCalorica: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="metaProteina" className="text-gray-200 text-xs">Proteínas (g)</Label>
                    <Input
                      id="metaProteina"
                      type="number"
                      value={formData.metaProteina}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaProteina: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="metaCarboidrato" className="text-gray-200 text-xs">Carboidratos (g)</Label>
                    <Input
                      id="metaCarboidrato"
                      type="number"
                      value={formData.metaCarboidrato}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaCarboidrato: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="metaGordura" className="text-gray-200 text-xs">Gorduras (g)</Label>
                    <Input
                      id="metaGordura"
                      type="number"
                      value={formData.metaGordura}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaGordura: parseInt(e.target.value) || 0 }))}
                      className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                    />
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                <div className="space-y-1.5">
                  <Label htmlFor="hidratacao" className="text-gray-200 text-xs">Meta de Hidratação (litros/dia)</Label>
                  <Input
                    id="hidratacao"
                    type="number"
                    step="0.1"
                    value={formData.hidratacao}
                    onChange={(e) => setFormData(prev => ({ ...prev, hidratacao: parseFloat(e.target.value) || 0 }))}
                    className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-700/50 rounded-lg border border-gray-700">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{formData.calorias}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Calorias Atuais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{formData.proteinas}g</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Proteínas Atuais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-400">{formData.carboidratos}g</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Carboidratos Atuais</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{formData.gorduras}g</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wide">Gorduras Atuais</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="refeicoes" className="space-y-3 mt-3">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-semibold text-white">Refeições do Plano</h3>
              <div className="flex gap-2">
                <Button onClick={gerarPlanoAutomatico} variant="outline" className="border-gray-600 text-gray-200 hover:bg-gray-700 h-9 text-xs">
                  <Calculator className="h-3.5 w-3.5 mr-1.5" />
                  Gerar Automático
                </Button>
                <Button onClick={adicionarRefeicao} className="bg-blue-600 hover:bg-blue-700 h-9 text-xs">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Nova Refeição
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {refeicoes.map((refeicao) => (
                <Card key={refeicao.id} className="bg-gray-800/30 border-gray-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <Label className="text-gray-200 text-xs">Nome da Refeição</Label>
                          <Input
                            value={refeicao.nome}
                            onChange={(e) => atualizarRefeicao(refeicao.id, 'nome', e.target.value)}
                            placeholder="Ex: Café da Manhã"
                            className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-gray-200 text-xs">Horário</Label>
                          <Input
                            type="time"
                            value={refeicao.horario}
                            onChange={(e) => atualizarRefeicao(refeicao.id, 'horario', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-gray-200 text-xs">Calorias</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={refeicao.calorias}
                              onChange={(e) => atualizarRefeicao(refeicao.id, 'calorias', parseInt(e.target.value) || 0)}
                              className="bg-gray-700 border-gray-600 text-white h-9 text-sm"
                            />
                            <Button
                              onClick={() => calcularCaloriasRefeicao(refeicao.id)}
                              size="sm"
                              variant="outline"
                              className="border-gray-600 text-gray-200 hover:bg-gray-700 h-9 w-9 p-0"
                            >
                              <Calculator className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => removerRefeicao(refeicao.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white h-9 w-9 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-gray-200 text-sm">Alimentos</h4>
                      <Button
                        onClick={() => adicionarAlimento(refeicao.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 h-8 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1.5" />
                        Adicionar Alimento
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {refeicao.alimentos.map((alimento) => (
                        <div key={alimento.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-3 bg-gray-700 rounded-lg">
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300">Alimento</Label>
                            <Select
                              value={alimento.nome}
                              onValueChange={(value) => atualizarAlimento(refeicao.id, alimento.id, 'nome', value)}
                            >
                              <SelectTrigger className="bg-gray-600 border-gray-500 text-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-600 border-gray-500">
                                {alimentosDisponiveis.map((alimentoDisp) => (
                                  <SelectItem key={alimentoDisp.nome} value={alimentoDisp.nome}>
                                    {alimentoDisp.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300">Quantidade</Label>
                            <Input
                              type="number"
                              value={alimento.quantidade}
                              onChange={(e) => atualizarAlimento(refeicao.id, alimento.id, 'quantidade', parseFloat(e.target.value) || 0)}
                              className="bg-gray-600 border-gray-500 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300">Unidade</Label>
                            <Input
                              value={alimento.unidade}
                              readOnly
                              className="bg-gray-600 border-gray-500 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300">Calorias</Label>
                            <Input
                              value={Math.round(alimento.calorias)}
                              readOnly
                              className="bg-gray-600 border-gray-500 text-white text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-gray-300">Proteínas (g)</Label>
                            <Input
                              value={Math.round(alimento.proteinas * 10) / 10}
                              readOnly
                              className="bg-gray-600 border-gray-500 text-white text-xs"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              onClick={() => removerAlimento(refeicao.id, alimento.id)}
                              size="sm"
                              variant="outline"
                              className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white w-full"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-gray-200 text-xs">Observações da Refeição</Label>
                      <Textarea
                        value={refeicao.observacoes}
                        onChange={(e) => atualizarRefeicao(refeicao.id, 'observacoes', e.target.value)}
                        placeholder="Observações sobre esta refeição..."
                        className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 text-sm"
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {refeicoes.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Nenhuma refeição adicionada ainda</p>
                  <Button onClick={adicionarRefeicao} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Refeição
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="atribuicoes" className="space-y-3 mt-3">
            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2 text-base">
                  <Users className="h-4 w-4 text-purple-400" />
                  Atribuir Plano aos Alunos
                </CardTitle>
                <CardDescription className="text-xs text-gray-400">
                  Selecione os alunos que receberão este plano
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alunos.map((aluno) => (
                    <div key={aluno.id} className="flex items-center space-x-2 p-2.5 bg-gray-700/50 rounded-lg border border-gray-700">
                      <Checkbox
                        id={`aluno-${aluno.id}`}
                        checked={formData.alunosAtribuidos.includes(aluno.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              alunosAtribuidos: [...prev.alunosAtribuidos, aluno.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              alunosAtribuidos: prev.alunosAtribuidos.filter(id => id !== aluno.id)
                            }));
                          }
                        }}
                        className="border-gray-500"
                      />
                      <div className="flex-1 min-w-0">
                        <Label htmlFor={`aluno-${aluno.id}`} className="text-white font-medium cursor-pointer text-sm line-clamp-1">
                          {aluno.nome}
                        </Label>
                        <p className="text-xs text-gray-400 line-clamp-1">{aluno.email}</p>
                      </div>
                      <Badge variant="outline" className="border-gray-500 text-gray-300 text-[10px] flex-shrink-0">
                        {aluno.objetivo}
                      </Badge>
                    </div>
                  ))}
                </div>

                {alunos.length === 0 && (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Nenhum aluno cadastrado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800/30 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Status do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: !!checked }))}
                    className="border-gray-500"
                  />
                  <Label htmlFor="ativo" className="text-white cursor-pointer text-sm">
                    Plano ativo (visível para os alunos)
                  </Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4 border-t border-gray-800 pt-3">
          <div className="flex justify-between items-center w-full gap-2">
            <Button 
              onClick={onClose} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white h-9 text-sm"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-9 text-sm"
            >
              {plano ? 'Atualizar Plano' : 'Criar Plano'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}