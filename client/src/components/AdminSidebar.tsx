import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Video, 
  UtensilsCrossed, 
  CreditCard, 
  Calendar,
  Dumbbell,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Star,
  TrendingUp
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import logoImage from "@assets/logo-personal-douglas.png";

interface AdminSidebarProps {
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: "Dashboard", 
    href: "/admin"
  },
  { 
    icon: Users, 
    label: "Alunos", 
    href: "/admin/alunos"
  },
  { 
    icon: Activity, 
    label: "Avaliações Físicas", 
    href: "/admin/avaliacoes-fisicas"
  },
  { 
    icon: Star, 
    label: "Feedbacks de Treinos", 
    href: "/admin/feedbacks"
  },
  { 
    icon: TrendingUp, 
    label: "Progresso de Treinos", 
    href: "/admin/progresso-treinos"
  },
  { 
    icon: Calendar, 
    label: "Agenda", 
    href: "/admin/agenda"
  },
  { 
    icon: Dumbbell, 
    label: "Fichas de Treino", 
    href: "/admin/fichas-treino"
  },
  { 
    icon: Video, 
    label: "Treinos Vídeo", 
    href: "/admin/treinos-video"
  },
  { 
    icon: UtensilsCrossed, 
    label: "Planos Alimentares", 
    href: "/admin/planos"
  },
  { 
    icon: CreditCard, 
    label: "Pagamentos", 
    href: "/admin/pagamentos"
  },
];

export default function AdminSidebar({ onLogout, isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const handleToggleDesktop = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    }
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
                  alt="Douglas Coimbra" 
                  className="h-10 w-10 object-contain rounded-lg"
                  data-testid="img-sidebar-logo"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm text-white truncate">Douglas Coimbra</h2>
                <p className="text-xs text-gray-400 truncate">Administrador</p>
              </div>
            </div>
            
            {/* Desktop toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDesktop}
              className="hidden md:flex text-gray-400 hover:text-white hover:bg-gray-800/50 h-8 w-8 p-0"
              data-testid="button-toggle-sidebar-desktop"
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
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href === '/admin' && location === '/admin/dashboard');
                
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
                        data-testid={`button-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
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
              onClick={onLogout}
              type="button"
              className={`
                group w-full text-left transition-all duration-200 rounded-lg px-3 py-2.5 text-gray-400 hover:text-white hover:bg-gray-800/50
                ${isCollapsed ? 'md:justify-center md:px-2' : 'flex items-center gap-3'}
              `}
              data-testid="button-sidebar-logout"
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

      {/* Mobile toggle button - Only show when sidebar is closed */}
      {!isMobileOpen && (
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-3 left-3 z-20 md:hidden p-2.5 rounded-lg bg-gray-900/95 backdrop-blur-sm text-white hover:bg-gray-800 transition-colors shadow-lg border border-gray-800"
          data-testid="button-open-sidebar"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {/* Desktop collapsed toggle button */}
      {isCollapsed && (
        <button
          onClick={handleToggleDesktop}
          className="hidden md:block fixed top-3 left-3 z-20 p-2.5 rounded-lg bg-gray-900/95 backdrop-blur-sm text-white hover:bg-gray-800 transition-colors shadow-lg border border-gray-800"
          data-testid="button-expand-sidebar-desktop"
          aria-label="Expandir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}
    </>
  );
}