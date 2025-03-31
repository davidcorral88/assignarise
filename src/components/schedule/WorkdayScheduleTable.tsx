
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Save, Edit, Trash, Plus } from 'lucide-react';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { WorkdaySchedule } from '@/utils/types';
import { 
  getWorkdaySchedules, 
  addWorkdaySchedule, 
  updateWorkSchedule, 
  deleteWorkdaySchedule 
} from '@/utils/dataService';

const formatDateFromMMDD = (mmdd: string): string => {
  // Convertir MM-DD a Date y formatear a string legible
  const year = new Date().getFullYear();
  const date = parse(`${year}-${mmdd}`, 'yyyy-MM-dd', new Date());
  return format(date, 'd MMM', { locale: es });
};

const WorkdayScheduleTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [editingSchedule, setEditingSchedule] = useState<WorkdaySchedule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Store original id for updates
  const [originalId, setOriginalId] = useState<string | null>(null);
  
  // Query para obtener los horarios
  const { data: schedules = [] } = useQuery({
    queryKey: ['workdaySchedules'],
    queryFn: getWorkdaySchedules
  });
  
  // Mutation para añadir horario
  const addScheduleMutation = useMutation({
    mutationFn: addWorkdaySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: "Engadido",
        description: "O novo horario foi engadido correctamente.",
      });
      setIsDialogOpen(false);
      setEditingSchedule(null);
      setOriginalId(null);
    }
  });
  
  // Mutation para actualizar horario
  const updateScheduleMutation = useMutation({
    mutationFn: (schedule: WorkdaySchedule) => updateWorkSchedule(schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: "Actualizado",
        description: "O horario foi actualizado correctamente.",
      });
      setIsDialogOpen(false);
      setEditingSchedule(null);
      setOriginalId(null);
    }
  });
  
  // Mutation para eliminar horario
  const deleteScheduleMutation = useMutation({
    mutationFn: deleteWorkdaySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: "Eliminado",
        description: "O horario foi eliminado correctamente.",
      });
    }
  });
  
  const handleEdit = (schedule: WorkdaySchedule) => {
    setEditingSchedule({ ...schedule });
    setOriginalId(schedule.id);
    setIsDialogOpen(true);
  };
  
  const handleAddNew = () => {
    const newSchedule: WorkdaySchedule = {
      id: '',
      name: '',
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
      startTime: '09:00',
      endTime: '17:00',
      type: '',
      startDate: '01-01',
      endDate: '12-31',
      mondayHours: 8,
      tuesdayHours: 8,
      wednesdayHours: 8,
      thursdayHours: 8,
      fridayHours: 8,
    };
    setEditingSchedule(newSchedule);
    setOriginalId(null);
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    deleteScheduleMutation.mutate(id);
  };
  
  const handleDateSelect = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    if (!date || !editingSchedule) return;
    
    const dateStr = format(date, 'MM-dd');
    setEditingSchedule({ 
      ...editingSchedule, 
      [field]: dateStr 
    });
  };
  
  const handleSave = () => {
    if (!editingSchedule) return;
    
    if (!editingSchedule.type?.trim()) {
      toast({
        title: "Erro",
        description: "O tipo de xornada non pode estar vacío",
        variant: "destructive",
      });
      return;
    }
    
    if (originalId) {
      // Update existing schedule
      const updatedSchedule = { ...editingSchedule, id: originalId };
      updateScheduleMutation.mutate(updatedSchedule);
    } else {
      // Add new schedule
      addScheduleMutation.mutate(editingSchedule);
    }
  };
  
  const isPending = addScheduleMutation.isPending || updateScheduleMutation.isPending || deleteScheduleMutation.isPending;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Horarios de traballo</h3>
        <Button onClick={handleAddNew} className="flex items-center" disabled={isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Engadir horario
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo de xornada</TableHead>
            <TableHead>Data inicio</TableHead>
            <TableHead>Data fin</TableHead>
            <TableHead>Luns</TableHead>
            <TableHead>Martes</TableHead>
            <TableHead>Mércores</TableHead>
            <TableHead>Xoves</TableHead>
            <TableHead>Venres</TableHead>
            <TableHead className="text-right">Accións</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.type}</TableCell>
              <TableCell>{formatDateFromMMDD(schedule.startDate)}</TableCell>
              <TableCell>{formatDateFromMMDD(schedule.endDate)}</TableCell>
              <TableCell>{schedule.mondayHours}h</TableCell>
              <TableCell>{schedule.tuesdayHours}h</TableCell>
              <TableCell>{schedule.wednesdayHours}h</TableCell>
              <TableCell>{schedule.thursdayHours}h</TableCell>
              <TableCell>{schedule.fridayHours}h</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(schedule)}
                    disabled={isPending}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(schedule.id)}
                    disabled={isPending}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          
          {schedules.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                Non hai horarios configurados. Engade un horario para comezar.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Dialog for adding/editing schedules */}
      {editingSchedule && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {originalId ? "Editar horario" : "Engadir novo horario"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Tipo de xornada</Label>
                <Input 
                  id="type" 
                  value={editingSchedule.type} 
                  onChange={(e) => setEditingSchedule({
                    ...editingSchedule,
                    type: e.target.value
                  })}
                  placeholder="Ex: Normal, Reducida, Verán..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data inicio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingSchedule.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingSchedule.startDate 
                          ? formatDateFromMMDD(editingSchedule.startDate)
                          : "Seleccionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parse(`2024-${editingSchedule.startDate}`, 'yyyy-MM-dd', new Date())}
                        onSelect={(date) => handleDateSelect('startDate', date)}
                        initialFocus
                        locale={es}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label>Data fin</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editingSchedule.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingSchedule.endDate 
                          ? formatDateFromMMDD(editingSchedule.endDate)
                          : "Seleccionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={parse(`2024-${editingSchedule.endDate}`, 'yyyy-MM-dd', new Date())}
                        onSelect={(date) => handleDateSelect('endDate', date)}
                        initialFocus
                        locale={es}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="grid grid-cols-5 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="mondayHours">Luns</Label>
                  <Input 
                    id="mondayHours" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={editingSchedule.mondayHours} 
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      mondayHours: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tuesdayHours">Martes</Label>
                  <Input 
                    id="tuesdayHours" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={editingSchedule.tuesdayHours} 
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      tuesdayHours: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="wednesdayHours">Mércores</Label>
                  <Input 
                    id="wednesdayHours" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={editingSchedule.wednesdayHours} 
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      wednesdayHours: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="thursdayHours">Xoves</Label>
                  <Input 
                    id="thursdayHours" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={editingSchedule.thursdayHours} 
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      thursdayHours: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="fridayHours">Venres</Label>
                  <Input 
                    id="fridayHours" 
                    type="number" 
                    min="0"
                    step="0.5"
                    value={editingSchedule.fridayHours} 
                    onChange={(e) => setEditingSchedule({
                      ...editingSchedule,
                      fridayHours: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={addScheduleMutation.isPending || updateScheduleMutation.isPending}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={addScheduleMutation.isPending || updateScheduleMutation.isPending}
              >
                {(addScheduleMutation.isPending || updateScheduleMutation.isPending) ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white mr-2" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Gardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default WorkdayScheduleTable;
