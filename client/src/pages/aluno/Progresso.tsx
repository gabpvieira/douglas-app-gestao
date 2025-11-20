import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  TrendingUp,
  TrendingDown,
  Weight,
  Ruler,
  Activity,
  Calendar,
  Plus,
  Camera,
  Image as ImageIcon,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProgressEntry {
  id: number;
  date: string;
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
}

interface ProgressPhoto {
  id: number;
  date: string;
  type: "front" | "side" | "back";
  url: string;
}

export default function Progresso() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"1m" | "3m" | "6m" | "all">("3m");

  // TODO: Replace with real data from API
  const progressData: ProgressEntry[] = [
    {
      id: 1,
      date: "2024-01-15",
      weight: 75.0,
      bodyFat: 28,
      muscleMass: 42,
      chest: 95,
      waist: 85,
      hips: 105,
      arms: 32,
      thighs: 58
    },
    {
      id: 2,
      date: "2024-02-15",
      weight: 73.0,
      bodyFat: 26,
      muscleMass: 43,
      chest: 94,
      waist: 82,
      hips: 103,
      arms: 32,
      thighs: 57
    },
    {
      id: 3,
      date: "2024-03-15",
      weight: 71.0,
      bodyFat: 24,
      muscleMass: 44,
      chest: 93,
      waist: 79,
      hips: 101,
      arms: 33,
      thighs: 56
    },
    {
      id: 4,
      date: "2024-04-15",
      weight: 68.5,
      bodyFat: 22,
      muscleMass: 45,
      chest: 92,
      waist: 76,
      hips: 99,
      arms: 33,
      thighs: 55
    }
  ];

  const photos: ProgressPhoto[] = [
    {
      id: 1,
      date: "2024-01-15",
      type: "front",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    },
    {
      id: 2,
      date: "2024-01-15",
      type: "side",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    },
    {
      id: 3,
      date: "2024-04-15",
      type: "front",
      url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400"
    }
  ];

  const latestEntry = progressData[progressData.length - 1];
  const firstEntry = progressData[0];
  const weightLoss = firstEntry.weight - latestEntry.weight;
  const bodyFatLoss = (firstEntry.bodyFat || 0) - (latestEntry.bodyFat || 0);
  const muscleMassGain = (latestEntry.muscleMass || 0) - (firstEntry.muscleMass || 0);

  const chartData = progressData.map(entry => ({
    date: format(new Date(entry.date), "dd/MM", { locale: ptBR }),
    peso: entry.weight,
    gordura: entry.bodyFat,
    musculo: entry.muscleMass
  }));

  const measurementsData = progressData.map(entry => ({
    date: format(new Date(entry.date), "dd/MM", { locale: ptBR }),
    peito: entry.chest,
    cintura: entry.waist,
    quadril: entry.hips,
    braço: entry.arms,
    coxa: entry.thighs
  }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Meu Progresso</h1>
          <p className="text-muted-foreground">Acompanhe sua evolução física ao longo do tempo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPhotoDialog(true)} data-testid="button-add-photo">
            <Camera className="w-4 h-4 mr-2" />
            Adicionar Foto
          </Button>
          <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-progress">
            <Plus className="w-4 h-4 mr-2" />
            Registrar Progresso
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Peso Perdido</p>
            <TrendingDown className="w-5 h-5 text-chart-2" />
          </div>
          <p className="text-3xl font-bold text-chart-2">{weightLoss.toFixed(1)} kg</p>
          <p className="text-xs text-muted-foreground mt-1">
            {firstEntry.weight}kg → {latestEntry.weight}kg
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Gordura Reduzida</p>
            <TrendingDown className="w-5 h-5 text-chart-3" />
          </div>
          <p className="text-3xl font-bold text-chart-3">{bodyFatLoss.toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground mt-1">
            {firstEntry.bodyFat}% → {latestEntry.bodyFat}%
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Massa Muscular</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-bold text-primary">+{muscleMassGain.toFixed(1)} kg</p>
          <p className="text-xs text-muted-foreground mt-1">
            {firstEntry.muscleMass}kg → {latestEntry.muscleMass}kg
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Registros</p>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-3xl font-bold">{progressData.length}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Desde {format(new Date(firstEntry.date), "MMM/yyyy", { locale: ptBR })}
          </p>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
        </TabsList>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          {/* Period Selector */}
          <div className="flex justify-end gap-2">
            <Button
              variant={selectedPeriod === "1m" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("1m")}
            >
              1 Mês
            </Button>
            <Button
              variant={selectedPeriod === "3m" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("3m")}
            >
              3 Meses
            </Button>
            <Button
              variant={selectedPeriod === "6m" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("6m")}
            >
              6 Meses
            </Button>
            <Button
              variant={selectedPeriod === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("all")}
            >
              Tudo
            </Button>
          </div>

          {/* Weight Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Weight className="w-5 h-5 text-primary" />
              Evolução de Peso
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="peso" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                  name="Peso (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Body Composition Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Composição Corporal
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="gordura" 
                  stroke="hsl(var(--chart-3))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                  name="Gordura (%)"
                />
                <Line 
                  type="monotone" 
                  dataKey="musculo" 
                  stroke="hsl(var(--chart-2))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                  name="Músculo (kg)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Measurements Tab */}
        <TabsContent value="measurements" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              Evolução de Medidas (cm)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={measurementsData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="peito" fill="hsl(var(--chart-1))" name="Peito" />
                <Bar dataKey="cintura" fill="hsl(var(--chart-2))" name="Cintura" />
                <Bar dataKey="quadril" fill="hsl(var(--chart-3))" name="Quadril" />
                <Bar dataKey="braço" fill="hsl(var(--chart-4))" name="Braço" />
                <Bar dataKey="coxa" fill="hsl(var(--chart-5))" name="Coxa" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Measurements Table */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Medidas</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 text-sm font-medium">Data</th>
                    <th className="text-center p-3 text-sm font-medium">Peito</th>
                    <th className="text-center p-3 text-sm font-medium">Cintura</th>
                    <th className="text-center p-3 text-sm font-medium">Quadril</th>
                    <th className="text-center p-3 text-sm font-medium">Braço</th>
                    <th className="text-center p-3 text-sm font-medium">Coxa</th>
                  </tr>
                </thead>
                <tbody>
                  {progressData.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-sm">
                        {format(new Date(entry.date), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="text-center p-3 text-sm">{entry.chest} cm</td>
                      <td className="text-center p-3 text-sm">{entry.waist} cm</td>
                      <td className="text-center p-3 text-sm">{entry.hips} cm</td>
                      <td className="text-center p-3 text-sm">{entry.arms} cm</td>
                      <td className="text-center p-3 text-sm">{entry.thighs} cm</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="aspect-[3/4] bg-muted relative">
                  <img 
                    src={photo.url} 
                    alt={`Progresso ${photo.type}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-medium capitalize">{photo.type === "front" ? "Frente" : photo.type === "side" ? "Lateral" : "Costas"}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(photo.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {photos.length === 0 && (
            <Card className="p-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma foto registrada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione fotos para acompanhar sua evolução visual
              </p>
              <Button onClick={() => setShowPhotoDialog(true)}>
                <Camera className="w-4 h-4 mr-2" />
                Adicionar Primeira Foto
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Progress Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Registrar Novo Progresso</DialogTitle>
            <DialogDescription>
              Adicione suas medidas e acompanhe sua evolução
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input id="date" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input id="weight" type="number" step="0.1" placeholder="68.5" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bodyFat">Gordura Corporal (%)</Label>
                <Input id="bodyFat" type="number" step="0.1" placeholder="22.0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
                <Input id="muscleMass" type="number" step="0.1" placeholder="45.0" />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-4">Medidas Corporais (cm)</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chest">Peito</Label>
                  <Input id="chest" type="number" step="0.1" placeholder="92" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waist">Cintura</Label>
                  <Input id="waist" type="number" step="0.1" placeholder="76" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hips">Quadril</Label>
                  <Input id="hips" type="number" step="0.1" placeholder="99" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arms">Braço</Label>
                  <Input id="arms" type="number" step="0.1" placeholder="33" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="thighs">Coxa</Label>
                  <Input id="thighs" type="number" step="0.1" placeholder="55" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Input id="notes" placeholder="Ex: Sentindo mais energia, roupas mais folgadas..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowAddDialog(false)} data-testid="button-save-progress">
              Salvar Progresso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Photo Dialog */}
      <Dialog open={showPhotoDialog} onOpenChange={setShowPhotoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Foto de Progresso</DialogTitle>
            <DialogDescription>
              Registre sua evolução visual
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="photoDate">Data</Label>
              <Input id="photoDate" type="date" defaultValue={format(new Date(), "yyyy-MM-dd")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoType">Tipo de Foto</Label>
              <select id="photoType" className="w-full p-2 border rounded-md">
                <option value="front">Frente</option>
                <option value="side">Lateral</option>
                <option value="back">Costas</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Upload da Foto</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar ou arraste a foto aqui
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhotoDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setShowPhotoDialog(false)}>
              Adicionar Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
