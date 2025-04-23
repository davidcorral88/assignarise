
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clock, Mail } from 'lucide-react';

export const DailyReview = () => {
  const [enabled, setEnabled] = useState(false);
  const [reviewTime, setReviewTime] = useState('09:00');
  const [notificationEmails, setNotificationEmails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Cargar la configuración almacenada
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/review_config');
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
      const response = await fetch('/api/review_config', {
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
        
        <Button 
          onClick={saveConfig} 
          disabled={isLoading}
          className="mt-4"
        >
          {isLoading ? 'Gardando...' : 'Gardar configuración'}
        </Button>
      </CardContent>
    </Card>
  );
};
