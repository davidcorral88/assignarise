
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { 
  Card,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addHoliday, removeHoliday, getHolidays } from '@/utils/mockData';
import { Holiday } from '@/utils/types';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Info, Plus, Trash2 } from 'lucide-react';

interface HolidaysCalendarProps {
  isEditable: boolean;
}

const HolidaysCalendar: React.FC<HolidaysCalendarProps> = ({ isEditable }) => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [holidayName, setHolidayName] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);
  const [isDeletionDialogOpen, setIsDeletionDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHolidays();
  }, []);

  const loadHolidays = () => {
    const allHolidays = getHolidays();
    setHolidays(allHolidays);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!isEditable || !date) return;

    const formattedDate = format(date, 'yyyy-MM-dd');
    const existingHoliday = holidays.find(h => h.date === formattedDate);

    if (existingHoliday) {
      setHolidayToDelete(existingHoliday);
      setIsDeletionDialogOpen(true);
    } else {
      setSelectedDate(date);
      setHolidayName('');
      setIsDialogOpen(true);
    }
  };

  const handleAddHoliday = () => {
    if (!selectedDate || !holidayName.trim()) return;

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const newHoliday: Holiday = {
      date: formattedDate,
      name: holidayName.trim()
    };

    addHoliday(newHoliday);
    loadHolidays();
    setIsDialogOpen(false);
    toast({
      title: 'Festivo engadido',
      description: `Festivo "${holidayName}" engadido para o día ${format(selectedDate, 'dd/MM/yyyy')}`,
    });
  };

  const handleRemoveHoliday = () => {
    if (!holidayToDelete) return;

    removeHoliday(holidayToDelete);
    loadHolidays();
    setIsDeletionDialogOpen(false);
    toast({
      title: 'Festivo eliminado',
      description: `Festivo "${holidayToDelete.name}" eliminado do día ${format(new Date(holidayToDelete.date), 'dd/MM/yyyy')}`,
    });
  };

  // Function to determine which days are holidays for highlighting
  const isHoliday = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return holidays.some(holiday => holiday.date === formattedDate);
  };
  
  // Custom styling for holidays
  const modifiersStyles = {
    holiday: {
      backgroundColor: '#ffcccb',
      color: '#950000',
      fontWeight: 'bold',
    },
  };

  // Add custom modifier for holiday dates
  const modifiers = {
    holiday: (date: Date) => isHoliday(date),
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Calendario de Festivos</h3>
          <p className="text-sm text-muted-foreground">
            {isEditable 
              ? 'Fai clic nun día para engadir ou eliminar un festivo.'
              : 'Os días en cor vermella son festivos.'}
          </p>
        </div>
        {isEditable && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setSelectedDate(new Date());
              setHolidayName('');
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Engadir Festivo
          </Button>
        )}
      </div>
      
      <div className="border rounded-md">
        <Calendar
          mode="single"
          onSelect={handleDateSelect}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles as any}
          className="p-3 pointer-events-auto"
        />
      </div>
      
      <div className="space-y-4 mt-6">
        <h3 className="text-lg font-medium">Lista de Festivos</h3>
        {holidays.length > 0 ? (
          <ul className="space-y-2">
            {holidays
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
              .map((holiday) => (
                <li key={holiday.date} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">{format(new Date(holiday.date), 'dd/MM/yyyy')}</span>
                    <span>{holiday.name}</span>
                  </div>
                  {isEditable && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setHolidayToDelete(holiday);
                        setIsDeletionDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </li>
              ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center p-4 border rounded-md">
            <Info className="mr-2 h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">Non hai festivos definidos</p>
          </div>
        )}
      </div>
      
      {/* Dialog for adding a holiday */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Engadir Festivo</DialogTitle>
            <DialogDescription>
              Introduce o nome do festivo para o día {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holidayName">Nome do festivo</Label>
              <Input
                id="holidayName"
                placeholder="Ex: Día da Constitución"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddHoliday}>Engadir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for removing a holiday */}
      <Dialog open={isDeletionDialogOpen} onOpenChange={setIsDeletionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Festivo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que queres eliminar o festivo "{holidayToDelete?.name}" 
              do día {holidayToDelete ? format(new Date(holidayToDelete.date), 'dd/MM/yyyy') : ''}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletionDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRemoveHoliday}>Eliminar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HolidaysCalendar;
