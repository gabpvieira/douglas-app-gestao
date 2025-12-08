import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import logoImage from "@assets/logo-personal-douglas.png";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      senha: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log('🔐 Tentando login com Supabase Auth:', { email: data.email });
      
      // Fazer login com Supabase Auth (funciona para admin e aluno)
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.senha,
      });

      if (authError || !authData.user) {
        console.error('❌ Erro no login:', authError);
        throw new Error("Email ou senha inválidos");
      }

      console.log('✅ Login bem-sucedido:', authData.user.id);

      // Buscar perfil do usuário para determinar o tipo
      const { data: profile, error: profileError } = await supabase
        .from("users_profile")
        .select("nome, tipo")
        .eq("auth_uid", authData.user.id)
        .single();

      if (profileError || !profile) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        throw new Error("Erro ao carregar perfil do usuário");
      }

      console.log('✅ Perfil encontrado:', profile);

      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${profile.nome}`,
      });

      // Redirecionar baseado no tipo de usuário
      if (profile.tipo === "admin") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/aluno";
      }

    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-[#030712] p-4 overflow-hidden fixed inset-0">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      <Card className="w-full max-w-md border-gray-800 bg-gray-900/95 backdrop-blur-xl shadow-2xl relative z-10">
        <CardHeader className="space-y-4 pb-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/10 blur-2xl rounded-full" />
              <img 
                src={logoImage} 
                alt="Douglas Coimbra" 
                className="relative h-20 w-auto object-contain"
              />
            </div>
          </div>
          
          {/* Title */}
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold text-white tracking-tight">
              Bem-vindo de volta
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Entre com suas credenciais para acessar a plataforma
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-300">
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        className="h-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="senha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-300">
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-11 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-600/25 transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
