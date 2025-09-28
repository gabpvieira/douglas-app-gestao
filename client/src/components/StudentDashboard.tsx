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
  Trophy
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function StudentDashboard() {
  // TODO: Remove mock functionality - replace with real data
  const student = {
    name: "Ana Silva",
    email: "ana@email.com",
    plan: "Trimestral",
    startDate: "15/01/2024",
    avatar: "/api/placeholder/60/60",
    currentWeight: 68.5,
    targetWeight: 60,
    initialWeight: 75
  };

  const progressData = [
    { month: 'Jan', weight: 75, bodyFat: 28 },
    { month: 'Fev', weight: 73, bodyFat: 26 },
    { month: 'Mar', weight: 71, bodyFat: 24 },
    { month: 'Abr', weight: 68.5, bodyFat: 22 }
  ];

  const workouts = [
    {
      id: 1,
      name: "Treino A - Peito e Tríceps",
      type: "PDF",
      uploadDate: "20/04/2024",
      completed: true
    },
    {
      id: 2,
      name: "Treino B - Costas e Bíceps",
      type: "PDF",
      uploadDate: "18/04/2024",
      completed: false
    },
    {
      id: 3,
      name: "Cardio HIIT - 20 minutos",
      type: "Video",
      uploadDate: "15/04/2024",
      completed: true
    }
  ];

  const stats = [
    {
      title: "Peso Perdido",
      value: "6.5kg",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-chart-2"
    },
    {
      title: "Treinos Concluídos",
      value: "24",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-primary"
    },
    {
      title: "Dias Ativos",
      value: "89",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-chart-3"
    },
    {
      title: "Meta Atingida",
      value: "87%",
      icon: <Target className="w-5 h-5" />,
      color: "text-chart-1"
    }
  ];

  const weightProgress = ((student.initialWeight - student.currentWeight) / (student.initialWeight - student.targetWeight)) * 100;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={student.avatar} />
            <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Olá, {student.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground">Plano {student.plan} • Membro desde {student.startDate}</p>
          </div>
        </div>
        <Badge className="bg-chart-2 text-white px-4 py-2">
          <Activity className="w-4 h-4 mr-1" />
          Ativo
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 text-center" data-testid={`card-stat-${index}`}>
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4`}>
              <div className={stat.color}>{stat.icon}</div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Weight Progress */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Progresso de Peso</h3>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Peso Inicial: {student.initialWeight}kg</span>
              <span>Meta: {student.targetWeight}kg</span>
            </div>
            <Progress value={weightProgress} className="h-3" />
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">{student.currentWeight}kg</span>
              <p className="text-sm text-muted-foreground">Peso Atual</p>
            </div>
          </div>
        </Card>

        {/* Chart */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Evolução Mensal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="month" className="text-muted-foreground" />
              <YAxis className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Workouts and Content */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Latest Workouts */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Meus Treinos</h3>
            <Button variant="outline" size="sm" data-testid="button-view-all-workouts">
              Ver Todos
            </Button>
          </div>
          <div className="space-y-4">
            {workouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 border rounded-lg hover-elevate" data-testid={`workout-item-${workout.id}`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {workout.type === 'PDF' ? (
                      <FileText className="w-5 h-5 text-primary" />
                    ) : (
                      <Video className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{workout.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {workout.uploadDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {workout.completed && (
                    <Badge className="bg-chart-2 text-white" size="sm">
                      Concluído
                    </Badge>
                  )}
                  <Button size="sm" variant="ghost" data-testid={`button-${workout.type === 'PDF' ? 'download' : 'play'}-${workout.id}`}>
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

        {/* Meal Plan */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Plano Alimentar</h3>
            <Button variant="outline" size="sm" data-testid="button-view-meal-plan">
              Ver Detalhes
            </Button>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-card/50 rounded-lg">
              <h4 className="font-medium mb-2">Café da Manhã</h4>
              <p className="text-sm text-muted-foreground">
                2 fatias de pão integral + 1 ovo mexido + 1 fruta
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg">
              <h4 className="font-medium mb-2">Almoço</h4>
              <p className="text-sm text-muted-foreground">
                120g de frango grelhado + salada + 4 colheres de arroz integral
              </p>
            </div>
            <div className="p-4 bg-card/50 rounded-lg">
              <h4 className="font-medium mb-2">Jantar</h4>
              <p className="text-sm text-muted-foreground">
                Peixe grelhado + legumes refogados + 1 batata doce pequena
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}