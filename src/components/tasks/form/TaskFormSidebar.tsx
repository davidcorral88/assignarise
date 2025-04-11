
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { CalendarIcon, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskFormSidebarProps = {
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  submitting: boolean;
  isEditMode: boolean;
};

const TaskFormSidebar: React.FC<TaskFormSidebarProps> = ({
  status,
  setStatus,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  submitting,
  isEditMode
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#007bc4' }}>Detalles</CardTitle>
        <CardDescription>
          Configura o estado e a prioridade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in_progress">En progreso</SelectItem>
              <SelectItem value="completed">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Data de vencemento</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dueDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-6">
        <Button className="w-full" type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Actualizar tarefa' : 'Crear tarefa'}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TaskFormSidebar;
