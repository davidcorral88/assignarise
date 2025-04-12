
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkdaySchedule } from '@/utils/types';
import { getWorkdaySchedules, addWorkdaySchedule, deleteWorkdaySchedule } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Edit } from 'lucide-react';

const dayNames = ['Luns', 'Martes', 'Mércores', 'Xoves', 'Venres', 'Sábado', 'Domingo'];

const formSchema = z.object({
  name: z.string().min(1, "O nome é obrigatorio"),
  type: z.string().optional(),
  startTime: z.string().min(1, "A hora de inicio é obrigatoria"),
  endTime: z.string().min(1, "A hora de fin é obrigatoria"),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  monday: z.boolean().default(true),
  tuesday: z.boolean().default(true),
  wednesday: z.boolean().default(true),
  thursday: z.boolean().default(true),
  friday: z.boolean().default(true),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false)
});

const WorkdaySchedulesTab = () => {
  const [schedules, setSchedules] = useState<WorkdaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "Standard",
      startTime: "09:00",
      endTime: "17:00",
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
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
      // Create days_of_week array based on checkboxes
      const days_of_week = [];
      if (values.monday) days_of_week.push(1);
      if (values.tuesday) days_of_week.push(2);
      if (values.wednesday) days_of_week.push(3);
      if (values.thursday) days_of_week.push(4);
      if (values.friday) days_of_week.push(5);
      if (values.saturday) days_of_week.push(6);
      if (values.sunday) days_of_week.push(7);
      
      const newSchedule: WorkdaySchedule = {
        id: 0, // Will be assigned by server
        name: values.name,
        type: values.type || "Standard",
        startTime: values.startTime,
        endTime: values.endTime,
        breakStart: values.breakStart || null,
        breakEnd: values.breakEnd || null,
        monday: values.monday,
        tuesday: values.tuesday,
        wednesday: values.wednesday,
        thursday: values.thursday,
        friday: values.friday,
        saturday: values.saturday,
        sunday: values.sunday,
        days_of_week
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

  const handleDeleteSchedule = async (id: number) => {
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

  // Helper function to determine if a day is included in the schedule
  const isDayIncluded = (schedule: WorkdaySchedule, dayIndex: number) => {
    // Check days_of_week array first
    if (schedule.days_of_week && Array.isArray(schedule.days_of_week)) {
      return schedule.days_of_week.includes(dayIndex + 1); // +1 because days_of_week is 1-7
    }

    // Fall back to individual day properties
    const dayProps = [
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
      schedule.sunday,
    ];

    return dayProps[dayIndex] === true;
  };

  // Helper function to get hours for a specific day
  const getHoursForDay = (schedule: WorkdaySchedule, dayIndex: number) => {
    if (!isDayIncluded(schedule, dayIndex)) return '-';

    const dayProps = [
      schedule.mondayHours,
      schedule.tuesdayHours,
      schedule.wednesdayHours,
      schedule.thursdayHours,
      schedule.fridayHours,
    ];

    // Return specific hours if available
    if (dayIndex < dayProps.length && dayProps[dayIndex] !== undefined) {
      return dayProps[dayIndex];
    }

    // Calculate hours from start/end times
    if (schedule.startTime && schedule.endTime) {
      const start = new Date(`1970-01-01T${schedule.startTime || schedule.start_time}`);
      const end = new Date(`1970-01-01T${schedule.endTime || schedule.end_time}`);
      
      // Calculate hours difference
      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      // Subtract break time if available
      if (schedule.breakStart && schedule.breakEnd) {
        const breakStart = new Date(`1970-01-01T${schedule.breakStart}`);
        const breakEnd = new Date(`1970-01-01T${schedule.breakEnd}`);
        const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        hours -= breakHours;
      }
      
      return hours.toFixed(1);
    }

    return '8.0'; // Default full workday
  };

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
                Introduce os detalles da xornada de traballo
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddSchedule)} className="space-y-4">
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
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de fin</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="breakStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inicio descanso</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            value={field.value || ""} 
                            onChange={e => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="breakEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fin descanso</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field} 
                            value={field.value || ""} 
                            onChange={e => field.onChange(e.target.value || undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div>
                  <FormLabel className="block mb-2">Días da semana</FormLabel>
                  <div className="grid grid-cols-7 gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, index) => (
                      <FormField
                        key={day}
                        control={form.control}
                        name={day as any}
                        render={({ field }) => (
                          <FormItem className="flex flex-col items-center space-y-1">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="text-xs">{dayNames[index].substring(0, 3)}</FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit">Gardar</Button>
                </DialogFooter>
              </form>
            </Form>
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
                  <TableHead>Horario</TableHead>
                  {dayNames.map(day => (
                    <TableHead key={day} className="text-center">{day}</TableHead>
                  ))}
                  <TableHead className="w-[80px]">Accións</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length > 0 ? (
                  schedules.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.name}
                        {schedule.type && (
                          <Badge variant="outline" className="ml-2">
                            {schedule.type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.startTime || schedule.start_time} - {schedule.endTime || schedule.end_time}
                      </TableCell>
                      {dayNames.map((_, index) => (
                        <TableCell key={index} className="text-center">
                          {isDayIncluded(schedule, index) ? (
                            <span className="font-medium">{getHoursForDay(schedule, index)}h</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Eliminar</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
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
