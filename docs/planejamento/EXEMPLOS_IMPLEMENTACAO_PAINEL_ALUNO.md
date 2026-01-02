# 💻 EXEMPLOS DE IMPLEMENTAÇÃO - PAINEL DO ALUNO

**Complemento ao:** PLANEJAMENTO_PAINEL_ALUNO_COMPLETO.md  
**Versão:** 1.0  
**Data:** 07/12/2025

---

## 📑 ÍNDICE

1. [Componentes Reutilizáveis](#1-componentes-reutilizáveis)
2. [Hooks Customizados](#2-hooks-customizados)
3. [Páginas Completas](#3-páginas-completas)
4. [Utilitários](#4-utilitários)

---

## 1. COMPONENTES REUTILIZÁVEIS

### 1.1 TreinoCard.tsx

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dumbbell, Calendar, Target, Play } from "lucide-react";
import { FichaAluno, FichaTreino } from "@shared/schema";

interface TreinoCardProps {
  ficha: FichaAluno & { fichas_treino: FichaTreino & { exercicios_ficha: any[] } };
  onIniciar: (fichaId: string) => void;
  showProgress?: boolean;
  progressoAtual?: number;
  progressoTotal?: number;
}

export function TreinoCard({ 
  ficha, 
  onIniciar, 
  showProgress = false,
  progressoAtual = 0,
  progressoTotal = 0
}: TreinoCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pausado": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "concluido": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const progressoPercentual = progressoTotal > 0 
    ? Math.round((progressoAtual / progressoTotal) * 100) 
    : 0;

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="h-6 w-6 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-gray-100 text-lg">
                {ficha.fichas_treino?.nome}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-1">
                {ficha.fichas_treino?.descricao}
              </p>
            </div>
          </div>
          <Badge variant="outline" className={getStatusColor(ficha.status)}>
            {ficha.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info da Ficha */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Término</p>
              <p className="text-gray-300">
                {new Date(ficha.data_fim).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Objetivo</p>
              <p className="text-gray-300 capitalize">
                {ficha.fichas_treino?.objetivo || "-"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Dumbbell className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-gray-500 text-xs">Exercícios</p>
              <p className="text-gray-300">
                {ficha.fichas_treino?.exercicios_ficha?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Barra de Progresso */}
        {showProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progresso</span>
              <span className="text-gray-300 font-medium">{progressoPercentual}%</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progressoPercentual}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {progressoAtual} de {progressoTotal} exercícios concluídos
            </p>
          </div>
        )}

        {/* Botão Iniciar */}
        <Button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-6"
          onClick={() => onIniciar(ficha.id)}
        >
          <Play className="h-5 w-5 mr-2" />
          Iniciar Treino
        </Button>
      </CardContent>
    </Card>
  );
}
```



### 1.2 GraficoEvolucao.tsx

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

interface DadoGrafico {
  data: string;
  valor: number;
  dataFormatada?: string;
}

interface GraficoEvolucaoProps {
  dados: DadoGrafico[];
  metrica: string;
  unidade: string;
  meta?: number;
  titulo?: string;
}

export function GraficoEvolucao({ 
  dados, 
  metrica, 
  unidade, 
  meta,
  titulo = "Evolução"
}: GraficoEvolucaoProps) {
  const [periodo, setPeriodo] = useState<"1m" | "3m" | "6m" | "1a" | "todos">("3m");

  // Filtrar dados por período
  const filtrarPorPeriodo = (dados: DadoGrafico[]) => {
    const hoje = new Date();
    const mesesAtras = {
      "1m": 1,
      "3m": 3,
      "6m": 6,
      "1a": 12,
      "todos": 999
    };

    const dataLimite = new Date();
    dataLimite.setMonth(hoje.getMonth() - mesesAtras[periodo]);

    return dados.filter(d => new Date(d.data) >= dataLimite);
  };

  const dadosFiltrados = filtrarPorPeriodo(dados).map(d => ({
    ...d,
    dataFormatada: new Date(d.data).toLocaleDateString("pt-BR", { 
      day: "2-digit", 
      month: "short" 
    })
  }));

  // Calcular tendência
  const calcularTendencia = () => {
    if (dadosFiltrados.length < 2) return { tipo: "neutro", percentual: 0 };
    
    const primeiro = dadosFiltrados[0].valor;
    const ultimo = dadosFiltrados[dadosFiltrados.length - 1].valor;
    const diferenca = ultimo - primeiro;
    const percentual = ((diferenca / primeiro) * 100).toFixed(1);

    if (diferenca > 0) return { tipo: "alta", percentual: `+${percentual}` };
    if (diferenca < 0) return { tipo: "baixa", percentual };
    return { tipo: "neutro", percentual: "0" };
  };

  const tendencia = calcularTendencia();

  const getTendenciaIcon = () => {
    switch (tendencia.tipo) {
      case "alta": return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "baixa": return <TrendingDown className="h-5 w-5 text-red-500" />;
      default: return <Minus className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTendenciaColor = () => {
    switch (tendencia.tipo) {
      case "alta": return "text-green-500";
      case "baixa": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-100">{titulo}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              {getTendenciaIcon()}
              <span className={`text-sm font-medium ${getTendenciaColor()}`}>
                {tendencia.percentual}%
              </span>
              <span className="text-sm text-gray-400">no período</span>
            </div>
          </div>
          
          {/* Filtros de Período */}
          <div className="flex gap-1">
            {(["1m", "3m", "6m", "1a", "todos"] as const).map((p) => (
              <Button
                key={p}
                variant={periodo === p ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriodo(p)}
                className={periodo === p ? "bg-blue-500" : ""}
              >
                {p === "todos" ? "Todos" : p.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {dadosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            Sem dados para o período selecionado
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosFiltrados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="dataFormatada" 
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
              />
              <YAxis 
                stroke="#9CA3AF"
                style={{ fontSize: "12px" }}
                label={{ 
                  value: unidade, 
                  angle: -90, 
                  position: "insideLeft",
                  style: { fill: "#9CA3AF" }
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "#1F2937", 
                  border: "1px solid #374151",
                  borderRadius: "8px"
                }}
                labelStyle={{ color: "#F3F4F6" }}
              />
              
              {/* Linha de Meta */}
              {meta && (
                <ReferenceLine 
                  y={meta} 
                  stroke="#EF4444" 
                  strokeDasharray="5 5"
                  label={{ 
                    value: `Meta: ${meta}${unidade}`, 
                    fill: "#EF4444",
                    position: "right"
                  }}
                />
              )}
              
              {/* Linha de Dados */}
              <Line 
                type="monotone" 
                dataKey="valor" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: "#3B82F6", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Estatísticas */}
        {dadosFiltrados.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-800">
            <div className="text-center">
              <p className="text-xs text-gray-400">Mínimo</p>
              <p className="text-lg font-bold text-gray-100">
                {Math.min(...dadosFiltrados.map(d => d.valor)).toFixed(1)}{unidade}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Média</p>
              <p className="text-lg font-bold text-gray-100">
                {(dadosFiltrados.reduce((acc, d) => acc + d.valor, 0) / dadosFiltrados.length).toFixed(1)}{unidade}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Máximo</p>
              <p className="text-lg font-bold text-gray-100">
                {Math.max(...dadosFiltrados.map(d => d.valor)).toFixed(1)}{unidade}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```



### 1.3 RegistroSerieModal.tsx

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExercicioFicha } from "@shared/schema";
import { useState } from "react";
import { Dumbbell, Hash, Weight } from "lucide-react";

interface RegistroSerieModalProps {
  exercicio: ExercicioFicha;
  numeroSerie: number;
  onSalvar: (dados: { carga: string; repeticoes: number }) => void;
  onFechar: () => void;
  isOpen: boolean;
}

export function RegistroSerieModal({
  exercicio,
  numeroSerie,
  onSalvar,
  onFechar,
  isOpen
}: RegistroSerieModalProps) {
  const [carga, setCarga] = useState("");
  const [repeticoes, setRepeticoes] = useState("");

  const handleSalvar = () => {
    if (!carga || !repeticoes) return;
    
    onSalvar({
      carga,
      repeticoes: parseInt(repeticoes)
    });
    
    // Limpar campos
    setCarga("");
    setRepeticoes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onFechar}>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-100 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-blue-500" />
            Registrar Série {numeroSerie}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Info do Exercício */}
          <div className="p-3 bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-100">{exercicio.nome}</h4>
            <p className="text-sm text-gray-400 mt-1">
              {exercicio.series} séries × {exercicio.repeticoes} reps
            </p>
          </div>

          {/* Input de Carga */}
          <div className="space-y-2">
            <Label htmlFor="carga" className="text-gray-300 flex items-center gap-2">
              <Weight className="h-4 w-4" />
              Carga (kg)
            </Label>
            <Input
              id="carga"
              type="number"
              step="0.5"
              placeholder="Ex: 20"
              value={carga}
              onChange={(e) => setCarga(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
              autoFocus
            />
          </div>

          {/* Input de Repetições */}
          <div className="space-y-2">
            <Label htmlFor="repeticoes" className="text-gray-300 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Repetições
            </Label>
            <Input
              id="repeticoes"
              type="number"
              placeholder="Ex: 12"
              value={repeticoes}
              onChange={(e) => setRepeticoes(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onFechar}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              disabled={!carga || !repeticoes}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              Salvar Série
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 2. HOOKS CUSTOMIZADOS

### 2.1 useTreinosRealizados.ts

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface RegistrarTreinoData {
  fichaAlunoId: string;
  exercicioId: string;
  series: Array<{
    numeroSerie: number;
    carga: string;
    repeticoes: number;
  }>;
}

// Registrar treino realizado
export function useRegistrarTreino() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: RegistrarTreinoData) => {
      // 1. Criar treino_realizado
      const { data: treino, error: treinoError } = await supabase
        .from('treinos_realizados')
        .insert({
          ficha_aluno_id: dados.fichaAlunoId,
          exercicio_id: dados.exercicioId,
          data_realizacao: new Date().toISOString(),
          series_realizadas: dados.series.length,
        })
        .select()
        .single();

      if (treinoError) throw treinoError;

      // 2. Criar series_realizadas
      const series = dados.series.map(s => ({
        treino_realizado_id: treino.id,
        numero_serie: s.numeroSerie,
        carga: s.carga,
        repeticoes: s.repeticoes,
        concluida: 'true',
      }));

      const { error: seriesError } = await supabase
        .from('series_realizadas')
        .insert(series);

      if (seriesError) throw seriesError;

      return treino;
    },
    onSuccess: (_, variables) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['historico-treinos', variables.fichaAlunoId] });
      queryClient.invalidateQueries({ queryKey: ['estatisticas-treino', variables.fichaAlunoId] });
    },
  });
}

// Buscar histórico de treinos
export function useHistoricoTreinos(fichaAlunoId: string | undefined) {
  return useQuery({
    queryKey: ['historico-treinos', fichaAlunoId],
    queryFn: async () => {
      if (!fichaAlunoId) return [];

      const { data, error } = await supabase
        .from('treinos_realizados')
        .select(`
          *,
          exercicios_ficha:exercicio_id(
            nome,
            grupo_muscular
          ),
          series_realizadas(*)
        `)
        .eq('ficha_aluno_id', fichaAlunoId)
        .order('data_realizacao', { ascending: false });

      if (error) throw error;

      // Agrupar por data
      const treinosPorData = data?.reduce((acc: any, treino: any) => {
        const data = new Date(treino.data_realizacao).toLocaleDateString("pt-BR");
        if (!acc[data]) {
          acc[data] = {
            data: treino.data_realizacao,
            exercicios: [],
          };
        }
        acc[data].exercicios.push(treino);
        return acc;
      }, {});

      return Object.values(treinosPorData || {});
    },
    enabled: !!fichaAlunoId,
  });
}

// Estatísticas de treino
export function useEstatisticasTreino(fichaAlunoId: string | undefined) {
  return useQuery({
    queryKey: ['estatisticas-treino', fichaAlunoId],
    queryFn: async () => {
      if (!fichaAlunoId) return null;

      const { data, error } = await supabase
        .from('treinos_realizados')
        .select('*, series_realizadas(*)')
        .eq('ficha_aluno_id', fichaAlunoId);

      if (error) throw error;

      // Calcular estatísticas
      const totalTreinos = data.length;
      const totalSeries = data.reduce((acc, t) => acc + (t.series_realizadas?.length || 0), 0);
      
      const volumeTotal = data.reduce((acc, t) => {
        return acc + (t.series_realizadas || []).reduce((sum: number, s: any) => {
          const peso = parseFloat(s.carga) || 0;
          return sum + (peso * s.repeticoes);
        }, 0);
      }, 0);

      // Exercício mais realizado
      const exerciciosCount: Record<string, number> = {};
      data.forEach(t => {
        const id = t.exercicio_id;
        exerciciosCount[id] = (exerciciosCount[id] || 0) + 1;
      });

      const exercicioMaisRealizado = Object.entries(exerciciosCount)
        .sort(([, a], [, b]) => b - a)[0];

      return {
        totalTreinos,
        totalSeries,
        volumeTotal: Math.round(volumeTotal),
        exercicioMaisRealizado: exercicioMaisRealizado?.[0],
        frequenciaExercicio: exercicioMaisRealizado?.[1] || 0,
      };
    },
    enabled: !!fichaAlunoId,
  });
}

// Último treino realizado
export function useUltimoTreino(fichaAlunoId: string | undefined) {
  return useQuery({
    queryKey: ['ultimo-treino', fichaAlunoId],
    queryFn: async () => {
      if (!fichaAlunoId) return null;

      const { data, error } = await supabase
        .from('treinos_realizados')
        .select(`
          *,
          exercicios_ficha:exercicio_id(nome),
          series_realizadas(*)
        `)
        .eq('ficha_aluno_id', fichaAlunoId)
        .order('data_realizacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!fichaAlunoId,
  });
}
```



### 2.2 useMetasAluno.ts

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Buscar metas do aluno
export function useMetasAluno(alunoId: string | undefined) {
  return useQuery({
    queryKey: ['metas-aluno', alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from('metas_avaliacoes')
        .select('*')
        .eq('aluno_id', alunoId)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Calcular progresso de uma meta
export function useProgressoMeta(metaId: string | undefined, alunoId: string | undefined) {
  return useQuery({
    queryKey: ['progresso-meta', metaId],
    queryFn: async () => {
      if (!metaId || !alunoId) return null;

      // Buscar meta
      const { data: meta, error: metaError } = await supabase
        .from('metas_avaliacoes')
        .select('*')
        .eq('id', metaId)
        .single();

      if (metaError) throw metaError;

      // Buscar avaliações no período
      const { data: avaliacoes, error: avalError } = await supabase
        .from('avaliacoes_fisicas')
        .select('peso, percentual_gordura, massa_magra, data_avaliacao')
        .eq('aluno_id', alunoId)
        .gte('data_avaliacao', meta.data_inicio)
        .order('data_avaliacao', { ascending: true });

      if (avalError) throw avalError;

      if (!avaliacoes || avaliacoes.length === 0) {
        return {
          meta,
          avaliacoes: [],
          progressoPeso: 0,
          progressoGordura: 0,
          progressoMassaMagra: 0,
          diasDecorridos: 0,
          diasRestantes: 0,
          previsaoAtingimento: null,
        };
      }

      // Calcular progresso
      const primeira = avaliacoes[0];
      const ultima = avaliacoes[avaliacoes.length - 1];

      const calcularProgresso = (inicial: number, atual: number, alvo: number) => {
        const totalMudanca = alvo - inicial;
        const mudancaAtual = atual - inicial;
        return totalMudanca !== 0 ? (mudancaAtual / totalMudanca) * 100 : 0;
      };

      const progressoPeso = meta.peso_alvo 
        ? calcularProgresso(
            parseFloat(primeira.peso || '0'),
            parseFloat(ultima.peso || '0'),
            parseFloat(meta.peso_alvo)
          )
        : 0;

      const progressoGordura = meta.percentual_gordura_alvo
        ? calcularProgresso(
            parseFloat(primeira.percentual_gordura || '0'),
            parseFloat(ultima.percentual_gordura || '0'),
            parseFloat(meta.percentual_gordura_alvo)
          )
        : 0;

      const progressoMassaMagra = meta.massa_magra_alvo
        ? calcularProgresso(
            parseFloat(primeira.massa_magra || '0'),
            parseFloat(ultima.massa_magra || '0'),
            parseFloat(meta.massa_magra_alvo)
          )
        : 0;

      // Calcular dias
      const hoje = new Date();
      const dataInicio = new Date(meta.data_inicio);
      const dataAlvo = new Date(meta.data_alvo);
      
      const diasDecorridos = Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
      const diasRestantes = Math.floor((dataAlvo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

      // Previsão de atingimento (baseado em progresso linear)
      const progressoMedio = (progressoPeso + progressoGordura + progressoMassaMagra) / 3;
      const taxaDiaria = progressoMedio / diasDecorridos;
      const diasNecessarios = (100 - progressoMedio) / taxaDiaria;
      const previsaoAtingimento = new Date(hoje.getTime() + (diasNecessarios * 24 * 60 * 60 * 1000));

      return {
        meta,
        avaliacoes,
        progressoPeso: Math.round(progressoPeso),
        progressoGordura: Math.round(progressoGordura),
        progressoMassaMagra: Math.round(progressoMassaMagra),
        progressoMedio: Math.round(progressoMedio),
        diasDecorridos,
        diasRestantes,
        previsaoAtingimento: diasNecessarios > 0 ? previsaoAtingimento : null,
      };
    },
    enabled: !!metaId && !!alunoId,
  });
}
```

---

## 3. PÁGINAS COMPLETAS

### 3.1 AvaliacoesFisicas.tsx

```typescript
import { useState } from "react";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAlunoProfile } from "@/hooks/useAlunoData";
import { useAvaliacoesFisicasAluno, useAvaliacaoFixada } from "@/hooks/useAvaliacoesFisicasAluno";
import { GraficoEvolucao } from "@/components/aluno/GraficoEvolucao";
import { 
  Activity, 
  Loader2, 
  TrendingUp, 
  Weight, 
  Ruler, 
  Percent,
  Calendar,
  Pin
} from "lucide-react";

export default function AvaliacoesFisicas() {
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const { data: avaliacoes, isLoading: loadingAvaliacoes } = useAvaliacoesFisicasAluno(alunoId);
  const { data: avaliacaoFixada } = useAvaliacaoFixada(alunoId);
  
  const [metricaSelecionada, setMetricaSelecionada] = useState<"peso" | "percentual_gordura" | "massa_magra">("peso");

  if (loadingProfile || loadingAvaliacoes) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  // Preparar dados para gráfico
  const dadosGrafico = avaliacoes?.map(av => ({
    data: av.data_avaliacao,
    valor: parseFloat(av[metricaSelecionada] || '0')
  })) || [];

  const getUnidade = () => {
    switch (metricaSelecionada) {
      case "peso": return "kg";
      case "percentual_gordura": return "%";
      case "massa_magra": return "kg";
    }
  };

  const getMetricaNome = () => {
    switch (metricaSelecionada) {
      case "peso": return "Peso";
      case "percentual_gordura": return "% Gordura";
      case "massa_magra": return "Massa Magra";
    }
  };

  return (
    <AlunoLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Avaliações Físicas</h1>
          <p className="text-gray-400 mt-1">
            Acompanhe sua evolução física
          </p>
        </div>

        {/* Avaliação Fixada */}
        {avaliacaoFixada && (
          <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-100 flex items-center gap-2">
                  <Pin className="h-5 w-5 text-blue-500" />
                  Avaliação Atual
                </CardTitle>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Fixada
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Weight className="h-4 w-4 text-blue-500" />
                    <span className="text-xs text-gray-400">Peso</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-100">
                    {avaliacaoFixada.peso}kg
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-4 w-4 text-orange-500" />
                    <span className="text-xs text-gray-400">% Gordura</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-100">
                    {avaliacaoFixada.percentual_gordura}%
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-gray-400">Massa Magra</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-100">
                    {avaliacaoFixada.massa_magra}kg
                  </p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Ruler className="h-4 w-4 text-purple-500" />
                    <span className="text-xs text-gray-400">IMC</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-100">
                    {avaliacaoFixada.imc}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Avaliação de {new Date(avaliacaoFixada.data_avaliacao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seletor de Métrica */}
        <div className="flex gap-2">
          <Button
            variant={metricaSelecionada === "peso" ? "default" : "outline"}
            onClick={() => setMetricaSelecionada("peso")}
            className={metricaSelecionada === "peso" ? "bg-blue-500" : ""}
          >
            Peso
          </Button>
          <Button
            variant={metricaSelecionada === "percentual_gordura" ? "default" : "outline"}
            onClick={() => setMetricaSelecionada("percentual_gordura")}
            className={metricaSelecionada === "percentual_gordura" ? "bg-blue-500" : ""}
          >
            % Gordura
          </Button>
          <Button
            variant={metricaSelecionada === "massa_magra" ? "default" : "outline"}
            onClick={() => setMetricaSelecionada("massa_magra")}
            className={metricaSelecionada === "massa_magra" ? "bg-blue-500" : ""}
          >
            Massa Magra
          </Button>
        </div>

        {/* Gráfico de Evolução */}
        <GraficoEvolucao
          dados={dadosGrafico}
          metrica={getMetricaNome()}
          unidade={getUnidade()}
          titulo={`Evolução de ${getMetricaNome()}`}
        />

        {/* Lista de Avaliações */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-100">Histórico de Avaliações</h2>
          {avaliacoes && avaliacoes.length > 0 ? (
            <div className="grid gap-4">
              {avaliacoes.map((avaliacao) => (
                <Card key={avaliacao.id} className="bg-gray-900 border-gray-800">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-gray-100 text-lg">
                            {new Date(avaliacao.data_avaliacao).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric"
                            })}
                          </CardTitle>
                          <p className="text-sm text-gray-400 mt-1">
                            Protocolo: {avaliacao.protocolo || "Manual"}
                          </p>
                        </div>
                      </div>
                      {avaliacao.fixada && (
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                          <Pin className="h-3 w-3 mr-1" />
                          Fixada
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {avaliacao.peso && (
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400">Peso</p>
                          <p className="text-lg font-bold text-gray-100">{avaliacao.peso}kg</p>
                        </div>
                      )}
                      {avaliacao.percentual_gordura && (
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400">% Gordura</p>
                          <p className="text-lg font-bold text-gray-100">{avaliacao.percentual_gordura}%</p>
                        </div>
                      )}
                      {avaliacao.massa_magra && (
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400">Massa Magra</p>
                          <p className="text-lg font-bold text-gray-100">{avaliacao.massa_magra}kg</p>
                        </div>
                      )}
                      {avaliacao.imc && (
                        <div className="text-center p-3 bg-gray-800 rounded-lg">
                          <p className="text-xs text-gray-400">IMC</p>
                          <p className="text-lg font-bold text-gray-100">{avaliacao.imc}</p>
                        </div>
                      )}
                    </div>
                    {avaliacao.observacoes && (
                      <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-gray-300">{avaliacao.observacoes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-12">
                <div className="text-center">
                  <Activity className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">
                    Nenhuma avaliação física registrada
                  </h3>
                  <p className="text-gray-400">
                    Aguarde seu treinador realizar sua primeira avaliação física.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AlunoLayout>
  );
}
```

---

## 4. UTILITÁRIOS

### 4.1 Cálculos de Avaliação Física

```typescript
// lib/avaliacaoCalculos.ts

export function calcularIMC(peso: number, altura: number): number {
  // altura em cm, converter para metros
  const alturaMetros = altura / 100;
  return peso / (alturaMetros * alturaMetros);
}

export function classificarIMC(imc: number): string {
  if (imc < 18.5) return "Abaixo do peso";
  if (imc < 25) return "Peso normal";
  if (imc < 30) return "Sobrepeso";
  if (imc < 35) return "Obesidade Grau I";
  if (imc < 40) return "Obesidade Grau II";
  return "Obesidade Grau III";
}

export function classificarGordura(percentual: number, genero: string): string {
  if (genero === "masculino") {
    if (percentual < 6) return "Essencial";
    if (percentual < 14) return "Atleta";
    if (percentual < 18) return "Fitness";
    if (percentual < 25) return "Aceitável";
    return "Obesidade";
  } else {
    if (percentual < 14) return "Essencial";
    if (percentual < 21) return "Atleta";
    if (percentual < 25) return "Fitness";
    if (percentual < 32) return "Aceitável";
    return "Obesidade";
  }
}

export function calcularMassaMagra(peso: number, percentualGordura: number): number {
  return peso * (1 - percentualGordura / 100);
}

export function calcularMassaGorda(peso: number, percentualGordura: number): number {
  return peso * (percentualGordura / 100);
}

export function calcularPesoIdeal(altura: number, genero: string): number {
  // Fórmula de Devine
  const alturaPolegadas = altura / 2.54;
  if (genero === "masculino") {
    return 50 + 2.3 * (alturaPolegadas - 60);
  } else {
    return 45.5 + 2.3 * (alturaPolegadas - 60);
  }
}
```

---

**Fim dos Exemplos de Implementação**

Este documento fornece exemplos práticos e prontos para uso na implementação do Painel do Aluno. Todos os componentes seguem os padrões estabelecidos no projeto e podem ser adaptados conforme necessário.

