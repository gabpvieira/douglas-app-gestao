import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/logo-personal-douglas.png";

interface LoginFormProps {
  onBack?: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function LoginForm({ onBack, onLoginSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message === 'Invalid login credentials' 
            ? 'Email ou senha incorretos' 
            : error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Buscar perfil do usuário
        const { data: profile } = await supabase
          .from('users_profile')
          .select('*')
          .eq('auth_uid', data.user.id)
          .single();

        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${profile?.nome || data.user.email}!`,
        });

        onLoginSuccess({
          ...data.user,
          profile
        });
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <Card className="w-full max-w-md p-6 sm:p-8 border-gray-800 bg-gray-900/50 backdrop-blur">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mb-4 sm:mb-6 -ml-2 text-gray-400 hover:text-white hover:bg-gray-800"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <img 
              src={logoImage} 
              alt="Personal Douglas" 
              className="h-12 sm:h-16 w-auto"
              data-testid="img-logo-login"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">
            Entrar na conta
          </h1>
          <p className="text-sm sm:text-base text-gray-400">
            Acesse sua área exclusiva de treinos e nutrição
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 text-sm sm:text-base">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-12 text-sm sm:text-base"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                data-testid="input-email"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 text-sm sm:text-base">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none z-10" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                className="pl-10 pr-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-11 sm:h-12 text-sm sm:text-base"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                data-testid="input-password"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white h-11 sm:h-12 text-sm sm:text-base font-semibold" 
            data-testid="button-submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}