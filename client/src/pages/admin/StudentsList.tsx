import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Calendar,
  Ruler,
  Users,
  Upload,
  Check,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { useAlunos, useDeleteAluno, useUpdateAluno, useCreateAluno } from "@/hooks/useAlunos";
import PageHeader from "@/components/PageHeader";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

interface Student {
  id: string;
  nome: string;
  email: string;
  dataNascimento: string | null;
  altura: number | null;
  genero: string | null;
  status: string;
  fotoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const addStudentSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  dataNascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  altura: z.string().min(1, "Altura é obrigatória").transform(val => parseInt(val, 10)),
  genero: z.enum(["masculino", "feminino", "outro"], {
    required_error: "Selecione um gênero",
  }),
  status: z.enum(["ativo", "inativo", "pendente"], {
    required_error: "Selecione um status",
  }),
});

type AddStudentFormData = z.infer<typeof addStudentSchema>;

export default function StudentsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const { data: students = [], isLoading } = useAlunos();
  const deleteAluno = useDeleteAluno();
  const updateAluno = useUpdateAluno();
  const createAluno = useCreateAluno();

  const addForm = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      nome: "",
      email: "",
      senha: "",
      dataNascimento: "",
      altura: "" as any,
      genero: undefined,
      status: "ativo",
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-green-500 text-white';
      case 'pendente': return 'bg-yellow-500 text-white';
      case 'inativo': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ativo': return 'Ativo';
      case 'pendente': return 'Pendente';
      case 'inativo': return 'Inativo';
      default: return status;
    }
  };

  const filteredStudents = students.filter((student: Student) =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    
    // Primeira letra do primeiro nome + primeira letra do último nome
    const firstInitial = parts[0][0];
    const lastInitial = parts[parts.length - 1][0];
    return (firstInitial + lastInitial).toUpperCase();
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setViewModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      dataNascimento: formData.get('dataNascimento') as string,
      altura: parseInt(formData.get('altura') as string),
      genero: formData.get('genero') as string,
      status: formData.get('status') as string,
    };

    await updateAluno.mutateAsync({ id: selectedStudent.id, data });
    setEditModalOpen(false);
    setSelectedStudent(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    // Simular upload - em uma implementação real, faria upload para Supabase Storage
    return `https://placeholder.com/students/${Date.now()}.jpg`;
  };

  const handleAddStudent = async (data: AddStudentFormData) => {
    try {
      let fotoUrl: string | undefined;
      
      if (selectedFile) {
        fotoUrl = await uploadFile(selectedFile);
      }

      await createAluno.mutateAsync({
        ...data,
        fotoUrl,
      });
      
      setAddModalOpen(false);
      addForm.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
    }
  };

  const handleOpenAddModal = () => {
    addForm.reset();
    setSelectedFile(null);
    setPreviewUrl(null);
    setAddModalOpen(true);
  };

  return (
    <>
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4">
        <PageHeader
          title="Alunos"
          description="Gerencie todos os alunos do sistema"
          actions={
            <Button 
              onClick={handleOpenAddModal}
              data-testid="button-add-student" 
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Aluno
            </Button>
          }
        />

        {/* Search Bar - Minimal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/30 border-gray-800 text-white placeholder:text-gray-500 text-sm h-10"
            data-testid="input-search-students"
          />
        </div>

        {/* Students List - Flat Design */}
        <Card className="border-gray-800 bg-[#0b132d]">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-medium text-white">
              {filteredStudents.length} {filteredStudents.length === 1 ? 'aluno' : 'alunos'}
            </h2>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">Carregando...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm mb-4">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleOpenAddModal}
                  className="bg-blue-600 hover:bg-blue-700 text-white" 
                  data-testid="button-add-first-student"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Aluno
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {filteredStudents.map((student) => (
                <div 
                  key={student.id} 
                  className="flex items-center justify-between p-4 hover:bg-gray-800/20 transition-colors"
                    data-testid={`card-student-${student.id}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage src={student.fotoUrl || undefined} />
                        <AvatarFallback className="bg-gray-700 text-white text-xs" data-testid={`text-student-initials-${student.id}`}>
                          {getInitials(student.nome)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate" data-testid={`text-student-name-${student.id}`}>
                          {student.nome}
                        </h3>
                        <p className="text-xs text-gray-500 truncate" data-testid={`text-student-email-${student.id}`}>
                          {student.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex items-center gap-3 text-xs text-gray-500">
                        <span data-testid={`text-student-age-${student.id}`}>
                          {calculateAge(student.dataNascimento)} anos
                        </span>
                        <span>•</span>
                        <span data-testid={`text-student-height-${student.id}`}>
                          {student.altura || 'N/A'}cm
                        </span>
                      </div>
                      
                      <Badge 
                        variant="outline"
                        className={`text-xs border-0 ${
                          student.status === 'ativo' 
                            ? 'bg-green-500/10 text-green-400' 
                            : student.status === 'pendente'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-gray-500/10 text-gray-400'
                        }`}
                        data-testid={`badge-student-status-${student.id}`}
                      >
                        {getStatusLabel(student.status)}
                      </Badge>
                      
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleViewStudent(student)}
                          data-testid={`button-view-student-${student.id}`}
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleEditStudent(student)}
                          className="text-gray-400 hover:text-white h-8 w-8 p-0"
                          data-testid={`button-edit-student-${student.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja deletar este aluno?')) {
                              deleteAluno.mutate(student.id);
                            }
                          }}
                          disabled={deleteAluno.isPending}
                          data-testid={`button-delete-student-${student.id}`}
                          className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
      
      {/* Modals */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes do Aluno
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Avatar e Nome */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedStudent.fotoUrl || undefined} />
                  <AvatarFallback className="text-2xl">
                    {getInitials(selectedStudent.nome)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-2xl font-bold">{selectedStudent.nome}</h3>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                  <Badge className={getStatusColor(selectedStudent.status)} style={{ marginTop: '8px' }}>
                    {getStatusLabel(selectedStudent.status)}
                  </Badge>
                </div>
              </div>

              {/* Informações Pessoais */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data de Nascimento</span>
                  </div>
                  <p className="font-medium">
                    {selectedStudent.dataNascimento 
                      ? new Date(selectedStudent.dataNascimento).toLocaleDateString('pt-BR')
                      : 'Não informado'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Idade</span>
                  </div>
                  <p className="font-medium">{calculateAge(selectedStudent.dataNascimento)} anos</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span>Altura</span>
                  </div>
                  <p className="font-medium">{selectedStudent.altura || 'N/A'} cm</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Gênero</span>
                  </div>
                  <p className="font-medium capitalize">{selectedStudent.genero || 'N/A'}</p>
                </div>
              </div>

              {/* Datas */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Cadastrado em</p>
                    <p className="font-medium">
                      {new Date(selectedStudent.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Última atualização</p>
                    <p className="font-medium">
                      {new Date(selectedStudent.updatedAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)}>
              Fechar
            </Button>
            <Button onClick={() => {
              setViewModalOpen(false);
              if (selectedStudent) handleEditStudent(selectedStudent);
            }}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Adicionar Aluno - Flat Design Profissional */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gray-900 border-gray-800">
          {/* Header Compacto */}
          <DialogHeader className="border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/10 rounded-lg">
                <Plus className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-white">
                  Novo Aluno
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-400">
                  Cadastre um novo aluno na plataforma
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddStudent)} className="space-y-6">
              {/* Scrollable Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-200px)] pr-2 space-y-6">
                
                {/* Seção: Foto de Perfil */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Foto</span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-800">
                    {previewUrl ? (
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 ring-2 ring-gray-700">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            data-testid="img-student-preview"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Upload className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="photo-upload"
                        data-testid="input-photo-upload"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                        onClick={() => document.getElementById('photo-upload')?.click()}
                        data-testid="button-upload-photo"
                      >
                        <Upload className="w-3.5 h-3.5 mr-2" />
                        {selectedFile ? 'Alterar Foto' : 'Selecionar Foto'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG ou GIF (máx. 5MB)</p>
                    </div>
                  </div>
                </div>

                {/* Seção: Dados Pessoais */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Dados Pessoais</span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome */}
                    <FormField
                      control={addForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-300">Nome Completo</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ex: João Silva Santos" 
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                              data-testid="input-student-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Data de Nascimento */}
                    <FormField
                      control={addForm.control}
                      name="dataNascimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">Data de Nascimento</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                              data-testid="input-student-birthdate"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Gênero */}
                    <FormField
                      control={addForm.control}
                      name="genero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">Gênero</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                data-testid="select-student-gender"
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="masculino" className="text-white hover:bg-gray-700">Masculino</SelectItem>
                              <SelectItem value="feminino" className="text-white hover:bg-gray-700">Feminino</SelectItem>
                              <SelectItem value="outro" className="text-white hover:bg-gray-700">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Altura */}
                    <FormField
                      control={addForm.control}
                      name="altura"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">Altura (cm)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="175" 
                              min="50"
                              max="250"
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                              data-testid="input-student-height"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Status */}
                    <FormField
                      control={addForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-300">Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger 
                                className="bg-gray-800 border-gray-700 text-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                                data-testid="select-student-status"
                              >
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="ativo" className="text-white hover:bg-gray-700">Ativo</SelectItem>
                              <SelectItem value="inativo" className="text-white hover:bg-gray-700">Inativo</SelectItem>
                              <SelectItem value="pendente" className="text-white hover:bg-gray-700">Pendente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção: Acesso à Plataforma */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-gray-800" />
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acesso</span>
                    <div className="h-px flex-1 bg-gray-800" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Email */}
                    <FormField
                      control={addForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-300">E-mail</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="aluno@email.com" 
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                              data-testid="input-student-email"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Senha */}
                    <FormField
                      control={addForm.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-sm font-medium text-gray-300">Senha</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Mínimo 6 caracteres" 
                              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                              data-testid="input-student-password"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Fixo */}
              <DialogFooter className="border-t border-gray-800 pt-4 flex-row gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAddModalOpen(false)}
                  disabled={createAluno.isPending}
                  className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-gray-300"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createAluno.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-save-student"
                >
                  {createAluno.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salvar Aluno
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Aluno
            </DialogTitle>
            <DialogDescription>
              Atualize as informações do aluno
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    defaultValue={selectedStudent.nome}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedStudent.email}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    defaultValue={selectedStudent.dataNascimento || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    name="altura"
                    type="number"
                    defaultValue={selectedStudent.altura || ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Gênero</Label>
                  <Select name="genero" defaultValue={selectedStudent.genero || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue={selectedStudent.status}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditModalOpen(false)}
                  disabled={updateAluno.isPending}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateAluno.isPending}>
                  {updateAluno.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}