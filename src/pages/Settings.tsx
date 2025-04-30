
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { DailyReview } from '@/components/settings/DailyReview';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Database, Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/utils/dbConfig';
import { toast } from '@/components/ui/use-toast';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [emailServerStatus, setEmailServerStatus] = useState<'loading' | 'connected' | 'error'>(
    'loading'
  );
  const [isTestingEmailServer, setIsTestingEmailServer] = useState(false);
  
  useEffect(() => {
    // Only administrators can access this page
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  useEffect(() => {
    // Check email server status on component mount
    checkEmailServerStatus();
  }, []);
  
  const checkEmailServerStatus = async () => {
    if (isTestingEmailServer) return;
    
    setIsTestingEmailServer(true);
    setEmailServerStatus('loading');
    
    try {
      const response = await fetch(`${API_URL}/email/test`);
      const data = await response.json();
      
      if (response.ok && data.status === 'Email server connection successful') {
        setEmailServerStatus('connected');
      } else {
        setEmailServerStatus('error');
      }
    } catch (error) {
      console.error('Error checking email server:', error);
      setEmailServerStatus('error');
    } finally {
      setIsTestingEmailServer(false);
    }
  };
  
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Axusta a configuración da aplicación
          </p>
        </div>
        
        {/* Email server status section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center">
              <Mail className="h-5 w-5 mr-2" />
              Servidor de correo
            </CardTitle>
            <CardDescription>
              Estado del servidor SMTP para envío de notificaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {emailServerStatus === 'loading' && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertTitle className="text-blue-800">
                  Comprobando conexión
                </AlertTitle>
                <AlertDescription className="text-blue-700">
                  Verificando la conexión al servidor SMTP...
                </AlertDescription>
              </Alert>
            )}
            
            {emailServerStatus === 'connected' && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Servidor SMTP conectado
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  El servidor de correo está configurado correctamente y listo para enviar notificaciones.
                </AlertDescription>
              </Alert>
            )}
            
            {emailServerStatus === 'error' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">
                  Error de conexión SMTP
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  No se pudo establecer conexión con el servidor de correo. Las notificaciones por email no funcionarán correctamente.
                </AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={checkEmailServerStatus}
              disabled={isTestingEmailServer}
              variant={emailServerStatus === 'error' ? "destructive" : "outline"}
              size="sm"
            >
              {isTestingEmailServer ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comprobando...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Comprobar conexión SMTP
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {/* Sección de revisión diaria de tareas */}
        <DailyReview />
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Configuración</CardTitle>
            <CardDescription>
              Axusta a configuración da aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <Alert className="bg-green-50 border-green-200">
              <Database className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Modo PostgreSQL exclusivo
              </AlertTitle>
              <AlertDescription className="text-green-700">
                La aplicación está utilizando PostgreSQL como único sistema de almacenamiento. El almacenamiento local ha sido desactivado.
              </AlertDescription>
            </Alert>
            
            <StorageUsage />
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Ayuda de administración</h3>
              <p className="text-sm text-muted-foreground">
                Para realizar copias de seguridad o restaurar la base de datos PostgreSQL, contacte con el administrador del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
