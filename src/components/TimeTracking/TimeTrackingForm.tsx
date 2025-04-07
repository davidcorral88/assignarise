import React, { useState } from 'react';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { addTimeEntry } from '@/utils/dataService';
import { Task, TimeEntry } from '@/utils/types';

interface TimeTrackingFormProps {
  tasks: Task[];
  onEntryAdded: (entry: TimeEntry) => void;
  onCancel: () => void;
  userId: number;
}

const TimeTrackingForm: React.FC<TimeTrackingFormProps> = ({ 
  tasks, 
  onEntryAdded, 
  onCancel,
  userId 
}) => {
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [hours, setHours] = useState<number>(1);
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || hours <= 0 || !date) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor complete todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const timeEntry: TimeEntry = {
        id: uuidv4(),
        task_id: selectedTask,
        user_id: userId,
        hours: hours,
        date: format(date, 'yyyy-MM-dd'),
        notes: notes,
        description: `Registro de ${hours} horas para la tarea`,
      };
      
      await addTimeEntry(timeEntry);
      onEntryAdded(timeEntry);
      
      toast({
        title: 'Tiempo registrado',
        description: 'El registro de horas se ha guardado correctamente',
      });
    } catch (error) {
      console.error('Error al registrar tiempo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el registro de tiempo',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="animate-scale-in">
      <CardHeader>
        <CardTitle>Novo rexistro de horas</CardTitle>
        <CardDescription>
          Introduce as horas traballadas nunha tarefa asignada
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task">Tarefa *</Label>
            <Select 
              value={selectedTask} 
              onValueChange={setSelectedTask}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tarefa" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map(task => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Horas traballadas *</Label>
              <Input
                id="hours"
                type="number"
                min="0.5"
                step="0.5"
                value={hours || ''}
                onChange={(e) => setHours(Number(e.target.value))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                    className="bg-white pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Engade detalles sobre o traballo realizado"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white mr-2" />
                Gardando...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Gardar rexistro
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TimeTrackingForm;
