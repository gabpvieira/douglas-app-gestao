import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalAlunos: number;
  alunosAtivos: number;
  alunosPendentes: number;
  alunosInativos: number;
  receitaMensal: number;
  totalPagamentosAprovados: number;
  totalPagamentosPendentes: number;
}

// Hook para estatísticas do dashboard
export function useDashboardStats() {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Buscar alunos
      const { data: alunos, error: alunosError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('tipo', 'aluno');

      if (alunosError) {
        console.error('Erro ao buscar alunos:', alunosError);
        throw new Error('Falha ao buscar alunos');
      }
      
      // Buscar pagamentos do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('*')
        .gte('createdAt', primeiroDiaMes)
        .lte('createdAt', ultimoDiaMes);

      if (pagamentosError) {
        console.error('Erro ao buscar pagamentos:', pagamentosError);
      }
      
      // Calcular estatísticas
      const totalAlunos = alunos?.length || 0;
      const alunosAtivos = alunos?.filter((a: any) => a.status === 'ativo').length || 0;
      const alunosPendentes = alunos?.filter((a: any) => a.status === 'pendente').length || 0;
      const alunosInativos = alunos?.filter((a: any) => a.status === 'inativo').length || 0;
      
      const pagamentosAprovados = pagamentos?.filter((p: any) => p.status === 'aprovado') || [];
      const receitaMensal = pagamentosAprovados.reduce((sum: number, p: any) => sum + (p.valor || 0), 0) / 100; // Converter de centavos
      
      const totalPagamentosAprovados = pagamentosAprovados.length;
      const totalPagamentosPendentes = pagamentos?.filter((p: any) => p.status === 'pendente').length || 0;
      
      return {
        totalAlunos,
        alunosAtivos,
        alunosPendentes,
        alunosInativos,
        receitaMensal,
        totalPagamentosAprovados,
        totalPagamentosPendentes
      };
    },
    refetchInterval: 60000 // Atualizar a cada 1 minuto
  });
}
