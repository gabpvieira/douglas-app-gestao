import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Interface para carga por série
export interface CargaSerie {
  serie: number;
  carga: string;
  repeticoes?: number;
}

// Interface para registro de última carga
export interface UltimaCargaExercicio {
  id: string;
  alunoId: string;
  exercicioId: string;
  cargasPorSerie: CargaSerie[];
  ultimaAtualizacao: string;
  treinoReferenciaId?: string;
}

// Mapa de cargas por exercício (para uso nos componentes)
export type MapaCargasExercicios = Record<string, CargaSerie[]>;

/**
 * Hook para buscar últimas cargas de múltiplos exercícios para um aluno
 */
export function useUltimasCargasExercicios(alunoId?: string, exercicioIds?: string[]) {
  return useQuery({
    queryKey: ['ultimas-cargas', alunoId, exercicioIds],
    queryFn: async (): Promise<MapaCargasExercicios> => {
      if (!alunoId || !exercicioIds || exercicioIds.length === 0) {
        return {};
      }

      const { data, error } = await supabase
        .from('ultima_carga_exercicio')
        .select('*')
        .eq('aluno_id', alunoId)
        .in('exercicio_id', exercicioIds);

      if (error) {
        console.error('Erro ao buscar últimas cargas:', error);
        throw error;
      }

      // Converter para mapa de exercício -> cargas
      const mapa: MapaCargasExercicios = {};
      data?.forEach((item: any) => {
        mapa[item.exercicio_id] = item.cargas_por_serie as CargaSerie[];
      });

      return mapa;
    },
    enabled: !!alunoId && !!exercicioIds && exercicioIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar última carga de um exercício específico
 */
export function useUltimaCargaExercicio(alunoId?: string, exercicioId?: string) {
  return useQuery({
    queryKey: ['ultima-carga', alunoId, exercicioId],
    queryFn: async (): Promise<CargaSerie[] | null> => {
      if (!alunoId || !exercicioId) return null;

      const { data, error } = await supabase
        .from('ultima_carga_exercicio')
        .select('cargas_por_serie')
        .eq('aluno_id', alunoId)
        .eq('exercicio_id', exercicioId)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar última carga:', error);
        throw error;
      }

      return data?.cargas_por_serie as CargaSerie[] | null;
    },
    enabled: !!alunoId && !!exercicioId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Interface para dados de salvamento de cargas
 */
interface DadosSalvarCargas {
  alunoId: string;
  exercicios: Array<{
    exercicioId: string;
    cargasPorSerie: CargaSerie[];
    treinoReferenciaId?: string;
  }>;
}

/**
 * Hook para salvar últimas cargas após finalizar treino
 */
export function useSalvarUltimasCargas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: DadosSalvarCargas) => {
      const { alunoId, exercicios } = dados;

      if (!alunoId || exercicios.length === 0) {
        return { success: true, count: 0 };
      }

      let salvos = 0;
      const erros: string[] = [];

      // UPSERT para cada exercício
      for (const ex of exercicios) {
        // Filtrar apenas séries com carga válida
        const cargasValidas = ex.cargasPorSerie.filter(
          c => c.carga && c.carga !== '' && c.carga !== '0'
        );

        if (cargasValidas.length === 0) continue;

        const { error } = await supabase
          .from('ultima_carga_exercicio')
          .upsert(
            {
              aluno_id: alunoId,
              exercicio_id: ex.exercicioId,
              cargas_por_serie: cargasValidas,
              ultima_atualizacao: new Date().toISOString(),
              treino_referencia_id: ex.treinoReferenciaId || null,
            },
            {
              onConflict: 'aluno_id,exercicio_id',
            }
          );

        if (error) {
          console.error(`Erro ao salvar carga do exercício ${ex.exercicioId}:`, error);
          erros.push(ex.exercicioId);
        } else {
          salvos++;
        }
      }

      if (erros.length > 0) {
        console.warn(`${erros.length} exercícios não tiveram cargas salvas`);
      }

      return { success: erros.length === 0, count: salvos, erros };
    },
    onSuccess: (_, variables) => {
      // Invalidar cache de cargas para este aluno
      queryClient.invalidateQueries({ 
        queryKey: ['ultimas-cargas', variables.alunoId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['ultima-carga', variables.alunoId] 
      });
    },
    onError: (error) => {
      console.error('Erro ao salvar últimas cargas:', error);
    },
  });
}

/**
 * Função utilitária para extrair cargas de exercícios finalizados
 */
export function extrairCargasDeExercicios(
  exercicios: Array<{
    id: string;
    seriesRealizadas: Array<{
      numero: number;
      peso: string;
      repeticoes: number;
      concluida: boolean;
    }>;
  }>
): Array<{ exercicioId: string; cargasPorSerie: CargaSerie[] }> {
  return exercicios
    .filter(ex => ex.seriesRealizadas.some(s => s.concluida && s.peso))
    .map(ex => ({
      exercicioId: ex.id,
      cargasPorSerie: ex.seriesRealizadas
        .filter(s => s.concluida && s.peso && s.peso !== '' && s.peso !== '0')
        .map(s => ({
          serie: s.numero,
          carga: s.peso,
          repeticoes: s.repeticoes,
        })),
    }))
    .filter(ex => ex.cargasPorSerie.length > 0);
}

/**
 * Função utilitária para obter carga de uma série específica
 */
export function obterCargaSerie(
  cargas: CargaSerie[] | undefined,
  numeroSerie: number
): string {
  if (!cargas || cargas.length === 0) return '';
  const carga = cargas.find(c => c.serie === numeroSerie);
  return carga?.carga || '';
}

/**
 * Função utilitária para verificar se há cargas anteriores
 */
export function temCargasAnteriores(cargas: CargaSerie[] | undefined): boolean {
  return !!cargas && cargas.length > 0 && cargas.some(c => c.carga && c.carga !== '0');
}
