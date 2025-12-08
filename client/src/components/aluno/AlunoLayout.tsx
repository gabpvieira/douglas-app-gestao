import { useState } from "react";
import { Link, useLocation } from "wouter";
import { 
  Home, 
  Dumbbell, 
  Apple, 
  Calendar, 
  TrendingUp, 
  Video, 
  User, 
  Menu, 
  X,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import logoImage from "@assets/logo-personal-douglas.png";

interface AlunoLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/aluno/dashboard" },
  { icon: Dumbbell, label: "Meus Treinos", href: "/aluno/treinos" },
  { icon: Apple, label: "Nutrição", href: "/aluno/nutricao" },
  { icon: Calendar, label: "Agenda", href: "/aluno/agenda" },
  { icon: TrendingUp, label: "Progresso", href: "/aluno/progresso" },
  { icon: Video, label: "Vídeos", href: "/aluno/videos" },
  { icon: User, label: "Perfil", href: "/aluno/perfil" },
];

export default function AlunoLayout({ children }: AlunoLayoutProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleToggleDesktop = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[100] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-[101] h-screen bg-gray-950 text-white transition-all duration-300 ease-in-out border-r border-gray-800/50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:z-40
        ${isCollapsed ? 'md:w-16' : 'md:w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800/50">
            <div className={`flex items-center gap-3 transition-all duration-300 min-w-0 ${isCollapsed ? 'md:opacity-0 md:w-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="flex-shrink-0">
                <img 
                  src={logoImage} 
                  alt="Douglas Personal" 
                  className="h-10 w-10 object-contain rounded-lg"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm text-white truncate">Douglas Personal</h2>
                <p className="text-xs text-gray-400 truncate">Painel do Aluno</p>
              </div>
            </div>
            
            {/* Desktop toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDesktop}
              className="hidden md:flex text-gray-400 hover:text-white hover:bg-gray-800/50 h-8 w-8 p-0"
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <Menu className="w-4 h-4" />
            </Button>
            
            {/* Mobile close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800/50 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href === '/aluno/dashboard' && (location === '/aluno' || location === '/aluno/'));
                
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <button
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          w-full text-left transition-all duration-200 rounded-lg px-3 py-2.5 group
                          ${isCollapsed ? 'md:justify-center md:px-2' : 'flex items-center gap-3'}
                          ${isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                          }
                        `}
                        title={isCollapsed ? item.label : undefined}
                      >
                        <item.icon 
                          className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} 
                          strokeWidth={1.5}
                        />
                        <span className={`
                          text-sm font-medium transition-all duration-300 
                          ${isCollapsed ? 'md:hidden' : 'block'}
                        `}>
                          {item.label}
                        </span>
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="px-3 py-4 border-t border-gray-800/50">
            <button
              onClick={handleLogout}
              type="button"
              className={`
                group w-full text-left transition-all duration-200 rounded-lg px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50
                ${isCollapsed ? 'md:justify-center md:px-2' : 'flex items-center gap-3'}
              `}
              title={isCollapsed ? "Sair" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-white" strokeWidth={1.5} />
              <span className={`text-sm font-medium transition-all duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                Sair
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
        <div className="flex items-center justify-between px-3 py-2.5">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-lg text-white hover:bg-gray-800 transition-colors"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo e Título Centralizados */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <img 
              src={logoImage} 
              alt="Douglas Personal" 
              className="h-8 w-8 object-contain rounded-lg flex-shrink-0"
            />
            <div className="text-center min-w-0">
              <h2 className="font-semibold text-sm text-white leading-tight truncate">Douglas Coimbra</h2>
              <p className="text-[10px] text-gray-400 leading-tight truncate">Painel do Aluno</p>
            </div>
          </div>

          {/* Botão Sair */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Desktop collapsed toggle button */}
      {isCollapsed && (
        <button
          onClick={handleToggleDesktop}
          className="hidden md:block fixed top-3 left-3 z-50 p-2.5 rounded-lg bg-gray-900/95 backdrop-blur-sm text-white hover:bg-gray-800 transition-colors shadow-lg border border-gray-800"
          aria-label="Expandir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Main Content */}
      <main className={`min-h-screen transition-all duration-300 pt-[52px] md:pt-0 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {children}
      </main>
    </>
  );
}
