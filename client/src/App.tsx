import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationProvider } from "@/components/notifications";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import ErrorBoundary from "./components/ErrorBoundary";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import AboutSection from "./components/AboutSection";
import BenefitsSection from "./components/BenefitsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import ResultsSection from "./components/ResultsSection";
import PricingSection from "./components/PricingSection";
import ChatFormSection from "./components/ChatFormSection";
import LoginForm from "./components/LoginForm";
import AdminDashboard from "./components/AdminDashboard";
import AdminSidebar from "./components/AdminSidebar";
import StudentsList from "./pages/admin/StudentsList";
import AgendaProfissional from "./pages/AgendaProfissional";
import { TreinosVideo } from "./pages/TreinosVideo";
import TreinosPdfPage from "./pages/TreinosPdf";
import PlanosAlimentares from "./pages/PlanosAlimentares";
import PagamentosAdmin from "./pages/admin/Pagamentos";
import FichasTreino from "./pages/admin/FichasTreino";
import AvaliacoesFisicas from "./pages/admin/AvaliacoesFisicas";
import AvaliacoesPosturais from "./pages/admin/AvaliacoesPosturais";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";
import AlunoDashboard from "./pages/aluno/Dashboard";
import MeusTreinos from "./pages/aluno/MeusTreinos";
import TreinoExecucao from "./pages/aluno/TreinoExecucao";
import Nutricao from "./pages/aluno/Nutricao";
import AgendaAluno from "./pages/aluno/Agenda";
import Progresso from "./pages/aluno/Progresso";
import VideosAluno from "./pages/aluno/Videos";
import AlunoPerfil from "./pages/aluno/Perfil";

// Landing Page Component
function LandingPage({ onLogin }: { onLogin: () => void }) {
  // Garantir que a página sempre inicie no topo
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header onLoginClick={onLogin} />
      <HeroSection />
      <AboutSection />
      <BenefitsSection />
      <HowItWorksSection />
      <ResultsSection />
      <PricingSection />
      <ChatFormSection />
      <Footer />
    </div>
  );
}

// Admin Layout Component
function AdminLayout({ userName, onLogout }: { 
  userName: string;
  onLogout: () => void;
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        onLogout={onLogout}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={setIsSidebarCollapsed}
      />
      <main className={`
        min-h-screen transition-all duration-300 ease-in-out
        ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}
      `}>
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
          <Route path="/admin/avaliacoes-fisicas" component={AvaliacoesFisicas} />
          <Route path="/admin/avaliacoes-posturais" component={AvaliacoesPosturais} />
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
        
        // Verificar sessão do Supabase Auth (admin e aluno)
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
        
        console.log('✅ Sessão admin encontrada');
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
        console.log('👋 Usuário deslogado - redirecionando para landing page');
        setCurrentUser(null);
        setCurrentView('landing');
        // Garantir que sempre vai para a raiz
        if (window.location.pathname !== '/') {
          setLocation('/');
        }
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
    console.log('🚪 Iniciando logout...');
    
    // Redirecionar PRIMEIRO para evitar flash de 404
    setLocation('/');
    
    // Limpar estado
    setCurrentUser(null);
    setCurrentView('landing');
    
    // Fazer logout no Supabase
    await supabase.auth.signOut();
    
    console.log('📍 Logout concluído');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setLocation('/');
  };

  // Redirecionar automaticamente se estiver na raiz
  useEffect(() => {
    if (location === '/' && !loading) {
      if (currentView === 'admin') {
        setLocation('/admin');
      } else if (currentView === 'student') {
        setLocation('/aluno');
      }
    }
  }, [location, currentView, loading]);

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
      <Switch>
        {/* Rota pública de login - sempre acessível */}
        <Route path="/login" component={Login} />
        
        {/* Rotas protegidas do aluno */}
        {currentView === 'student' ? (
          <>
            <Route path="/aluno/dashboard" component={AlunoDashboard} />
            <Route path="/aluno/treinos" component={MeusTreinos} />
            <Route path="/aluno/treino/:fichaAlunoId" component={TreinoExecucao} />
            <Route path="/aluno/nutricao" component={Nutricao} />
            <Route path="/aluno/agenda" component={AgendaAluno} />
            <Route path="/aluno/progresso" component={Progresso} />
            <Route path="/aluno/videos" component={VideosAluno} />
            <Route path="/aluno/perfil" component={AlunoPerfil} />
            <Route path="/aluno" component={AlunoDashboard} />
          </>
        ) : null}
        
        {/* Rotas do admin */}
        {currentView === 'admin' ? (
          <>
            <Route path="/admin">
              <AdminLayout userName={userName} onLogout={handleLogout} />
            </Route>
            <Route path="/admin/:rest*">
              {() => <AdminLayout userName={userName} onLogout={handleLogout} />}
            </Route>
          </>
        ) : null}
        
        {/* Landing page - rota padrão */}
        <Route path="/">
          <LandingPage onLogin={handleLogin} />
        </Route>
        
        {/* 404 - qualquer outra rota */}
        <Route component={NotFound} />
      </Switch>
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
        <NotificationProvider maxNotifications={5}>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
