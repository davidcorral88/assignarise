
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { DailyReview } from '@/components/settings/DailyReview';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Database, Mail, AlertCircle, CheckCircle, RefreshCcw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { API_URL } from '@/utils/dbConfig';
import { toast } from '@/components/ui/use-toast';

interface EmailStatus {
  configured: boolean;
  status: 'connected' | 'error' | 'checking';
  message: string;
  error?: string;
  code?: string;
}

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [emailStatus, setEmailStatus] = useState<EmailStatus>({
    configured: true,
    status: 'checking',
    message: 'Comprobando estado do servidor de correo...'
  });
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  
  useEffect(() => {
    // Only administrators can access this page
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    } else {
      // Check email status when the page loads
      checkEmailStatus();
    }
  }, [currentUser, navigate]);
  
  const checkEmailStatus = async () => {
    try {
      setIsCheckingEmail(true);
      setEmailStatus({
        ...emailStatus,
        status: 'checking',
        message: 'Comprobando estado do servidor de correo...'
      });
      
      const response = await fetch(`${API_URL}/email/status`);
      const data = await response.json();
      
      setEmailStatus({
        configured: data.configured,
        status: data.status,
        message: data.message,
        error: data.error,
        code: data.code
      });
    } catch (error) {
      setEmailStatus({
        configured: false,
        status: 'error',
        message: 'Error ao comprobar o estado do servidor de correo',
        error: error instanceof Error ? error.message : 'Error descoñecido'
      });
    } finally {
      setIsCheckingEmail(false);
    }
  };
  
  const runEmailTest = async () => {
    try {
      setIsCheckingEmail(true);
      const response = await fetch(`${API_URL}/email/test`);
      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: "Test de correo completado",
          description: "A conexión co servidor de correo foi realizada correctamente",
          variant: "default"
        });
      } else {
        toast({
          title: "Erro na conexión",
          description: data.details || "Non se puido conectar co servidor de correo",
          variant: "destructive"
        });
      }
      
      // Refresh status after test
      checkEmailStatus();
    } catch (error) {
      toast({
        title: "Erro na conexión",
        description: "Non se puido conectar co servidor de correo",
        variant: "destructive"
      });
    } finally {
      setIsCheckingEmail(false);
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
            
            {/* Email Status Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Estado do servidor de correo
                </h3>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runEmailTest}
                  disabled={isCheckingEmail}
                  className="h-8"
                >
                  {isCheckingEmail ? (
                    <>
                      <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
                      Comprobando...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Comprobar conexión
                    </>
                  )}
                </Button>
              </div>
              
              {emailStatus.status === 'checking' ? (
                <Alert className="bg-gray-100 border-gray-200">
                  <RefreshCcw className="h-4 w-4 text-gray-600 animate-spin" />
                  <AlertDescription className="text-gray-700">
                    Comprobando estado do servidor de correo...
                  </AlertDescription>
                </Alert>
              ) : emailStatus.status === 'connected' ? (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    O servidor de correo está conectado e funciona correctamente.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <div className="space-y-2 w-full">
                    <AlertDescription className="text-amber-700">
                      {emailStatus.message || "Produciuse un erro ao conectar co servidor de correo."}
                    </AlertDescription>
                    
                    {emailStatus.error && (
                      <div className="text-xs mt-2 text-amber-600 bg-amber-100 p-2 rounded">
                        <p className="font-semibold">Detalles do erro:</p>
                        <p>{emailStatus.error}</p>
                        {emailStatus.code && <p>Código: {emailStatus.code}</p>}
                      </div>
                    )}
                    
                    <div className="text-xs bg-amber-100 p-2 rounded mt-2">
                      <p className="font-semibold">Solución de problemas:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Verifique a configuración do servidor de correo na API</li>
                        <li>Comprobe se as credenciais SMTP son correctas</li>
                        <li>Comprobe se o servidor SMTP está accesible desde o servidor da API</li>
                        <li>Comprobe se o porto 587 está aberto para conexións externas</li>
                      </ul>
                    </div>
                  </div>
                </Alert>
              )}
            </div>
            
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
