
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Clock } from 'lucide-react';

export const DailyReview = () => {
  const [enabled, setEnabled] = useState(false);
  const [reviewTime, setReviewTime] = useState('09:00');
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
        }),
      });

      if (response.ok) {
        toast({
          title: 'Configuración gardada',
          description: 'A configuración de revisión diaria gardouse correctamente.',
        });
      } else {
        throw new Error('Error ao gardar a configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Non se puido gardar a configuración. Inténteo de novo máis tarde.',
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
          Configura a revisión automática de tarefas para alertas de horas non imputadas
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
