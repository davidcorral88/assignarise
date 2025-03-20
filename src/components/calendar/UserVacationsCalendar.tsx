import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  getHolidays, 
  getVacationDays, 
  addVacationDay, 
  removeVacationDay 
} from '@/utils/mockData';
import { format, addDays, isBefore, isAfter, parseISO, eachDayOfInterval } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Holiday, VacationDay } from '@/utils/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAuth } from '@/components/auth/AuthContext';
import { Info, Briefcase, Stethoscope } from 'lucide-react';

interface UserVacationsCalendarProps {
  userId?: string;
}

type CalendarMode = 'single' | 'range';

const UserVacationsCalendar: React.FC<UserVacationsCalendarProps> = ({ userId }) => {
  const { currentUser } = useAuth();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState<boolean>(false);
  const [daysToShow, setDaysToShow] = useState<string[]>(["vacation", "sick_leave"]);
  const [dayType, setDayType] = useState<'vacation' | 'sick_leave'>('vacation');
  const [vacationToDelete, setVacationToDelete] = useState<VacationDay | null>(null);
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('range');
  
  const actualUserId = userId || currentUser?.id;

  useEffect(() => {
    loadData();
  }, [actualUserId]);

  const loadData = () => {
    setHolidays(getHolidays());
    if (actualUserId) {
      setVacationDays(getVacationDays(actualUserId));
    }
  };

  const isVacation = (date: Date) => {
    if (!actualUserId) return false;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return vacationDays.some(day => 
      day.userId === actualUserId && 
      day.date === formattedDate && 
      day.type === 'vacation' &&
      daysToShow.includes('vacation')
    );
  };

  const isSickLeave = (date: Date) => {
    if (!actualUserId) return false;
    const formattedDate = format(date, 'yyyy-MM-dd');
    return vacationDays.some(day => 
      day.userId === actualUserId && 
      day.date === formattedDate && 
      day.type === 'sick_leave' &&
      daysToShow.includes('sick_leave')
    );
  };

  const isHoliday = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.some(holiday => holiday.date === formattedDate);
  };

  const modifiers = {
    vacation: (date: Date) => isVacation(date),
    sickLeave: (date: Date) => isSickLeave(date),
    holiday: (date: Date) => isHoliday(date),
  };

  const modifiersStyles = {
    vacation: {
      backgroundColor: '#FEC6A1',
      color: '#994D00',
      fontWeight: 'bold',
    },
    sickLeave: {
      backgroundColor: '#F2FCE2',
      color: '#3F6212',
      fontWeight: 'bold',
    },
    holiday: {
      backgroundColor: '#ffcccb',
      color: '#950000',
      fontWeight: 'bold',
    },
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date || !actualUserId) return;
    
    setSelectedDate(date);
    checkAndOpenDialog(date);
  };

  const handleRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    if (!range.from || !actualUserId) return;
    
    setDateRange(range);
    if (range.to) {
      // We have a complete range, open the dialog
      setIsDialogOpen(true);
    }
  };

  const checkAndOpenDialog = (date: Date) => {
    if (!actualUserId) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Don't add vacation/sick days on holidays
    if (isHoliday(date)) {
      toast({
        title: "Data non dispoñible",
        description: "Non podes marcar un día festivo como vacacións ou baixa",
        variant: "destructive"
      });
      return;
    }
    
    const existingVacation = vacationDays.find(
      day => day.userId === actualUserId && 
      day.date === formattedDate
    );
    
    if (existingVacation) {
      setVacationToDelete(existingVacation);
      setIsDeletionDialogOpen(true);
    } else {
      setDayType('vacation');
      setIsDialogOpen(true);
    }
  };

  const handleAddVacation = () => {
    if (!actualUserId) return;
    
    // Handle single date
    if (calendarMode === 'single' && selectedDate) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      if (isHoliday(selectedDate)) {
        toast({
          title: "Data non dispoñible",
          description: "Non podes marcar un día festivo como vacacións ou baixa",
          variant: "destructive"
        });
        return;
      }
      
      const newVacation: VacationDay = {
        userId: actualUserId,
        date: formattedDate,
        type: dayType
      };
      
      addVacationDay(newVacation);
      loadData();
      
      toast({
        title: dayType === 'vacation' ? 'Vacacións engadidas' : 'Baixa médica engadida',
        description: `${dayType === 'vacation' ? 'Día de vacacións' : 'Día de baixa médica'} engadido para o ${format(selectedDate, 'dd/MM/yyyy')}`
      });
    } 
    // Handle date range
    else if (calendarMode === 'range' && dateRange.from && dateRange.to) {
      // Get all days in the range
      const daysInRange = eachDayOfInterval({
        start: dateRange.from,
        end: dateRange.to
      });
      
      let addedCount = 0;
      
      // Add each day in the range
      daysInRange.forEach(day => {
        if (!isHoliday(day)) {
          const formattedDate = format(day, 'yyyy-MM-dd');
          
          // Check if day already exists
          const exists = vacationDays.some(
            v => v.userId === actualUserId && 
            v.date === formattedDate &&
            v.type === dayType
          );
          
          if (!exists) {
            const newVacation: VacationDay = {
              userId: actualUserId,
              date: formattedDate,
              type: dayType
            };
            
            addVacationDay(newVacation);
            addedCount++;
          }
        }
      });
      
      loadData();
      
      if (addedCount > 0) {
        toast({
          title: dayType === 'vacation' ? 'Vacacións engadidas' : 'Baixas médicas engadidas',
          description: `${addedCount} ${dayType === 'vacation' ? 'días de vacacións' : 'días de baixa médica'} engadidos`
        });
      } else {
        toast({
          title: "Non se engadiron días",
          description: "Os días seleccionados xa estaban rexistrados ou son festivos",
        });
      }
    }
    
    // Reset selections
    setSelectedDate(undefined);
    setDateRange({ from: undefined, to: undefined });
    setIsDialogOpen(false);
  };

  const handleRemoveVacation = () => {
    if (!vacationToDelete) return;
    
    removeVacationDay(vacationToDelete);
    loadData();
    setIsDeletionDialogOpen(false);
    
    toast({
      title: vacationToDelete.type === 'vacation' ? 'Vacacións eliminadas' : 'Baixa médica eliminada',
      description: `${vacationToDelete.type === 'vacation' ? 'Día de vacacións' : 'Día de baixa médica'} eliminado do ${format(new Date(vacationToDelete.date), 'dd/MM/yyyy')}`
    });
  };

  const getVacationsList = () => {
    if (!actualUserId) return [];
    
    const filteredDays = vacationDays.filter(day => 
      day.userId === actualUserId && 
      daysToShow.includes(day.type)
    );
    
    return filteredDays.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const filteredVacations = getVacationsList();
  const { toast } = useToast();

  const handleToggleChange = (value: string[]) => {
    // Don't allow empty selection
    if (value.length === 0) {
      // If trying to deselect the last option, keep it selected
      return;
    }
    
    // For other changes, just update as normal
    setDaysToShow(value);
  };

  const toggleCalendarMode = () => {
    setCalendarMode(calendarMode === 'single' ? 'range' : 'single');
    // Reset selections when changing mode
    setSelectedDate(undefined);
    setDateRange({ from: undefined, to: undefined });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Calendario de Ausencias</h3>
          <p className="text-sm text-muted-foreground">
            {calendarMode === 'single' 
              ? 'Fai clic nun día para marcar vacacións ou baixa médica'
              : 'Selecciona un rango de días para marcar vacacións ou baixa médica'}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleCalendarMode}
            className="mb-2 sm:mb-0"
          >
            {calendarMode === 'single' 
              ? 'Cambiar a selección de rango' 
              : 'Cambiar a selección simple'}
          </Button>
          
          <ToggleGroup 
            type="multiple" 
            value={daysToShow}
            onValueChange={handleToggleChange}
          >
            <ToggleGroupItem value="vacation" aria-label="Mostrar vacacións">
              <Briefcase className="h-4 w-4 mr-2" />
              Vacacións
            </ToggleGroupItem>
            <ToggleGroupItem value="sick_leave" aria-label="Mostrar baixas">
              <Stethoscope className="h-4 w-4 mr-2" />
              Baixa médica
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Calendar
          mode={calendarMode}
          selected={calendarMode === 'single' ? selectedDate : dateRange}
          onSelect={calendarMode === 'single' ? handleDateSelect : handleRangeSelect}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles as any}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      <div className="mt-6 space-y-4">
        <h3 className="text-lg font-medium">Lista de días marcados</h3>
        <div className="space-y-2">
          {filteredVacations.length > 0 ? (
            <ul className="space-y-2">
              {filteredVacations.map((day) => (
                <li key={`${day.userId}-${day.date}-${day.type}`} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{format(new Date(day.date), 'dd/MM/yyyy')}</span>
                    <span className="px-2 py-1 rounded-full text-xs" 
                      style={{
                        backgroundColor: day.type === 'vacation' ? '#FEC6A1' : '#F2FCE2',
                        color: day.type === 'vacation' ? '#994D00' : '#3F6212'
                      }}
                    >
                      {day.type === 'vacation' ? 'Vacacións' : 'Baixa médica'}
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setVacationToDelete(day);
                      setIsDeletionDialogOpen(true);
                    }}
                  >
                    <span className="sr-only">Eliminar</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                    </svg>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center p-4 border rounded-md">
              <Info className="mr-2 h-5 w-5 text-muted-foreground" />
              <p className="text-muted-foreground">Non hai días marcados</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Dialog for adding a vacation/sick leave day */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marcar día de ausencia</DialogTitle>
            <DialogDescription>
              {calendarMode === 'single' 
                ? `Selecciona o tipo de ausencia para o día ${selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}.`
                : `Selecciona o tipo de ausencia para o período do ${dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : ''} ao ${dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : ''}.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={dayType}
              onValueChange={(value: any) => setDayType(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacacións</SelectItem>
                <SelectItem value="sick_leave">Baixa médica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddVacation}>Gardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for removing a vacation/sick leave day */}
      <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar día marcado</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que queres eliminar o día de 
              {vacationToDelete?.type === 'vacation' ? ' vacacións' : ' baixa médica'} 
              do {vacationToDelete ? format(new Date(vacationToDelete.date), 'dd/MM/yyyy') : ''}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletionDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveVacation}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserVacationsCalendar;
