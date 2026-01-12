import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface WorkoutProgressDay {
  id: string;
  userId: string;
  workoutDate: string;
  workoutSnapshot: any;
  totalExercises: number;
  completedExercises: number;
  durationMinutes: number | null;
  sourceWorkoutId: string | null;
  sourceFichaAlunoId: string | null;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MonthlyWorkoutStats {
  totalWorkoutDays: number;
  totalExercises: number;
  totalCompletedExercises: number;
  completionRate: number;
}

/**
 * Hook para buscar progresso de treinos de um aluno em um mês específico
 * Usa a tabela workout_progress_backup (fonte única da verdade)
 */
export function useMonthlyWorkoutProgress(alunoId: string | null, year: number, month: number) {
  return useQuery<WorkoutProgressDay[]>({
    queryKey: ['workout-progress', 'monthly', alunoId, year, month],
    queryFn: async () => {
      if (!alunoId) return [];

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data, error } = await supabase
        .from('workout_progress_backup')
        .select('*')
        .eq('user_id', alunoId)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .lte('workout_date', endDate.toISOString().split('T')[0])
        .order('workout_date', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar progresso mensal:', error);
        throw new Error('Falha ao buscar progresso de treinos');
      }

      return (data || []).map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        workoutDate: item.workout_date,
        workoutSnapshot: item.workout_snapshot,
        totalExercises: item.total_exercises,
        completedExercises: item.completed_exercises,
        durationMinutes: item.duration_minutes,
        sourceWorkoutId: item.source_workout_id,
        sourceFichaAlunoId: item.source_ficha_aluno_id,
        locked: item.locked,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
    },
    enabled: !!alunoId
  });
}

/**
 * Hook para buscar dias treinados em um mês (apenas datas)
 * Otimizado para calendário
 */
export function useMonthlyTrainingDays(alunoId: string | null, year: number, month: number) {
  return useQuery<Set<number>>({
    queryKey: ['workout-progress', 'training-days', alunoId, year, month],
    queryFn: async () => {
      if (!alunoId) return new Set<number>();

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);

      const { data, error } = await supabase
        .from('workout_progress_backup')
        .select('workout_date')
        .eq('user_id', alunoId)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .lte('workout_date', endDate.toISOString().split('T')[0]);

      if (error) {
        console.error('❌ Erro ao buscar dias treinados:', error);
        throw new Error('Falha ao buscar dias treinados');
      }

      const diasUnicos = new Set<number>();
      (data || []).forEach((item: any) => {
        const data = new Date(item.workout_date + 'T00:00:00');
        diasUnicos.add(data.getDate());
      });

      return diasUnicos;
    },
    enabled: !!alunoId
  });
}

/**
 * Hook para buscar estatísticas de treino em um período
 */
export function useWorkoutStats(alunoId: string | null, startDate: Date, endDate: Date) {
  return useQuery<MonthlyWorkoutStats>({
    queryKey: ['workout-progress', 'stats', alunoId, startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      if (!alunoId) {
        return {
          totalWorkoutDays: 0,
          totalExercises: 0,
          totalCompletedExercises: 0,
          completionRate: 0
        };
      }

      const { data, error } = await supabase
        .from('workout_progress_backup')
        .select('workout_date, total_exercises, completed_exercises')
        .eq('user_id', alunoId)
        .gte('workout_date', startDate.toISOString().split('T')[0])
        .lte('workout_date', endDate.toISOString().split('T')[0]);

      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        throw new Error('Falha ao buscar estatísticas de treino');
      }

      const uniqueDays = new Set(data?.map(d => d.workout_date) || []);
      const totalExercises = data?.reduce((sum, d) => sum + (d.total_exercises || 0), 0) || 0;
      const totalCompleted = data?.reduce((sum, d) => sum + (d.completed_exercises || 0), 0) || 0;

      return {
        totalWorkoutDays: uniqueDays.size,
        totalExercises,
        totalCompletedExercises: totalCompleted,
        completionRate: totalExercises > 0 ? Math.round((totalCompleted / totalExercises) * 100) : 0
      };
    },
    enabled: !!alunoId
  });
}

/**
 * Hook para buscar progresso de uma data específica
 */
export function useWorkoutProgressByDate(alunoId: string | null, date: Date) {
  return useQuery<WorkoutProgressDay | null>({
    queryKey: ['workout-progress', 'by-date', alunoId, date.toISOString()],
    queryFn: async () => {
      if (!alunoId) return null;

      const dateStr = date.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('workout_progress_backup')
        .select('*')
        .eq('user_id', alunoId)
        .eq('workout_date', dateStr)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Não encontrado
        console.error('❌ Erro ao buscar progresso por data:', error);
        throw new Error('Falha ao buscar progresso');
      }

      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        workoutDate: data.workout_date,
        workoutSnapshot: data.workout_snapshot,
        totalExercises: data.total_exercises,
        completedExercises: data.completed_exercises,
        durationMinutes: data.duration_minutes,
        sourceWorkoutId: data.source_workout_id,
        sourceFichaAlunoId: data.source_ficha_aluno_id,
        locked: data.locked,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    },
    enabled: !!alunoId
  });
}
