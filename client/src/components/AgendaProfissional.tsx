import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Plus, CalendarDays, Clock, Users, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAlunos } from '@/hooks/useAlunos';
import { useBlocosHorarios, useAgendamentos } from '@/hooks/useAgenda';
import { BlocoHorarioForm } from './BlocoHorarioForm';
import { AgendamentoModal } from './AgendamentoModal';
import { AgendamentosList } from './AgendamentosList';

interface Aluno {
  id: string;
  nome: string;
  email: string;
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

// Dados mockados
const mockAlunos: Aluno[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@email.com',
    dataNascimento: '1990-01-01',
    altura: 175,
    genero: 'masculino',
    status: 'ativo'
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@email.com',
    dataNascimento: '1985-05-15',
    altura: 165,
    genero: 'feminino',
    status: 'ativo'
  },
  {
    id: '3',
    nome: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    dataNascimento: '1992-08-20',
    altura: 180,
    genero: 'masculino',
    status: 'ativo'
  }
];

const mockBlocosHorarios: BlocoHorario[] = [
  {
    id: '1',
    diaSemana: 1, // Segunda
    horaInicio: '09:00',
    horaFim: '10:00',
    ativo: true
  },
  {
    id: '2',
    diaSemana: 1, // Segunda
    horaInicio: '14:00',
    horaFim: '15:00',
    ativo: true
  },
  {
    id: '3',
    diaSemana: 2, // Terça
    horaInicio: '10:00',
    horaFim: '11:00',
    ativo: true
  },
  {
    id: '4',
    diaSemana: 3, // Quarta
    horaInicio: '16:00',
    horaFim: '17:00',
    ativo: true
  },
  {
    id: '5',
    diaSemana: 4, // Quinta
    horaInicio: '08:00',
    horaFim: '09:00',
    ativo: true
  },
  {
    id: '6',
    diaSemana: 5, // Sexta
    horaInicio: '15:00',
    horaFim: '16:00',
    ativo: false
  }
];

const mockAgendamentos: Agendamento[] = [
  {
    id: '1',
    alunoId: '1',
    blocoHorarioId: '1',
    dataHora: new Date(2025, 0, 27, 9, 0), // 27 de janeiro de 2025, 09:00
    status: 'confirmado',
    observacoes: 'Primeira sessão de treino',
    aluno: mockAlunos[0],
    blocoHorario: mockBlocosHorarios[0]
  },
  {
    id: '2',
    alunoId: '2',
    blocoHorarioId: '2',
    dataHora: new Date(2025, 0, 27, 14, 0), // 27 de janeiro de 2025, 14:00
    status: 'agendado',
    observacoes: 'Avaliação física',
    aluno: mockAlunos[1],
    blocoHorario: mockBlocosHorarios[1]
  },
  {
    id: '3',
    alunoId: '3',
    blocoHorarioId: '3',
    dataHora: new Date(2025, 0, 28, 10, 0), // 28 de janeiro de 2025, 10:00
    status: 'realizado',
    observacoes: 'Treino de força',
    aluno: mockAlunos[2],
    blocoHorario: mockBlocosHorarios[2]
  },
  {
    id: '4',
    alunoId: '1',
    blocoHorarioId: '4',
    dataHora: new Date(2025, 0, 29, 16, 0), // 29 de janeiro de 2025, 16:00
    status: 'agendado',
    observacoes: 'Treino cardio',
    aluno: mockAlunos[0],
    blocoHorario: mockBlocosHorarios[3]
  }
];

export function AgendaProfissional() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Buscar dados reais do Supabase
  const { data: alunosData = [], isLoading: loadingAlunos } = useAlunos();
  const { data: blocosData = [], isLoading: loadingBlocos } = useBlocosHorarios();
  const { data: agendamentosData = [], isLoading: loadingAgendamentos } = useAgendamentos();
  
  // Adaptar dados para o formato esperado
  const alunos: Aluno[] = alunosData.map(a => ({
    id: a.id,
    nome: a.nome,
    email: a.email,
    dataNascimento: a.dataNascimento || undefined,
    altura: a.altura || undefined,
    genero: a.genero || undefined,
    status: a.status
  }));
  
  const blocosHorarios: BlocoHorario[] = blocosData.map(b => ({
    id: b.id,
    diaSemana: b.diaSemana,
    horaInicio: b.horaInicio,
    horaFim: b.horaFim,
    ativo: b.ativo
  }));
  
  const agendamentos: Agendamento[] = agendamentosData.map(a => ({
    id: a.id,
    alunoId: a.alunoId,
    blocoHorarioId: a.blocoHorarioId,
    dataHora: new Date(a.dataAgendamento),
    status: a.status as any,
    observacoes: a.observacoes || undefined,
    aluno: a.aluno ? {
      id: a.aluno.id,
      nome: a.aluno.nome,
      email: a.aluno.email
    } : undefined,
    blocoHorario: a.blocoHorario ? {
      id: a.blocoHorario.id,
      diaSemana: a.blocoHorario.diaSemana,
      horaInicio: a.blocoHorario.horaInicio,
      horaFim: a.blocoHorario.horaFim,
      ativo: a.blocoHorario.ativo
    } : undefined
  }));
  
  // Modal states
  const [isAgendamentoModalOpen, setIsAgendamentoModalOpen] = useState(false);
  const [isBlocoModalOpen, setIsBlocoModalOpen] = useState(false);
  const [editingAgendamento, setEditingAgendamento] = useState<Agendamento | null>(null);
  const [editingBloco, setEditingBloco] = useState<BlocoHorario | null>(null);

  // Não precisamos mais dos useEffect para fetch de dados da API
  // Os dados já estão carregados com os mocks

  // Calendar helpers
  const getAgendamentosForDate = (date: Date) => {
    return agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.dataHora);
      return agendamentoDate.toDateString() === date.toDateString();
    });
  };

  const getCalendarModifiers = () => {
    const datesWithAppointments = agendamentos.map(agendamento => 
      new Date(agendamento.dataHora)
    );
    
    return {
      hasAppointments: datesWithAppointments,
    };
  };

  const getCalendarModifiersClassNames = () => {
    return {
      hasAppointments: 'bg-blue-100 text-blue-900 font-semibold',
    };
  };

  // Get appointments for selected date
  const todayAppointments = selectedDate ? getAgendamentosForDate(selectedDate) : [];

  // Statistics
  const stats = {
    total: agendamentos.length,
    confirmado: agendamentos.filter(a => a.status === 'confirmado').length,
    agendado: agendamentos.filter(a => a.status === 'agendado').length,
    realizado: agendamentos.filter(a => a.status === 'realizado').length,
  };

  // Event handlers
  const handleNewAgendamento = () => {
    setEditingAgendamento(null);
    setIsAgendamentoModalOpen(true);
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setEditingAgendamento(agendamento);
    setIsAgendamentoModalOpen(true);
  };

  const handleDeleteAgendamento = async (id: string) => {
    // A exclusão será feita pelo hook useDeleteAgendamento no componente filho
    // Aqui apenas confirmamos a ação
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      // O componente filho AgendamentosList já tem o hook de delete
      toast({
        title: "Processando",
        description: "Excluindo agendamento...",
      });
    }
  };

  const handleSaveAgendamento = async (agendamentoData: any) => {
    try {
      console.log('📅 Salvando agendamento:', agendamentoData);
      
      // TODO: Implementar com hooks do React Query
      // Por enquanto, apenas fecha o modal e mostra mensagem
      
      setIsAgendamentoModalOpen(false);
      setEditingAgendamento(null);
      
      toast({
        title: "Em desenvolvimento",
        description: "Funcionalidade de agendamento será implementada em breve",
      });
    } catch (error: any) {
      console.error('Erro ao salvar agendamento:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar agendamento",
        variant: "destructive",
      });
    }
  };

  const handleNewBloco = () => {
    setEditingBloco(null);
    setIsBlocoModalOpen(true);
  };

  const handleEditBloco = (bloco: BlocoHorario) => {
    setEditingBloco(bloco);
    setIsBlocoModalOpen(true);
  };

  const handleDeleteBloco = async (id: string) => {
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBlocosHorarios(prev => prev.filter(b => b.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Bloco de horário excluído com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir bloco de horário",
        variant: "destructive",
      });
    }
  };

  const handleSaveBloco = async (blocoData: any) => {
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (editingBloco) {
        // Atualizar bloco existente
        const updatedBloco = { ...editingBloco, ...blocoData };
        setBlocosHorarios(prev => 
          prev.map(b => b.id === editingBloco.id ? updatedBloco : b)
        );
      } else {
        // Criar novo bloco
        const newBloco: BlocoHorario = {
          id: Date.now().toString(),
          ...blocoData
        };
        setBlocosHorarios(prev => [...prev, newBloco]);
      }
      
      setIsBlocoModalOpen(false);
      setEditingBloco(null);
      
      toast({
        title: "Sucesso",
        description: editingBloco ? "Bloco atualizado!" : "Bloco criado!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar bloco",
        variant: "destructive",
      });
    }
  };

  const getDiaSemanaLabel = (dia: number) => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[dia];
  };

  const isLoading = loadingAlunos || loadingBlocos || loadingAgendamentos;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agenda Profissional</h1>
        <Button onClick={handleNewAgendamento} disabled={isLoading}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Carregando dados da agenda...
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmado}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.agendado}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realizados</p>
                <p className="text-2xl font-bold text-blue-600">{stats.realizado}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
          <TabsTrigger value="schedule">Horários</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Calendário</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={getCalendarModifiers()}
                  modifiersClassNames={getCalendarModifiersClassNames()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  Agendamentos - {selectedDate?.toLocaleDateString('pt-BR')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayAppointments.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum agendamento para esta data</p>
                    <Button 
                      className="mt-4" 
                      onClick={handleNewAgendamento}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Agendamento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todayAppointments.map((agendamento) => (
                      <div 
                        key={agendamento.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{agendamento.aluno?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            agendamento.status === 'confirmado' ? 'bg-green-100 text-green-800' :
                            agendamento.status === 'agendado' ? 'bg-yellow-100 text-yellow-800' :
                            agendamento.status === 'cancelado' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {agendamento.status}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditAgendamento(agendamento)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments">
          <AgendamentosList
            agendamentos={agendamentos}
            onEditAgendamento={handleEditAgendamento}
            onDeleteAgendamento={handleDeleteAgendamento}
            onRefresh={() => {}} // Não precisa mais de refresh com dados mockados
          />
        </TabsContent>

        <TabsContent value="schedule">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Blocos de Horário</h2>
              <Button onClick={handleNewBloco}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Bloco
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {blocosHorarios.map((bloco) => (
                <Card key={bloco.id} className={!bloco.ativo ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{getDiaSemanaLabel(bloco.diaSemana)}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bloco.horaInicio} às {bloco.horaFim}
                        </p>
                        <p className="text-xs mt-1">
                          Status: {bloco.ativo ? 'Ativo' : 'Inativo'}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditBloco(bloco)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteBloco(bloco.id)}
                        >
                          <Plus className="h-4 w-4 rotate-45" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AgendamentoModal
        isOpen={isAgendamentoModalOpen}
        onClose={() => {
          setIsAgendamentoModalOpen(false);
          setEditingAgendamento(null);
        }}
        onSave={handleSaveAgendamento}
        agendamento={editingAgendamento}
        alunos={alunos}
        blocosHorarios={blocosHorarios}
      />

      <BlocoHorarioForm
        blocos={blocosHorarios}
        onBlocoCreated={handleSaveBloco}
        onBlocoUpdated={handleSaveBloco}
        onBlocoDeleted={handleDeleteBloco}
      />
    </div>
  );
}