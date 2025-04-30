
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { DailyReview } from '@/components/settings/DailyReview';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Database, Mail, AlertTriangle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { API_URL } from '@/utils/dbConfig';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [emailPreferences, setEmailPreferences] = useState({
    assignmentNotifications: true,
    taskModificationNotifications: true
  });
  const [emailStatus, setEmailStatus] = useState<'checking' | 'working' | 'error' | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  useEffect(() => {
    // Only administrators can access this page
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
    
    // Load email preferences from localStorage
    const savedPreferences = localStorage.getItem('emailPreferences');
    if (savedPreferences) {
      setEmailPreferences(JSON.parse(savedPreferences));
    }
  }, [currentUser, navigate]);
  
  const handlePreferenceChange = (preference: keyof typeof emailPreferences) => {
    setEmailPreferences(prev => {
      const newPreferences = {
        ...prev,
        [preference]: !prev[preference]
      };
      localStorage.setItem('emailPreferences', JSON.stringify(newPreferences));
      return newPreferences;
    });
  };
  
  const checkEmailStatus = async () => {
    setEmailStatus('checking');
    setEmailError(null);
    
    try {
      const response = await fetch(`${API_URL}/email/test`);
      const data = await response.json();
      
      if (response.ok) {
        setEmailStatus('working');
        toast({
          title: 'Servidor de correo',
          description: 'A conexión co servidor de correo é correcta',
          variant: 'default',
        });
      } else {
        setEmailStatus('error');
        setEmailError(data.details || 'Erro descoñecido');
        toast({
          title: 'Erro na conexión co servidor de correo',
          description: data.details || 'Non se puido conectar co servidor de correo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setEmailStatus('error');
      setEmailError(error instanceof Error ? error.message : 'Erro descoñecido');
      toast({
        title: 'Erro na conexión co servidor de correo',
        description: error instanceof Error ? error.message : 'Erro descoñecido',
        variant: 'destructive',
      });
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
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Switch
                  id="assignment-notifications"
                  checked={emailPreferences.assignmentNotifications}
                  onCheckedChange={() => handlePreferenceChange('assignmentNotifications')}
                />
                <Label htmlFor="assignment-notifications">
                  Envío de emails ao realizar modificacións nas asignacións de horas a tarefas
                </Label>
              </div>
              
              <div className="flex items-center space-x-4">
                <Switch
                  id="task-notifications"
                  checked={emailPreferences.taskModificationNotifications}
                  onCheckedChange={() => handlePreferenceChange('taskModificationNotifications')}
                />
                <Label htmlFor="task-notifications">
                  Envío de emails ao realizar modificacións nas tarefas
                </Label>
              </div>
              
              <div className="pt-2">
                <Button 
                  onClick={checkEmailStatus}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  disabled={emailStatus === 'checking'}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  {emailStatus === 'checking' ? 'Comprobando...' : 'Comprobar servidor de correo'}
                </Button>
                
                {emailStatus === 'working' && (
                  <Alert className="mt-2 bg-green-50 border-green-200">
                    <Mail className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">
                      Servidor de correo funcionando
                    </AlertTitle>
                    <AlertDescription className="text-green-700">
                      A conexión co servidor de correo é correcta.
                    </AlertDescription>
                  </Alert>
                )}
                
                {emailStatus === 'error' && (
                  <Alert className="mt-2 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">
                      Problema no servidor de correo
                    </AlertTitle>
                    <AlertDescription className="text-red-700">
                      {emailError || 'Non se puido conectar co servidor de correo. Comproba a configuración.'}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
            
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
