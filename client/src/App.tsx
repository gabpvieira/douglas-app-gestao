import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import BenefitsSection from "./components/BenefitsSection";
import PricingSection from "./components/PricingSection";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import NavigationHeader from "./components/NavigationHeader";
import AdminSidebar from "./components/AdminSidebar";
import AddStudent from "./pages/admin/AddStudent";
import StudentsList from "./pages/admin/StudentsList";
import NotFound from "@/pages/not-found";

// Landing Page Component
function LandingPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={onLogin} />
      <HeroSection />
      <BenefitsSection />
      <PricingSection />
      <div className="text-center py-12">
        <button 
          onClick={onLogin}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          data-testid="button-demo-login"
        >
          Ver Dashboard Demo
        </button>
      </div>
      <Footer />
    </div>
  );
}

// Admin Layout Component
function AdminLayout({ userName, onLogout }: { 
  userName: string;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar onLogout={onLogout} />
      <main className="flex-1 md:ml-64">
        <Switch>
          <Route path="/admin">
            <AdminDashboard />
          </Route>
          <Route path="/admin/dashboard">
            <AdminDashboard />
          </Route>
          <Route path="/admin/alunos">
            <StudentsList />
          </Route>
          <Route path="/admin/novo-aluno">
            <AddStudent />
          </Route>
          <Route path="/admin/treinos-pdf">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Treinos PDF</h1>
              <p className="text-muted-foreground mt-2">Em breve...</p>
            </div>
          </Route>
          <Route path="/admin/treinos-video">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Treinos Vídeo</h1>
              <p className="text-muted-foreground mt-2">Em breve...</p>
            </div>
          </Route>
          <Route path="/admin/planos">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Planos Alimentares</h1>
              <p className="text-muted-foreground mt-2">Em breve...</p>
            </div>
          </Route>
          <Route path="/admin/pagamentos">
            <div className="p-6">
              <h1 className="text-2xl font-bold">Pagamentos</h1>
              <p className="text-muted-foreground mt-2">Em breve...</p>
            </div>
          </Route>
          <Route>
            <NotFound />
          </Route>
        </Switch>
      </main>
    </div>
  );
}

// Student Layout Component  
function StudentLayout({ children, userName, onLogout }: { 
  children: React.ReactNode;
  userName: string;
  onLogout: () => void;
}) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        userType="student" 
        userName={userName}
        onLogout={onLogout}
      />
      <main>{children}</main>
    </div>
  );
}

function Router() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'admin' | 'student'>('landing');
  const [userType, setUserType] = useState<'admin' | 'student'>('admin');
  
  // TODO: Remove mock functionality - replace with real authentication
  const mockUsers = {
    admin: { name: 'Douglas Silva', email: 'douglas@consultoria.com' },
    student: { name: 'Ana Silva', email: 'ana@email.com' }
  };

  const handleLogin = () => {
    setCurrentView('login');
  };

  const handleLoginSubmit = () => {
    // Mock login - alternates between admin and student for demo
    console.log('Login submitted');
    setCurrentView(userType);
  };

  const handleLogout = () => {
    console.log('Logout');
    setCurrentView('landing');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  const toggleUserType = () => {
    const newType = userType === 'admin' ? 'student' : 'admin';
    setUserType(newType);
    if (currentView === 'admin' || currentView === 'student') {
      setCurrentView(newType);
    }
  };

  const currentUser = mockUsers[userType];

  return (
    <div className="dark">
      {currentView === 'landing' && (
        <LandingPage onLogin={handleLogin} />
      )}
      
      {currentView === 'login' && (
        <div>
          <LoginForm onBack={handleBackToLanding} />
          <div className="fixed bottom-6 right-6 space-y-2">
            <div className="bg-card p-4 rounded-lg border shadow-lg">
              <p className="text-sm text-muted-foreground mb-3">Demo - Alternar Tipo de Usuário:</p>
              <button 
                onClick={toggleUserType}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
                data-testid="button-toggle-user-type"
              >
                {userType === 'admin' ? '💼 Administrador' : '🏃 Aluno'}
              </button>
              <button 
                onClick={handleLoginSubmit}
                className="w-full mt-2 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                data-testid="button-demo-login-submit"
              >
                Entrar como {userType === 'admin' ? 'Admin' : 'Aluno'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {currentView === 'admin' && (
        <AdminLayout userName={currentUser.name} onLogout={handleLogout} />
      )}
      
      {currentView === 'student' && (
        <StudentLayout userName={currentUser.name} onLogout={handleLogout}>
          <StudentDashboard />
        </StudentLayout>
      )}
    </div>
  );
}

function App() {
  // Force dark mode for the fitness platform
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
