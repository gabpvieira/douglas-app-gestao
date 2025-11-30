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
      console.log('🔄 [Dashboard] Buscando estatísticas...');
      
      // Buscar alunos da tabela correta
      const { data: alunos, error: alunosError } = await supabase
        .from('alunos')
        .select('id, status');

      if (alunosError) {
        console.error('❌ [Dashboard] Erro ao buscar alunos:', alunosError);
        throw new Error('Falha ao buscar alunos');
      }
      
      console.log('✅ [Dashboard] Alunos encontrados:', alunos?.length);
      
      // Buscar assinaturas ativas para calcular receita mensal
      const { data: assinaturas, error: assinaturasError } = await supabase
        .from('assinaturas')
        .select('preco, plano_tipo, status')
        .eq('status', 'ativa');

      if (assinaturasError) {
        console.error('❌ [Dashboard] Erro ao buscar assinaturas:', assinaturasError);
      } else {
        console.log('✅ [Dashboard] Assinaturas ativas:', assinaturas?.length);
      }
      
      // Buscar pagamentos do mês atual
      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString();
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).toISOString();
      
      const { data: pagamentos, error: pagamentosError } = await supabase
        .from('pagamentos')
        .select('valor, status, created_at')
        .gte('created_at', primeiroDiaMes)
        .lte('created_at', ultimoDiaMes);

      if (pagamentosError) {
        console.error('❌ [Dashboard] Erro ao buscar pagamentos:', pagamentosError);
      } else {
        console.log('✅ [Dashboard] Pagamentos do mês:', pagamentos?.length);
      }
      
      // Calcular estatísticas de alunos
      const totalAlunos = alunos?.length || 0;
      const alunosAtivos = alunos?.filter((a: any) => a.status === 'ativo').length || 0;
      const alunosPendentes = alunos?.filter((a: any) => a.status === 'pendente').length || 0;
      const alunosInativos = alunos?.filter((a: any) => a.status === 'inativo').length || 0;
      
      console.log('📊 [Dashboard] Estatísticas de alunos:', {
        total: totalAlunos,
        ativos: alunosAtivos,
        pendentes: alunosPendentes,
        inativos: alunosInativos
      });
      
      // Calcular receita mensal estimada (baseado em assinaturas ativas)
      let receitaMensal = 0;
      if (assinaturas && assinaturas.length > 0) {
        receitaMensal = assinaturas.reduce((sum: number, a: any) => {
          // Se for trimestral, dividir por 3 para obter valor mensal
          if (a.plano_tipo === 'online_trimestral') {
            return sum + (a.preco / 3);
          }
          return sum + a.preco;
        }, 0) / 100; // Converter de centavos para reais
      }
      
      console.log('💰 [Dashboard] Receita mensal calculada:', receitaMensal);
      
      // Estatísticas de pagamentos
      const pagamentosAprovados = pagamentos?.filter((p: any) => p.status === 'aprovado') || [];
      const totalPagamentosAprovados = pagamentosAprovados.length;
      const totalPagamentosPendentes = pagamentos?.filter((p: any) => p.status === 'pendente').length || 0;
      
      const stats = {
        totalAlunos,
        alunosAtivos,
        alunosPendentes,
        alunosInativos,
        receitaMensal,
        totalPagamentosAprovados,
        totalPagamentosPendentes
      };
      
      console.log('✨ [Dashboard] Estatísticas finais:', stats);
      
      return stats;
    },
    refetchInterval: 60000, // Atualizar a cada 1 minuto
    staleTime: 30000, // Considerar dados frescos por 30 segundos
  });
}
