
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
import { Plus, Trash2, Edit } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatorio"),
  type: z.string().optional(),
  mondayHours: z.number().min(0, "O valor debe ser positivo").optional(),
  tuesdayHours: z.number().min(0, "O valor debe ser positivo").optional(),
  wednesdayHours: z.number().min(0, "O valor debe ser positivo").optional(),
  thursdayHours: z.number().min(0, "O valor debe ser positivo").optional(),
  fridayHours: z.number().min(0, "O valor debe ser positivo").optional()
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
      name: "",
      type: "Standard",
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
      // Predeterminado para días de la semana (siempre L-V)
      const days_of_week = [1, 2, 3, 4, 5]; // Lunes a Viernes
      
      const newSchedule: WorkdaySchedule = {
        id: "",
        name: values.name,
        type: values.type || "Standard",
        // Valores predeterminados para campos obligatorios en la API
        start_time: "08:00",
        end_time: "16:00", 
        days_of_week: days_of_week,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        // Los valores de horas por día
        mondayHours: values.mondayHours,
        tuesdayHours: values.tuesdayHours,
        wednesdayHours: values.wednesdayHours,
        thursdayHours: values.thursdayHours,
        fridayHours: values.fridayHours
      };
      
      await addWorkdaySchedule(newSchedule);
      await fetchSchedules();
      
      toast({
        title: 'Xornada engadida',
        description: `A xornada ${values.name} foi engadida correctamente`,
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
      name: schedule.name,
      type: schedule.type || "Standard",
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
      // Predeterminado para días de la semana (siempre L-V)
      const days_of_week = [1, 2, 3, 4, 5]; // Lunes a Viernes
      
      const updatedSchedule: WorkdaySchedule = {
        ...currentSchedule,
        name: values.name,
        type: values.type || "Standard",
        days_of_week: days_of_week,
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        mondayHours: values.mondayHours,
        tuesdayHours: values.tuesdayHours,
        wednesdayHours: values.wednesdayHours,
        thursdayHours: values.thursdayHours,
        fridayHours: values.fridayHours
      };
      
      await updateWorkdaySchedule(currentSchedule.id, updatedSchedule);
      await fetchSchedules();
      
      toast({
        title: 'Xornada actualizada',
        description: `A xornada ${values.name} foi actualizada correctamente`,
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

  const formatHours = (hours: number | undefined) => {
    if (hours === undefined) return '-';
    return `${hours}h`;
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
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                    value={field.value || ''} 
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
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                    value={field.value || ''} 
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
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                    value={field.value || ''} 
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
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                    value={field.value || ''} 
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
                    onChange={e => field.onChange(parseFloat(e.target.value))} 
                    value={field.value || ''} 
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Nome da xornada" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
                Introduce as horas de traballo para cada día da semana
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
                Modifica as horas de traballo para cada día
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome da xornada</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Luns</TableHead>
                  <TableHead className="text-center">Martes</TableHead>
                  <TableHead className="text-center">Mércores</TableHead>
                  <TableHead className="text-center">Xoves</TableHead>
                  <TableHead className="text-center">Venres</TableHead>
                  <TableHead className="w-[100px]">Accións</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length > 0 ? (
                  schedules.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.name}
                      </TableCell>
                      <TableCell>
                        {schedule.type || "Standard"}
                      </TableCell>
                      <TableCell className="text-center">{formatHours(schedule.mondayHours)}</TableCell>
                      <TableCell className="text-center">{formatHours(schedule.tuesdayHours)}</TableCell>
                      <TableCell className="text-center">{formatHours(schedule.wednesdayHours)}</TableCell>
                      <TableCell className="text-center">{formatHours(schedule.thursdayHours)}</TableCell>
                      <TableCell className="text-center">{formatHours(schedule.fridayHours)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEditSchedule(schedule)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      Non hai xornadas rexistradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkdaySchedulesTab;
