import { 
  LayoutDashboard, 
  FileText, 
  Video, 
  UtensilsCrossed, 
  Calendar,
  LogOut,
  Menu,
  X,
  Settings,
  Award,
  Target,
  Users
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface StudentSidebarProps {
  onLogout: () => void;
  userName: string;
  userEmail: string;
  avatarUrl?: string;
  planType: string;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/aluno" },
  { icon: Users, label: "Comunidade", href: "/aluno/comunidade" },
  { icon: FileText, label: "Treinos", href: "/aluno/treinos" },
  { icon: Video, label: "Vídeos", href: "/aluno/videos" },
  { icon: UtensilsCrossed, label: "Alimentação", href: "/aluno/plano-alimentar" },
  { icon: Calendar, label: "Agenda", href: "/aluno/agenda" },
  { icon: Award, label: "Progresso", href: "/aluno/progresso" },
  { icon: Target, label: "Metas", href: "/aluno/metas" },
  { icon: Settings, label: "Configurações", href: "/aluno/configuracoes" },
];

export default function StudentSidebar({ 
  onLogout, 
  userName, 
  userEmail, 
  avatarUrl = "/api/placeholder/40/40", 
  planType 
}: StudentSidebarProps) {
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

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
        fixed left-0 top-0 z-50 h-screen w-72 bg-gradient-to-br from-slate-900 to-slate-800 text-white transition-transform duration-300 ease-in-out
        ${isCollapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
        md:w-64
      `}>
        <div className="flex flex-col h-full">
          {/* Header - User Profile */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">PF</span>
                </div>
                <div>
                  <h2 className="font-semibold text-sm">Personal Fitness</h2>
                  <p className="text-xs text-slate-400">Área do Aluno</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(true)}
                className="md:hidden text-white hover:bg-slate-800 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* User Info */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
              <Avatar className="w-10 h-10 border-2 border-slate-600">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{userName}</p>
                <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  {planType}
                </Badge>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href === '/aluno' && location === '/aluno/dashboard');
                
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <Button
                        variant="ghost"
                        className={`
                          w-full justify-start gap-3 text-left px-3 py-2.5 text-sm
                          ${isActive 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                        onClick={() => setIsCollapsed(true)}
                      >
                        <item.icon className="w-4 h-4" />
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
            >
              <LogOut className="w-4 h-4" />
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
        className="fixed top-4 left-4 z-30 md:hidden bg-slate-900 text-white hover:bg-slate-800 p-2 rounded-full shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </Button>
    </>
  );
}