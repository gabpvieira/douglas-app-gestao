import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, User, Edit, Trash2, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Aluno {
  id: string;
  nome: string;
  email: string;
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

interface AgendamentsListProps {
  agendamentos: Agendamento[];
  onEditAgendamento: (agendamento: Agendamento) => void;
  onDeleteAgendamento: (id: string) => void;
  onRefresh: () => void;
}

export function AgendamentosList({ 
  agendamentos, 
  onEditAgendamento, 
  onDeleteAgendamento,
  onRefresh 
}: AgendamentsListProps) {
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>(agendamentos);
  const [filters, setFilters] = useState({
    status: '',
    aluno: '',
    dataInicio: '',
    dataFim: '',
  });

  useEffect(() => {
    applyFilters();
  }, [agendamentos, filters]);

  const applyFilters = () => {
    let filtered = [...agendamentos];

    if (filters.status) {
      filtered = filtered.filter(agendamento => agendamento.status === filters.status);
    }

    if (filters.aluno) {
      filtered = filtered.filter(agendamento => 
        agendamento.aluno?.nome.toLowerCase().includes(filters.aluno.toLowerCase()) ||
        agendamento.aluno?.email.toLowerCase().includes(filters.aluno.toLowerCase())
      );
    }

    if (filters.dataInicio) {
      const dataInicio = new Date(filters.dataInicio);
      filtered = filtered.filter(agendamento => 
        new Date(agendamento.dataHora) >= dataInicio
      );
    }

    if (filters.dataFim) {
      const dataFim = new Date(filters.dataFim);
      dataFim.setHours(23, 59, 59, 999);
      filtered = filtered.filter(agendamento => 
        new Date(agendamento.dataHora) <= dataFim
      );
    }

    // Sort by date/time
    filtered.sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

    setFilteredAgendamentos(filtered);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      aluno: '',
      dataInicio: '',
      dataFim: '',
    });
  };

  const handleDeleteAgendamento = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        // Removido: chamada de API
        // const response = await fetch(`/api/admin/agendamentos/${id}`, {
        //   method: 'DELETE',
        // });

        // if (!response.ok) {
        //   throw new Error('Erro ao excluir agendamento');
        // }

        onDeleteAgendamento(id);
        toast({
          title: "Sucesso",
          description: "Agendamento excluído com sucesso",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir agendamento",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      agendado: { label: 'Agendado', variant: 'secondary' as const },
      confirmado: { label: 'Confirmado', variant: 'default' as const },
      cancelado: { label: 'Cancelado', variant: 'destructive' as const },
      realizado: { label: 'Realizado', variant: 'outline' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  const formatDateTime = (dateTime: Date) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getDiaSemanaLabel = (dia: number) => {
    const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return dias[dia];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os status</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Aluno</label>
              <Input
                placeholder="Nome ou email do aluno"
                value={filters.aluno}
                onChange={(e) => setFilters({ ...filters, aluno: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Data Início</label>
              <Input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Data Fim</label>
              <Input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredAgendamentos.length} agendamento(s) encontrado(s)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAgendamentos.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredAgendamentos.map((agendamento) => {
            const { date, time } = formatDateTime(agendamento.dataHora);
            return (
              <Card key={agendamento.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {agendamento.aluno?.nome || 'Aluno não encontrado'}
                          </span>
                        </div>
                        {getStatusBadge(agendamento.status)}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{time}</span>
                        </div>
                        {agendamento.blocoHorario && (
                          <span>
                            {getDiaSemanaLabel(agendamento.blocoHorario.diaSemana)} - 
                            {agendamento.blocoHorario.horaInicio} às {agendamento.blocoHorario.horaFim}
                          </span>
                        )}
                      </div>

                      {agendamento.aluno?.email && (
                        <div className="text-sm text-muted-foreground">
                          Email: {agendamento.aluno.email}
                        </div>
                      )}

                      {agendamento.observacoes && (
                        <div className="text-sm">
                          <span className="font-medium">Observações:</span> {agendamento.observacoes}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditAgendamento(agendamento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAgendamento(agendamento.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}