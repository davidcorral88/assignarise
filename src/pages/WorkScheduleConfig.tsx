
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar as CalendarIcon,
  Save,
  Clock,
  Plus,
  Trash2,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { 
  getHolidays, 
  getWorkSchedule, 
  updateWorkSchedule, 
  addHoliday, 
  removeHoliday 
} from '../utils/mockData';
import { Holiday, WorkSchedule as WorkScheduleType } from '../utils/types';
import { cn } from '@/lib/utils';
import { format, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';

const WorkScheduleConfig = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [holidayName, setHolidayName] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  // Work schedule settings
  const [workSchedule, setWorkSchedule] = useState<WorkScheduleType>({
    regularHours: {
      mondayToThursday: 8.5,
      friday: 6,
    },
    reducedHours: {
      dailyHours: 7,
    },
    reducedPeriods: [{
      start: '07-01', // July 1st
      end: '08-31',   // August 31st
    }]
  });
  
  // Add new period state
  const [newPeriodStart, setNewPeriodStart] = useState<Date | undefined>();
  const [newPeriodEnd, setNewPeriodEnd] = useState<Date | undefined>();
  
  useEffect(() => {
    // Only directors can access this page
    if (currentUser?.role !== 'director') {
      navigate('/dashboard');
      return;
    }
    
    // Load initial data
    setHolidays(getHolidays());
    
    const schedule = getWorkSchedule();
    if (schedule) {
      setWorkSchedule(schedule);
    }
  }, [currentUser, navigate]);
  
  const handleAddHoliday = () => {
    if (!selectedDate || !holidayName.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecciona unha data e introduce un nome para o festivo',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    const newHoliday: Holiday = {
      date: format(selectedDate, 'yyyy-MM-dd'),
      name: holidayName.trim()
    };
    
    addHoliday(newHoliday);
    
    setHolidays([...holidays, newHoliday]);
    setHolidayName('');
    setSelectedDate(new Date());
    
    toast({
      title: 'Festivo engadido',
      description: `Festivo ${newHoliday.name} engadido para o ${format(selectedDate, 'dd/MM/yyyy')}.`,
    });
    
    setSubmitting(false);
  };
  
  const handleRemoveHoliday = (holiday: Holiday) => {
    removeHoliday(holiday);
    setHolidays(holidays.filter(h => h.date !== holiday.date));
    
    toast({
      title: 'Festivo eliminado',
      description: `Festivo ${holiday.name} eliminado.`,
    });
  };
  
  const handleSaveWorkSchedule = () => {
    setSubmitting(true);
    
    // Validate work schedule
    if (workSchedule.regularHours.mondayToThursday <= 0 || 
        workSchedule.regularHours.friday <= 0 || 
        workSchedule.reducedHours.dailyHours <= 0) {
      toast({
        title: 'Erro',
        description: 'As horas de traballo deben ser maiores que cero',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }
    
    updateWorkSchedule(workSchedule);
    
    toast({
      title: 'Horario actualizado',
      description: 'O horario de traballo foi actualizado correctamente.',
    });
    
    setSubmitting(false);
  };
  
  const handleAddPeriod = () => {
    if (!newPeriodStart || !newPeriodEnd) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecciona as datas de inicio e fin do período',
        variant: 'destructive',
      });
      return;
    }
    
    const startStr = format(newPeriodStart, 'MM-dd');
    const endStr = format(newPeriodEnd, 'MM-dd');
    
    const updatedSchedule = {
      ...workSchedule,
      reducedPeriods: [
        ...workSchedule.reducedPeriods,
        {
          start: startStr,
          end: endStr
        }
      ]
    };
    
    setWorkSchedule(updatedSchedule);
    setNewPeriodStart(undefined);
    setNewPeriodEnd(undefined);
    
    toast({
      title: 'Período engadido',
      description: `Período de xornada reducida engadido do ${format(newPeriodStart, 'dd/MM')} ao ${format(newPeriodEnd, 'dd/MM')}.`,
    });
  };
  
  const handleRemovePeriod = (index: number) => {
    const updatedPeriods = [...workSchedule.reducedPeriods];
    updatedPeriods.splice(index, 1);
    
    setWorkSchedule({
      ...workSchedule,
      reducedPeriods: updatedPeriods
    });
    
    toast({
      title: 'Período eliminado',
      description: 'Período de xornada reducida eliminado correctamente.',
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Configuración do horario</h1>
        </div>
        
        <Tabs defaultValue="work-schedule" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="work-schedule">Horario de traballo</TabsTrigger>
            <TabsTrigger value="holidays">Festivos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="work-schedule" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Horario de traballo</CardTitle>
                <CardDescription>
                  Configura os horarios regulares e reducidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Xornada Regular</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mondayToThursday">Horas de luns a xoves</Label>
                      <div className="flex items-center">
                        <Input
                          id="mondayToThursday"
                          type="number"
                          min="0"
                          step="0.5"
                          value={workSchedule.regularHours.mondayToThursday}
                          onChange={(e) => setWorkSchedule({
                            ...workSchedule,
                            regularHours: {
                              ...workSchedule.regularHours,
                              mondayToThursday: parseFloat(e.target.value) || 0
                            }
                          })}
                        />
                        <span className="ml-2">horas</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="friday">Horas de venres</Label>
                      <div className="flex items-center">
                        <Input
                          id="friday"
                          type="number"
                          min="0"
                          step="0.5"
                          value={workSchedule.regularHours.friday}
                          onChange={(e) => setWorkSchedule({
                            ...workSchedule,
                            regularHours: {
                              ...workSchedule.regularHours,
                              friday: parseFloat(e.target.value) || 0
                            }
                          })}
                        />
                        <span className="ml-2">horas</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Xornada Reducida</h3>
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="reducedHours">Horas diarias</Label>
                    <div className="flex items-center">
                      <Input
                        id="reducedHours"
                        type="number"
                        min="0"
                        step="0.5"
                        value={workSchedule.reducedHours.dailyHours}
                        onChange={(e) => setWorkSchedule({
                          ...workSchedule,
                          reducedHours: {
                            dailyHours: parseFloat(e.target.value) || 0
                          }
                        })}
                      />
                      <span className="ml-2">horas</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Períodos de xornada reducida</Label>
                    
                    {workSchedule.reducedPeriods.map((period, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-md border">
                        <div>
                          Do <span className="font-medium">{period.start}</span> ao <span className="font-medium">{period.end}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemovePeriod(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-md border border-dashed">
                      <div className="space-y-2">
                        <Label>Data de inicio</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newPeriodStart && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newPeriodStart ? format(newPeriodStart, "dd/MM") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newPeriodStart}
                              onSelect={setNewPeriodStart}
                              initialFocus
                              locale={es}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Data de fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !newPeriodEnd && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newPeriodEnd ? format(newPeriodEnd, "dd/MM") : <span>Seleccionar data</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newPeriodEnd}
                              onSelect={setNewPeriodEnd}
                              initialFocus
                              locale={es}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <Button 
                        className="sm:col-span-2" 
                        variant="outline"
                        onClick={handleAddPeriod}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Engadir período
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Button onClick={handleSaveWorkSchedule} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Gardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Gardar cambios
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="holidays" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Festivos</CardTitle>
                <CardDescription>
                  Configura os días festivos para o ano actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Engadir novo festivo</h3>
                    
                    <div className="space-y-2">
                      <Label>Data</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Seleccionar data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            initialFocus
                            locale={es}
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="holidayName">Nome do festivo</Label>
                      <Input
                        id="holidayName"
                        value={holidayName}
                        onChange={(e) => setHolidayName(e.target.value)}
                        placeholder="Ex: Día da Hispanidade"
                      />
                    </div>
                    
                    <Button onClick={handleAddHoliday}>
                      <Plus className="mr-2 h-4 w-4" />
                      Engadir festivo
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Festivos configurados</h3>
                    
                    {holidays.length > 0 ? (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {holidays
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map(holiday => (
                            <div 
                              key={holiday.date} 
                              className="flex items-center justify-between p-3 rounded-md border"
                            >
                              <div>
                                <span className="font-medium">{format(parseISO(holiday.date), 'dd/MM/yyyy')}</span>
                                <span className="mx-2">-</span>
                                <span>{holiday.name}</span>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRemoveHoliday(holiday)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border rounded-md border-dashed">
                        <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                        <p className="text-muted-foreground text-center">
                          Non hai festivos configurados.
                          <br />
                          Engade festivos para evitar alertas en días non laborables.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default WorkScheduleConfig;
