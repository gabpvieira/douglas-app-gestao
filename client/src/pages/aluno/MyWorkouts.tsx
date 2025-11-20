import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Dumbbell,
  Calendar,
  Clock,
  Download,
  CheckCircle2,
  Circle,
  FileText,
  Target,
  TrendingUp,
  Play,
  ChevronRight
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  notes?: string;
}

interface Workout {
  id: number;
  name: string;
  type: "A" | "B" | "C" | "D" | "E";
  focus: string;
  duration: string;
  exercises: Exercise[];
  assignedDate: string;
  completed: boolean;
  completedDate?: string;
}

export default function MyWorkouts() {
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [activeTab, setActiveTab] = useState("current");

  // TODO: Replace with real data from API
  const workouts: Workout[] = [
    {
      id: 1,
      name: "Treino A - Peito e Tríceps",
      type: "A",
      focus: "Peito, Tríceps",
      duration: "60 min",
      assignedDate: "20/04/2024",
      completed: true,
      completedDate: "21/04/2024",
      exercises: [
        { name: "Supino Reto", sets: "4", reps: "8-12", rest: "90s", notes: "Controle na descida" },
        { name: "Supino Inclinado", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Crucifixo", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Tríceps Testa", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Tríceps Corda", sets: "3", reps: "12-15", rest: "45s" }
      ]
    },
    {
      id: 2,
      name: "Treino B - Costas e Bíceps",
      type: "B",
      focus: "Costas, Bíceps",
      duration: "65 min",
      assignedDate: "18/04/2024",
      completed: false,
      exercises: [
        { name: "Barra Fixa", sets: "4", reps: "6-10", rest: "90s", notes: "Usar auxílio se necessário" },
        { name: "Remada Curvada", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Puxada Frontal", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Rosca Direta", sets: "3", reps: "10-12", rest: "60s" },
        { name: "Rosca Martelo", sets: "3", reps: "12-15", rest: "45s" }
      ]
    },
    {
      id: 3,
      name: "Treino C - Pernas",
      type: "C",
      focus: "Quadríceps, Posterior, Glúteos",
      duration: "70 min",
      assignedDate: "15/04/2024",
      completed: true,
      completedDate: "16/04/2024",
      exercises: [
        { name: "Agachamento Livre", sets: "4", reps: "8-12", rest: "120s", notes: "Profundidade completa" },
        { name: "Leg Press 45°", sets: "4", reps: "12-15", rest: "90s" },
        { name: "Cadeira Extensora", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Mesa Flexora", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Stiff", sets: "3", reps: "10-12", rest: "60s" }
      ]
    },
    {
      id: 4,
      name: "Treino D - Ombros e Abdômen",
      type: "D",
      focus: "Ombros, Core",
      duration: "55 min",
      assignedDate: "12/04/2024",
      completed: false,
      exercises: [
        { name: "Desenvolvimento", sets: "4", reps: "8-12", rest: "90s" },
        { name: "Elevação Lateral", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Elevação Frontal", sets: "3", reps: "12-15", rest: "60s" },
        { name: "Abdominal Supra", sets: "3", reps: "15-20", rest: "45s" },
        { name: "Prancha", sets: "3", reps: "45-60s", rest: "60s" }
      ]
    }
  ];

  const currentWorkouts = workouts.filter(w => !w.completed);
  const completedWorkouts = workouts.filter(w => w.completed);
  
  const totalWorkouts = workouts.length;
  const completedCount = completedWorkouts.length;
  const completionRate = Math.round((completedCount / totalWorkouts) * 100);

  const handleViewWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
  };

  const handleMarkComplete = (workoutId: number) => {
    // TODO: Implement API call to mark workout as complete
    console.log("Mark workout complete:", workoutId);
  };

  const WorkoutCard = ({ workout }: { workout: Workout }) => (
    <Card 
      className="p-6 hover-elevate cursor-pointer transition-all"
      onClick={() => handleViewWorkout(workout)}
      data-testid={`workout-card-${workout.id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
            workout.completed ? 'bg-chart-2/20 text-chart-2' : 'bg-primary/20 text-primary'
          }`}>
            {workout.type}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{workout.name}</h3>
            <p className="text-sm text-muted-foreground">{workout.focus}</p>
          </div>
        </div>
        {workout.completed ? (
          <Badge className="bg-chart-2 text-white">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Concluído
          </Badge>
        ) : (
          <Badge variant="outline">
            <Circle className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {workout.duration}
        </div>
        <div className="flex items-center gap-1">
          <Dumbbell className="w-4 h-4" />
          {workout.exercises.length} exercícios
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {workout.completed ? workout.completedDate : workout.assignedDate}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          className="text-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleViewWorkout(workout);
          }}
        >
          Ver Detalhes
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        {!workout.completed && (
          <Button 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleMarkComplete(workout.id);
            }}
            data-testid={`button-complete-${workout.id}`}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Marcar como Concluído
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meus Treinos</h1>
          <p className="text-muted-foreground">Acesse seus planos de treino personalizados</p>
        </div>
        <Button variant="outline" data-testid="button-download-all">
          <Download className="w-4 h-4 mr-2" />
          Baixar Todos
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Total de Treinos</p>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{totalWorkouts}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Concluídos</p>
            <CheckCircle2 className="w-5 h-5 text-chart-2" />
          </div>
          <p className="text-3xl font-bold">{completedCount}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
            <TrendingUp className="w-5 h-5 text-chart-3" />
          </div>
          <p className="text-3xl font-bold">{completionRate}%</p>
          <Progress value={completionRate} className="mt-2 h-2" />
        </Card>
      </div>

      {/* Workouts Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">
            Treinos Atuais ({currentWorkouts.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídos ({completedWorkouts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4 mt-6">
          {currentWorkouts.length > 0 ? (
            currentWorkouts.map(workout => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum treino pendente</h3>
              <p className="text-muted-foreground">
                Parabéns! Você completou todos os treinos atribuídos.
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedWorkouts.length > 0 ? (
            completedWorkouts.map(workout => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))
          ) : (
            <Card className="p-12 text-center">
              <Dumbbell className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhum treino concluído ainda</h3>
              <p className="text-muted-foreground">
                Complete seus treinos para vê-los aqui.
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Workout Details Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                selectedWorkout?.completed ? 'bg-chart-2/20 text-chart-2' : 'bg-primary/20 text-primary'
              }`}>
                {selectedWorkout?.type}
              </div>
              {selectedWorkout?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedWorkout?.focus} • {selectedWorkout?.duration}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Workout Info */}
            <div className="flex items-center gap-4 text-sm">
              <Badge variant="outline">
                <Calendar className="w-3 h-3 mr-1" />
                Atribuído em {selectedWorkout?.assignedDate}
              </Badge>
              {selectedWorkout?.completed && (
                <Badge className="bg-chart-2 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Concluído em {selectedWorkout?.completedDate}
                </Badge>
              )}
            </div>

            {/* Exercises List */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Dumbbell className="w-4 h-4" />
                Exercícios ({selectedWorkout?.exercises.length})
              </h4>
              {selectedWorkout?.exercises.map((exercise, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-medium">{exercise.name}</h5>
                        {exercise.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            💡 {exercise.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                    <div className="bg-muted/50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground mb-1">Séries</p>
                      <p className="font-semibold">{exercise.sets}</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground mb-1">Repetições</p>
                      <p className="font-semibold">{exercise.reps}</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground mb-1">Descanso</p>
                      <p className="font-semibold">{exercise.rest}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1" data-testid="button-download-workout">
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              {!selectedWorkout?.completed && (
                <Button 
                  className="flex-1"
                  onClick={() => {
                    if (selectedWorkout) {
                      handleMarkComplete(selectedWorkout.id);
                      setSelectedWorkout(null);
                    }
                  }}
                  data-testid="button-complete-workout-dialog"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Marcar como Concluído
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
