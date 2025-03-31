import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar, 
  Clock, 
  Tag, 
  Users,
  ArrowLeft,
  Edit,
  CheckCircle2,
  Circle,
  Timer,
  PlusCircle,
  Save,
  Database,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  getHolidays, 
  getWorkSchedule, 
  updateWorkSchedule,
  getWorkdaySchedules,
  addHoliday,
  getUsers,
} from '../utils/dataService';
import { WorkSchedule, Holiday, WorkdaySchedule, User } from '../utils/types';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { mockWorkdaySchedule } from '@/utils/mockData';
import { useNavigate } from 'react-router-dom';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { ImportUsersButton } from '@/components/users/ImportUsersButton';
import { ResetDatabaseButton } from '@/components/settings/ResetDatabaseButton';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
})

const WorkScheduleConfig = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    defaultWorkdayScheduleId: '',
    useDefaultForAll: true,
    userSchedules: [],
  });
  const [workdaySchedules, setWorkdaySchedules] = useState<WorkdaySchedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHolidayDate, setNewHolidayDate] = useState<Date | undefined>(undefined);
  const [newHolidayName, setNewHolidayName] = useState<string>('');
  const [defaultScheduleId, setDefaultScheduleId] = useState<string>('');
  const [useDefaultForAll, setUseDefaultForAll] = useState<boolean>(true);
  const [reducedHours, setReducedHours] = useState<number>(6);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedHolidays = await getHolidays();
        setHolidays(fetchedHolidays);
        
        const fetchedSchedule = await getWorkSchedule();
        setWorkSchedule(fetchedSchedule);
        
        setReducedHours(fetchedSchedule.reducedHours || 6);
        setDefaultScheduleId(fetchedSchedule.defaultWorkdayScheduleId);
        setUseDefaultForAll(fetchedSchedule.useDefaultForAll);
        
        const fetchedSchedules = await getWorkdaySchedules();
        setWorkdaySchedules(fetchedSchedules);
        
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const [newHolidayDescription, setNewHolidayName] = useState<string>('');
  const handleAddHoliday = () => {
    if (!newHolidayDate || !newHolidayName) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor introduce una fecha y un nombre para el día festivo.',
        variant: 'destructive',
      });
      return;
    }
    
    const holiday = {
      date: format(newHolidayDate, 'yyyy-MM-dd'),
      name: newHolidayName,
      description: newHolidayName // Use name as description if not provided
    };
    
    addHoliday(holiday)
      .then(() => {
        setHolidays([...holidays, holiday]);
        setNewHolidayDate(undefined);
        setNewHolidayName('');
        
        toast({
          title: 'Día festivo añadido',
          description: 'El día festivo ha sido registrado correctamente.',
        });
      })
      .catch(error => {
        console.error('Error adding holiday:', error);
        toast({
          title: 'Error',
          description: 'No se pudo añadir el día festivo.',
          variant: 'destructive',
        });
      });
  };
  
  const handleSaveSettings = async () => {
    if (!defaultScheduleId) {
      toast({
        title: 'Horario por defecto requerido',
        description: 'Por favor selecciona un horario por defecto.',
        variant: 'destructive',
      });
      return;
    }
    
    // Update any reducedPeriods that have 'start' and 'end' properties to use 'startDate' and 'endDate'
    const normalizedReducedPeriods = workSchedule.reducedPeriods?.map(period => {
      if ('start' in period && 'end' in period) {
        return {
          startDate: period.start,
          endDate: period.end
        };
      }
      return period;
    });
    
    const updatedWorkSchedule: WorkSchedule = {
      ...workSchedule,
      defaultWorkdayScheduleId: defaultScheduleId,
      useDefaultForAll: useDefaultForAll,
      reducedHours: reducedHours,
      reducedPeriods: normalizedReducedPeriods
    };
    
    try {
      await updateWorkSchedule(updatedWorkSchedule);
      setWorkSchedule(updatedWorkSchedule);
      
      toast({
        title: 'Configuración guardada',
        description: 'La configuración de horarios ha sido guardada correctamente.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la configuración.',
        variant: 'destructive',
      });
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <Clock className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al panel
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#007bc4' }}>
            Configuración de horarios
          </h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Días festivos</CardTitle>
                <CardDescription>
                  Administra los días festivos que afectarán a todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {holidays.map(holiday => (
                    <Badge key={holiday.date} variant="secondary" className="px-3 py-1 text-sm">
                      {holiday.name} ({format(parseISO(holiday.date), 'dd/MM/yyyy')})
                    </Badge>
                  ))}
                  
                  {holidays.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      No hay días festivos aún
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newHolidayDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {newHolidayDate ? format(newHolidayDate, "dd/MM/yyyy") : <span>Seleccionar fecha</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={newHolidayDate}
                          onSelect={setNewHolidayDate}
                          initialFocus
                          className="bg-white pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={newHolidayName}
                      onChange={(e) => setNewHolidayName(e.target.value)}
                      placeholder="Nombre del día festivo"
                    />
                  </div>
                </div>
                
                <Button type="button" className="w-full" variant="outline" onClick={handleAddHoliday}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir día festivo
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Horario por defecto</CardTitle>
                <CardDescription>
                  Selecciona el horario por defecto para todos los usuarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horario</Label>
                  <Select value={defaultScheduleId} onValueChange={setDefaultScheduleId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar horario" />
                    </SelectTrigger>
                    <SelectContent>
                      {workdaySchedules.map(schedule => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                  <div className="space-y-1 leading-none">
                    <h3 className="text-sm font-medium leading-none">Usar horario por defecto para todos</h3>
                    <p className="text-sm text-muted-foreground">
                      Si está activado, todos los usuarios usarán el horario por defecto.
                    </p>
                  </div>
                  <Switch id="default" checked={useDefaultForAll} onCheckedChange={setUseDefaultForAll} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reducedHours">Horas reducidas</Label>
                  <Input
                    id="reducedHours"
                    type="number"
                    value={reducedHours}
                    onChange={(e) => setReducedHours(Number(e.target.value))}
                    placeholder="Horas reducidas"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Acciones</CardTitle>
                <CardDescription>
                  Guarda la configuración actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={handleSaveSettings}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar configuración
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Almacenamiento</CardTitle>
                <CardDescription>
                  Información sobre el uso del almacenamiento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StorageUsage />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Copia de seguridad</CardTitle>
                <CardDescription>
                  Realiza una copia de seguridad de la base de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DatabaseBackup />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Importar usuarios</CardTitle>
                <CardDescription>
                  Importa usuarios desde un archivo JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ImportUsersButton onImportComplete={() => {}} />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle style={{ color: '#007bc4' }}>Restablecer base de datos</CardTitle>
                <CardDescription>
                  Elimina todos los datos de la base de datos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ResetDatabaseButton />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WorkScheduleConfig;
