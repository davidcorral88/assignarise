
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Mail, Play } from 'lucide-react';
import { API_URL } from '@/utils/dbConfig';

export const DailyReview = () => {
  const [enabled, setEnabled] = useState(false);
  const [reviewTime, setReviewTime] = useState('09:00');
  const [notificationEmails, setNotificationEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cargar la configuración almacenada
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch(`${API_URL}/review_config`);
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setEnabled(data.config.enabled === 'S');
          setReviewTime(data.config.reviewTime || '09:00');
          setNotificationEmails(data.config.notificationEmails || '');
        }
      }
    } catch (error) {
      console.error('Error al cargar la configuración:', error);
    }
  };

  const saveConfig = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/review_config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: enabled ? 'S' : 'N',
          reviewTime,
          notificationEmails,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Configuración guardada',
          description: 'La configuración de revisión diaria se ha guardado correctamente.',
        });
      } else {
        throw new Error('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo guardar la configuración. Inténtelo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const runDailyReview = async () => {
    setIsRunning(true);
    try {
      // Ejecutar revisión manualmente
      const response = await fetch(`${API_URL}/daily_review/run`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Error al ejecutar la revisión');
      }
      
      const data = await response.json();
      
      if (data.executed) {
        toast({
          title: 'Revisión ejecutada',
          description: `Se enviaron ${data.alertsSent} alertas de un total de ${data.totalUsers} usuarios revisados.`,
        });
      } else {
        toast({
          title: 'Revisión no ejecutada',
          description: `Motivo: ${data.reason === 'disabled' ? 'La revisión está desactivada' : 'El día anterior no era laborable'}`,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error al ejecutar la revisión:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo ejecutar la revisión. Revisa la consola para más detalles.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Revisión diaria de tarefas</CardTitle>
        <CardDescription>
          Configura a revisión automática de tarefas para enviar alertas de horas non imputadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="review-enabled" 
            checked={enabled} 
            onCheckedChange={(checked) => setEnabled(checked === true)}
          />
          <Label htmlFor="review-enabled">Activar revisión diaria</Label>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="review-time">Hora de revisión</Label>
          <div className="flex items-center space-x-2">
            <TimePicker 
              id="review-time"
              value={reviewTime}
              onChange={(value) => setReviewTime(value)}
              disabled={!enabled}
            />
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Hora a la que se ejecutará la revisión diariamente
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notification-emails">Correos en copia</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="notification-emails"
              placeholder="email@ejemplo.com, otro@ejemplo.com"
              value={notificationEmails}
              onChange={(e) => setNotificationEmails(e.target.value)}
              disabled={!enabled}
            />
            <Mail className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Lista de correos electrónicos separados por comas que recibirán copia de todas las alertas
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button 
            onClick={saveConfig} 
            disabled={isLoading}
          >
            {isLoading ? 'Gardando...' : 'Gardar configuración'}
          </Button>
          
          <Button 
            onClick={runDailyReview} 
            disabled={isRunning || !enabled}
            variant="outline"
            className="ml-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            {isRunning ? 'Executando...' : 'Executar agora'}
          </Button>
        </div>
        
        {enabled && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>
              La revisión diaria comprobará las horas imputadas del día anterior y enviará alertas a los usuarios con horas incompletas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
