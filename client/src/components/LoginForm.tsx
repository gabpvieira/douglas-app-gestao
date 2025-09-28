import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";

interface LoginFormProps {
  onBack?: () => void;
}

export default function LoginForm({ onBack }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login/Register attempted:', formData);
    // TODO: Implement actual authentication
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-md p-8">
        {onBack && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="mb-6 -ml-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {isLogin ? 'Entrar na conta' : 'Criar conta'}
          </h1>
          <p className="text-muted-foreground">
            {isLogin 
              ? 'Acesse sua área exclusiva de treinos e nutrição'
              : 'Comece sua jornada de transformação hoje'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Seu nome"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                data-testid="input-name"
                required={!isLogin}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="pl-10"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                data-testid="input-email"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                data-testid="input-password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirme sua senha"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                data-testid="input-confirm-password"
                required={!isLogin}
              />
            </div>
          )}
          
          <Button type="submit" className="w-full" data-testid="button-submit">
            {isLogin ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>
        
        {isLogin && (
          <div className="text-center mt-4">
            <Button variant="link" size="sm" data-testid="button-forgot-password">
              Esqueci minha senha
            </Button>
          </div>
        )}
        
        <Separator className="my-6" />
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
          </p>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
            data-testid="button-toggle-mode"
          >
            {isLogin ? 'Criar conta gratuita' : 'Fazer login'}
          </Button>
        </div>
      </Card>
    </div>
  );
}