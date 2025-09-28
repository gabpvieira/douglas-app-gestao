import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { insertUserProfileSchema, insertAlunoSchema } from "@shared/schema";
import { z } from "zod";
import { Upload, ArrowLeft } from "lucide-react";

const addStudentSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
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

interface AddStudentProps {
  onBack?: () => void;
}

export default function AddStudent({ onBack }: AddStudentProps) {
  const [location, navigate] = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddStudentFormData>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      nome: "",
      email: "",
      dataNascimento: "",
      altura: "" as any,
      genero: undefined,
      status: "ativo",
    },
  });

  const createStudentMutation = useMutation({
    mutationFn: async (data: AddStudentFormData & { fotoUrl?: string }) => {
      return apiRequest("POST", "/api/admin/students", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Aluno adicionado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      navigate("/admin/alunos");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar aluno.",
        variant: "destructive",
      });
    },
  });

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
    // Por enquanto, retornamos uma URL mock
    return `https://placeholder.com/students/${Date.now()}.jpg`;
  };

  const onSubmit = async (data: AddStudentFormData) => {
    try {
      let fotoUrl: string | undefined;
      
      if (selectedFile) {
        fotoUrl = await uploadFile(selectedFile);
      }

      await createStudentMutation.mutateAsync({
        ...data,
        fotoUrl,
      });
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/alunos");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-4"
          data-testid="button-back-to-students"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Alunos
        </Button>
        <h1 className="text-3xl font-bold">Adicionar Novo Aluno</h1>
        <p className="text-muted-foreground mt-2">
          Preencha as informações do novo aluno para adicioná-lo ao sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Aluno</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Upload de Foto */}
              <div className="space-y-2">
                <Label>Foto do Perfil</Label>
                <div className="flex items-center gap-4">
                  {previewUrl && (
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        data-testid="img-student-preview"
                      />
                    </div>
                  )}
                  <div>
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
                      onClick={() => document.getElementById('photo-upload')?.click()}
                      data-testid="button-upload-photo"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {selectedFile ? 'Alterar Foto' : 'Selecionar Foto'}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Nome */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Digite o nome completo" 
                        data-testid="input-student-name"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Digite o e-mail" 
                        data-testid="input-student-email"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data de Nascimento */}
              <FormField
                control={form.control}
                name="dataNascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        data-testid="input-student-birthdate"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Altura */}
              <FormField
                control={form.control}
                name="altura"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Altura (cm)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 175" 
                        min="50"
                        max="250"
                        data-testid="input-student-height"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Gênero */}
              <FormField
                control={form.control}
                name="genero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-student-gender">
                          <SelectValue placeholder="Selecione o gênero" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-student-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="pendente">Pendente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  data-testid="button-cancel-add-student"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createStudentMutation.isPending}
                  className="flex-1"
                  data-testid="button-save-student"
                >
                  {createStudentMutation.isPending ? "Salvando..." : "Salvar Aluno"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}