import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface MetricasAluno {
  alunoId: string;
  nome: string;
  fotoUrl: string | null;
  email: string;
  
  // Semana Atual
  diasTreinadosSemana: number;
  treinosRealizadosSemana: number;
  exerciciosCompletadosSemana: number;
  
  // Histórico
  sequenciaAtual: number;
  melhorSequencia: number;
  totalTreinosRealizados: number;
  
  // Engajamento
  taxaFrequencia: number;
  mediaExerciciosPorTreino: number;
  ultimoTreino: Date | null;
}

export interface AlunoDestaque {
  posicao: number;
  alunoId: string;
  nome: string;
  fotoUrl: string | null;
  pontuacao: number;
  diasTreinados: number;
  treinosRealizados: number;
  badge: 'ouro' | 'prata' | 'bronze' | 'fogo' | null;
}

// Funções auxiliares
function getInicioSemana(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay();
  const inicio = new Date(hoje);
  inicio.setDate(hoje.getDate() - diaSemana);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function getFimSemana(): Date {
  const inicio = getInicioSemana();
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  fim.setHours(23, 59, 59, 999);
  return fim;
}

// Buscar métricas de um aluno específico
async function buscarMetricasAluno(alunoId: string): Promise<MetricasAluno> {
  const inicioSemana = getInicioSemana();
  const fimSemana = getFimSemana();
  
  // 1. Buscar dados do aluno
  const { data: alunoData } = await supabase
    .from('alunos')
    .select(`
      id,
      users_profile!inner(nome, foto_url, email)
    `)
    .eq('id', alunoId)
    .single();
  
  if (!alunoData) {
    throw new Error('Aluno não encontrado');
  }
  
  // Garantir que users_profile não é um array
  const profile = Array.isArray(alunoData.users_profile) 
    ? alunoData.users_profile[0] 
    : alunoData.users_profile;
  
  // 2. Buscar fichas do aluno
  const { data: fichas } = await supabase
    .from('fichas_alunos')
    .select('id')
    .eq('aluno_id', alunoId);
  
  const fichaIds = fichas?.map(f => f.id) || [];
  
  if (fichaIds.length === 0) {
    return {
      alunoId,
      nome: profile.nome,
      fotoUrl: profile.foto_url,
      email: profile.email,
      diasTreinadosSemana: 0,
      treinosRealizadosSemana: 0,
      exerciciosCompletadosSemana: 0,
      sequenciaAtual: 0,
      melhorSequencia: 0,
      totalTreinosRealizados: 0,
      taxaFrequencia: 0,
      mediaExerciciosPorTreino: 0,
      ultimoTreino: null
    };
  }
  
  // 3. Buscar treinos realizados na semana
  const { data: treinosSemana } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao, exercicio_id')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', inicioSemana.toISOString())
    .lte('data_realizacao', fimSemana.toISOString());
  
  // 4. Buscar todos os treinos (últimos 90 dias para calcular sequências)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 90);
  
  const { data: todosTreinos } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', dataLimite.toISOString())
    .order('data_realizacao', { ascending: false });
  
  // 5. Calcular métricas da semana
  const diasUnicos = new Set<string>();
  treinosSemana?.forEach(treino => {
    const data = new Date(treino.data_realizacao);
    diasUnicos.add(data.toDateString());
  });
  
  const diasTreinadosSemana = diasUnicos.size;
  const treinosRealizadosSemana = treinosSemana?.length || 0;
  const exerciciosCompletadosSemana = treinosSemana?.length || 0;
  
  // 6. Calcular sequências
  const diasTreinados = Array.from(
    new Set(todosTreinos?.map(t => new Date(t.data_realizacao).toDateString()))
  ).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());
  
  let sequenciaAtual = 0;
  let melhorSequencia = 0;
  let sequenciaTemp = 0;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 90; i++) {
    const dia = new Date(hoje);
    dia.setDate(hoje.getDate() - i);
    
    const treinouNesteDia = diasTreinados.some(d => 
      d.toDateString() === dia.toDateString()
    );
    
    if (treinouNesteDia) {
      sequenciaTemp++;
      if (i === 0 || sequenciaAtual > 0) {
        sequenciaAtual = sequenciaTemp;
      }
      melhorSequencia = Math.max(melhorSequencia, sequenciaTemp);
    } else {
      if (sequenciaAtual > 0) break;
      sequenciaTemp = 0;
    }
  }
  
  // 7. Calcular outras métricas
  const totalTreinosRealizados = todosTreinos?.length || 0;
  const taxaFrequencia = (diasTreinadosSemana / 7) * 100;
  const mediaExerciciosPorTreino = diasTreinadosSemana > 0 
    ? exerciciosCompletadosSemana / diasTreinadosSemana 
    : 0;
  
  const ultimoTreino = todosTreinos && todosTreinos.length > 0
    ? new Date(todosTreinos[0].data_realizacao)
    : null;
  
  return {
    alunoId,
    nome: profile.nome,
    fotoUrl: profile.foto_url,
    email: profile.email,
    diasTreinadosSemana,
    treinosRealizadosSemana,
    exerciciosCompletadosSemana,
    sequenciaAtual,
    melhorSequencia,
    totalTreinosRealizados,
    taxaFrequencia,
    mediaExerciciosPorTreino,
    ultimoTreino
  };
}

// Hook: Buscar progresso de todos os alunos
export function useProgressoTreinos() {
  return useQuery<MetricasAluno[]>({
    queryKey: ['progresso-treinos'],
    queryFn: async () => {
      // 1. Buscar todos os alunos ativos
      const { data: alunos, error } = await supabase
        .from('alunos')
        .select('id')
        .eq('status', 'ativo');
      
      if (error) throw error;
      if (!alunos || alunos.length === 0) return [];
      
      // 2. Buscar métricas de cada aluno
      const metricas = await Promise.all(
        alunos.map(aluno => buscarMetricasAluno(aluno.id))
      );
      
      return metricas;
    },
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
}

// Hook: Buscar progresso de um aluno específico
export function useProgressoAluno(alunoId: string) {
  return useQuery<MetricasAluno>({
    queryKey: ['progresso-aluno', alunoId],
    queryFn: () => buscarMetricasAluno(alunoId),
    enabled: !!alunoId,
    staleTime: 1000 * 60 * 5
  });
}

// Hook: Buscar ranking semanal
export function useRankingSemanal(criterio: 'dias' | 'treinos' | 'exercicios' = 'dias') {
  return useQuery<AlunoDestaque[]>({
    queryKey: ['ranking-semanal', criterio],
    queryFn: async () => {
      // 1. Buscar todos os alunos ativos
      const { data: alunos } = await supabase
        .from('alunos')
        .select('id')
        .eq('status', 'ativo');
      
      if (!alunos || alunos.length === 0) return [];
      
      // 2. Buscar métricas de cada aluno
      const metricas = await Promise.all(
        alunos.map(aluno => buscarMetricasAluno(aluno.id))
      );
      
      // 3. Ordenar por critério
      const ordenado = metricas.sort((a, b) => {
        if (criterio === 'dias') {
          return b.diasTreinadosSemana - a.diasTreinadosSemana;
        } else if (criterio === 'treinos') {
          return b.treinosRealizadosSemana - a.treinosRealizadosSemana;
        } else {
          return b.exerciciosCompletadosSemana - a.exerciciosCompletadosSemana;
        }
      });
      
      // 4. Criar ranking com badges
      const ranking: AlunoDestaque[] = ordenado.map((aluno, index) => {
        let badge: 'ouro' | 'prata' | 'bronze' | 'fogo' | null = null;
        
        if (index === 0) badge = 'ouro';
        else if (index === 1) badge = 'prata';
        else if (index === 2) badge = 'bronze';
        else if (aluno.diasTreinadosSemana >= 5) badge = 'fogo';
        
        const pontuacao = criterio === 'dias' 
          ? aluno.diasTreinadosSemana
          : criterio === 'treinos'
          ? aluno.treinosRealizadosSemana
          : aluno.exerciciosCompletadosSemana;
        
        return {
          posicao: index + 1,
          alunoId: aluno.alunoId,
          nome: aluno.nome,
          fotoUrl: aluno.fotoUrl,
          pontuacao,
          diasTreinados: aluno.diasTreinadosSemana,
          treinosRealizados: aluno.treinosRealizadosSemana,
          badge
        };
      });
      
      // 5. Retornar top 10
      return ranking.slice(0, 10);
    },
    staleTime: 1000 * 60 * 5
  });
}

// Hook: Buscar histórico de treinos do aluno
export function useHistoricoTreinos(alunoId: string, dias: number = 30) {
  return useQuery({
    queryKey: ['historico-treinos', alunoId, dias],
    queryFn: async () => {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - dias);
      
      // Buscar fichas do aluno
      const { data: fichas } = await supabase
        .from('fichas_alunos')
        .select('id')
        .eq('aluno_id', alunoId);
      
      const fichaIds = fichas?.map(f => f.id) || [];
      
      if (fichaIds.length === 0) return [];
      
      // Buscar treinos realizados
      const { data: treinos } = await supabase
        .from('treinos_realizados')
        .select(`
          id,
          data_realizacao,
          series_realizadas,
          observacoes,
          exercicios_ficha!inner(nome, grupo_muscular)
        `)
        .in('ficha_aluno_id', fichaIds)
        .gte('data_realizacao', dataLimite.toISOString())
        .order('data_realizacao', { ascending: false });
      
      return treinos || [];
    },
    enabled: !!alunoId,
    staleTime: 1000 * 60 * 5
  });
}
