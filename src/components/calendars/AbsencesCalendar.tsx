
import React, { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { gl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { VacationDay, User, VacationType } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { getVacationDays, getUsers, addVacationDay, removeVacationDay } from '@/utils/dataService';
import { eachYearOfInterval } from 'date-fns';

// Define colors for different types of absences
const absenceColors = {
  vacation: '#D3E4FD', // Soft blue
  personal: '#FFDEE2', // Soft pink
  sick: '#FDE1D3', // Soft peach
  sick_leave: '#ea384c' // Red
};

// Helper to translate vacation type to Spanish
const vacationTypeToLabel = (type: VacationType): string => {
  switch (type) {
    case 'vacation': return 'Vacacións';
    case 'personal': return 'Persoal';
    case 'sick': return 'Enfermidade';
    case 'sick_leave': return 'Baixa médica';
    default: return type;
  }
};

const AbsencesCalendar = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [absences, setAbsences] = useState<VacationDay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  // States for date range selection
  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<Date[] | undefined>();
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<VacationType>('vacation');
  const [absenceReason, setAbsenceReason] = useState<string>('');
  const [applyToWeekends, setApplyToWeekends] = useState<boolean>(false);

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

  // Function to handle date range selection
  const handleDateRangeSelect = (dates: Date[] | undefined) => {
    setSelectedDateRange(dates);
    
    // If user has selected exactly two dates (a range), open the absence type dialog
    if (dates && dates.length === 2 && dates[0] && dates[1]) {
      setRangeDialogOpen(true);
    }
  };
  
  // Function to save the date range with the selected absence type
  const handleSaveAbsence = async () => {
    if (!selectedDateRange || !selectedDateRange[0] || !selectedDateRange[1] || !selectedUserId) {
      toast({
        title: 'Erro',
        description: 'Debe seleccionar un rango de datas e un empregado',
        variant: 'destructive',
      });
      return;
    }
    
    const startDate = selectedDateRange[0];
    const endDate = selectedDateRange[1];
    const userId = parseInt(selectedUserId);
    
    // Generate all days in the selected range
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Filter out weekends if not applying to weekends
    const daysToApply = applyToWeekends 
      ? daysInRange 
      : daysInRange.filter(date => date.getDay() !== 0 && date.getDay() !== 6);
    
    try {
      setLoading(true);
      
      // Create a vacation day entry for each day in the range
      for (const day of daysToApply) {
        await addVacationDay({
          userId,
          date: format(day, 'yyyy-MM-dd'),
          type: selectedAbsenceType,
          reason: absenceReason || undefined
        });
      }
      
      // Reload absences
      const absencesData = await getVacationDays(userId);
      
      // Filter absences for the selected year
      const filteredAbsences = absencesData.filter(absence => {
        const absenceYear = absence.date.substring(0, 4);
        return absenceYear === selectedYear;
      });
      
      setAbsences(filteredAbsences);
      
      toast({
        title: 'Ausencias gardadas',
        description: `${daysToApply.length} días de ausencia gardados para ${users.find(u => u.id === userId)?.name || 'o empregado'}`,
      });
      
      // Reset states
      setRangeDialogOpen(false);
      setSelectedDateRange(undefined);
      setAbsenceReason('');
      
    } catch (error) {
      console.error('Error saving absences:', error);
      toast({
        title: 'Erro',
        description: 'Non foi posible gardar as ausencias',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle absence deletion
  const handleDeleteAbsence = async (absence: VacationDay) => {
    if (!confirm(`¿Seguro que desea eliminar esta ausencia de ${format(parseISO(absence.date), 'dd/MM/yyyy', { locale: gl })}?`)) {
      return;
    }
    
    try {
      await removeVacationDay(absence.userId, absence.date);
      
      // Remove from local state
      setAbsences(absences.filter(a => 
        !(a.userId === absence.userId && a.date === absence.date)
      ));
      
      toast({
        title: 'Ausencia eliminada',
        description: 'A ausencia foi eliminada correctamente',
      });
      
    } catch (error) {
      console.error('Error deleting absence:', error);
      toast({
        title: 'Erro',
        description: 'Non foi posible eliminar a ausencia',
        variant: 'destructive',
      });
    }
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        
        // If there are users, select the first one by default
        if (usersData.length > 0 && !selectedUserId) {
          setSelectedUserId(usersData[0].id.toString());
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Non foi posible cargar os usuarios',
          variant: 'destructive',
        });
      }
    };

    fetchUsers();
  }, [selectedUserId]);

  // Function to fetch absences for the selected user and year
  useEffect(() => {
    const fetchAbsences = async () => {
      if (!selectedUserId) return;
      
      setLoading(true);
      try {
        const absencesData = await getVacationDays(parseInt(selectedUserId));
        
        // Filter absences for the selected year
        const filteredAbsences = absencesData.filter(absence => {
          const absenceYear = absence.date.substring(0, 4);
          return absenceYear === selectedYear;
        });
        
        setAbsences(filteredAbsences);
      } catch (error) {
        console.error('Error fetching absences:', error);
        toast({
          title: 'Error',
          description: 'Non foi posible cargar as ausencias',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAbsences();
  }, [selectedUserId, selectedYear]);

  // Create maps of absence dates by type for easier lookup
  const absenceMap = new Map<string, string>();
  absences.forEach(absence => {
    const dateStr = absence.date.split('T')[0];
    absenceMap.set(dateStr, absence.type || 'vacation');
  });

  // Get the selected user's name
  const selectedUser = users.find(user => user.id.toString() === selectedUserId);

  // Function to generate the modifier styles for the calendar
  const modifiersStyles = {
    vacation: { backgroundColor: absenceColors.vacation },
    personal: { backgroundColor: absenceColors.personal },
    sick: { backgroundColor: absenceColors.sick },
    sick_leave: { backgroundColor: absenceColors.sick_leave, color: 'white' }
  };

  // Group absences by type to display in legend
  const absenceTypes = Array.from(new Set(absences.map(a => a.type || 'vacation')));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year-select">Ano</Label>
              <Select
                value={selectedYear}
                onValueChange={setSelectedYear}
              >
                <SelectTrigger id="year-select">
                  <SelectValue placeholder="Selecciona un ano" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="user-select">Empregado</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Selecciona un empregado" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id.toString()}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-2 font-medium">
                Calendario de Ausencias {selectedYear} - {selectedUser?.name || 'Empregado'}
                <p className="text-sm text-muted-foreground mt-1">
                  Seleccione un rango de datas co rato para engadir ausencias
                </p>
              </div>
              
              {loading ? (
                <div className="text-center py-4">Cargando ausencias...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Calendar
                      mode="range"
                      selected={selectedDateRange}
                      onSelect={handleDateRangeSelect}
                      month={new Date(parseInt(selectedYear), 0)}
                      numberOfMonths={12}
                      showOutsideDays={false}
                      fixedWeeks
                      className="rounded-md border w-full"
                      locale={gl}
                      modifiers={{
                        vacation: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'vacation';
                        },
                        personal: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'personal';
                        },
                        sick: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'sick';
                        },
                        sick_leave: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'sick_leave';
                        }
                      }}
                      modifiersStyles={modifiersStyles}
                    />
                  </div>
                  
                  {absenceTypes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 justify-center">
                      <div className="text-sm font-medium">Lenda:</div>
                      {absenceTypes.includes('vacation') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.vacation }}></div>
                          <span className="text-sm">Vacacións</span>
                        </div>
                      )}
                      {absenceTypes.includes('personal') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.personal }}></div>
                          <span className="text-sm">Persoal</span>
                        </div>
                      )}
                      {absenceTypes.includes('sick') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.sick }}></div>
                          <span className="text-sm">Enfermidade</span>
                        </div>
                      )}
                      {absenceTypes.includes('sick_leave') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.sick_leave }}></div>
                          <span className="text-sm">Baixa médica</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-4 font-medium">
                Listado de Ausencias {selectedYear} - {selectedUser?.name || 'Empregado'}
              </div>
              {loading ? (
                <div className="text-center py-4">Cargando ausencias...</div>
              ) : (
                <div className="space-y-2">
                  {absences.length > 0 ? (
                    absences
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(absence => {
                        const absenceType = absence.type || 'vacation';
                        const typeLabel = vacationTypeToLabel(absenceType);
                        
                        return (
                          <div 
                            key={`${absence.userId}-${absence.date}`} 
                            className="p-3 rounded-lg flex justify-between items-center"
                            style={{ backgroundColor: absenceColors[absenceType as keyof typeof absenceColors] }}
                          >
                            <div>
                              <div className="font-medium">
                                {format(parseISO(absence.date), 'dd/MM/yyyy', { locale: gl })}
                              </div>
                              {absence.reason && (
                                <div className="text-sm opacity-80">{absence.reason}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">
                                {typeLabel}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0" 
                                onClick={() => handleDeleteAbsence(absence)}
                              >
                                ×
                              </Button>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Non hai ausencias rexistradas para este ano
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Dialog for adding absence details */}
      <Dialog open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Engadir nova ausencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDateRange && selectedDateRange[0] && selectedDateRange[1] && (
              <div className="text-center text-sm">
                <span className="font-medium">Datas seleccionadas: </span>
                {format(selectedDateRange[0], 'dd/MM/yyyy', { locale: gl })} - {format(selectedDateRange[1], 'dd/MM/yyyy', { locale: gl })}
                <p className="text-muted-foreground mt-1">Total: {
                  eachDayOfInterval({
                    start: selectedDateRange[0],
                    end: selectedDateRange[1]
                  }).length
                } días</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="absence-type">Tipo de ausencia</Label>
              <RadioGroup 
                value={selectedAbsenceType} 
                onValueChange={(value) => setSelectedAbsenceType(value as VacationType)}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vacation" id="vacation" />
                  <Label htmlFor="vacation">Vacacións</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal" id="personal" />
                  <Label htmlFor="personal">Persoal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sick" id="sick" />
                  <Label htmlFor="sick">Enfermidade</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sick_leave" id="sick_leave" />
                  <Label htmlFor="sick_leave">Baixa médica</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="absence-reason">Motivo (opcional)</Label>
              <Input 
                id="absence-reason" 
                value={absenceReason} 
                onChange={(e) => setAbsenceReason(e.target.value)} 
                placeholder="Introduza o motivo da ausencia"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="apply-weekends" 
                checked={applyToWeekends} 
                onCheckedChange={(checked) => setApplyToWeekends(checked as boolean)}
              />
              <Label htmlFor="apply-weekends">Aplicar tamén a fins de semana</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRangeDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveAbsence} disabled={loading}>
              {loading ? 'Gardando...' : 'Gardar ausencia'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AbsencesCalendar;
