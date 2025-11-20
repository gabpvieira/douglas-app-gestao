import { useQuery } from '@tanstack/react-query';

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
      const alunosResponse = await fetch('/api/admin/students');
      const alunos = await alunosResponse.json();
      
      // Buscar pagamentos do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      const pagamentosResponse = await fetch(
        `/api/admin/pagamentos?dataInicio=${primeiroDiaMes}&dataFim=${ultimoDiaMes}`
      );
      const pagamentos = await pagamentosResponse.json();
      
      // Calcular estatísticas
      const totalAlunos = alunos.length;
      const alunosAtivos = alunos.filter((a: any) => a.status === 'ativo').length;
      const alunosPendentes = alunos.filter((a: any) => a.status === 'pendente').length;
      const alunosInativos = alunos.filter((a: any) => a.status === 'inativo').length;
      
      const pagamentosAprovados = pagamentos.filter((p: any) => p.status === 'aprovado');
      const receitaMensal = pagamentosAprovados.reduce((sum: number, p: any) => sum + p.valor, 0) / 100; // Converter de centavos
      
      const totalPagamentosAprovados = pagamentosAprovados.length;
      const totalPagamentosPendentes = pagamentos.filter((p: any) => p.status === 'pendente').length;
      
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
