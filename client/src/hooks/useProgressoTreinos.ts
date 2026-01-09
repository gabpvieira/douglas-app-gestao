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
  seriesRealizadasSemana: number; // Volume total de séries na semana
  
  // Mês Atual
  diasTreinadosMes: number;
  treinosRealizadosMes: number;
  
  // Histórico
  sequenciaAtual: number;
  melhorSequencia: number;
  totalTreinosRealizados: number;
  totalDiasTreinados: number;
  
  // Engajamento
  taxaFrequencia: number;
  mediaExerciciosPorTreino: number;
  ultimoTreino: Date | null;
  
  // Datas de treinos (para calendário)
  diasTreinadosSemanaReal: string[]; // datas ISO
  diasTreinadosMesReal: string[]; // datas ISO
  diasTreinadosSemanaIndices: number[]; // índices 0-6 (0=seg, 6=dom) para WeekProgressTracker
}

export interface AlunoDestaque {
  posicao: number;
  alunoId: string;
  nome: string;
  fotoUrl: string | null;
  pontuacao: number;
  diasTreinados: number;
  treinosRealizados: number;
  seriesRealizadas: number; // Volume total de séries
  badge: 'ouro' | 'prata' | 'bronze' | 'fogo' | null;
}

export interface TreinosPorDia {
  data: string; // formato YYYY-MM-DD
  quantidade: number;
}

// Funções auxiliares
// Semana inicia na SEGUNDA-FEIRA (padrão brasileiro)

// Converte o índice do JavaScript (0=dom, 1=seg...) para índice brasileiro (0=seg, 1=ter...)
function converterDiaParaIndiceBR(diaJS: number): number {
  return diaJS === 0 ? 6 : diaJS - 1;
}

function getInicioSemana(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
  const inicio = new Date(hoje);
  // Se for domingo (0), volta 6 dias para segunda anterior
  // Se for segunda (1), volta 0 dias
  // Se for terça (2), volta 1 dia, etc.
  const diasParaVoltar = diaSemana === 0 ? 6 : diaSemana - 1;
  inicio.setDate(hoje.getDate() - diasParaVoltar);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

function getFimSemana(): Date {
  const inicio = getInicioSemana();
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6); // Segunda + 6 = Domingo
  fim.setHours(23, 59, 59, 999);
  return fim;
}

function getInicioMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1, 0, 0, 0, 0);
}

function getFimMes(): Date {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59, 999);
}

// Buscar métricas de um aluno específico
async function buscarMetricasAluno(alunoId: string): Promise<MetricasAluno> {
  const inicioSemana = getInicioSemana();
  const fimSemana = getFimSemana();
  const inicioMes = getInicioMes();
  const fimMes = getFimMes();
  
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
      seriesRealizadasSemana: 0,
      diasTreinadosMes: 0,
      treinosRealizadosMes: 0,
      sequenciaAtual: 0,
      melhorSequencia: 0,
      totalTreinosRealizados: 0,
      totalDiasTreinados: 0,
      taxaFrequencia: 0,
      mediaExerciciosPorTreino: 0,
      ultimoTreino: null,
      diasTreinadosSemanaReal: [],
      diasTreinadosMesReal: [],
      diasTreinadosSemanaIndices: []
    };
  }
  
  // 3. Buscar treinos realizados na semana (com séries)
  const { data: treinosSemana } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao, exercicio_id, series_realizadas')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', inicioSemana.toISOString())
    .lte('data_realizacao', fimSemana.toISOString());
  
  // 3b. Buscar feedbacks da semana como fallback (para treinos deletados)
  const { data: feedbacksSemana } = await supabase
    .from('feedback_treinos')
    .select('created_at, treino_id')
    .eq('aluno_id', alunoId)
    .gte('created_at', inicioSemana.toISOString())
    .lte('created_at', fimSemana.toISOString());
  
  // 4. Buscar treinos realizados no mês
  const { data: treinosMes } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', inicioMes.toISOString())
    .lte('data_realizacao', fimMes.toISOString());
  
  // 4b. Buscar feedbacks do mês como fallback
  const { data: feedbacksMes } = await supabase
    .from('feedback_treinos')
    .select('created_at, treino_id')
    .eq('aluno_id', alunoId)
    .gte('created_at', inicioMes.toISOString())
    .lte('created_at', fimMes.toISOString());
  
  // 5. Buscar todos os treinos (últimos 90 dias para calcular sequências)
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 90);
  
  const { data: todosTreinos } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', dataLimite.toISOString())
    .order('data_realizacao', { ascending: false });
  
  // 6. Buscar total geral de treinos (histórico completo)
  const { count: totalGeral } = await supabase
    .from('treinos_realizados')
    .select('*', { count: 'exact', head: true })
    .in('ficha_aluno_id', fichaIds);
  
  // 7. Calcular métricas da semana
  const diasUnicosSemana = new Set<string>();
  const diasIndicesSemana = new Set<number>(); // Índices no formato BR (0=seg, 6=dom)
  
  // Adicionar dias dos treinos realizados
  treinosSemana?.forEach(treino => {
    // Usar a data ISO diretamente para evitar problemas de timezone
    const dataISO = treino.data_realizacao.split('T')[0];
    diasUnicosSemana.add(dataISO);
    
    // Criar data em UTC para obter o dia da semana correto
    const data = new Date(dataISO + 'T00:00:00Z');
    diasIndicesSemana.add(converterDiaParaIndiceBR(data.getUTCDay()));
  });
  
  // Adicionar dias dos feedbacks (para treinos deletados)
  feedbacksSemana?.forEach(feedback => {
    const dataISO = feedback.created_at.split('T')[0];
    // Verificar se já não foi contado pelos treinos
    if (!diasUnicosSemana.has(dataISO)) {
      diasUnicosSemana.add(dataISO);
      const data = new Date(dataISO + 'T00:00:00Z');
      diasIndicesSemana.add(converterDiaParaIndiceBR(data.getUTCDay()));
    }
  });
  
  const diasTreinadosSemana = diasUnicosSemana.size;
  const treinosRealizadosSemana = treinosSemana?.length || 0;
  const exerciciosCompletadosSemana = treinosSemana?.length || 0;
  const seriesRealizadasSemana = treinosSemana?.reduce((total, treino) => total + (treino.series_realizadas || 0), 0) || 0;
  const diasTreinadosSemanaReal = Array.from(diasUnicosSemana);
  const diasTreinadosSemanaIndices = Array.from(diasIndicesSemana);
  
  // 8. Calcular métricas do mês
  const diasUnicosMes = new Set<string>();
  
  // Adicionar dias dos treinos realizados
  treinosMes?.forEach(treino => {
    // Usar a data ISO diretamente para evitar problemas de timezone
    const dataISO = treino.data_realizacao.split('T')[0];
    diasUnicosMes.add(dataISO);
  });
  
  // Adicionar dias dos feedbacks (para treinos deletados)
  feedbacksMes?.forEach(feedback => {
    const dataISO = feedback.created_at.split('T')[0];
    if (!diasUnicosMes.has(dataISO)) {
      diasUnicosMes.add(dataISO);
    }
  });
  
  const diasTreinadosMes = diasUnicosMes.size;
  const treinosRealizadosMes = treinosMes?.length || 0;
  const diasTreinadosMesReal = Array.from(diasUnicosMes);
  
  // 9. Calcular total de dias únicos treinados (histórico completo)
  const diasUnicosTotal = new Set<string>();
  todosTreinos?.forEach(treino => {
    // Usar a data ISO diretamente para evitar problemas de timezone
    const dataISO = treino.data_realizacao.split('T')[0];
    diasUnicosTotal.add(dataISO);
  });
  
  // 10. Calcular sequências
  const diasTreinados = Array.from(
    new Set(todosTreinos?.map(t => t.data_realizacao.split('T')[0]))
  ).map(d => new Date(d + 'T00:00:00Z')).sort((a, b) => b.getTime() - a.getTime());
  
  let sequenciaAtual = 0;
  let melhorSequencia = 0;
  let sequenciaTemp = 0;
  
  const hoje = new Date();
  hoje.setUTCHours(0, 0, 0, 0);
  
  for (let i = 0; i < 90; i++) {
    const dia = new Date(hoje);
    dia.setUTCDate(hoje.getUTCDate() - i);
    
    const treinouNesteDia = diasTreinados.some(d => 
      d.toISOString().split('T')[0] === dia.toISOString().split('T')[0]
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
  
  // 11. Calcular outras métricas
  const totalTreinosRealizados = totalGeral || 0;
  const totalDiasTreinados = diasUnicosTotal.size;
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
    seriesRealizadasSemana,
    diasTreinadosMes,
    treinosRealizadosMes,
    sequenciaAtual,
    melhorSequencia,
    totalTreinosRealizados,
    totalDiasTreinados,
    taxaFrequencia,
    mediaExerciciosPorTreino,
    ultimoTreino,
    diasTreinadosSemanaReal,
    diasTreinadosMesReal,
    diasTreinadosSemanaIndices
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
      
      // 3. Calcular pontuação composta para cada aluno
      // Fórmula: (dias * 100) + (treinos * 10) + (séries * 1)
      // Isso prioriza dias, mas considera volume de trabalho
      const alunosComPontuacao = metricas.map(aluno => ({
        ...aluno,
        pontuacaoComposta: (aluno.diasTreinadosSemana * 100) + 
                          (aluno.treinosRealizadosSemana * 10) + 
                          (aluno.seriesRealizadasSemana * 1)
      }));
      
      // 4. Ordenar por pontuação composta (ou critério específico se fornecido)
      const ordenado = alunosComPontuacao.sort((a, b) => {
        if (criterio === 'dias') {
          // Ordenar por pontuação composta (dias + volume)
          return b.pontuacaoComposta - a.pontuacaoComposta;
        } else if (criterio === 'treinos') {
          return b.treinosRealizadosSemana - a.treinosRealizadosSemana;
        } else {
          return b.exerciciosCompletadosSemana - a.exerciciosCompletadosSemana;
        }
      });
      
      // 5. Criar ranking com badges aprimorados
      const ranking: AlunoDestaque[] = ordenado.map((aluno, index) => {
        let badge: 'ouro' | 'prata' | 'bronze' | 'fogo' | null = null;
        
        // Top 3 sempre recebem medalhas
        if (index === 0) badge = 'ouro';
        else if (index === 1) badge = 'prata';
        else if (index === 2) badge = 'bronze';
        // Badge "fogo" para quem treinou 4+ dias com bom volume (80+ séries)
        else if (aluno.diasTreinadosSemana >= 4 && aluno.seriesRealizadasSemana >= 80) badge = 'fogo';
        
        const pontuacao = criterio === 'dias' 
          ? aluno.pontuacaoComposta
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
          seriesRealizadas: aluno.seriesRealizadasSemana,
          badge
        };
      });
      
      // 6. Retornar top 10
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

// Hook: Buscar ranking geral (acumulado)
export function useRankingGeral() {
  return useQuery<AlunoDestaque[]>({
    queryKey: ['ranking-geral'],
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
      
      // 3. Ordenar por total de treinos realizados (acumulado)
      const ordenado = metricas.sort((a, b) => {
        return b.totalTreinosRealizados - a.totalTreinosRealizados;
      });
      
      // 4. Criar ranking com badges
      const ranking: AlunoDestaque[] = ordenado.map((aluno, index) => {
        let badge: 'ouro' | 'prata' | 'bronze' | 'fogo' | null = null;
        
        if (index === 0) badge = 'ouro';
        else if (index === 1) badge = 'prata';
        else if (index === 2) badge = 'bronze';
        else if (aluno.totalTreinosRealizados >= 50) badge = 'fogo';
        
        return {
          posicao: index + 1,
          alunoId: aluno.alunoId,
          nome: aluno.nome,
          fotoUrl: aluno.fotoUrl,
          pontuacao: aluno.totalTreinosRealizados,
          diasTreinados: aluno.totalDiasTreinados,
          treinosRealizados: aluno.totalTreinosRealizados,
          badge
        };
      });
      
      // 5. Retornar top 10
      return ranking.slice(0, 10);
    },
    staleTime: 1000 * 60 * 5
  });
}

// Hook: Buscar treinos de um mês específico
export function useTreinosMes(alunoId: string, ano: number, mes: number) {
  return useQuery<TreinosPorDia[]>({
    queryKey: ['treinos-mes', alunoId, ano, mes],
    queryFn: async () => {
      const inicioMes = new Date(ano, mes, 1, 0, 0, 0, 0);
      const fimMes = new Date(ano, mes + 1, 0, 23, 59, 59, 999);
      
      // Buscar fichas do aluno
      const { data: fichas } = await supabase
        .from('fichas_alunos')
        .select('id')
        .eq('aluno_id', alunoId);
      
      const fichaIds = fichas?.map(f => f.id) || [];
      
      if (fichaIds.length === 0) return [];
      
      // Buscar treinos do mês
      const { data: treinos } = await supabase
        .from('treinos_realizados')
        .select('data_realizacao')
        .in('ficha_aluno_id', fichaIds)
        .gte('data_realizacao', inicioMes.toISOString())
        .lte('data_realizacao', fimMes.toISOString());
      
      // Agrupar por dia
      const treinosPorDia: Record<string, number> = {};
      treinos?.forEach(treino => {
        // Usar a data ISO diretamente para evitar problemas de timezone
        const dataISO = treino.data_realizacao.split('T')[0];
        treinosPorDia[dataISO] = (treinosPorDia[dataISO] || 0) + 1;
      });
      
      return Object.entries(treinosPorDia).map(([data, quantidade]) => ({
        data,
        quantidade
      }));
    },
    enabled: !!alunoId,
    staleTime: 1000 * 60 * 5
  });
}
