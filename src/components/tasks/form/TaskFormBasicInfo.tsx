
import React from 'react';
import { User } from '@/utils/types';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { UserIcon, CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type TaskFormBasicInfoProps = {
  task: any | null;
  creatorUser: User | null;
  tarefa: string;
  setTarefa: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  category: string;
  setCategory: (value: string) => void;
  project: string;
  setProject: (value: string) => void;
  availableProjects: string[];
  categories: string[];
  isEditMode: boolean;
};

const TaskFormBasicInfo: React.FC<TaskFormBasicInfoProps> = ({
  task,
  creatorUser,
  tarefa,
  setTarefa,
  description,
  setDescription,
  startDate,
  setStartDate,
  category,
  setCategory,
  project,
  setProject,
  availableProjects,
  categories,
  isEditMode
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle style={{ color: '#007bc4' }}>Información básica</CardTitle>
        <CardDescription>
          Ingresa os detalles básicos da tarefa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode && task?.id && (
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <div className="flex">
              <Input
                id="id"
                type="text"
                value={task?.id || ''}
                className="bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>
            <p className="text-xs text-muted-foreground">
              O ID asígnase automaticamente e non se pode modificar
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="creator">Creador</Label>
          <div className="flex items-center space-x-2 p-2 border rounded-md bg-gray-50">
            <UserIcon className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium">
              {creatorUser ? creatorUser.name : isEditMode ? 'Usuario non atopado' : 'Ti (creador da tarefa)'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="startDate">Data Inicio</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tarefa">Tarefa *</Label>
          <Input
            id="tarefa"
            value={tarefa}
            onChange={(e) => setTarefa(e.target.value)}
            placeholder="Ingresa o nome da tarefa"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Descrición</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe a tarefa en detalle"
            className="min-h-[150px]"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoría</Label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ningunha categoría</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Proxecto</Label>
            <Select 
              value={project} 
              onValueChange={(value) => setProject(value)}
              disabled={!category || availableProjects.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={category ? "Seleccionar proxecto" : "Selecciona primeiro unha categoría"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Ningún proxecto</SelectItem>
                {availableProjects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskFormBasicInfo;
