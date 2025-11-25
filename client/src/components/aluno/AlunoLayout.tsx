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
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

interface AlunoLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/aluno/dashboard" },
  { icon: Dumbbell, label: "Meus Treinos", path: "/aluno/treinos" },
  { icon: Apple, label: "Nutrição", path: "/aluno/nutricao" },
  { icon: Calendar, label: "Agenda", path: "/aluno/agenda" },
  { icon: TrendingUp, label: "Progresso", path: "/aluno/progresso" },
  { icon: Video, label: "Vídeos", path: "/aluno/videos" },
  { icon: User, label: "Perfil", path: "/aluno/perfil" },
];

export default function AlunoLayout({ children }: AlunoLayoutProps) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-blue-500" />
          <h1 className="text-lg font-bold">Douglas Personal</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen bg-gray-900 border-r border-gray-800
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${isCollapsed ? "lg:w-16" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
            <div className={`flex items-center gap-3 ${isCollapsed ? "lg:justify-center lg:w-full" : ""}`}>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-base font-bold text-gray-100">Douglas Personal</span>
                  <span className="text-xs text-gray-400">Painel do Aluno</span>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex text-gray-400 hover:text-gray-100"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto mt-16 lg:mt-0">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Link key={item.path} href={item.path}>
                  <div
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
                      transition-all duration-200 group relative
                      ${
                        isActive
                          ? "bg-blue-500/10 text-blue-500"
                          : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                      }
                      ${isCollapsed ? "lg:justify-center" : ""}
                    `}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    
                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-gray-100 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        {item.label}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-gray-800">
            <Button
              variant="ghost"
              className={`w-full text-gray-400 hover:text-gray-100 hover:bg-gray-800 group relative ${isCollapsed ? "lg:justify-center lg:px-0" : "justify-start"}`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span className="ml-3">Sair</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden lg:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-gray-100 text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                  Sair
                </div>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`min-h-screen pt-16 lg:pt-0 transition-all duration-300 ${isCollapsed ? "lg:ml-16" : "lg:ml-64"}`}>
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
