import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Search,
  Filter,
  UserPlus,
  Video,
  Calendar,
  CreditCard,
  ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAlunos } from "@/hooks/useAlunos";
import { useDashboardStats } from "@/hooks/useDashboard";
import PageHeader from "@/components/PageHeader";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [, setLocation] = useLocation();
  
  const { data: alunos = [], isLoading: loadingAlunos } = useAlunos();
  const { data: dashboardStats, isLoading: loadingStats } = useDashboardStats();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Atualiza a cada minuto

    return () => clearInterval(timer);
  }, []);

  const getInitials = (name: string) => {
    const firstName = name.trim().split(' ')[0];
    return firstName.substring(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getFormattedTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const stats = [
    {
      title: "Total de Alunos",
      value: loadingStats ? "..." : String(dashboardStats?.totalAlunos || 0),
      change: loadingStats ? "..." : `${dashboardStats?.alunosAtivos || 0} ativos`,
      icon: <Users className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Receita Mensal",
      value: loadingStats ? "..." : `R$ ${(dashboardStats?.receitaMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loadingStats ? "..." : `${dashboardStats?.totalPagamentosAprovados || 0} pagamentos`,
      icon: <DollarSign className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Alunos Ativos",
      value: loadingStats ? "..." : String(dashboardStats?.alunosAtivos || 0),
      change: loadingStats ? "..." : `${dashboardStats?.alunosPendentes || 0} pendentes`,
      icon: <TrendingUp className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Inativos",
      value: loadingStats ? "..." : String(dashboardStats?.alunosInativos || 0),
      change: loadingStats ? "..." : `${dashboardStats?.totalPagamentosPendentes || 0} pag. pendentes`,
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: "down"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-chart-2 text-white';
      case 'pendente': return 'bg-chart-3 text-white';
      case 'inativo': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const filteredStudents = alunos
    .filter(student => 
      student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .slice(0, 10); // Mostrar apenas os 10 primeiros

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <PageHeader
          title="Painel Administrativo"
          description="Gerencie seus alunos e monitore o desempenho"
        />

        {/* Greeting Section */}
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/30 rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-white">
            {getGreeting()}, Douglas
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mt-1">
            {getFormattedTime()} • {currentTime.toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur" data-testid={`card-stat-${index}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400">{stat.title}</p>
                  <p className="text-lg sm:text-2xl font-bold text-white mt-1">{stat.value}</p>
                  <p className={`text-[10px] sm:text-sm flex items-center gap-1 mt-1 ${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {stat.change}
                  </p>
                </div>
                <div className={`h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center ${
                  stat.trend === 'up' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <div className="text-white scale-75 sm:scale-100">{stat.icon}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Adicionar Novo Aluno */}
          <Card 
            className="group relative overflow-hidden border-gray-800 bg-gradient-to-br from-blue-900/20 to-blue-800/10 hover:from-blue-900/30 hover:to-blue-800/20 backdrop-blur transition-all duration-300 cursor-pointer"
            onClick={() => setLocation('/admin/alunos')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10 transition-all duration-300" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Novo Aluno</h3>
              <p className="text-xs sm:text-sm text-gray-400">Cadastrar novo aluno no sistema</p>
            </div>
          </Card>

          {/* Adicionar Novo Treino */}
          <Card 
            className="group relative overflow-hidden border-gray-800 bg-gradient-to-br from-purple-900/20 to-purple-800/10 hover:from-purple-900/30 hover:to-purple-800/20 backdrop-blur transition-all duration-300 cursor-pointer"
            onClick={() => setLocation('/admin/treinos-video')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/10 group-hover:to-purple-600/10 transition-all duration-300" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Novo Treino</h3>
              <p className="text-xs sm:text-sm text-gray-400">Adicionar vídeo de treino</p>
            </div>
          </Card>

          {/* Ver Agenda */}
          <Card 
            className="group relative overflow-hidden border-gray-800 bg-gradient-to-br from-green-900/20 to-green-800/10 hover:from-green-900/30 hover:to-green-800/20 backdrop-blur transition-all duration-300 cursor-pointer"
            onClick={() => setLocation('/admin/agenda')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/10 group-hover:to-green-600/10 transition-all duration-300" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Ver Agenda</h3>
              <p className="text-xs sm:text-sm text-gray-400">Gerenciar atendimentos</p>
            </div>
          </Card>

          {/* Gerenciar Pagamentos */}
          <Card 
            className="group relative overflow-hidden border-gray-800 bg-gradient-to-br from-orange-900/20 to-orange-800/10 hover:from-orange-900/30 hover:to-orange-800/20 backdrop-blur transition-all duration-300 cursor-pointer"
            onClick={() => setLocation('/admin/pagamentos')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-600/0 group-hover:from-orange-500/10 group-hover:to-orange-600/10 transition-all duration-300" />
            <div className="relative p-4 sm:p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-white mb-1">Pagamentos</h3>
              <p className="text-xs sm:text-sm text-gray-400">Controlar financeiro</p>
            </div>
          </Card>
        </div>

        {/* Students Management */}
        <Card className="p-4 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white">Gestão de Alunos</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <Input
                  placeholder="Buscar alunos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 sm:w-64 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-xs sm:text-sm"
                  data-testid="input-search-students"
                />
              </div>
              <Button variant="outline" size="sm" data-testid="button-filter" className="border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs sm:text-sm">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </div>

          {/* Students List */}
          <div className="space-y-2">
            {loadingAlunos ? (
              <div className="py-8 text-center text-gray-500">
                Carregando alunos...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center gap-3 p-4 rounded-lg border border-gray-800 bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  data-testid={`card-student-${student.id}`}
                >
                  <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                    <AvatarImage src={student.fotoUrl || undefined} />
                    <AvatarFallback className="bg-gray-700 text-white text-sm">
                      {getInitials(student.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm sm:text-base truncate">
                      {student.nome}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-400 truncate">
                      {student.email}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(student.status)} text-xs whitespace-nowrap`}>
                    {student.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}