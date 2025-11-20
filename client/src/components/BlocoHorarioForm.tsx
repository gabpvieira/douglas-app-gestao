import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BlocoHorario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BlocoHorarioFormProps {
  blocos: BlocoHorario[];
  onBlocoCreated: (bloco: BlocoHorario) => void;
  onBlocoUpdated: (bloco: BlocoHorario) => void;
  onBlocoDeleted: (id: string) => void;
}

const diasSemana = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

export function BlocoHorarioForm({ blocos, onBlocoCreated, onBlocoUpdated, onBlocoDeleted }: BlocoHorarioFormProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBloco, setEditingBloco] = useState<BlocoHorario | null>(null);
  const [formData, setFormData] = useState({
    diaSemana: '',
    horaInicio: '',
    horaFim: '',
    ativo: true,
  });

  const resetForm = () => {
    setFormData({
      diaSemana: '',
      horaInicio: '',
      horaFim: '',
      ativo: true,
    });
    setEditingBloco(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.diaSemana || !formData.horaInicio || !formData.horaFim) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const blocoData = {
        id: editingBloco?.id || `bloco-${Date.now()}`,
        diaSemana: parseInt(formData.diaSemana),
        horaInicio: formData.horaInicio,
        horaFim: formData.horaFim,
        ativo: formData.ativo,
        createdAt: editingBloco?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (editingBloco) {
        onBlocoUpdated(blocoData);
        toast({
          title: "Sucesso",
          description: "Bloco de horário atualizado com sucesso",
        });
      } else {
        onBlocoCreated(blocoData);
        toast({
          title: "Sucesso",
          description: "Bloco de horário criado com sucesso",
        });
      }

      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar bloco de horário",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (bloco: BlocoHorario) => {
    setEditingBloco(bloco);
    setFormData({
      diaSemana: bloco.diaSemana.toString(),
      horaInicio: bloco.horaInicio,
      horaFim: bloco.horaFim,
      ativo: bloco.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este bloco de horário?')) return;

    try {
      onBlocoDeleted(id);
      toast({
        title: "Sucesso",
        description: "Bloco de horário excluído com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir bloco de horário",
        variant: "destructive",
      });
    }
  };

  const getDiaSemanaLabel = (dia: number) => {
    return diasSemana.find(d => d.value === dia)?.label || '';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Blocos de Horário</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Bloco
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingBloco ? 'Editar Bloco de Horário' : 'Novo Bloco de Horário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="diaSemana">Dia da Semana</Label>
                <Select value={formData.diaSemana} onValueChange={(value) => setFormData({ ...formData, diaSemana: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    {diasSemana.map((dia) => (
                      <SelectItem key={dia.value} value={dia.value.toString()}>
                        {dia.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="horaInicio">Hora de Início</Label>
                <Input
                  id="horaInicio"
                  type="time"
                  value={formData.horaInicio}
                  onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="horaFim">Hora de Fim</Label>
                <Input
                  id="horaFim"
                  type="time"
                  value={formData.horaFim}
                  onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={formData.ativo}
                  onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingBloco ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blocos.map((bloco) => (
          <Card key={bloco.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex justify-between items-center">
                {getDiaSemanaLabel(bloco.diaSemana)}
                <Badge variant={bloco.ativo ? "default" : "secondary"}>
                  {bloco.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {bloco.horaInicio} - {bloco.horaFim}
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(bloco)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(bloco.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}