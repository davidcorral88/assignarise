
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  CalendarProps 
} from '@/components/ui/calendar';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { format, parse, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { getHolidays, addHoliday, removeHoliday } from '@/utils/dataService';
import { Holiday } from '@/utils/types';

interface HolidaysCalendarProps {
  isEditable: boolean;
}

const HolidaysCalendar: React.FC<HolidaysCalendarProps> = ({ isEditable }) => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [holidayName, setHolidayName] = useState<string>('');
  const [holidayDescription, setHolidayDescription] = useState<string>('');

  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: getHolidays
  });

  const addHolidayMutation = useMutation({
    mutationFn: addHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      setHolidayName('');
      setHolidayDescription('');
      toast({
        title: 'Día festivo añadido',
        description: 'El día festivo ha sido registrado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar el día festivo.',
        variant: 'destructive',
      });
    }
  });

  const removeHolidayMutation = useMutation({
    mutationFn: removeHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      toast({
        title: 'Día festivo eliminado',
        description: 'El día festivo ha sido eliminado correctamente.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo eliminar el día festivo.',
        variant: 'destructive',
      });
    }
  });

  const handleAddHoliday = async () => {
    if (!selectedDate || !holidayName.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor selecciona una fecha e introduce un nombre para el día festivo.',
        variant: 'destructive',
      });
      return;
    }
    
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (holidays.some(h => h.date === dateStr)) {
      toast({
        title: 'Fecha duplicada',
        description: 'Ya existe un día festivo en esta fecha.',
        variant: 'destructive',
      });
      return;
    }
    
    const newHoliday = {
      date: dateStr,
      name: holidayName,
      description: holidayDescription || holidayName
    };
    
    addHolidayMutation.mutate(newHoliday);
  };

  const handleRemoveHoliday = (holiday: Holiday) => {
    removeHolidayMutation.mutate(holiday);
  };

  const handleCalendarRender = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isHoliday = holidays.some(h => h.date === dateStr);
    
    if (isHoliday) {
      return {
        className: cn('bg-red-100 hover:bg-red-200 text-red-800')
      };
    }
    
    return {};
  };

  return (
    <div className={cn("space-y-6", isEditable ? "" : "pointer-events-none")}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={es}
            className="rounded-md border shadow bg-white"
            modifiers={{
              holiday: holidays.map(h => parseISO(h.date))
            }}
            modifiersClassNames={{
              holiday: 'bg-red-100 text-red-800 hover:bg-red-200'
            }}
            components={{
              DayContent: ({ date }) => (
                <div className="relative flex h-8 w-8 items-center justify-center p-0">
                  {date.getDate()}
                </div>
              )
            }}
            disabled={!isEditable}
          />
          
          {isEditable && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="holidayName">Nome do festivo</Label>
              <div className="flex gap-2">
                <Input
                  id="holidayName"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Ex: Día Nacional de Galicia"
                  className="flex-1"
                />
                <Input
                  id="holidayDescription"
                  value={holidayDescription}
                  onChange={(e) => setHolidayDescription(e.target.value)}
                  placeholder="Descripción"
                  className="flex-1"
                />
                <Button 
                  onClick={handleAddHoliday}
                  disabled={addHolidayMutation.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Engadir
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Festivos programados</h3>
            
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
                        <span className="font-medium">
                          {format(parseISO(holiday.date), 'dd/MM/yyyy')}
                        </span>
                        <span className="mx-2">-</span>
                        <span>{holiday.name}</span>
                      </div>
                      {isEditable && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveHoliday(holiday)}
                          disabled={removeHolidayMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Non hai festivos programados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HolidaysCalendar;
