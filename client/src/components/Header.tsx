import { Button } from "@/components/ui/button";
import logoImage from "@assets/logo-personal-douglas.png";

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Personal Douglas - Consultoria Fitness" 
              className="h-12 w-auto"
              data-testid="img-logo-header"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-foreground">Personal Douglas</h1>
              <p className="text-sm text-muted-foreground">Consultoria Fitness</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#sobre" className="text-muted-foreground hover:text-foreground transition-colors">
              Sobre
            </a>
            <a href="#beneficios" className="text-muted-foreground hover:text-foreground transition-colors">
              Benefícios
            </a>
            <a href="#planos" className="text-muted-foreground hover:text-foreground transition-colors">
              Planos
            </a>
          </nav>

          {/* Login Button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={onLoginClick}
              data-testid="button-header-login"
            >
              Entrar
            </Button>
            <Button 
              onClick={onLoginClick}
              data-testid="button-header-signup"
            >
              Começar Agora
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}