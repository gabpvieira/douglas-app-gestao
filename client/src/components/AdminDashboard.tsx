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
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  FileText,
  Video
} from "lucide-react";
import { useState } from "react";

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  
  // TODO: Remove mock functionality - replace with real data
  const stats = [
    {
      title: "Total de Alunos",
      value: "127",
      change: "+12%",
      icon: <Users className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Receita Mensal",
      value: "R$ 18.500",
      change: "+8%",
      icon: <DollarSign className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Taxa de Adesão",
      value: "94%",
      change: "+5%",
      icon: <TrendingUp className="w-6 h-6" />,
      trend: "up"
    },
    {
      title: "Inadimplência",
      value: "3",
      change: "-2",
      icon: <AlertTriangle className="w-6 h-6" />,
      trend: "down"
    }
  ];

  const students = [
    {
      id: 1,
      name: "Ana Silva",
      email: "ana@email.com",
      plan: "Trimestral",
      status: "ativo",
      joinDate: "15/01/2024",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos@email.com",
      plan: "Mensal",
      status: "pendente",
      joinDate: "20/01/2024",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Mariana Costa",
      email: "mariana@email.com",
      plan: "Família",
      status: "ativo",
      joinDate: "10/01/2024",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "João Oliveira",
      email: "joao@email.com",
      plan: "Trimestral",
      status: "inativo",
      joinDate: "05/01/2024",
      avatar: "/api/placeholder/40/40"
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

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie seus alunos e monitore o desempenho</p>
        </div>
        <Button data-testid="button-add-student">
          <Plus className="w-4 h-4 mr-2" />
          Novo Aluno
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6" data-testid={`card-stat-${index}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-sm flex items-center gap-1 ${
                  stat.trend === 'up' ? 'text-chart-2' : 'text-destructive'
                }`}>
                  {stat.change} vs mês anterior
                </p>
              </div>
              <div className="text-primary">{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Students Management */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Gestão de Alunos</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar alunos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
                data-testid="input-search-students"
              />
            </div>
            <Button variant="outline" size="sm" data-testid="button-filter">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Aluno</th>
                <th className="text-left py-3 px-4">Plano</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Data de Ingresso</th>
                <th className="text-left py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover-elevate" data-testid={`row-student-${student.id}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={student.avatar} />
                        <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline">{student.plan}</Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 text-muted-foreground">
                    {student.joinDate}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" data-testid={`button-view-${student.id}`}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-edit-${student.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-workout-${student.id}`}>
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-videos-${student.id}`}>
                        <Video className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-more-${student.id}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}