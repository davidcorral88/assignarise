
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Calendar 
} from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { es } from 'date-fns/locale';
import { format, parseISO } from 'date-fns';
import { getVacationDays, getHolidays } from '@/utils/dataService';
import { VacationDay, Holiday } from '@/utils/types';

interface UserVacationsCalendarProps {
  userId?: string;
}

const UserVacationsCalendar: React.FC<UserVacationsCalendarProps> = ({ userId }) => {
  // Obtener vacaciones del usuario
  const { data: vacationDays = [] } = useQuery({
    queryKey: ['vacationDays', userId],
    queryFn: () => getVacationDays(userId),
    enabled: !!userId
  });
  
  // Obtener festivos para mostrarlos también
  const { data: holidays = [] } = useQuery({
    queryKey: ['holidays'],
    queryFn: getHolidays
  });
  
  // Preparar los modificadores para el calendario
  const vacationDates = vacationDays
    .filter(v => v.type === 'vacation')
    .map(v => parseISO(v.date));
    
  const sickLeaveDates = vacationDays
    .filter(v => v.type === 'sick_leave')
    .map(v => parseISO(v.date));
    
  const holidayDates = holidays.map(h => parseISO(h.date));
  
  return (
    <div>
      <Calendar
        mode="multiple"
        selected={[]}
        locale={es}
        className="rounded-md border shadow bg-white"
        modifiers={{
          vacation: vacationDates,
          sickLeave: sickLeaveDates,
          holiday: holidayDates
        }}
        modifiersClassNames={{
          vacation: 'bg-green-100 text-green-800 hover:bg-green-200',
          sickLeave: 'bg-amber-100 text-amber-800 hover:bg-amber-200',
          holiday: 'bg-red-100 text-red-800 hover:bg-red-200'
        }}
        components={{
          DayContent: ({ date }) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isVacation = vacationDays.some(v => v.date === dateStr && v.type === 'vacation');
            const isSickLeave = vacationDays.some(v => v.date === dateStr && v.type === 'sick_leave');
            const isHoliday = holidays.some(h => h.date === dateStr);
            
            return (
              <div className="relative flex h-8 w-8 items-center justify-center p-0">
                {date.getDate()}
              </div>
            );
          }
        }}
        disabled
      />
      
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-green-100 mr-2"></div>
          <span className="text-sm">Vacacións</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-amber-100 mr-2"></div>
          <span className="text-sm">Baixa médica</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-4 h-4 rounded bg-red-100 mr-2"></div>
          <span className="text-sm">Festivo</span>
        </div>
      </div>
    </div>
  );
};

export default UserVacationsCalendar;
