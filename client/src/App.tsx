import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import BenefitsSection from "./components/BenefitsSection";
import PricingSection from "./components/PricingSection";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import StudentDashboardEnhanced from "./components/StudentDashboardEnhanced";
import NavigationHeader from "./components/NavigationHeader";
import AdminSidebar from "./components/AdminSidebar";
import StudentSidebar from "./components/StudentSidebar";
import StudentsList from "./pages/admin/StudentsList";
import AgendaProfissional from "./pages/AgendaProfissional";
import { TreinosVideo } from "./pages/TreinosVideo";
import TreinosPdfPage from "./pages/TreinosPdf";
import PlanosAlimentares from "./pages/PlanosAlimentares";
import PagamentosAdmin from "./pages/admin/Pagamentos";
import FichasTreino from "./pages/admin/FichasTreino";
import NotFound from "@/pages/not-found";
import StudentLayoutWrapper from "./components/StudentLayoutWrapper";
import MyWorkouts from "./pages/aluno/MyWorkouts";
import MySchedule from "./pages/aluno/MySchedule";
import Configuracoes from "./pages/aluno/Configuracoes";
import Progresso from "./pages/aluno/Progresso";
import Metas from "./pages/aluno/Metas";
import Community from "./pages/aluno/Community";

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
    <div className="min-h-screen bg-background">
      <AdminSidebar onLogout={onLogout} />
      <main className="min-h-screen md:ml-64">
        <Switch>
          <Route path="/admin/dashboard">
            <AdminDashboard />
          </Route>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/alunos">
            <StudentsList />
          </Route>
          <Route path="/admin/agenda">
            <AgendaProfissional />
          </Route>
          <Route path="/admin/treinos-pdf">
            <div className="p-6">
              <TreinosPdfPage />
            </div>
          </Route>
          <Route path="/admin/treinos-video">
            <TreinosVideo />
          </Route>
          <Route path="/admin/fichas-treino" component={FichasTreino} />
          <Route path="/admin/planos" component={PlanosAlimentares} />
          <Route path="/admin/planos-alimentares" component={PlanosAlimentares} />
          <Route path="/admin/pagamentos" component={PagamentosAdmin} />
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
    <div className="min-h-screen bg-background flex">
      <StudentSidebar 
        onLogout={onLogout}
        userName={userName}
        userEmail="ana@email.com"
        planType="Trimestral"
      />
      <main className="flex-1 relative md:ml-64 ml-0">
        {children}
      </main>
    </div>
  );
}

function Router() {
  const [location, setLocation] = useLocation();
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'admin' | 'student'>('landing');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Função auxiliar para processar usuário autenticado
  const processAuthenticatedUser = async (session: any, shouldRedirect: boolean = false) => {
    console.log('👤 Processando usuário:', session.user.id);
    
    // Buscar perfil do usuário
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('*')
      .eq('auth_uid', session.user.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }
    
    const user = {
      ...session.user,
      profile: profile || null
    };
    
    setCurrentUser(user);
    
    // Determinar tipo de usuário
    const tipo = profile?.tipo || session.user.user_metadata?.role || 'aluno';
    console.log('🔑 Tipo de usuário:', tipo);
    
    if (tipo === 'admin') {
      setCurrentView('admin');
      if (shouldRedirect && !location.startsWith('/admin')) {
        console.log('📍 Redirecionando para /admin');
        setLocation('/admin');
      }
    } else {
      setCurrentView('student');
      if (shouldRedirect && !location.startsWith('/aluno')) {
        console.log('📍 Redirecionando para /aluno');
        setLocation('/aluno');
      }
    }
  };

  // Restaurar sessão ao carregar
  useEffect(() => {
    let mounted = true;
    let isProcessing = false;
    
    const restoreSession = async () => {
      if (isProcessing) {
        console.log('⚠️ Já está processando sessão, ignorando...');
        return;
      }
      
      isProcessing = true;
      
      try {
        console.log('🔍 Restaurando sessão...');
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        if (sessionError) {
          console.error('❌ Erro ao buscar sessão:', sessionError);
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.log('ℹ️ Nenhuma sessão ativa');
          setLoading(false);
          return;
        }
        
        console.log('✅ Sessão encontrada');
        await processAuthenticatedUser(session, location === '/' || location === '/login');
        
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
          isProcessing = false;
        }
      }
    };

    restoreSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state changed:', event);
      
      // Ignorar evento SIGNED_IN inicial (já tratado no restoreSession)
      if (event === 'SIGNED_IN' && loading) {
        console.log('⏭️ Ignorando SIGNED_IN durante carregamento inicial');
        return;
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogado');
        setCurrentUser(null);
        setCurrentView('landing');
        setLocation('/');
      } else if (event === 'SIGNED_IN' && session?.user) {
        console.log('👋 Novo login detectado');
        await processAuthenticatedUser(session, true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    setCurrentView('login');
    setLocation('/login');
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    
    // Determinar tipo de usuário baseado no tipo
    const tipo = user.profile?.tipo || user.user_metadata?.role;
    
    if (tipo === 'admin') {
      setCurrentView('admin');
      setLocation('/admin');
    } else {
      setCurrentView('student');
      setLocation('/aluno');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCurrentView('landing');
    setLocation('/');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setLocation('/');
  };

  const userName = currentUser?.profile?.nome || currentUser?.email || 'Usuário';

  // Mostrar loading enquanto verifica sessão
  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dark">
      {currentView === 'landing' && (
        <LandingPage onLogin={handleLogin} />
      )}
      
      {currentView === 'login' && (
        <LoginForm onBack={handleBackToLanding} onLoginSuccess={handleLoginSuccess} />
      )}
      
      {currentView === 'admin' && (
        <AdminLayout userName={userName} onLogout={handleLogout} />
      )}
      
      {currentView === 'student' && (
        <StudentLayoutWrapper 
          userName={userName}
          userEmail={currentUser?.email || ''}
          avatarUrl={currentUser?.profile?.fotoUrl}
          planType="Trimestral"
          onLogout={handleLogout}
        >
          <Switch>
            <Route path="/aluno">
              <StudentDashboardEnhanced />
            </Route>
            <Route path="/aluno/dashboard">
              <StudentDashboardEnhanced />
            </Route>
            <Route path="/aluno/treinos">
              <MyWorkouts />
            </Route>
            <Route path="/aluno/videos">
              <div className="p-6">
                <TreinosVideo />
              </div>
            </Route>
            <Route path="/aluno/plano-alimentar">
              <div className="p-6">
                <PlanosAlimentares />
              </div>
            </Route>
            <Route path="/aluno/agenda">
              <MySchedule />
            </Route>
            <Route path="/aluno/progresso">
              <Progresso />
            </Route>
            <Route path="/aluno/metas">
              <Metas />
            </Route>
            <Route path="/aluno/comunidade">
              <Community />
            </Route>
            <Route path="/aluno/configuracoes">
              <Configuracoes />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
        </StudentLayoutWrapper>
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
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
