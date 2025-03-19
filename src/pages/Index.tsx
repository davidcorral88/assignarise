
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/40 h-16 px-6 flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center">
          <CheckSquare className="h-6 w-6 text-primary mr-2" />
          <span className="font-semibold text-xl">App de Tarefas</span>
        </div>
        <Button onClick={() => navigate('/login')}>
          {isAuthenticated ? 'Panel' : 'Iniciar sesión'}
        </Button>
      </header>
      
      <main className="flex-1 px-6 py-20 md:py-40">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col space-y-10 items-center text-center">
            <div className="space-y-4 animate-fade-in">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight" style={{ color: '#007bc4' }}>
                Rexistro de Tarefas do Plan de Transporte Público de Galicia
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Unha aplicación intuitiva para a xestión de tarefas, deseñada para xerentes e traballadores.
              </p>
            </div>
            
            <div className="animate-slide-in delay-100">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-6 rounded-full">
                Comezar agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 w-full animate-slide-in delay-200">
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Xestión de tarefas</h3>
                <p className="text-muted-foreground">Crea, edita e supervisa todas as tarefas nun só lugar cunha interface intuitiva.</p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Xestión de usuarios</h3>
                <p className="text-muted-foreground">Manexa perfís de xerente e traballador con diferentes niveis de acceso e permisos.</p>
              </div>
              
              <div className="bg-card rounded-lg p-6 shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="text-primary"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Seguimento de horas</h3>
                <p className="text-muted-foreground">Rexistra as horas traballadas en cada tarefa e mantén un control preciso do tempo.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
