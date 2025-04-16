
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Database, Clock, Mail, CheckCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from '@/components/ui/use-toast';

interface TaskReviewConfig {
  enabled: boolean;
  reviewTime: string;
  notificationEmails: string[];
}

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [taskReviewConfig, setTaskReviewConfig] = useState<TaskReviewConfig>({
    enabled: false,
    reviewTime: '08:00',
    notificationEmails: []
  });
  const [emailInput, setEmailInput] = useState('');
  
  useEffect(() => {
    // Only administrators can access this page
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    } else {
      // Load task review configuration
      loadTaskReviewConfig();
    }
  }, [currentUser, navigate]);
  
  const loadTaskReviewConfig = async () => {
    try {
      const response = await fetch('/api/config/task-review');
      if (response.ok) {
        const data = await response.json();
        setTaskReviewConfig(data);
      }
    } catch (error) {
      console.error('Error loading task review configuration:', error);
    }
  };
  
  const saveTaskReviewConfig = async () => {
    try {
      const response = await fetch('/api/config/task-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskReviewConfig)
      });
      
      if (response.ok) {
        toast({
          title: 'Configuración gardada',
          description: 'A configuración da revisión diaria de tarefas foi gardada correctamente.',
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving task review configuration:', error);
      toast({
        title: 'Error',
        description: 'Non se puido gardar a configuración.',
        variant: 'destructive',
      });
    }
  };
  
  const handleEmailAdd = () => {
    if (!emailInput) return;
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      toast({
        title: 'Email non válido',
        description: 'Por favor, introduce unha dirección de email válida.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!taskReviewConfig.notificationEmails.includes(emailInput)) {
      setTaskReviewConfig({
        ...taskReviewConfig,
        notificationEmails: [...taskReviewConfig.notificationEmails, emailInput]
      });
      setEmailInput('');
    }
  };
  
  const removeEmail = (email: string) => {
    setTaskReviewConfig({
      ...taskReviewConfig,
      notificationEmails: taskReviewConfig.notificationEmails.filter(e => e !== email)
    });
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
        
        {/* Task Review Configuration */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Revisión diaria de tarefas</CardTitle>
            <CardDescription>
              Configuración do proceso automático de revisión de imputacións
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="enableReview" 
                checked={taskReviewConfig.enabled}
                onCheckedChange={(checked) => 
                  setTaskReviewConfig({ ...taskReviewConfig, enabled: !!checked })
                }
              />
              <label
                htmlFor="enableReview"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Activar a revisión diaria de tarefas
              </label>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="reviewTime" className="text-sm font-medium">
                Hora de revisión diaria
              </label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <TimePicker 
                  id="reviewTime"
                  value={taskReviewConfig.reviewTime}
                  onChange={(value) => 
                    setTaskReviewConfig({ ...taskReviewConfig, reviewTime: value })
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                A revisión comprobarase as imputacións do día anterior á hora indicada.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Emails para notificacións
              </label>
              <div className="flex gap-2">
                <Input 
                  placeholder="Email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
                <Button onClick={handleEmailAdd} type="button">
                  <Mail className="mr-2 h-4 w-4" />
                  Engadir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Estes emails recibirán unha copia de tódalas notificacións.
              </p>
              
              {taskReviewConfig.notificationEmails.length > 0 && (
                <div className="mt-2 space-y-1">
                  {taskReviewConfig.notificationEmails.map(email => (
                    <div key={email} className="flex items-center justify-between bg-secondary/50 px-3 py-1 rounded-md">
                      <span className="text-sm">{email}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => removeEmail(email)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={saveTaskReviewConfig}>
              Gardar configuración
            </Button>
          </CardFooter>
        </Card>
        
        {/* PostgreSQL Info Card */}
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
