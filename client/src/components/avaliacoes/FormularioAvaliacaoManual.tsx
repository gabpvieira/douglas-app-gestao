/**
 * Formulário de Avaliação Manual
 * Permite entrada manual de dados de composição corporal
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calculator, Scale, Ruler, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface FormularioAvaliacaoManualProps {
  alunoId?: string;
  onSubmit: (dados: any) => void;
  onVoltar: () => void;
}

export default function FormularioAvaliacaoManual({
  alunoId,
  onSubmit,
  onVoltar
}: FormularioAvaliacaoManualProps) {
  const [selectedAlunoId, setSelectedAlunoId] = useState(alunoId || '');
  const [dataAvaliacao, setDataAvaliacao] = useState(new Date().toISOString().split('T')[0]);
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [genero, setGenero] = useState<'masculino' | 'feminino'>('masculino');
  const [percentualGordura, setPercentualGordura] = useState('');
  
  // Circunferências
  const [circunferenciaTorax, setCircunferenciaTorax] = useState('');
  const [circunferenciaCintura, setCircunferenciaCintura] = useState('');
  const [circunferenciaAbdomen, setCircunferenciaAbdomen] = useState('');
  const [circunferenciaQuadril, setCircunferenciaQuadril] = useState('');
  const [circunferenciaBracoDireito, setCircunferenciaBracoDireito] = useState('');
  const [circunferenciaBracoEsquerdo, setCircunferenciaBracoEsquerdo] = useState('');
  const [circunferenciaCoxaDireita, setCircunferenciaCoxaDireita] = useState('');
  const [circunferenciaCoxaEsquerda, setCircunferenciaCoxaEsquerda] = useState('');
  const [circunferenciaPanturrilhaDireita, setCircunferenciaPanturrilhaDireita] = useState('');
  const [circunferenciaPanturrilhaEsquerda, setCircunferenciaPanturrilhaEsquerda] = useState('');
  
  const [observacoes, setObservacoes] = useState('');
  
  // Estados de expansão das seções
  const [secaoDadosBasicosAberta, setSecaoDadosBasicosAberta] = useState(true);
  const [secaoCircunferenciasAberta, setSecaoCircunferenciasAberta] = useState(false);
  const [secaoObservacoesAberta, setSecaoObservacoesAberta] = useState(false);

  // Buscar lista de alunos
  const { data: alunos } = useQuery({
    queryKey: ['alunos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          data_nascimento,
          altura,
          genero,
          user_profile:users_profile!inner(nome)
        `)
        .eq('status', 'ativo')
        .order('user_profile(nome)');

      if (error) throw error;
      return data;
    },
  });

  // Preencher dados do aluno selecionado
  const handleAlunoChange = (alunoId: string) => {
    setSelectedAlunoId(alunoId);
    const aluno = alunos?.find(a => a.id === alunoId);
    if (aluno) {
      if (aluno.altura) setAltura(aluno.altura.toString());
      if (aluno.genero) setGenero(aluno.genero as 'masculino' | 'feminino');
      if (aluno.data_nascimento) {
        const nascimento = new Date(aluno.data_nascimento);
        const hoje = new Date();
        const idadeCalculada = hoje.getFullYear() - nascimento.getFullYear();
        setIdade(idadeCalculada.toString());
      }
    }
  };

  // Cálculos automáticos
  const calcularIMC = () => {
    if (!peso || !altura) return null;
    const pesoNum = parseFloat(peso);
    const alturaM = parseFloat(altura) / 100;
    return (pesoNum / (alturaM * alturaM)).toFixed(1);
  };

  const calcularMassaGorda = () => {
    if (!peso || !percentualGordura) return null;
    const pesoNum = parseFloat(peso);
    const percGordura = parseFloat(percentualGordura);
    return ((pesoNum * percGordura) / 100).toFixed(1);
  };

  const calcularMassaMagra = () => {
    if (!peso || !percentualGordura) return null;
    const pesoNum = parseFloat(peso);
    const percGordura = parseFloat(percentualGordura);
    return (pesoNum - (pesoNum * percGordura) / 100).toFixed(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAlunoId || !peso || !altura || !idade || !percentualGordura) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    const idadeNum = parseFloat(idade);
    const percGordura = parseFloat(percentualGordura);
    
    const imc = calcularIMC();
    const massaGorda = calcularMassaGorda();
    const massaMagra = calcularMassaMagra();

    // Montar dados no formato esperado
    const dados = {
      alunoId: selectedAlunoId,
      dataAvaliacao,
      peso: pesoNum,
      altura: alturaNum,
      idade: idadeNum,
      genero,
      protocolo: 'manual',
      resultado: {
        imc: parseFloat(imc || '0'),
        percentualGordura: percGordura,
        massaMagra: parseFloat(massaMagra || '0'),
        massaGorda: parseFloat(massaGorda || '0'),
        pesoIdeal: pesoNum, // Simplificado para avaliação manual
        classificacao: 'Manual',
      },
      perimetria: {
        torax: circunferenciaTorax ? parseFloat(circunferenciaTorax) : undefined,
        cintura: circunferenciaCintura ? parseFloat(circunferenciaCintura) : undefined,
        abdomen: circunferenciaAbdomen ? parseFloat(circunferenciaAbdomen) : undefined,
        quadril: circunferenciaQuadril ? parseFloat(circunferenciaQuadril) : undefined,
        bracoDireito: circunferenciaBracoDireito ? parseFloat(circunferenciaBracoDireito) : undefined,
        bracoEsquerdo: circunferenciaBracoEsquerdo ? parseFloat(circunferenciaBracoEsquerdo) : undefined,
        coxaDireita: circunferenciaCoxaDireita ? parseFloat(circunferenciaCoxaDireita) : undefined,
        coxaEsquerda: circunferenciaCoxaEsquerda ? parseFloat(circunferenciaCoxaEsquerda) : undefined,
        panturrilhaDireita: circunferenciaPanturrilhaDireita ? parseFloat(circunferenciaPanturrilhaDireita) : undefined,
        panturrilhaEsquerda: circunferenciaPanturrilhaEsquerda ? parseFloat(circunferenciaPanturrilhaEsquerda) : undefined,
      },
      observacoes,
    };

    onSubmit(dados);
  };

  const imc = calcularIMC();
  const massaGorda = calcularMassaGorda();
  const massaMagra = calcularMassaMagra();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Seleção de Aluno */}
      {!alunoId && (
        <Card className="border-gray-800 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-white">Selecionar Aluno</CardTitle>
            <CardDescription>Escolha o aluno para realizar a avaliação</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedAlunoId} onValueChange={handleAlunoChange}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecione um aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos?.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.user_profile?.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Data da Avaliação */}
      <Card className="border-gray-800 bg-gray-900/50">
        <CardHeader>
          <CardTitle className="text-white">Data da Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="date"
            value={dataAvaliacao}
            onChange={(e) => setDataAvaliacao(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            required
          />
        </CardContent>
      </Card>

      {/* Dados Básicos */}
      <Collapsible open={secaoDadosBasicosAberta} onOpenChange={setSecaoDadosBasicosAberta}>
        <Card className="border-gray-800 bg-gray-900/50">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-white">Dados Básicos</CardTitle>
                </div>
                {secaoDadosBasicosAberta ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription className="text-left">
                Insira peso, altura, idade, gênero e percentual de gordura já calculado
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genero" className="text-gray-300">Gênero *</Label>
              <Select value={genero} onValueChange={(v) => setGenero(v as 'masculino' | 'feminino')}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="feminino">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idade" className="text-gray-300">Idade (anos) *</Label>
              <Input
                id="idade"
                type="number"
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                placeholder="Ex: 30"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="peso" className="text-gray-300">
                <Scale className="h-4 w-4 inline mr-1" />
                Peso (kg) *
              </Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="Ex: 75.5"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="altura" className="text-gray-300">
                <Ruler className="h-4 w-4 inline mr-1" />
                Altura (cm) *
              </Label>
              <Input
                id="altura"
                type="number"
                value={altura}
                onChange={(e) => setAltura(e.target.value)}
                placeholder="Ex: 175"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="percentualGordura" className="text-gray-300">
                <Activity className="h-4 w-4 inline mr-1" />
                % Gordura *
              </Label>
              <Input
                id="percentualGordura"
                type="number"
                step="0.1"
                value={percentualGordura}
                onChange={(e) => setPercentualGordura(e.target.value)}
                placeholder="Ex: 15.5"
                className="bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>
          </div>

          {/* Cálculos Automáticos */}
          {peso && altura && percentualGordura && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">IMC</p>
                <p className="text-lg font-bold text-white">{imc}</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Massa Magra</p>
                <p className="text-lg font-bold text-green-500">{massaMagra} kg</p>
              </div>
              <div className="bg-gray-800/50 p-3 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Massa Gorda</p>
                <p className="text-lg font-bold text-red-500">{massaGorda} kg</p>
              </div>
            </div>
          )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Circunferências (Opcional) */}
      <Collapsible open={secaoCircunferenciasAberta} onOpenChange={setSecaoCircunferenciasAberta}>
        <Card className="border-gray-800 bg-gray-900/50">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-white">Circunferências (Opcional)</CardTitle>
                </div>
                {secaoCircunferenciasAberta ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription className="text-left">
                Medidas em centímetros para acompanhamento de evolução
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
            {/* Tronco */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Tronco</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="torax" className="text-gray-400 text-xs">Tórax (cm)</Label>
                  <Input
                    id="torax"
                    type="number"
                    step="0.1"
                    value={circunferenciaTorax}
                    onChange={(e) => setCircunferenciaTorax(e.target.value)}
                    placeholder="Ex: 95.5"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cintura" className="text-gray-400 text-xs">Cintura (cm)</Label>
                  <Input
                    id="cintura"
                    type="number"
                    step="0.1"
                    value={circunferenciaCintura}
                    onChange={(e) => setCircunferenciaCintura(e.target.value)}
                    placeholder="Ex: 80.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="abdomen" className="text-gray-400 text-xs">Abdômen (cm)</Label>
                  <Input
                    id="abdomen"
                    type="number"
                    step="0.1"
                    value={circunferenciaAbdomen}
                    onChange={(e) => setCircunferenciaAbdomen(e.target.value)}
                    placeholder="Ex: 85.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quadril" className="text-gray-400 text-xs">Quadril (cm)</Label>
                  <Input
                    id="quadril"
                    type="number"
                    step="0.1"
                    value={circunferenciaQuadril}
                    onChange={(e) => setCircunferenciaQuadril(e.target.value)}
                    placeholder="Ex: 95.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Membros Superiores */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Membros Superiores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bracoDireito" className="text-gray-400 text-xs">Braço Direito (cm)</Label>
                  <Input
                    id="bracoDireito"
                    type="number"
                    step="0.1"
                    value={circunferenciaBracoDireito}
                    onChange={(e) => setCircunferenciaBracoDireito(e.target.value)}
                    placeholder="Ex: 35.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bracoEsquerdo" className="text-gray-400 text-xs">Braço Esquerdo (cm)</Label>
                  <Input
                    id="bracoEsquerdo"
                    type="number"
                    step="0.1"
                    value={circunferenciaBracoEsquerdo}
                    onChange={(e) => setCircunferenciaBracoEsquerdo(e.target.value)}
                    placeholder="Ex: 35.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>

            {/* Membros Inferiores */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300">Membros Inferiores</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="coxaDireita" className="text-gray-400 text-xs">Coxa Direita (cm)</Label>
                  <Input
                    id="coxaDireita"
                    type="number"
                    step="0.1"
                    value={circunferenciaCoxaDireita}
                    onChange={(e) => setCircunferenciaCoxaDireita(e.target.value)}
                    placeholder="Ex: 55.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coxaEsquerda" className="text-gray-400 text-xs">Coxa Esquerda (cm)</Label>
                  <Input
                    id="coxaEsquerda"
                    type="number"
                    step="0.1"
                    value={circunferenciaCoxaEsquerda}
                    onChange={(e) => setCircunferenciaCoxaEsquerda(e.target.value)}
                    placeholder="Ex: 55.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panturrilhaDireita" className="text-gray-400 text-xs">Panturrilha Direita (cm)</Label>
                  <Input
                    id="panturrilhaDireita"
                    type="number"
                    step="0.1"
                    value={circunferenciaPanturrilhaDireita}
                    onChange={(e) => setCircunferenciaPanturrilhaDireita(e.target.value)}
                    placeholder="Ex: 38.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="panturrilhaEsquerda" className="text-gray-400 text-xs">Panturrilha Esquerda (cm)</Label>
                  <Input
                    id="panturrilhaEsquerda"
                    type="number"
                    step="0.1"
                    value={circunferenciaPanturrilhaEsquerda}
                    onChange={(e) => setCircunferenciaPanturrilhaEsquerda(e.target.value)}
                    placeholder="Ex: 38.0"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Observações */}
      <Collapsible open={secaoObservacoesAberta} onOpenChange={setSecaoObservacoesAberta}>
        <Card className="border-gray-800 bg-gray-900/50">
          <CollapsibleTrigger className="w-full">
            <CardHeader className="cursor-pointer hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Observações</CardTitle>
                {secaoObservacoesAberta ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <CardDescription className="text-left">
                Informações adicionais sobre a avaliação
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
          <Textarea
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            placeholder="Ex: Cliente relatou dificuldade em manter dieta nos finais de semana..."
            className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
          />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onVoltar}
          className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          Voltar
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
        >
          Continuar
        </Button>
      </div>
    </form>
  );
}
