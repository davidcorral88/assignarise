
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar as CalendarIcon,
  Check,
  Loader2,
  Heart,
  Trash2
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { 
  getVacationDays, 
  addVacationDay, 
  removeVacationDay 
} from '../utils/dataService';
import { VacationDay } from '../utils/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const UserVacations = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedType, setSelectedType] = useState<'vacation' | 'sick_leave'>('vacation');
  
  // Redirect if not logged in
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);
  
  // Query for vacation days
  const { data: vacationDays = [] } = useQuery({
    queryKey: ['vacationDays', currentUser?.id],
    queryFn: async () => currentUser ? await getVacationDays(currentUser.id) : [],
    enabled: !!currentUser
  });
  
  // Mutation for adding vacation day
  const addVacationMutation = useMutation({
    mutationFn: addVacationDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationDays', currentUser?.id] });
      setSelectedDate(undefined);
      
      toast({
        title: 'Día engadido',
        description: `Día de ${selectedType === 'vacation' ? 'vacacións' : 'baixa médica'} engadido correctamente.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu un erro ao engadir o día',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation for removing vacation day
  const removeVacationMutation = useMutation({
    mutationFn: removeVacationDay,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacationDays', currentUser?.id] });
      
      toast({
        title: 'Día eliminado',
        description: 'Día eliminado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Ocorreu un erro ao eliminar o día',
        variant: 'destructive',
      });
    }
  });
  
  const handleAddVacationDay = () => {
    if (!selectedDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecciona unha data',
        variant: 'destructive',
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: 'Erro',
        description: 'Usuario non identificado',
        variant: 'destructive',
      });
      return;
    }
    
    const newVacationDay: VacationDay = {
      userId: currentUser.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
      type: selectedType
    };
    
    // Check if date already exists
    const exists = vacationDays.some(
      v => v.date === newVacationDay.date && v.type === newVacationDay.type
    );
    
    if (exists) {
      toast({
        title: 'Data xa rexistrada',
        description: 'Esta data xa está rexistrada co mesmo tipo de ausencia.',
        variant: 'destructive',
      });
      return;
    }
    
    addVacationMutation.mutate(newVacationDay);
  };
  
  const handleRemoveVacationDay = (day: VacationDay) => {
    removeVacationMutation.mutate(day);
  };
  
  // Function to render dates in calendar
  const handleCalendarRender = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Check if date is a vacation or sick leave
    const isVacation = vacationDays.some(v => v.date === dateStr && v.type === 'vacation');
    const isSickLeave = vacationDays.some(v => v.date === dateStr && v.type === 'sick_leave');
    
    if (isVacation) {
      return {
        className: cn('bg-green-100 hover:bg-green-200 text-green-800')
      };
    }
    
    if (isSickLeave) {
      return {
        className: cn('bg-amber-100 hover:bg-amber-200 text-amber-800')
      };
    }
    
    return {};
  };
  
  if (!currentUser) {
    return null; // Will redirect to login
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">As miñas vacacións e baixas</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Engadir día de vacacións ou baixa</CardTitle>
              <CardDescription>
                Selecciona un día e indica se é vacacións ou baixa médica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Selecciona a data</Label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="border rounded-md p-3 bg-white"
                  locale={es}
                  modifiers={{
                    vacation: vacationDays
                      .filter(v => v.type === 'vacation')
                      .map(v => parseISO(v.date)),
                    sickLeave: vacationDays
                      .filter(v => v.type === 'sick_leave')
                      .map(v => parseISO(v.date))
                  }}
                  modifiersClassNames={{
                    vacation: 'bg-green-100 text-green-800 hover:bg-green-200',
                    sickLeave: 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }}
                  components={{
                    DayContent: ({ date }) => (
                      <div
                        className={cn(
                          'relative flex h-8 w-8 items-center justify-center p-0'
                        )}
                      >
                        {date.getDate()}
                      </div>
                    )
                  }}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Tipo de ausencia</Label>
                <RadioGroup 
                  value={selectedType} 
                  onValueChange={(value) => setSelectedType(value as 'vacation' | 'sick_leave')}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vacation" id="vacation" />
                    <Label htmlFor="vacation" className="flex items-center cursor-pointer">
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      Vacacións
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sick_leave" id="sick_leave" />
                    <Label htmlFor="sick_leave" className="flex items-center cursor-pointer">
                      <Heart className="mr-1.5 h-4 w-4" />
                      Baixa médica
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                className="w-full mt-2" 
                onClick={handleAddVacationDay}
                disabled={addVacationMutation.isPending || !selectedDate}
              >
                {addVacationMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Engadindo...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Engadir día
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Días rexistrados</CardTitle>
              <CardDescription>
                Lista de días de vacacións e baixas médicas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Vacacións</h3>
                  {vacationDays.filter(v => v.type === 'vacation').length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {vacationDays
                        .filter(v => v.type === 'vacation')
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(vacation => (
                          <div 
                            key={`vacation-${vacation.date}`} 
                            className="flex items-center justify-between p-3 rounded-md border border-green-200 bg-green-50"
                          >
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
                              <span>{format(parseISO(vacation.date), 'dd/MM/yyyy')}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveVacationDay(vacation)}
                              disabled={removeVacationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non hai días de vacacións rexistrados.</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Baixas médicas</h3>
                  {vacationDays.filter(v => v.type === 'sick_leave').length > 0 ? (
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                      {vacationDays
                        .filter(v => v.type === 'sick_leave')
                        .sort((a, b) => a.date.localeCompare(b.date))
                        .map(sickLeave => (
                          <div 
                            key={`sick-leave-${sickLeave.date}`} 
                            className="flex items-center justify-between p-3 rounded-md border border-amber-200 bg-amber-50"
                          >
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-2 text-amber-600" />
                              <span>{format(parseISO(sickLeave.date), 'dd/MM/yyyy')}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveVacationDay(sickLeave)}
                              disabled={removeVacationMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Non hai días de baixa médica rexistrados.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserVacations;
