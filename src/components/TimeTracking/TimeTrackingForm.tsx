
import React, { useState } from 'react';
import { format } from 'date-fns';
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
  
  // Improve task assignment detection to properly filter assigned tasks
  const assignedTasks = tasks.filter(task => {
    // Check if the task has assignments array
    if (!task.assignments || !Array.isArray(task.assignments) || task.assignments.length === 0) {
      return false;
    }
    
    // Check if any assignment matches the current user ID
    return task.assignments.some(assignment => {
      // Handle case where assignment might not have user_id
      if (!assignment || assignment.user_id === undefined) {
        return false;
      }
      
      // Convert both to numbers for comparison
      const assignmentUserId = typeof assignment.user_id === 'string' 
        ? parseInt(assignment.user_id, 10) 
        : assignment.user_id;
        
      // Make sure we're comparing numbers
      const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      console.log(`Comparing assignment user ID ${assignmentUserId} with current user ID ${userIdNumber}. Match: ${assignmentUserId === userIdNumber}`);
      
      return assignmentUserId === userIdNumber;
    });
  });
  
  console.log(`Total tasks: ${tasks.length}, Filtered assigned tasks: ${assignedTasks.length}, User ID: ${userId}`);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTask || hours <= 0 || !date) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor complete todos os campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Ensure task_id is properly formatted - convert to string as required by TimeEntry type
      const taskId = parseInt(selectedTask, 10);
      
      if (isNaN(taskId)) {
        throw new Error('ID de tarea inválido');
      }
      
      const timeEntry: Partial<TimeEntry> = {
        task_id: taskId,           // Use NUMBER as TimeEntry expects number
        user_id: userId,           // Use NUMBER as TimeEntry expects number
        hours: hours,              // NUMBER
        date: format(date, 'yyyy-MM-dd'), // STRING in YYYY-MM-DD format
        notes: notes || '',        // STRING
      };
      
      console.log('Enviando registro de tempo:', JSON.stringify(timeEntry));
      
      const savedEntry = await addTimeEntry(timeEntry);
      console.log('Rexistro gardado con éxito:', savedEntry);
      
      onEntryAdded(savedEntry);
      
      toast({
        title: 'Tempo rexistrado',
        description: 'O rexistro de horas gardouse correctamente',
      });
    } catch (error) {
      console.error('Error ao rexistrar tempo:', error);
      toast({
        title: 'Erro',
        description: 'Non se puido gardar o rexistro de tempo. Comproba que a tarefa existe.',
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
              onValueChange={(value) => {
                console.log('Tarefa seleccionada:', value);
                setSelectedTask(value);
              }}
              required
            >
              <SelectTrigger id="task">
                <SelectValue placeholder="Seleccionar tarefa" />
              </SelectTrigger>
              <SelectContent>
                {assignedTasks.length > 0 ? (
                  assignedTasks.map(task => (
                    <SelectItem key={task.id} value={String(task.id)}>
                      {task.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-tasks" disabled>
                    Non hai tarefas asignadas
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {assignedTasks.length === 0 && (
              <p className="text-sm text-amber-600 mt-2">
                Non tes tarefas asignadas. Contacta co administrador.
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Horas traballadas *</Label>
              <Input
                id="hours"
                type="number"
                min="0.1"
                step="0.1"
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
