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
  Activity
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
    href: "/admin",
    gradient: "from-blue-500 to-cyan-500"
  },
  { 
    icon: Users, 
    label: "Alunos", 
    href: "/admin/alunos",
    gradient: "from-purple-500 to-pink-500"
  },
  { 
    icon: Activity, 
    label: "Avaliações Físicas", 
    href: "/admin/avaliacoes-fisicas",
    gradient: "from-indigo-500 to-purple-500"
  },
  { 
    icon: Calendar, 
    label: "Agenda", 
    href: "/admin/agenda",
    gradient: "from-green-500 to-emerald-500"
  },
  { 
    icon: Dumbbell, 
    label: "Fichas de Treino", 
    href: "/admin/fichas-treino",
    gradient: "from-orange-500 to-red-500"
  },
  { 
    icon: Video, 
    label: "Treinos Vídeo", 
    href: "/admin/treinos-video",
    gradient: "from-pink-500 to-rose-500"
  },
  { 
    icon: UtensilsCrossed, 
    label: "Planos Alimentares", 
    href: "/admin/planos",
    gradient: "from-yellow-500 to-orange-500"
  },
  { 
    icon: CreditCard, 
    label: "Pagamentos", 
    href: "/admin/pagamentos",
    gradient: "from-teal-500 to-cyan-500"
  },
];

export default function AdminSidebar({ onLogout, isCollapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, opacity: 0 });
  const navRef = useRef<HTMLUListElement>(null);
  
  const handleToggleDesktop = () => {
    if (onToggleCollapse) {
      onToggleCollapse(!isCollapsed);
    }
  };

  // Atualizar posição do indicador quando a rota mudar
  useEffect(() => {
    if (!navRef.current) return;
    
    const activeIndex = menuItems.findIndex(item => 
      location === item.href || (item.href === '/admin' && location === '/admin/dashboard')
    );
    
    if (activeIndex !== -1) {
      const buttons = navRef.current.querySelectorAll('li');
      const activeButton = buttons[activeIndex];
      
      if (activeButton) {
        const { offsetTop, offsetHeight } = activeButton as HTMLElement;
        setIndicatorStyle({
          top: offsetTop + (offsetHeight / 2) - 4, // Ajustado para centralizar a bolinha menor
          opacity: 1
        });
      }
    }
  }, [location]);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white transition-all duration-300 ease-in-out shadow-2xl border-r border-slate-800/50
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isCollapsed ? 'md:w-16' : 'md:w-56'}
      `}>
        <div className="flex flex-col h-full relative">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-slate-900/50 backdrop-blur">
            <div className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'md:opacity-0 md:w-0 md:overflow-hidden' : 'opacity-100'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg blur-md opacity-40"></div>
                <img 
                  src={logoImage} 
                  alt="Personal Douglas" 
                  className="h-8 w-auto relative z-10 drop-shadow-xl"
                  data-testid="img-sidebar-logo"
                />
              </div>
              <div>
                <h2 className="font-bold text-sm bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Personal Douglas</h2>
                <p className="text-[10px] text-slate-500 font-medium">Admin Panel</p>
              </div>
            </div>
            
            {/* Desktop toggle button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleDesktop}
              className="hidden md:flex text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all"
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
              className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl"
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-3 overflow-y-auto relative">
            {/* Animated Indicator Ball - Right Side */}
            <div 
              className="absolute right-3 w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 transition-all duration-500 ease-out pointer-events-none"
              style={{
                top: `${indicatorStyle.top}px`,
                opacity: indicatorStyle.opacity,
                transform: `translateY(0) scale(${indicatorStyle.opacity})`,
              }}
            >
              <div className="absolute inset-0 rounded-full bg-blue-400 animate-pulse"></div>
            </div>

            <ul ref={navRef} className="space-y-0.5 relative z-10">
              {menuItems.map((item, index) => {
                const isActive = location === item.href || 
                  (item.href === '/admin' && location === '/admin/dashboard');
                
                return (
                  <li key={item.href} className="group">
                    <Link href={item.href}>
                      <button
                        onClick={() => setIsMobileOpen(false)}
                        className={`
                          w-full gap-2 text-left transition-all duration-300 rounded-lg p-2 relative overflow-hidden
                          ${isCollapsed ? 'md:justify-center md:px-1' : 'flex items-center'}
                          ${isActive 
                            ? 'text-white' 
                            : 'text-slate-400 hover:text-white'
                          }
                        `}
                        data-testid={`button-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                        title={isCollapsed ? item.label : undefined}
                      >
                        {/* Background gradient on hover */}
                        <div className={`
                          absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300
                          ${isActive ? 'opacity-5' : ''}
                        `}></div>
                        
                        <div className="flex items-center gap-2 relative z-10">
                          <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 flex-shrink-0
                            ${isActive 
                              ? `bg-gradient-to-br ${item.gradient} shadow-md` 
                              : 'bg-slate-800/50 group-hover:bg-slate-800'
                            }
                          `}>
                            <item.icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                          </div>
                          <span className={`
                            text-sm font-medium transition-all duration-300 
                            ${isCollapsed ? 'md:hidden' : 'block'}
                            ${isActive ? 'text-white' : ''}
                          `}>
                            {item.label}
                          </span>
                        </div>
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-3 border-t border-slate-800/50 bg-slate-900/30 backdrop-blur">
            <button
              onClick={onLogout}
              type="button"
              className={`
                group w-full gap-2 text-slate-400 hover:text-white transition-all duration-300 rounded-lg p-2 relative overflow-hidden cursor-pointer
                ${isCollapsed ? 'md:justify-center md:px-1' : 'flex items-center'}
              `}
              data-testid="button-sidebar-logout"
              title={isCollapsed ? "Sair" : undefined}
            >
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              
              <div className="flex items-center gap-2 relative pointer-events-none">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-800/50 group-hover:bg-red-500/20 transition-all duration-300 flex-shrink-0">
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className={`text-sm font-medium transition-opacity duration-300 ${isCollapsed ? 'md:hidden' : 'block'}`}>
                  Sair
                </span>
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-slate-900/90 backdrop-blur text-white hover:bg-slate-800 transition-colors shadow-lg"
        data-testid="button-open-sidebar"
        aria-label="Abrir menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Desktop collapsed toggle button */}
      {isCollapsed && (
        <button
          onClick={handleToggleDesktop}
          className="hidden md:block fixed top-4 left-4 z-30 p-2 rounded-lg bg-slate-900/90 backdrop-blur text-white hover:bg-slate-800 transition-colors shadow-lg"
          data-testid="button-expand-sidebar-desktop"
          aria-label="Expandir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}