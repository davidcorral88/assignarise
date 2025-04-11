
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { User } from '@/utils/types';
import { getAllCategories } from '@/utils/categoryProjectData';

interface TaskBasicInfoProps {
  task: any;
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
  creatorUser: User | null;
  isEditMode: boolean;
}

const TaskBasicInfo: React.FC<TaskBasicInfoProps> = ({
  task,
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
  creatorUser,
  isEditMode
}) => {
  // Get all available categories
  const categories = getAllCategories();

  return (
    <div className="space-y-4">
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
            onValueChange={(value) => {
              setCategory(value);
              // Reset project when changing category
              if (value !== category) {
                setProject('');
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="">Ningunha</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="project">Proxecto</Label>
          <Select
            value={project}
            onValueChange={setProject}
            disabled={!category}
          >
            <SelectTrigger>
              <SelectValue placeholder={category ? "Seleccionar proxecto" : "Seleccione categoría primeiro"} />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="">Ningún</SelectItem>
              {availableProjects.map((proj) => (
                <SelectItem key={proj} value={proj}>{proj}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export default TaskBasicInfo;
