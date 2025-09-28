import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  FileText, 
  Video, 
  UtensilsCrossed, 
  CreditCard, 
  LogOut,
  Menu,
  X
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import logoImage from "@assets/logo-personal-douglas.png";

interface AdminSidebarProps {
  onLogout: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Alunos", href: "/admin/alunos" },
  { icon: UserPlus, label: "Novo Aluno", href: "/admin/novo-aluno" },
  { icon: FileText, label: "Treinos PDF", href: "/admin/treinos-pdf" },
  { icon: Video, label: "Treinos Vídeo", href: "/admin/treinos-video" },
  { icon: UtensilsCrossed, label: "Planos Alimentares", href: "/admin/planos" },
  { icon: CreditCard, label: "Pagamentos", href: "/admin/pagamentos" },
];

export default function AdminSidebar({ onLogout }: AdminSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-screen bg-slate-900 text-white transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        w-64 md:relative md:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="Personal Douglas" 
                className="h-8 w-auto"
                data-testid="img-sidebar-logo"
              />
              <div>
                <h2 className="font-semibold text-sm">Personal Douglas</h2>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="md:hidden text-white hover:bg-slate-800"
              data-testid="button-close-sidebar"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href === '/admin' && location === '/admin/dashboard');
                
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={`
                          w-full justify-start gap-3 text-left
                          ${isActive 
                            ? 'bg-slate-800 text-white' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                        data-testid={`button-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.label}
                      </Button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <Button
              variant="ghost"
              onClick={onLogout}
              className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800 hover:text-white"
              data-testid="button-sidebar-logout"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
        className="fixed top-4 left-4 z-30 md:hidden bg-slate-900 text-white hover:bg-slate-800"
        data-testid="button-open-sidebar"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
}