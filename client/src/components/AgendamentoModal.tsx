import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string;
  altura?: number;
  genero?: string;
  status?: string;
}

interface BlocoHorario {
  id: string;
  diaSemana: number;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

interface Agendamento {
  id: string;
  alunoId: string;
  blocoHorarioId: string;
  dataHora: Date;
  status: 'agendado' | 'confirmado' | 'cancelado' | 'realizado';
  observacoes?: string;
  aluno?: Aluno;
  blocoHorario?: BlocoHorario;
}

interface AgendamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agendamentoData: any) => void;
  agendamento?: Agendamento | null;
  alunos: Aluno[];
  blocosHorarios: BlocoHorario[];
}

export function AgendamentoModal({ 
  isOpen, 
  onClose, 
  onSave,
  agendamento, 
  alunos,
  blocosHorarios
}: AgendamentoModalProps) {
  const [formData, setFormData] = useState({
    alunoId: '',
    blocoHorarioId: '',
    data: '',
    hora: '',
    status: 'agendado' as 'agendado' | 'confirmado' | 'cancelado' | 'realizado',
    observacoes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (agendamento) {
        // Editing existing appointment
        const dataHora = new Date(agendamento.dataHora);
        setFormData({
          alunoId: agendamento.alunoId,
          blocoHorarioId: agendamento.blocoHorarioId,
          data: dataHora.toISOString().split('T')[0],
          hora: dataHora.toTimeString().slice(0, 5),
          status: agendamento.status,
          observacoes: agendamento.observacoes || '',
        });
      } else {
        // Reset form for new appointment
        const today = new Date();
        setFormData({
          alunoId: '',
          blocoHorarioId: '',
          data: today.toISOString().split('T')[0],
          hora: '',
          status: 'agendado',
          observacoes: '',
        });
      }
    }
  }, [isOpen, agendamento]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.alunoId || !formData.blocoHorarioId || !formData.data || !formData.hora) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos",
        variant: "destructive",
      });
      return;
    }

    try {
      const dataHora = new Date(`${formData.data}T${formData.hora}:00`);
      
      const agendamentoData = {
        alunoId: formData.alunoId,
        blocoHorarioId: formData.blocoHorarioId,
        dataHora: dataHora,
        status: formData.status,
        observacoes: formData.observacoes || undefined,
      };

      // Chamar a função onSave passada como prop
      await onSave(agendamentoData);
      
      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar agendamento",
        variant: "destructive",
      });
    }
  };

  const getFilteredBlocosHorarios = () => {
    if (!formData.data) return blocosHorarios.filter(bloco => bloco.ativo);
    
    const selectedDate = new Date(formData.data);
    const dayOfWeek = selectedDate.getDay();
    
    return blocosHorarios.filter(bloco => bloco.diaSemana === dayOfWeek && bloco.ativo);
  };

  const getDiaSemanaLabel = (dia: number) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="alunoId">Aluno *</Label>
            <Select value={formData.alunoId} onValueChange={(value) => setFormData({ ...formData, alunoId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o aluno" />
              </SelectTrigger>
              <SelectContent>
                {alunos.map((aluno) => (
                  <SelectItem key={aluno.id} value={aluno.id}>
                    {aluno.nome} ({aluno.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data">Data *</Label>
            <Input
              id="data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="blocoHorarioId">Bloco de Horário *</Label>
            <Select 
              value={formData.blocoHorarioId} 
              onValueChange={(value) => setFormData({ ...formData, blocoHorarioId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o horário" />
              </SelectTrigger>
              <SelectContent>
                {getFilteredBlocosHorarios().map((bloco) => (
                  <SelectItem key={bloco.id} value={bloco.id}>
                    {getDiaSemanaLabel(bloco.diaSemana)} - {bloco.horaInicio} às {bloco.horaFim}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hora">Hora Específica *</Label>
            <Input
              id="hora"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="confirmado">Confirmado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
                <SelectItem value="realizado">Realizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Observações adicionais..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {agendamento ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}