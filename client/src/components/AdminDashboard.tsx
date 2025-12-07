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
  ArrowRight,
  UserCheck,
  Wallet,
  Activity,
  UserX,
  Dumbbell,
  CalendarCheck
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
  const { data: dashboardStats, isLoading: loadingStats, error: statsError } = useDashboardStats();
  
  // Log para debug
  console.log('📊 [AdminDashboard] Stats:', { dashboardStats, loadingStats, statsError });

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
    const dayOfWeek = currentTime.toLocaleDateString('pt-BR', { weekday: 'long' });
    
    // Frases para manhã (05:00 - 11:59)
    const morningGreetings = [
      'Café na mão e foco total. Bom dia, Douglas.',
      'Começando o dia com energia lá em cima!',
      'Primeiro a gestão, depois os treinos. Bom dia.',
      'Pronto para transformar vidas hoje, Douglas?',
      'Bom dia! Hora de fazer acontecer.',
      'Que tal começar o dia aumentando a carga nos negócios?'
    ];
    
    // Frases para tarde (12:00 - 17:59)
    const afternoonGreetings = [
      'Tarde produtiva por aí, Douglas?',
      'Ainda dá tempo de ajustar muita coisa hoje.',
      `${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} a todo vapor, Douglas.`,
      'Espero que os treinos da manhã tenham sido ótimos.',
      'Boa tarde! Vamos ver os números?',
      'Foco total na gestão, Douglas.'
    ];
    
    // Frases para noite (18:00 - 04:59)
    const nightGreetings = [
      'Dia longo? O painel continua aqui firme e forte.',
      'Hora de fechar a agenda ou preparar o amanhã?',
      'O descanso também faz parte do processo, Douglas.',
      'Missão cumprida por hoje, Douglas?',
      'Boa noite! Hora de revisar o dia.',
      'Que bom te ver, Douglas.'
    ];
    
    let greetings: string[];
    
    if (hour >= 5 && hour < 12) {
      greetings = morningGreetings;
    } else if (hour >= 12 && hour < 18) {
      greetings = afternoonGreetings;
    } else {
      greetings = nightGreetings;
    }
    
    // Seleciona uma frase aleatória baseada na hora atual (muda a cada hora)
    const index = hour % greetings.length;
    return greetings[index];
  };

  const getSubGreeting = () => {
    const hour = currentTime.getHours();
    
    if (hour >= 5 && hour < 12) {
      return 'Pronto para aumentar a carga nos negócios hoje?';
    } else if (hour >= 12 && hour < 18) {
      return 'Vamos ver como estão as coisas por aqui?';
    } else {
      return 'Hora de revisar o dia ou planejar o próximo?';
    }
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
      icon: <Users className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-600"
    },
    {
      title: "Receita Mensal",
      value: loadingStats ? "..." : `R$ ${(dashboardStats?.receitaMensal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: loadingStats ? "..." : `${dashboardStats?.totalPagamentosAprovados || 0} pagamentos`,
      icon: <Wallet className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-600"
    },
    {
      title: "Alunos Ativos",
      value: loadingStats ? "..." : String(dashboardStats?.alunosAtivos || 0),
      change: loadingStats ? "..." : `${dashboardStats?.alunosPendentes || 0} pendentes`,
      icon: <Activity className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-600"
    },
    {
      title: "Fichas de Treino",
      value: loadingStats ? "..." : String(dashboardStats?.fichasTreinoAtivas || 0),
      change: loadingStats ? "..." : "ativas",
      icon: <Dumbbell className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-600"
    },
    {
      title: "Agendamentos",
      value: loadingStats ? "..." : String(dashboardStats?.agendamentosDoMes || 0),
      change: loadingStats ? "..." : "este mês",
      icon: <CalendarCheck className="w-5 h-5" />,
      trend: "up",
      color: "bg-blue-600"
    },
    {
      title: "Inativos",
      value: loadingStats ? "..." : String(dashboardStats?.alunosInativos || 0),
      change: loadingStats ? "..." : `${dashboardStats?.totalPagamentosPendentes || 0} pag. pendentes`,
      icon: <UserX className="w-5 h-5" />,
      trend: "down",
      color: "bg-blue-600"
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
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        {/* Header */}
        <PageHeader
          title="Painel Administrativo"
          description="Gerencie seus alunos e monitore o desempenho"
        />

        {/* Greeting Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-white mb-1">
              {getGreeting()}
            </h2>
            <p className="text-sm text-gray-400">
              {getFormattedTime()} • {currentTime.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards - Flat Design */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {stats.map((stat, index) => (
            <Card key={index} className="border-gray-800 bg-blue-950/30 hover:bg-blue-950/40 transition-colors" data-testid={`card-stat-${index}`}>
              <div className="p-4 flex flex-col items-center text-center">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-white mb-1.5">
                  {stat.value}
                </p>
                <p className={`text-xs font-medium ${
                  stat.trend === 'up' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions - Minimal Flat Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Adicionar Novo Aluno */}
          <Card 
            className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => setLocation('/admin/alunos')}
          >
            <div className="p-5 flex flex-col items-center text-center">
              <UserPlus className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Novo Aluno</h3>
              <p className="text-xs text-gray-500">Cadastrar aluno</p>
            </div>
          </Card>

          {/* Adicionar Novo Treino */}
          <Card 
            className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => setLocation('/admin/treinos-video')}
          >
            <div className="p-5 flex flex-col items-center text-center">
              <Video className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Novo Treino</h3>
              <p className="text-xs text-gray-500">Adicionar vídeo</p>
            </div>
          </Card>

          {/* Ver Agenda */}
          <Card 
            className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => setLocation('/admin/agenda')}
          >
            <div className="p-5 flex flex-col items-center text-center">
              <Calendar className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Ver Agenda</h3>
              <p className="text-xs text-gray-500">Atendimentos</p>
            </div>
          </Card>

          {/* Gerenciar Pagamentos */}
          <Card 
            className="group border-gray-800 bg-gray-900/30 hover:border-gray-700 transition-colors cursor-pointer"
            onClick={() => setLocation('/admin/pagamentos')}
          >
            <div className="p-5 flex flex-col items-center text-center">
              <CreditCard className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors mb-3" />
              <h3 className="text-sm font-medium text-white mb-1">Pagamentos</h3>
              <p className="text-xs text-gray-500">Controle financeiro</p>
            </div>
          </Card>
        </div>

        {/* Students Management - Minimal Flat Design */}
        <Card className="border-gray-800 bg-gray-900/30">
          <div className="p-5 border-b border-gray-800">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-base font-medium text-white">Alunos Recentes</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setLocation('/admin/alunos')}
                className="text-xs text-gray-400 hover:text-white"
              >
                Ver todos
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 text-sm h-9"
                data-testid="input-search-students"
              />
            </div>
          </div>

          {/* Students List */}
          <div className="divide-y divide-gray-800">
            {loadingAlunos ? (
              <div className="py-8 text-center text-sm text-gray-500">
                Carregando...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center gap-3 p-4 hover:bg-gray-800/30 transition-colors cursor-pointer"
                  data-testid={`card-student-${student.id}`}
                  onClick={() => setLocation('/admin/alunos')}
                >
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={student.fotoUrl || undefined} />
                    <AvatarFallback className="bg-gray-700 text-white text-xs">
                      {getInitials(student.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {student.nome}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {student.email}
                    </div>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`text-xs border-0 ${
                      student.status === 'ativo' 
                        ? 'bg-green-500/10 text-green-400' 
                        : student.status === 'pendente'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
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