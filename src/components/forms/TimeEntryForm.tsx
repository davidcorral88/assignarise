
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Calendar as CalendarIcon } from 'lucide-react';
import { addTimeEntry } from '@/utils/dataService';
import { useAuth } from '@/components/auth/useAuth';
import { toNumericId } from '@/utils/typeUtils';

interface TimeEntryFormProps {
  taskId: string;
  onTimeEntryCreated: () => void;
}

const TimeEntryForm: React.FC<TimeEntryFormProps> = ({ taskId, onTimeEntryCreated }) => {
  const { currentUser } = useAuth();
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Necesitas iniciar sesión para registrar horas",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const numericTaskId = toNumericId(taskId);
      const userId = toNumericId(currentUser.id);
      
      if (numericTaskId === undefined || userId === undefined) {
        throw new Error("ID inválido");
      }
      
      const timeEntry = {
        task_id: numericTaskId,
        user_id: userId,
        date: format(date, 'yyyy-MM-dd'),
        hours: hours,
        notes: notes
      };
      
      await addTimeEntry(timeEntry);
      
      toast({
        title: "Éxito",
        description: "Tiempo registrado correctamente",
      });
      
      setHours(1);
      setNotes('');
      
      // Notify parent component to refresh time entries
      onTimeEntryCreated();
    } catch (error) {
      console.error('Error al registrar tiempo:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el tiempo",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t pt-4">
      <h4 className="text-sm font-medium">Añadir nuevo registro de horas</h4>
      
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="hours">Horas</Label>
          <Input
            id="hours"
            type="number"
            step="0.25"
            min="0.25"
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'dd/MM/yyyy') : <span>Seleccionar fecha</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          placeholder="Descripción del trabajo realizado"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            Guardando...
          </>
        ) : 'Registrar horas'}
      </Button>
    </form>
  );
};

export default TimeEntryForm;
