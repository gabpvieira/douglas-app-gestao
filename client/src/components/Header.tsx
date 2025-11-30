import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import logoImage from "@assets/logo-personal-douglas.png";

interface HeaderProps {
  onLoginClick?: () => void;
}

export default function Header({ onLoginClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMobileMenuOpen(false);
    }
  };

  const menuItems = [
    { id: 'hero', label: 'Início' },
    { id: 'sobre', label: 'Sobre' },
    { id: 'beneficios', label: 'Benefícios' },
    { id: 'como-funciona', label: 'Como Funciona' },
    { id: 'planos', label: 'Planos' },
    { id: 'contato', label: 'Contato' }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo e Título */}
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Douglas Coimbra" 
                className="h-10 w-auto md:h-12 object-contain"
                data-testid="img-logo-header"
              />
              <div className="hidden sm:block">
                <h1 className="text-base md:text-lg font-bold text-white leading-tight">
                  Douglas Coimbra
                </h1>
                <p className="text-xs text-zinc-400">
                  Consultoria Fitness
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Action Button */}
            <div className="hidden lg:flex items-center">
              <Button 
                onClick={onLoginClick}
                className="bg-[#3c8af6] hover:bg-[#2b7ae5] text-white shadow-lg shadow-[#3c8af6]/20"
                data-testid="button-header-login"
              >
                Entrar
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-zinc-950 border-l border-zinc-800/50 z-50 lg:hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
              <div className="flex items-center gap-3">
                <img 
                  src={logoImage} 
                  alt="Douglas Coimbra" 
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h2 className="text-base font-bold text-white">Douglas Coimbra</h2>
                  <p className="text-xs text-zinc-400">Consultoria Fitness</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="p-4">
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 flex items-center gap-3"
                  >
                    <div className="w-1 h-6 bg-[#3c8af6] rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-6 border-t border-zinc-800/50">
                <Button 
                  onClick={onLoginClick}
                  className="w-full bg-gradient-to-r from-[#3c8af6] to-[#2b7ae5] hover:from-[#2b7ae5] hover:to-[#1a6ad4] text-white shadow-lg shadow-[#3c8af6]/20"
                  data-testid="button-header-login-mobile"
                >
                  Entrar
                </Button>
              </div>
            </nav>

            {/* Footer Info */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-zinc-800/50 bg-zinc-950/50">
              <p className="text-xs text-zinc-500 text-center">
                © 2024 Douglas Coimbra
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
