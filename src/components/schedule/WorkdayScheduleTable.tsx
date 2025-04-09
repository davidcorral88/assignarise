import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  getWorkdaySchedules, 
  addWorkdaySchedule, 
  deleteWorkdaySchedule 
} from '@/utils/dataService';
import { WorkdaySchedule } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Import directly from apiService
import { updateWorkdaySchedule } from '@/utils/apiService';

const workdayScheduleSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  monday: z.boolean().default(false),
  tuesday: z.boolean().default(false),
  wednesday: z.boolean().default(false),
  thursday: z.boolean().default(false),
  friday: z.boolean().default(false),
  saturday: z.boolean().default(false),
  sunday: z.boolean().default(false),
  startTime: z.string().default('08:00'),
  endTime: z.string().default('17:00'),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
  mondayHours: z.number().optional(),
  tuesdayHours: z.number().optional(),
  wednesdayHours: z.number().optional(),
  thursdayHours: z.number().optional(),
  fridayHours: z.number().optional(),
  saturdayHours: z.number().optional(),
  sundayHours: z.number().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof workdayScheduleSchema>;

const WorkdayScheduleTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkdaySchedule | null>(null);
  
  const { data: workdaySchedules = [], isLoading } = useQuery({
    queryKey: ['workdaySchedules'],
    queryFn: getWorkdaySchedules
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(workdayScheduleSchema),
    defaultValues: {
      name: "",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      startTime: '08:00',
      endTime: '17:00',
    },
  });
  
  const editForm = useForm<FormValues>({
    resolver: zodResolver(workdayScheduleSchema),
    defaultValues: {
      name: "",
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      startTime: '08:00',
      endTime: '17:00',
    },
    mode: "onChange"
  });
  
  useEffect(() => {
    if (selectedSchedule) {
      const formValues = {
        name: selectedSchedule.name,
        monday: selectedSchedule.monday || false,
        tuesday: selectedSchedule.tuesday || false,
        wednesday: selectedSchedule.wednesday || false,
        thursday: selectedSchedule.thursday || false,
        friday: selectedSchedule.friday || false,
        saturday: selectedSchedule.saturday || false,
        sunday: selectedSchedule.sunday || false,
        startTime: selectedSchedule.startTime || selectedSchedule.start_time,
        endTime: selectedSchedule.endTime || selectedSchedule.end_time,
        breakStart: selectedSchedule.breakStart,
        breakEnd: selectedSchedule.breakEnd,
        mondayHours: selectedSchedule.mondayHours,
        tuesdayHours: selectedSchedule.tuesdayHours,
        wednesdayHours: selectedSchedule.wednesdayHours,
        thursdayHours: selectedSchedule.thursdayHours,
        fridayHours: selectedSchedule.fridayHours,
        startDate: selectedSchedule.startDate ? new Date(selectedSchedule.startDate) : undefined,
        endDate: selectedSchedule.endDate ? new Date(selectedSchedule.endDate) : undefined,
      };
      editForm.reset(formValues);
    }
  }, [selectedSchedule, editForm]);
  
  const addWorkdayScheduleMutation = useMutation({
    mutationFn: (data: FormValues) => {
      const newSchedule: WorkdaySchedule = {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
        start_time: data.startTime,
        end_time: data.endTime,
        days_of_week: [],
        startTime: data.startTime,
        endTime: data.endTime,
        breakStart: data.breakStart,
        breakEnd: data.breakEnd,
        mondayHours: data.mondayHours,
        tuesdayHours: data.tuesdayHours,
        wednesdayHours: data.wednesdayHours,
        thursdayHours: data.thursdayHours,
        fridayHours: data.fridayHours,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
      };
      
      const daysOfWeek = [];
      if (data.monday) daysOfWeek.push(1);
      if (data.tuesday) daysOfWeek.push(2);
      if (data.wednesday) daysOfWeek.push(3);
      if (data.thursday) daysOfWeek.push(4);
      if (data.friday) daysOfWeek.push(5);
      if (data.saturday) daysOfWeek.push(6);
      if (data.sunday) daysOfWeek.push(0);
      
      newSchedule.days_of_week = daysOfWeek;
      
      return addWorkdaySchedule(newSchedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: 'Horario de trabajo añadido',
        description: 'El horario de trabajo ha sido añadido correctamente.',
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo añadir el horario de trabajo.',
        variant: 'destructive',
      });
    }
  });
  
  const updateWorkdayScheduleMutation = useMutation({
    mutationFn: (data: FormValues & { id: string }) => {
      const updatedSchedule: WorkdaySchedule = {
        id: data.id,
        name: data.name,
        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,
        start_time: data.startTime,
        end_time: data.endTime,
        days_of_week: [],
        startTime: data.startTime,
        endTime: data.endTime,
        breakStart: data.breakStart,
        breakEnd: data.breakEnd,
        mondayHours: data.mondayHours,
        tuesdayHours: data.tuesdayHours,
        wednesdayHours: data.wednesdayHours,
        thursdayHours: data.thursdayHours,
        fridayHours: data.fridayHours,
        startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
        endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
      };
      
      const daysOfWeek = [];
      if (data.monday) daysOfWeek.push(1);
      if (data.tuesday) daysOfWeek.push(2);
      if (data.wednesday) daysOfWeek.push(3);
      if (data.thursday) daysOfWeek.push(4);
      if (data.friday) daysOfWeek.push(5);
      if (data.saturday) daysOfWeek.push(6);
      if (data.sunday) daysOfWeek.push(0);
      
      updatedSchedule.days_of_week = daysOfWeek;
      
      return updateWorkdaySchedule(updatedSchedule.id, updatedSchedule);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: 'Horario de trabajo actualizado',
        description: 'El horario de trabajo ha sido actualizado correctamente.',
      });
      setEditOpen(false);
      setSelectedSchedule(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar el horario de trabajo.',
        variant: 'destructive',
      });
    }
  });
  
  const deleteWorkdayScheduleMutation = useMutation({
    mutationFn: (id: string) => deleteWorkdaySchedule(parseInt(id, 10)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workdaySchedules'] });
      toast({
        title: 'Horario de trabajo eliminado',
        description: 'El horario de trabajo ha sido eliminado correctamente.',
      });
      setSelectedSchedule(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el horario de trabajo.',
        variant: 'destructive',
      });
    }
  });
  
  const onSubmit = (values: FormValues) => {
    addWorkdayScheduleMutation.mutate(values);
  };
  
  const onEditSubmit = (values: FormValues) => {
    if (selectedSchedule) {
      updateWorkdayScheduleMutation.mutate({ ...values, id: selectedSchedule.id });
    }
  };
  
  const handleDelete = (schedule: WorkdaySchedule) => {
    deleteWorkdayScheduleMutation.mutate(schedule.id);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Horarios de trabajo</CardTitle>
        <FormDescription>
          Gestiona los horarios de trabajo de la empresa.
        </FormDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Añadir horario de trabajo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Añadir horario de trabajo</DialogTitle>
              <DialogDescription>
                Añade un nuevo horario de trabajo a la lista.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del horario" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este es el nombre del horario de trabajo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="monday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Lunes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tuesday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Martes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="wednesday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Miércoles
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thursday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Jueves
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="friday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Viernes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="saturday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Sábado
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sunday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Domingo
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta es la hora de inicio del horario de trabajo.
                        </FormDescription>
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
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta es la hora de fin del horario de trabajo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={addWorkdayScheduleMutation.isPending}>
                    {addWorkdayScheduleMutation.isPending ? (
                      <>
                        Añadiendo...
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      </>
                    ) : (
                      "Añadir"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>Editar horario de trabajo</DialogTitle>
              <DialogDescription>
                Edita un horario de trabajo existente.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-8">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del horario" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este es el nombre del horario de trabajo.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-4 gap-4">
                  <FormField
                    control={editForm.control}
                    name="monday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Lunes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="tuesday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Martes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="wednesday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Miércoles
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="thursday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Jueves
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="friday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Viernes
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="saturday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Sábado
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="sunday"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          Domingo
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de inicio</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta es la hora de inicio del horario de trabajo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hora de fin</FormLabel>
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Esta es la hora de fin del horario de trabajo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={updateWorkdayScheduleMutation.isPending}>
                    {updateWorkdayScheduleMutation.isPending ? (
                      <>
                        Actualizando...
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      </>
                    ) : (
                      "Actualizar"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Nombre</TableHead>
                <TableHead>Lunes</TableHead>
                <TableHead>Martes</TableHead>
                <TableHead>Miércoles</TableHead>
                <TableHead>Jueves</TableHead>
                <TableHead>Viernes</TableHead>
                <TableHead>Sábado</TableHead>
                <TableHead>Domingo</TableHead>
                <TableHead>Inicio</TableHead>
                <TableHead>Fin</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : workdaySchedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center">
                    No hay horarios de trabajo.
                  </TableCell>
                </TableRow>
              ) : (
                workdaySchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.name}</TableCell>
                    <TableCell>{schedule.monday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.tuesday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.wednesday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.thursday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.friday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.saturday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.sunday ? "Sí" : "No"}</TableCell>
                    <TableCell>{schedule.startTime}</TableCell>
                    <TableCell>{schedule.endTime}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedSchedule(schedule);
                        setEditOpen(true);
                      }}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(schedule)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkdayScheduleTable;
