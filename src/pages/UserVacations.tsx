
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar as CalendarIcon,
  Save,
  Check,
  Loader2,
  Heart,
  Trash2
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { 
  getVacationDays, 
  addVacationDay, 
  removeVacationDay 
} from '../utils/mockData';
import { VacationDay } from '../utils/types';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const UserVacations = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedType, setSelectedType] = useState<'vacation' | 'sick_leave'>('vacation');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    // Load initial data
    setVacationDays(getVacationDays(currentUser.id));
  }, [currentUser, navigate]);
  
  const handleAddVacationDay = () => {
    if (!selectedDate) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecciona unha data',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    const newVacationDay: VacationDay = {
      userId: currentUser?.id || '',
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
      setSubmitting(false);
      return;
    }
    
    addVacationDay(newVacationDay);
    
    setVacationDays([...vacationDays, newVacationDay]);
    setSelectedDate(undefined);
    
    toast({
      title: 'Día engadido',
      description: `Día de ${selectedType === 'vacation' ? 'vacacións' : 'baixa médica'} engadido correctamente.`,
    });
    
    setSubmitting(false);
  };
  
  const handleRemoveVacationDay = (day: VacationDay) => {
    removeVacationDay(day);
    setVacationDays(vacationDays.filter(v => v.date !== day.date || v.type !== day.type));
    
    toast({
      title: 'Día eliminado',
      description: `Día de ${day.type === 'vacation' ? 'vacacións' : 'baixa médica'} eliminado correctamente.`,
    });
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
                    DayContent: (props) => (
                      <div
                        className={cn(
                          'relative flex h-8 w-8 items-center justify-center p-0',
                          props.selected && 'text-white'
                        )}
                      >
                        {props.date.getDate()}
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
                disabled={submitting || !selectedDate}
              >
                {submitting ? (
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
