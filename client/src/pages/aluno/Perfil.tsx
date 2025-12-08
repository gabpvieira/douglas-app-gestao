import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAlunoProfile,
  useAlunoAssinatura,
} from "@/hooks/useAlunoData";
import {
  User,
  Mail,
  Calendar,
  Ruler,
  Weight,
  CreditCard,
  CheckCircle2,
  Loader2,
  Edit2,
  Save,
  X,
  Shield,
  Activity,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AlunoPerfil() {
  const [, setLocation] = useLocation();
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Extrair aluno_id corretamente
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const alunoData = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]
    : profile?.alunos;

  const { data: assinatura, isLoading: loadingAssinatura } = useAlunoAssinatura(alunoId);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    dataNascimento: "",
    altura: "",
    genero: "",
  });

  // Inicializar form data quando profile carregar
  useEffect(() => {
    if (profile && alunoData) {
      setFormData({
        nome: profile.nome || "",
        email: profile.email || "",
        dataNascimento: alunoData.data_nascimento || "",
        altura: alunoData.altura?.toString() || "",
        genero: alunoData.genero || "",
      });
    }
  }, [profile, alunoData]);

  const handleEdit = () => {
    if (profile && alunoData) {
      setFormData({
        nome: profile.nome || "",
        email: profile.email || "",
        dataNascimento: alunoData.data_nascimento || "",
        altura: alunoData.altura?.toString() || "",
        genero: alunoData.genero || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!profile || !alunoData) return;

    setIsSaving(true);
    try {
      // Atualizar users_profile
      const { error: profileError } = await supabase
        .from("users_profile")
        .update({
          nome: formData.nome,
          email: formData.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (profileError) throw profileError;

      // Atualizar alunos
      const { error: alunoError } = await supabase
        .from("alunos")
        .update({
          data_nascimento: formData.dataNascimento || null,
          altura: formData.altura ? parseInt(formData.altura) : null,
          genero: formData.genero || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", alunoData.id);

      if (alunoError) throw alunoError;

      // Invalidar cache
      queryClient.invalidateQueries({ queryKey: ["aluno-profile"] });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar seu perfil. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calcularIdade = (dataNascimento: string) => {
    if (!dataNascimento) return null;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    return idade;
  };

  const formatarData = (data: string) => {
    if (!data) return "-";
    return new Date(data).toLocaleDateString("pt-BR");
  };

  if (loadingProfile) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  const idade = alunoData?.data_nascimento ? calcularIdade(alunoData.data_nascimento) : null;

  // KPIs horizontais compactos
  const stats = [
    {
      icon: <Calendar className="w-10 h-10 text-gray-400" />,
      label: "Idade",
      value: idade ? `${idade} anos` : "-",
      subtitle: alunoData?.data_nascimento ? formatarData(alunoData.data_nascimento) : "Não informado",
    },
    {
      icon: <Ruler className="w-10 h-10 text-gray-400" />,
      label: "Altura",
      value: alunoData?.altura ? `${alunoData.altura} cm` : "-",
      subtitle: "Altura registrada",
    },
    {
      icon: <Activity className="w-10 h-10 text-gray-400" />,
      label: "Gênero",
      value: alunoData?.genero === "masculino" ? "Masculino" : alunoData?.genero === "feminino" ? "Feminino" : "-",
      subtitle: "Informação biológica",
    },
    {
      icon: <Shield className="w-10 h-10 text-gray-400" />,
      label: "Status",
      value: alunoData?.status === "ativo" ? "Ativo" : "Inativo",
      subtitle: "Conta ativa",
    },
  ];

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pt-3 md:pt-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-white mb-1">Meu Perfil</h1>
                <p className="text-sm text-gray-400">Gerencie suas informações pessoais</p>
              </div>
              {!isEditing && (
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-white"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </div>

          {/* KPIs - Layout 2x2 Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors"
              >
                <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                  <div className="flex-shrink-0 [&>svg]:w-8 [&>svg]:h-8 sm:[&>svg]:w-10 sm:[&>svg]:h-10">{stat.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">{stat.label}</p>
                    <p className="text-lg sm:text-2xl font-bold text-white truncate">{stat.value}</p>
                    <p className="text-[9px] sm:text-xs text-gray-500 truncate">{stat.subtitle}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Informações Pessoais */}
          <Card className="border-gray-800 bg-gray-900/30">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-base font-medium text-white">Informações Pessoais</h2>
            </div>

            <div className="p-5">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-sm text-gray-400">
                        Nome Completo
                      </Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm text-gray-400">
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dataNascimento" className="text-sm text-gray-400">
                        Data de Nascimento
                      </Label>
                      <Input
                        id="dataNascimento"
                        type="date"
                        value={formData.dataNascimento}
                        onChange={(e) => setFormData({ ...formData, dataNascimento: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altura" className="text-sm text-gray-400">
                        Altura (cm)
                      </Label>
                      <Input
                        id="altura"
                        type="number"
                        value={formData.altura}
                        onChange={(e) => setFormData({ ...formData, altura: e.target.value })}
                        className="bg-gray-800/50 border-gray-700 text-white"
                        placeholder="Ex: 175"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genero" className="text-sm text-gray-400">
                        Gênero
                      </Label>
                      <select
                        id="genero"
                        value={formData.genero}
                        onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                        className="w-full bg-gray-800/50 border border-gray-700 text-white rounded-md px-3 py-2 text-sm"
                      >
                        <option value="">Selecione</option>
                        <option value="masculino">Masculino</option>
                        <option value="feminino">Feminino</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      disabled={isSaving}
                      className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-white"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Nome Completo</p>
                      <p className="text-sm text-white">{profile?.nome || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">E-mail</p>
                      <p className="text-sm text-white">{profile?.email || "-"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Data de Nascimento</p>
                      <p className="text-sm text-white">
                        {alunoData?.data_nascimento ? formatarData(alunoData.data_nascimento) : "-"}
                        {idade && <span className="text-gray-500 ml-2">({idade} anos)</span>}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Ruler className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Altura</p>
                      <p className="text-sm text-white">
                        {alunoData?.altura ? `${alunoData.altura} cm` : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Gênero</p>
                      <p className="text-sm text-white">
                        {alunoData?.genero === "masculino"
                          ? "Masculino"
                          : alunoData?.genero === "feminino"
                          ? "Feminino"
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Status da Conta</p>
                      <Badge
                        variant="outline"
                        className={`text-xs border-0 ${
                          alunoData?.status === "ativo"
                            ? "bg-green-500/10 text-green-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {alunoData?.status === "ativo" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Assinatura */}
          <Card className="border-gray-800 bg-gray-900/30">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-base font-medium text-white">Assinatura</h2>
            </div>

            <div className="p-5">
              {loadingAssinatura ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500 mx-auto" />
                </div>
              ) : assinatura ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Plano Ativo</p>
                      <p className="text-xs text-gray-400">
                        Renovação em {formatarData(assinatura.data_fim)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Valor Mensal</p>
                      <p className="text-xl font-bold text-white">
                        R$ {assinatura.preco ? (assinatura.preco / 100).toFixed(2) : '0.00'}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Início</p>
                      <p className="text-sm text-white">{formatarData(assinatura.data_inicio)}</p>
                    </div>

                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Próximo Vencimento</p>
                      <p className="text-sm text-white">{formatarData(assinatura.data_fim)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <CreditCard className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-4">Nenhuma assinatura ativa</p>
                  <Button
                    onClick={() => setLocation("/aluno/assinatura")}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Ver Planos
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AlunoLayout>
  );
}
