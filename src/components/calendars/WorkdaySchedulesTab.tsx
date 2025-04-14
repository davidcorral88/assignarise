
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WorkdaySchedule } from '@/utils/types';
import { getWorkdaySchedules, addWorkdaySchedule, deleteWorkdaySchedule, updateWorkdaySchedule } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import WorkdayScheduleTable from '../schedule/WorkdayScheduleTable';

const formSchema = z.object({
  type: z.string().min(1, "O tipo é obrigatorio"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  mondayHours: z.coerce.number().min(0, "O valor debe ser positivo").optional(),
  tuesdayHours: z.coerce.number().min(0, "O valor debe ser positivo").optional(),
  wednesdayHours: z.coerce.number().min(0, "O valor debe ser positivo").optional(),
  thursdayHours: z.coerce.number().min(0, "O valor debe ser positivo").optional(),
  fridayHours: z.coerce.number().min(0, "O valor debe ser positivo").optional()
});

const WorkdaySchedulesTab = () => {
  const [schedules, setSchedules] = useState<WorkdaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<WorkdaySchedule | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Standard",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().getFullYear(), 11, 31).toISOString().split('T')[0],
      mondayHours: 8,
      tuesdayHours: 8,
      wednesdayHours: 8,
      thursdayHours: 8,
      fridayHours: 7
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

  const handleAddSchedule = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Form values being submitted:', values);
      
      // Asegúrate de que todos los valores sean números
      const mondayHours = typeof values.mondayHours === 'number' ? values.mondayHours : parseFloat(values.mondayHours as unknown as string) || 8;
      const tuesdayHours = typeof values.tuesdayHours === 'number' ? values.tuesdayHours : parseFloat(values.tuesdayHours as unknown as string) || 8;
      const wednesdayHours = typeof values.wednesdayHours === 'number' ? values.wednesdayHours : parseFloat(values.wednesdayHours as unknown as string) || 8;
      const thursdayHours = typeof values.thursdayHours === 'number' ? values.thursdayHours : parseFloat(values.thursdayHours as unknown as string) || 8;
      const fridayHours = typeof values.fridayHours === 'number' ? values.fridayHours : parseFloat(values.fridayHours as unknown as string) || 7;
      
      const newSchedule: WorkdaySchedule = {
        id: "",
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        // Required values for the API but not displayed
        start_time: "08:00",
        end_time: "16:00", 
        days_of_week: [1, 2, 3, 4, 5],
        // Hours for each day
        mondayHours: mondayHours,
        tuesdayHours: tuesdayHours,
        wednesdayHours: wednesdayHours,
        thursdayHours: thursdayHours,
        fridayHours: fridayHours,
      };
      
      console.log('Schedule being sent to API:', newSchedule);
      
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

  const handleEditSchedule = (schedule: WorkdaySchedule) => {
    setCurrentSchedule(schedule);
    
    form.reset({
      type: schedule.type || "Standard",
      startDate: schedule.startDate || "",
      endDate: schedule.endDate || "",
      mondayHours: schedule.mondayHours || undefined,
      tuesdayHours: schedule.tuesdayHours || undefined,
      wednesdayHours: schedule.wednesdayHours || undefined,
      thursdayHours: schedule.thursdayHours || undefined,
      fridayHours: schedule.fridayHours || undefined
    });
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateSchedule = async (values: z.infer<typeof formSchema>) => {
    if (!currentSchedule) return;
    
    try {
      console.log('Form values for update:', values);
      
      // Asegúrate de que todos los valores sean números
      const mondayHours = typeof values.mondayHours === 'number' ? values.mondayHours : parseFloat(values.mondayHours as unknown as string) || 8;
      const tuesdayHours = typeof values.tuesdayHours === 'number' ? values.tuesdayHours : parseFloat(values.tuesdayHours as unknown as string) || 8;
      const wednesdayHours = typeof values.wednesdayHours === 'number' ? values.wednesdayHours : parseFloat(values.wednesdayHours as unknown as string) || 8;
      const thursdayHours = typeof values.thursdayHours === 'number' ? values.thursdayHours : parseFloat(values.thursdayHours as unknown as string) || 8;
      const fridayHours = typeof values.fridayHours === 'number' ? values.fridayHours : parseFloat(values.fridayHours as unknown as string) || 7;
      
      const updatedSchedule: WorkdaySchedule = {
        ...currentSchedule,
        type: values.type,
        startDate: values.startDate,
        endDate: values.endDate,
        mondayHours: mondayHours,
        tuesdayHours: tuesdayHours,
        wednesdayHours: wednesdayHours,
        thursdayHours: thursdayHours,
        fridayHours: fridayHours,
      };
      
      console.log('Schedule being updated in API:', updatedSchedule);
      
      await updateWorkdaySchedule(currentSchedule.id, updatedSchedule);
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
                    {...field}
                    onChange={e => {
                      console.log('Luns value change:', e.target.value);
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }} 
                    value={field.value === undefined ? '' : field.value} 
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
                    {...field}
                    onChange={e => {
                      console.log('Martes value change:', e.target.value);
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }} 
                    value={field.value === undefined ? '' : field.value} 
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
                    {...field}
                    onChange={e => {
                      console.log('Mércores value change:', e.target.value);
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }} 
                    value={field.value === undefined ? '' : field.value} 
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
                    {...field}
                    onChange={e => {
                      console.log('Xoves value change:', e.target.value);
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }} 
                    value={field.value === undefined ? '' : field.value} 
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
                    {...field}
                    onChange={e => {
                      console.log('Venres value change:', e.target.value);
                      field.onChange(e.target.value ? parseFloat(e.target.value) : undefined);
                    }} 
                    value={field.value === undefined ? '' : field.value} 
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

  const renderDialogForm = (onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>, dialogTitle: string, submitButtonText: string) => (
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
              if (dialogTitle.includes("Engadir")) {
                setIsAddDialogOpen(false);
              } else {
                setIsEditDialogOpen(false);
                setCurrentSchedule(null);
              }
            }}
          >
            Cancelar
          </Button>
          <Button type="submit">{submitButtonText}</Button>
        </DialogFooter>
      </form>
    </Form>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Xornadas de traballo</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-1">
              <Plus size={16} />
              <span>Engadir Xornada</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Engadir nova xornada</DialogTitle>
              <DialogDescription>
                Introduce as datas de validez e horas de traballo para cada día da semana
              </DialogDescription>
            </DialogHeader>
            
            {renderDialogForm(handleAddSchedule, "Engadir nova xornada", "Gardar")}
          </DialogContent>
        </Dialog>
        
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
            
            {renderDialogForm(handleUpdateSchedule, "Editar xornada", "Actualizar")}
          </DialogContent>
        </Dialog>
      </div>
      
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
