
import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskSidebarProps {
  status: string;
  setStatus: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  dueDate: Date | undefined;
  setDueDate: (date: Date | undefined) => void;
  submitting: boolean;
  isEditMode: boolean;
}

const TaskSidebar: React.FC<TaskSidebarProps> = ({
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
    <div className="space-y-4">
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
    </div>
  );
}

export default TaskSidebar;
