import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Target,
  Plus,
  CheckCircle2,
  Circle,
  TrendingUp,
  Calendar,
  Edit2,
  Trash2,
  Flag,
  Award,
  Clock
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: "peso" | "medidas" | "treino" | "habitos" | "outro";
  targetValue: string;
  currentValue: string;
  unit: string;
  startDate: string;
  targetDate: string;
  status: "em_progresso" | "concluida" | "pausada";
  priority: "alta" | "media" | "baixa";
}

export default function Metas() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "em_progresso" | "concluida">("all");

  // TODO: Replace with real data from API
  const goals: Goal[] = [
    {
      id: 1,
      title: "Perder 10kg",
      description: "Reduzir peso de 75kg para 65kg através de dieta balanceada e exercícios regulares",
      category: "peso",
      targetValue: "65",
      currentValue: "68.5",
      unit: "kg",
      startDate: "2024-01-15",
      targetDate: "2024-07-15",
      status: "em_progresso",
      priority: "alta"
    },
    {
      id: 2,
      title: "Reduzir Cintura",
      description: "Diminuir medida da cintura para 70cm",
      category: "medidas",
      targetValue: "70",
      currentValue: "76",
      unit: "cm",
      startDate: "2024-01-15",
      targetDate: "2024-06-15",
      status: "em_progresso",
      priority: "alta"
    },
    {
      id: 3,
      title: "Treinar 5x por Semana",
      description: "Manter consistência de 5 treinos semanais",
      category: "treino",
      targetValue: "5",
      currentValue: "4",
      unit: "treinos/semana",
      startDate: "2024-02-01",
      targetDate: "2024-12-31",
      status: "em_progresso",
      priority: "media"
    },
    {
      id: 4,
      title: "Beber 2L de Água",
      description: "Manter hidratação adequada diariamente",
      category: "habitos",
      targetValue: "2",
      currentValue: "1.5",
      unit: "litros/dia",
      startDate: "2024-01-01",
      targetDate: "2024-12-31",
      status: "em_progresso",
      priority: "media"
    },
    {
      id: 5,
      title: "Correr 5km",
      description: "Conseguir correr 5km sem parar",
      category: "treino",
      targetValue: "5",
      currentValue: "5",
      unit: "km",
      startDate: "2024-01-01",
      targetDate: "2024-03-31",
      status: "concluida",
      priority: "baixa"
    }
  ];

  const filteredGoals = goals.filter(goal => 
    filterStatus === "all" ? true : goal.status === filterStatus
  );

  const activeGoals = goals.filter(g => g.status === "em_progresso").length;
  const completedGoals = goals.filter(g => g.status === "concluida").length;
  const completionRate = Math.round((completedGoals / goals.length) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "peso": return "⚖️";
      case "medidas": return "📏";
      case "treino": return "💪";
      case "habitos": return "🎯";
      default: return "📌";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "peso": return "Peso";
      case "medidas": return "Medidas";
      case "treino": return "Treino";
      case "habitos": return "Hábitos";
      default: return "Outro";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "text-red-500 border-red-500";
      case "media": return "text-yellow-500 border-yellow-500";
      case "baixa": return "text-blue-500 border-blue-500";
      default: return "";
    }
  };

  const calculateProgress = (goal: Goal) => {
    const current = parseFloat(goal.currentValue);
    const target = parseFloat(goal.targetValue);
    const start = parseFloat(goal.currentValue); // Simplified - should track initial value
    
    if (goal.category === "peso" || goal.category === "medidas") {
      // For weight/measurements, progress is reduction
      return Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100));
    } else {
      // For other goals, progress is increase
      return Math.min(100, Math.max(0, (current / target) * 100));
    }
  };

  const getDaysRemaining = (targetDate: string) => {
    return differenceInDays(new Date(targetDate), new Date());
  };

  const GoalCard = ({ goal }: { goal: Goal }) => {
    const progress = calculateProgress(goal);
    const daysRemaining = getDaysRemaining(goal.targetDate);
    
    return (
      <Card 
        className={`p-6 hover-elevate cursor-pointer transition-all ${
          goal.status === 'concluida' ? 'border-chart-2' : ''
        }`}
        onClick={() => setSelectedGoal(goal)}
        data-testid={`goal-card-${goal.id}`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getCategoryIcon(goal.category)}</div>
            <div>
              <h3 className="font-semibold text-lg">{goal.title}</h3>
              <p className="text-sm text-muted-foreground">{getCategoryLabel(goal.category)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getPriorityColor(goal.priority)}>
              <Flag className="w-3 h-3 mr-1" />
              {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
            </Badge>
            {goal.status === "concluida" ? (
              <Badge className="bg-chart-2 text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Concluída
              </Badge>
            ) : (
              <Badge variant="outline">
                <Circle className="w-3 h-3 mr-1" />
                Em Progresso
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-semibold">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>
                {goal.currentValue} {goal.unit} → {goal.targetValue} {goal.unit}
              </span>
            </div>
            {goal.status !== "concluida" && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{daysRemaining} dias</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Minhas Metas</h1>
          <p className="text-muted-foreground">Defina e acompanhe seus objetivos fitness</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-goal">
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Metas Ativas</p>
            <Target className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold">{activeGoals}</p>
          <p className="text-xs text-muted-foreground mt-1">em progresso</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Concluídas</p>
            <Award className="w-5 h-5 text-chart-2" />
          </div>
          <p className="text-3xl font-bold">{completedGoals}</p>
          <p className="text-xs text-muted-foreground mt-1">metas alcançadas</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            <TrendingUp className="w-5 h-5 text-chart-3" />
          </div>
          <p className="text-3xl font-bold">{completionRate}%</p>
          <Progress value={completionRate} className="mt-2 h-2" />
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("all")}
        >
          Todas ({goals.length})
        </Button>
        <Button
          variant={filterStatus === "em_progresso" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("em_progresso")}
        >
          Em Progresso ({activeGoals})
        </Button>
        <Button
          variant={filterStatus === "concluida" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilterStatus("concluida")}
        >
          Concluídas ({completedGoals})
        </Button>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <Card className="p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma meta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece definindo suas primeiras metas fitness
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Meta
            </Button>
          </Card>
        )}
      </div>

      {/* Goal Details Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedGoal && getCategoryIcon(selectedGoal.category)}</span>
              {selectedGoal?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedGoal && getCategoryLabel(selectedGoal.category)}
            </DialogDescription>
          </DialogHeader>

          {selectedGoal && (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getPriorityColor(selectedGoal.priority)}>
                  Prioridade {selectedGoal.priority}
                </Badge>
                {selectedGoal.status === "concluida" ? (
                  <Badge className="bg-chart-2 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Concluída
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <Circle className="w-3 h-3 mr-1" />
                    Em Progresso
                  </Badge>
                )}
              </div>

              <div>
                <h4 className="font-medium mb-2">Descrição</h4>
                <p className="text-muted-foreground">{selectedGoal.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4 bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Valor Atual</p>
                  <p className="text-2xl font-bold">
                    {selectedGoal.currentValue} {selectedGoal.unit}
                  </p>
                </Card>
                <Card className="p-4 bg-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Meta</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedGoal.targetValue} {selectedGoal.unit}
                  </p>
                </Card>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-sm font-semibold">{calculateProgress(selectedGoal).toFixed(0)}%</span>
                </div>
                <Progress value={calculateProgress(selectedGoal)} className="h-3" />
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Início</p>
                    <p className="font-medium">
                      {format(new Date(selectedGoal.startDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Prazo</p>
                    <p className="font-medium">
                      {format(new Date(selectedGoal.targetDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </div>

              {selectedGoal.status !== "concluida" && (
                <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {getDaysRemaining(selectedGoal.targetDate)} dias restantes
                    </p>
                    <p className="text-xs text-muted-foreground">
                      para atingir sua meta
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit2 className="w-4 h-4 mr-2" />
              Editar
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
            {selectedGoal?.status !== "concluida" && (
              <Button size="sm" className="bg-chart-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Marcar como Concluída
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Nova Meta</DialogTitle>
            <DialogDescription>
              Defina um objetivo claro e mensurável para acompanhar seu progresso
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalTitle">Título da Meta</Label>
              <Input id="goalTitle" placeholder="Ex: Perder 10kg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goalDescription">Descrição</Label>
              <Textarea 
                id="goalDescription" 
                placeholder="Descreva sua meta e como pretende alcançá-la"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select id="category" className="w-full p-2 border rounded-md">
                  <option value="peso">⚖️ Peso</option>
                  <option value="medidas">📏 Medidas</option>
                  <option value="treino">💪 Treino</option>
                  <option value="habitos">🎯 Hábitos</option>
                  <option value="outro">📌 Outro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <select id="priority" className="w-full p-2 border rounded-md">
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentValue">Valor Atual</Label>
                <Input id="currentValue" type="number" step="0.1" placeholder="75" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetValue">Valor Meta</Label>
                <Input id="targetValue" type="number" step="0.1" placeholder="65" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input id="unit" placeholder="kg" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input id="startDate" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input id="targetDate" type="date" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowAddDialog(false)} data-testid="button-save-goal">
              Criar Meta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
