import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  TrendingUp, 
  FileText, 
  Video, 
  Calendar,
  Target,
  Activity,
  Download,
  Play,
  Clock,
  Trophy,
  Zap,
  Heart,
  BarChart3,
  ChevronRight,
  Star,
  Award,
  Flame
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useState, useEffect } from "react";

export default function StudentDashboardEnhanced() {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // TODO: Remove mock functionality - replace with real data
  const student = {
    name: "Ana Silva",
    email: "ana@email.com",
    plan: "Trimestral",
    startDate: "15/01/2024",
    avatar: "https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20female%20fitness%20trainer%20avatar%2C%20confident%20smile%2C%20athletic%20build%2C%20modern%20clean%20style%2C%20high%20quality%20portrait&image_size=square",
    currentWeight: 68.5,
    targetWeight: 60,
    initialWeight: 75,
    streakDays: 15,
    totalWorkouts: 24,
    nextWorkout: "Treino A - Peito e Tríceps",
    nextWorkoutTime: "14:00"
  };

  const progressData = [
    { month: 'Jan', weight: 75, bodyFat: 28, muscle: 45 },
    { month: 'Fev', weight: 73, bodyFat: 26, muscle: 47 },
    { month: 'Mar', weight: 71, bodyFat: 24, muscle: 49 },
    { month: 'Abr', weight: 68.5, bodyFat: 22, muscle: 51 }
  ];

  const recentWorkouts = [
    {
      id: 1,
      name: "Treino A - Peito e Tríceps",
      type: "PDF",
      uploadDate: "20/04/2024",
      completed: true,
      duration: "45 min",
      difficulty: "Intermediário",
      calories: 320
    },
    {
      id: 2,
      name: "Treino B - Costas e Bíceps",
      type: "PDF",
      uploadDate: "18/04/2024",
      completed: false,
      duration: "50 min",
      difficulty: "Avançado",
      calories: 380
    },
    {
      id: 3,
      name: "Cardio HIIT - 20 minutos",
      type: "Video",
      uploadDate: "15/04/2024",
      completed: true,
      duration: "20 min",
      difficulty: "Intenso",
      calories: 250
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: "Avaliação Física",
      date: "25/04/2024",
      time: "10:00",
      type: "assessment"
    },
    {
      id: 2,
      title: "Treino Personalizado",
      date: "26/04/2024",
      time: "14:00",
      type: "workout"
    },
    {
      id: 3,
      title: "Consultoria Nutricional",
      date: "28/04/2024",
      time: "16:00",
      type: "nutrition"
    }
  ];

  const stats = [
    {
      title: "Peso Perdido",
      value: "6.5kg",
      change: "-8.7%",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10"
    },
    {
      title: "Treinos Completos",
      value: "24",
      change: "+12%",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Dias de Streak",
      value: student.streakDays.toString(),
      change: "🔥",
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Meta Atingida",
      value: "87%",
      change: "+5%",
      icon: <Target className="w-5 h-5" />,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10"
    }
  ];

  const achievements = [
    { id: 1, title: "Primeiro Treino", description: "Complete seu primeiro treino", earned: true, icon: "🎯" },
    { id: 2, title: "Semana de Foco", description: "7 dias consecutivos de treino", earned: true, icon: "🏆" },
    { id: 3, title: "Perda de Peso", description: "Perda de 5kg ou mais", earned: true, icon: "⚡" },
    { id: 4, title: "Mês de Dedicação", description: "30 dias de treino", earned: false, icon: "💪" }
  ];

  const weightProgress = ((student.initialWeight - student.currentWeight) / (student.initialWeight - student.targetWeight)) * 100;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 lg:w-20 lg:h-20 border-4 border-white shadow-lg">
            <AvatarImage src={student.avatar} />
            <AvatarFallback>
              {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">
              Olá, {student.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-300">
              Plano {student.plan} • Membro desde {student.startDate}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1">
                <Activity className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Flame className="w-3 h-3 mr-1 text-orange-500" />
                {student.streakDays} dias seguidos
              </Badge>
            </div>
          </div>
        </div>
        
        {/* Next Workout Card */}
        <Card className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Próximo Treino</p>
              <p className="font-semibold">{student.nextWorkout}</p>
              <p className="text-xs opacity-80">{student.nextWorkoutTime}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-4 lg:p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 border-0">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {stat.change}
              </span>
            </div>
            <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {stat.title}
            </p>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Weight Progress */}
        <Card className="p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300 border-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
              Progresso de Peso
            </h3>
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Peso Inicial: {student.initialWeight}kg</span>
              <span>Meta: {student.targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-4 rounded-full" />
            <div className="text-center">
              <span className="text-3xl lg:text-4xl font-bold text-primary">
                {student.currentWeight}kg
              </span>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                Peso Atual
              </p>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-6 lg:p-8 lg:col-span-2 hover:shadow-lg transition-shadow duration-300 border-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
              Evolução Mensal
            </h3>
            <BarChart3 className="w-5 h-5 text-slate-500" />
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-slate-500" />
              <YAxis className="text-slate-500" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                fill="url(#colorWeight)"
              />
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Workouts & Achievements */}
      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Recent Workouts */}
        <Card className="p-6 lg:p-8 lg:col-span-2 hover:shadow-lg transition-shadow duration-300 border-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
              Meus Treinos Recentes
            </h3>
            <Button variant="outline" size="sm" className="gap-2">
              Ver Todos
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="space-y-4">
            {recentWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${workout.completed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
                    {workout.type === 'PDF' ? (
                      <FileText className={`w-5 h-5 ${workout.completed ? 'text-green-600' : 'text-blue-600'}`} />
                    ) : (
                      <Video className={`w-5 h-5 ${workout.completed ? 'text-green-600' : 'text-blue-600'}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {workout.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workout.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        {workout.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {workout.calories} cal
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workout.completed && (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Star className="w-3 h-3 mr-1" />
                      Concluído
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" className="p-2">
                    {workout.type === 'PDF' ? (
                      <Download className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Achievements */}
        <Card className="p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300 border-0">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
              Conquistas
            </h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div key={achievement.id} className={`p-3 rounded-lg border ${achievement.earned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {achievement.title}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {achievement.description}
                    </p>
                  </div>
                  {achievement.earned && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300 border-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl lg:text-2xl font-semibold text-slate-900 dark:text-white">
            Próximos Eventos
          </h3>
          <Calendar className="w-5 h-5 text-slate-500" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  event.type === 'assessment' ? 'bg-purple-500' :
                  event.type === 'workout' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
                <p className="font-semibold text-slate-900 dark:text-white">
                  {event.title}
                </p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {event.date} às {event.time}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}