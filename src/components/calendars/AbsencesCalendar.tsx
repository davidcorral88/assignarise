
import React, { useState, useEffect } from 'react';
import { format, parseISO, eachDayOfInterval, isSameDay, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { DateRange } from 'react-day-picker';
import { useAuth } from '@/components/auth/useAuth';

const absenceColors = {
  vacacions: '#F2FCE2', // Light green
  baixa_medica: '#D3E4FD', // Light blue
  outros: '#FEF7CD' // Yellow
};

const vacationTypeToLabel = (type: VacationType): string => {
  switch (type) {
    case 'vacacions': return 'Vacacións';
    case 'baixa_medica': return 'Baixa Médica';
    case 'outros': return 'Outros';
    default: return type;
  }
};

const AbsencesCalendar = () => {
  const { currentUser } = useAuth();
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [absences, setAbsences] = useState<VacationDay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [absenceReason, setAbsenceReason] = useState<string>('');

  const [rangeDialogOpen, setRangeDialogOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<VacationType>('vacacions');
  const [applyToWeekends, setApplyToWeekends] = useState<boolean>(false);

  // Determine if current user is a worker (role: 'worker')
  const isWorkerRole = currentUser?.role === 'worker';
  
  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    
    if (range && range.from && range.to) {
      setRangeDialogOpen(true);
    }
  };

  const handleSaveAbsence = async () => {
    if (!selectedDateRange || !selectedDateRange.from || !selectedDateRange.to || !selectedUserId) {
      toast({
        title: 'Erro',
        description: 'Debe seleccionar un rango de datas e un empregado',
        variant: 'destructive',
      });
      return;
    }
    
    const startDate = selectedDateRange.from;
    const endDate = selectedDateRange.to;
    const userId = parseInt(selectedUserId);
    
    // Workers can only add absences for themselves
    if (isWorkerRole && currentUser && userId !== currentUser.id) {
      toast({
        title: 'Permiso denegado',
        description: 'Só podes engadir ausencias para ti mesmo',
        variant: 'destructive',
      });
      return;
    }
    
    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });
    const daysToApply = applyToWeekends 
      ? daysInRange 
      : daysInRange.filter(date => date.getDay() !== 0 && date.getDay() !== 6);
    
    try {
      setLoading(true);
      
      let successCount = 0;
      const errors = [];
      
      for (const day of daysToApply) {
        try {
          const dateStr = format(day, 'yyyy-MM-dd');
          
          await addVacationDay({
            userId,
            date: dateStr,
            type: selectedAbsenceType
          });
          
          successCount++;
        } catch (err) {
          console.error(`Error adding vacation day for date ${format(day, 'yyyy-MM-dd')}:`, err);
          errors.push(format(day, 'dd/MM/yyyy'));
        }
      }
      
      const absencesData = await getVacationDays(parseInt(selectedUserId));
      
      const filteredAbsences = absencesData.filter(absence => {
        const absenceYear = absence.date.substring(0, 4);
        return absenceYear === selectedYear;
      });
      
      setAbsences(filteredAbsences);
      
      if (successCount > 0) {
        toast({
          title: 'Ausencias gardadas',
          description: `${successCount} días de ausencia gardados para ${users.find(u => u.id === userId)?.name || 'o empregado'}${errors.length > 0 ? `. Fallaron ${errors.length} datas.` : ''}`,
        });
      } else {
        toast({
          title: 'Erro',
          description: 'Non foi posible gardar as ausencias',
          variant: 'destructive',
        });
      }
      
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

  const handleDeleteAbsence = async (absence: VacationDay) => {
    console.log('Deleting absence:', absence);
    console.log('Current user:', currentUser);
    console.log('Is worker role:', isWorkerRole);
    console.log('Absence userId:', absence.userId, 'type:', typeof absence.userId);
    console.log('Current user ID:', currentUser?.id, 'type:', typeof currentUser?.id);
    
    // Convert both IDs to numbers for proper comparison
    const absenceUserId = typeof absence.userId === 'string' ? parseInt(absence.userId) : absence.userId;
    const currentUserId = currentUser?.id;
    
    console.log('Converted absence userId:', absenceUserId);
    console.log('Current user ID for comparison:', currentUserId);
    
    // Prevent workers from deleting others' absences
    if (isWorkerRole && currentUser && absenceUserId !== currentUserId) {
      console.log('Permission denied - worker trying to delete others absence');
      toast({
        title: 'Permiso denegado',
        description: 'Só podes eliminar as túas propias ausencias',
        variant: 'destructive',
      });
      return;
    }
    
    if (!confirm(`¿Seguro que desea eliminar esta ausencia de ${format(parseISO(absence.date), 'dd/MM/yyyy', { locale: es })}?`)) {
      return;
    }
    
    try {
      let userId: number;
      
      if (typeof absence.userId === 'number') {
        userId = absence.userId;
      } else if (typeof absence.userId === 'string') {
        userId = Number(absence.userId);
        if (isNaN(userId)) {
          throw new Error(`Invalid user ID: ${absence.userId}`);
        }
      } else {
        userId = Number(selectedUserId);
        if (isNaN(userId)) {
          throw new Error('Invalid or missing user ID');
        }
      }
      
      const formattedDate = format(parseISO(absence.date), 'yyyy-MM-dd');
      
      console.log(`Attempting to delete absence for user ${userId} on date ${formattedDate}`);
      
      await removeVacationDay(userId, formattedDate);
      
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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        
        // Filter users for workers - they should only see themselves
        const filteredUsers = isWorkerRole && currentUser 
          ? usersData.filter(user => user.id === currentUser.id)
          : usersData;
          
        setUsers(filteredUsers);
        
        // Set the current logged-in user as default if available
        if (currentUser && currentUser.id) {
          setSelectedUserId(currentUser.id.toString());
        } else if (filteredUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(filteredUsers[0].id.toString());
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
  }, [currentUser, isWorkerRole]);

  useEffect(() => {
    const fetchAbsences = async () => {
      if (!selectedUserId) return;
      
      setLoading(true);
      try {
        const absencesData = await getVacationDays(parseInt(selectedUserId));
        
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

  const absenceMap = new Map<string, string>();
  absences.forEach(absence => {
    const absenceDate = parseISO(absence.date);
    const dateStr = format(absenceDate, 'yyyy-MM-dd');
    absenceMap.set(dateStr, absence.type || 'vacacions');
  });

  const selectedUser = users.find(user => user.id.toString() === selectedUserId);

  const modifiersStyles = {
    vacacions: { backgroundColor: absenceColors.vacacions },
    baixa_medica: { backgroundColor: absenceColors.baixa_medica },
    outros: { backgroundColor: absenceColors.outros }
  };

  const absenceTypes = Array.from(new Set(absences.map(a => a.type || 'vacacions')));

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
              {isWorkerRole ? (
                // For workers: display a read-only select with their own name
                <div className="bg-gray-100 border border-gray-300 px-4 py-2 rounded text-gray-700">
                  {selectedUser?.name || currentUser?.name || 'Empregado'}
                </div>
              ) : (
                // For admins and other roles: allow selecting any user
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
              )}
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
                      locale={es}
                      modifiers={{
                        vacacions: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'vacacions';
                        },
                        baixa_medica: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'baixa_medica';
                        },
                        outros: (date) => {
                          const dateStr = format(date, 'yyyy-MM-dd');
                          return absenceMap.get(dateStr) === 'outros';
                        }
                      }}
                      modifiersStyles={modifiersStyles}
                    />
                  </div>
                  
                  {absenceTypes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-4 justify-center">
                      <div className="text-sm font-medium">Lenda:</div>
                      {absenceTypes.includes('vacacions') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.vacacions }}></div>
                          <span className="text-sm">Vacacións</span>
                        </div>
                      )}
                      {absenceTypes.includes('baixa_medica') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.baixa_medica }}></div>
                          <span className="text-sm">Baixa Médica</span>
                        </div>
                      )}
                      {absenceTypes.includes('outros') && (
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: absenceColors.outros }}></div>
                          <span className="text-sm">Outros</span>
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
                        const absenceType = absence.type || 'vacacions';
                        const typeLabel = vacationTypeToLabel(absenceType);
                        
                        // Check if current user can delete this absence
                        const canDelete = !isWorkerRole || (currentUser && absence.userId === currentUser.id);
                        
                        return (
                          <div 
                            key={`${absence.userId}-${absence.date}`} 
                            className="p-3 rounded-lg flex justify-between items-center"
                            style={{ backgroundColor: absenceColors[absenceType as keyof typeof absenceColors] }}
                          >
                            <div>
                              <div className="font-medium">
                                {format(parseISO(absence.date), 'dd/MM/yyyy', { locale: es })}
                              </div>
                              {absenceReason && (
                                <div className="text-sm opacity-80">{absenceReason}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-medium">
                                {typeLabel}
                              </div>
                              {canDelete && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleDeleteAbsence(absence)}
                                >
                                  ×
                                </Button>
                              )}
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
      
      <Dialog open={rangeDialogOpen} onOpenChange={setRangeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Engadir nova ausencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedDateRange && selectedDateRange.from && selectedDateRange.to && (
              <div className="text-center text-sm">
                <span className="font-medium">Datas seleccionadas: </span>
                {format(selectedDateRange.from, 'dd/MM/yyyy', { locale: es })} - {format(selectedDateRange.to, 'dd/MM/yyyy', { locale: es })}
                <p className="text-muted-foreground mt-1">Total: {
                  eachDayOfInterval({
                    start: selectedDateRange.from,
                    end: selectedDateRange.to
                  }).length
                } días</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="absence-type">Tipo de ausencia</Label>
              <RadioGroup 
                value={selectedAbsenceType} 
                onValueChange={(value) => setSelectedAbsenceType(value as VacationType)}
                className="grid grid-cols-1 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vacacions" id="vacacions" />
                  <Label htmlFor="vacacions">Vacacións</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="baixa_medica" id="baixa_medica" />
                  <Label htmlFor="baixa_medica">Baixa Médica</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="outros" id="outros" />
                  <Label htmlFor="outros">Outros</Label>
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
