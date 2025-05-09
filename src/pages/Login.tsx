
import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Clock, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar error anterior
    setLoginError(null);
    
    if (!email || !password) {
      toast({
        title: 'Campos requiridos',
        description: 'Por favor, introduce email e contrasinal',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Produciuse un erro durante o inicio de sesión';
      
      // Mostrar mensajes específicos según el tipo de error
      if (errorMessage.includes('Usuario non atopado')) {
        setLoginError('O usuario non existe.');
      } else if (errorMessage.includes('servidor no está respondiendo') || errorMessage.includes('Respuesta no válida')) {
        setLoginError('Erro de conexión: Non se puido conectar co servidor.');
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setLoginError('Erro de rede: Comproba a túa conexión a Internet.');
      } else {
        setLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <Clock className="h-12 w-12 text-primary" />
          </div>
          <h1 className="mt-6 text-3xl font-bold" style={{ color: '#007bc4' }}>Control de Tarefas</h1>
          <p className="mt-2 text-muted-foreground">
            Control de Tarefas da Asistencia de Xestión e Seguemento do Plan de Transporte Público de Galicia (ATSXPTPG)
          </p>
        </div>
        
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Iniciar sesión</CardTitle>
            <CardDescription>
              Introduce as túas credenciais para acceder
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {loginError && (
                <Alert variant="destructive" className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700 text-sm">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="teu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contrasinal</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>Iniciar sesión</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
