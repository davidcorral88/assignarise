import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkdaySchedule } from '@/utils/types';
import { getWorkdaySchedules, deleteWorkdaySchedule, updateWorkdaySchedule, addWorkdaySchedule } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import WorkdayScheduleTable from '../schedule/WorkdayScheduleTable';
import { Plus } from 'lucide-react';
import { useAuth } from '@/components/auth/useAuth';

const formSchema = z.object({
  type: z.string().min(1, "O tipo é obrigatorio"),
  startDate: z.string().min(1, "A data de inicio é obrigatoria"),
  endDate: z.string().min(1, "A data de fin é obrigatoria"),
  mondayHours: z.coerce.number().min(0, "As horas deben ser maiores que 0"),
  tuesdayHours: z.coerce.number().min(0, "As horas deben ser maiores que 0"),
  wednesdayHours: z.coerce.number().min(0, "As horas deben ser maiores que 0"),
  thursdayHours: z.coerce.number().min(0, "As horas deben ser maiores que 0"),
  fridayHours: z.coerce.number().min(0, "As horas deben ser maiores que 0")
});

type FormValues = z.infer<typeof formSchema>;

const WorkdaySchedulesTab = () => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  
  const [schedules, setSchedules] = useState<WorkdaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<WorkdaySchedule | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      startDate: "",
      endDate: "",
      mondayHours: 0,
      tuesdayHours: 0,
      wednesdayHours: 0,
      thursdayHours: 0,
      fridayHours: 0
    },
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await getWorkdaySchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching workday schedules:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible cargar as xornadas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (schedule: WorkdaySchedule) => {
    setCurrentSchedule(schedule);
    
    form.reset({
      type: schedule.type || "Standard",
      startDate: schedule.startDate || "",
      endDate: schedule.endDate || "",
      mondayHours: schedule.mondayHours !== undefined ? schedule.mondayHours : 8,
      tuesdayHours: schedule.tuesdayHours !== undefined ? schedule.tuesdayHours : 8,
      wednesdayHours: schedule.wednesdayHours !== undefined ? schedule.wednesdayHours : 8,
      thursdayHours: schedule.thursdayHours !== undefined ? schedule.thursdayHours : 8,
      fridayHours: schedule.fridayHours !== undefined ? schedule.fridayHours : 7
    });
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = async (values: FormValues) => {
    if (!currentSchedule) return;
    
    try {
      const updatedSchedule: Partial<WorkdaySchedule> = {
        ...currentSchedule,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        mondayHours: values.mondayHours,
        tuesdayHours: values.tuesdayHours,
        wednesdayHours: values.wednesdayHours,
        thursdayHours: values.thursdayHours,
        fridayHours: values.fridayHours,
      };
      
      console.log('Form values for update:', values);
      console.log('Schedule being updated in API:', updatedSchedule);
      
      if (currentSchedule.id) {
        await updateWorkdaySchedule(currentSchedule.id, updatedSchedule);
      }
      
      await fetchSchedules();
      
      toast({
        title: 'Xornada actualizada',
        description: `A xornada ${values.type} foi actualizada correctamente`,
      });
      
      setIsEditDialogOpen(false);
      setCurrentSchedule(null);
    } catch (error) {
      console.error('Error updating workday schedule:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible actualizar a xornada',
        variant: 'destructive',
      });
    }
  };

  const handleAddSchedule = async (values: FormValues) => {
    try {
      const newSchedule: Partial<WorkdaySchedule> = {
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        mondayHours: values.mondayHours,
        tuesdayHours: values.tuesdayHours,
        wednesdayHours: values.wednesdayHours,
        thursdayHours: values.thursdayHours,
        fridayHours: values.fridayHours,
      };
      
      console.log('Adding new schedule with values:', newSchedule);
      
      await addWorkdaySchedule(newSchedule);
      await fetchSchedules();
      
      toast({
        title: 'Xornada engadida',
        description: `A xornada ${values.type} foi engadida correctamente`,
      });
      
      setIsAddDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error adding workday schedule:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible engadir a xornada',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await deleteWorkdaySchedule(id);
      await fetchSchedules();
      
      toast({
        title: 'Xornada eliminada',
        description: 'A xornada foi eliminada correctamente',
      });
    } catch (error) {
      console.error('Error deleting workday schedule:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible eliminar a xornada',
        variant: 'destructive',
      });
    }
  };

  const renderDateFields = () => {
    return (
      <div className="grid grid-cols-2 gap-4 mb-4">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data inicio</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data fin</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    );
  };

  const renderHoursFields = () => {
    return (
      <div className="space-y-4 mt-4">
        <h3 className="text-sm font-medium">Horas por día</h3>
        <div className="grid grid-cols-5 gap-4">
          <FormField
            control={form.control}
            name="mondayHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Luns</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="tuesdayHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Martes</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="wednesdayHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mércores</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="thursdayHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Xoves</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="fridayHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Venres</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.5" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    );
  };

  const renderDialogForm = (onSubmit: (values: FormValues) => Promise<void>, isAdd: boolean = false) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Tipo de xornada" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {renderDateFields()}
        {renderHoursFields()}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => {
              if (isAdd) {
                setIsAddDialogOpen(false);
              } else {
                setIsEditDialogOpen(false);
                setCurrentSchedule(null);
              }
              form.reset();
            }}
          >
            Cancelar
          </Button>
          <Button type="submit">{isAdd ? 'Engadir' : 'Actualizar'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  const handleAddDialogOpen = () => {
    form.reset({
      type: "",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      mondayHours: 0,
      tuesdayHours: 0,
      wednesdayHours: 0,
      thursdayHours: 0,
      fridayHours: 0
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Xornadas de traballo</h2>
        
        {isAdmin && (
          <Button onClick={handleAddDialogOpen}>
            <Plus className="w-4 h-4 mr-2" />
            Engadir Xornada
          </Button>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setCurrentSchedule(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar xornada</DialogTitle>
            <DialogDescription>
              Modifica as datas de validez e horas de traballo para cada día
            </DialogDescription>
          </DialogHeader>
          {renderDialogForm(handleUpdateSchedule)}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) form.reset();
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Engadir xornada</DialogTitle>
            <DialogDescription>
              Introduce os datos da nova xornada de traballo
            </DialogDescription>
          </DialogHeader>
          {renderDialogForm(handleAddSchedule, true)}
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="p-4 overflow-auto">
          {loading ? (
            <div className="text-center py-4">Cargando xornadas...</div>
          ) : (
            <WorkdayScheduleTable 
              schedules={schedules}
              onEdit={handleEditSchedule}
              onDelete={handleDeleteSchedule}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkdaySchedulesTab;
