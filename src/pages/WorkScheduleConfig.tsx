import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { es } from 'date-fns/locale';
import { HolidaysCalendar } from '@/components/calendar/HolidaysCalendar';
import WorkdayScheduleTable from '@/components/schedule/WorkdayScheduleTable';
import {
  getHolidays,
  addHoliday,
  removeHoliday,
  getWorkSchedule,
  updateWorkSchedule,
  getUsers
} from '@/utils/dataService';
import { Holiday, WorkSchedule } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/components/auth/AuthContext';
import { ResetDatabaseDialog } from '@/components/settings/ResetDatabaseDialog';
import ImportUsersButton from '@/components/users/ImportUsersButton';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { POSTGRESQL_ONLY_MODE } from '@/utils/dbConfig';
import { PostgreSQLMigration } from '@/components/settings/PostgreSQLMigration';

const WorkScheduleConfig = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("holidays");
  
  // Holiday states
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDescription, setNewHolidayDescription] = useState("");
  const [isLoadingHolidays, setIsLoadingHolidays] = useState(true);
  
  // Work schedule states
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    defaultWorkdayScheduleId: '',
    useDefaultForAll: true,
    userSchedules: [],
    reducedHours: 0,
    reducedPeriods: []
  });
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  
  // PostgreSQL mode state
  const [useAPI, setUseAPI] = useState(POSTGRESQL_ONLY_MODE);
  
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const holidaysData = await getHolidays();
        setHolidays(holidaysData);
      } catch (error) {
        console.error("Error fetching holidays:", error);
        toast({
          title: "Error",
          description: "Non se puideron cargar os festivos",
          variant: "destructive",
        });
      } finally {
        setIsLoadingHolidays(false);
      }
    };
    
    const fetchWorkSchedule = async () => {
      try {
        const scheduleData = await getWorkSchedule();
        setWorkSchedule(scheduleData);
      } catch (error) {
        console.error("Error fetching work schedule:", error);
        toast({
          title: "Error",
          description: "Non se puido cargar a configuración de horarios",
          variant: "destructive",
        });
      } finally {
        setIsLoadingSchedule(false);
      }
    };
    
    fetchHolidays();
    fetchWorkSchedule();
  }, []);
  
  const handleAddHoliday = async () => {
    if (!selectedDate) {
      toast({
        title: "Erro",
        description: "Selecciona unha data para o festivo",
        variant: "destructive",
      });
      return;
    }
    
    if (!newHolidayName) {
      toast({
        title: "Erro",
        description: "Introduce un nome para o festivo",
        variant: "destructive",
      });
      return;
    }
    
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    
    try {
      const newHoliday: Holiday = {
        date: formattedDate,
        name: newHolidayName,
        description: newHolidayDescription || newHolidayName
      };
      
      await addHoliday(newHoliday);
      
      // Update local state
      setHolidays([...holidays, newHoliday]);
      
      // Reset form
      setNewHolidayName("");
      setNewHolidayDescription("");
      setIsHolidayDialogOpen(false);
      
      toast({
        title: "Festivo engadido",
        description: `Festivo ${newHolidayName} engadido para o ${format(selectedDate, "dd/MM/yyyy")}`,
      });
    } catch (error) {
      console.error("Error adding holiday:", error);
      toast({
        title: "Erro",
        description: "Non se puido engadir o festivo",
        variant: "destructive",
      });
    }
  };
  
  const handleRemoveHoliday = async (holiday: Holiday) => {
    try {
      await removeHoliday(holiday);
      
      // Update local state
      setHolidays(holidays.filter(h => h.date !== holiday.date));
      
      toast({
        title: "Festivo eliminado",
        description: `O festivo foi eliminado correctamente`,
      });
    } catch (error) {
      console.error("Error removing holiday:", error);
      toast({
        title: "Erro",
        description: "Non se puido eliminar o festivo",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateReducedHours = (hours: number) => {
    const updatedSchedule = {
      ...workSchedule,
      reducedHours: hours
    };
    
    setWorkSchedule(updatedSchedule);
    saveWorkSchedule(updatedSchedule);
  };
  
  const handleAddReducedPeriod = (period: { startDate: string; endDate: string }) => {
    const updatedPeriods = [
      ...(workSchedule.reducedPeriods || []),
      period
    ];
    
    const updatedSchedule = {
      ...workSchedule,
      reducedPeriods: updatedPeriods
    };
    
    setWorkSchedule(updatedSchedule);
    saveWorkSchedule(updatedSchedule);
  };
  
  const handleRemoveReducedPeriod = (index: number) => {
    if (!workSchedule.reducedPeriods) return;
    
    const updatedPeriods = [...workSchedule.reducedPeriods];
    updatedPeriods.splice(index, 1);
    
    const updatedSchedule = {
      ...workSchedule,
      reducedPeriods: updatedPeriods
    };
    
    setWorkSchedule(updatedSchedule);
    saveWorkSchedule(updatedSchedule);
  };
  
  const saveWorkSchedule = async (schedule: WorkSchedule) => {
    try {
      await updateWorkSchedule(schedule);
      toast({
        title: "Configuración actualizada",
        description: "A configuración de horarios foi actualizada correctamente",
      });
    } catch (error) {
      console.error("Error updating work schedule:", error);
      toast({
        title: "Erro",
        description: "Non se puido actualizar a configuración de horarios",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración de horarios</h1>
            <p className="text-muted-foreground">
              Configura os días festivos, horas de xornada reducida e outros axustes relacionados co tempo.
            </p>
          </div>
        </div>
        
        <Tabs
          defaultValue="holidays"
          className="space-y-4"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="holidays">Festivos</TabsTrigger>
            <TabsTrigger value="schedule">Horarios</TabsTrigger>
            <TabsTrigger value="reduced">Xornada reducida</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="database">Base de datos</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="holidays" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Festivos</CardTitle>
                <CardDescription>
                  Engade e xestiona os días festivos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingHolidays ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                ) : (
                  <HolidaysCalendar
                    holidays={holidays}
                    onRemoveHoliday={handleRemoveHoliday}
                  />
                )}
                
                <Dialog open={isHolidayDialogOpen} onOpenChange={setIsHolidayDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      Engadir festivo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Engadir festivo</DialogTitle>
                      <DialogDescription>
                        Selecciona unha data e introduce os detalles do festivo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Data
                        </Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="col-span-3"
                          locale={es}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={newHolidayName}
                          onChange={(e) => setNewHolidayName(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descripción
                        </Label>
                        <Input
                          id="description"
                          value={newHolidayDescription}
                          onChange={(e) => setNewHolidayDescription(e.target.value)}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="secondary" onClick={() => setIsHolidayDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" onClick={handleAddHoliday}>
                        Engadir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Horarios de traballo</CardTitle>
                <CardDescription>
                  Configura os horarios de traballo predeterminados.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSchedule ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[250px]" />
                  </div>
                ) : (
                  <WorkdayScheduleTable />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reduced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Xornada reducida</CardTitle>
                <CardDescription>
                  Configura as horas de xornada reducida e os períodos nos que se aplica.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reducedHours" className="text-right">
                    Horas de xornada reducida
                  </Label>
                  <Input
                    id="reducedHours"
                    type="number"
                    defaultValue={workSchedule.reducedHours || 0}
                    onChange={(e) => handleUpdateReducedHours(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Períodos de xornada reducida</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {workSchedule.reducedPeriods && workSchedule.reducedPeriods.length > 0 ? (
                      <ul className="list-none space-y-2">
                        {workSchedule.reducedPeriods.map((period, index) => (
                          <li key={index} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                            <span>
                              {format(new Date(period.startDate), "dd/MM/yyyy")} - {format(new Date(period.endDate), "dd/MM/yyyy")}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => handleRemoveReducedPeriod(index)}>
                              Eliminar
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Non hai períodos de xornada reducida configurados.</p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          Engadir período
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Engadir período de xornada reducida</DialogTitle>
                          <DialogDescription>
                            Selecciona as datas de inicio e fin do período.
                          </DialogDescription>
                        </DialogHeader>
                        <ReducedPeriodForm onAddPeriod={handleAddReducedPeriod} />
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="database" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Base de datos</CardTitle>
                  <CardDescription>
                    Xestiona a base de datos da aplicación.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ImportUsersButton />
                  <DatabaseBackup />
                  <DatabaseImport />
                  <StorageUsage />
                  {useAPI && <PostgreSQLMigration />}
                  <ResetDatabaseDialog />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

interface ReducedPeriodFormProps {
  onAddPeriod: (period: { startDate: string; endDate: string }) => void;
}

const ReducedPeriodForm: React.FC<ReducedPeriodFormProps> = ({ onAddPeriod }) => {
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  
  const handleAddPeriod = () => {
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Selecciona as datas de inicio e fin do período",
        variant: "destructive",
      });
      return;
    }
    
    if (startDate > endDate) {
      toast({
        title: "Erro",
        description: "A data de inicio debe ser anterior á data de fin",
        variant: "destructive",
      });
      return;
    }
    
    onAddPeriod({
      startDate: format(startDate, "yyyy-MM-dd"),
      endDate: format(endDate, "yyyy-MM-dd")
    });
    
    toast({
      title: "Período engadido",
      description: `Período de xornada reducida engadido do ${format(startDate, "dd/MM/yyyy")} ao ${format(endDate, "dd/MM/yyyy")}`,
    });
  };
  
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="startDate" className="text-right">
          Data de inicio
        </Label>
        <Calendar
          mode="single"
          selected={startDate}
          onSelect={setStartDate}
          className="col-span-3"
          locale={es}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="endDate" className="text-right">
          Data de fin
        </Label>
        <Calendar
          mode="single"
          selected={endDate}
          onSelect={setEndDate}
          className="col-span-3"
          locale={es}
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={() => {}}>
          Cancelar
        </Button>
        <Button type="submit" onClick={handleAddPeriod}>
          Engadir
        </Button>
      </DialogFooter>
    </div>
  );
};

export default WorkScheduleConfig;
