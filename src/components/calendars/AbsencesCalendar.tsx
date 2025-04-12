
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { gl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VacationDay, User } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { getVacationDays, getUsers } from '@/utils/dataService';

// Define colors for different types of absences
const absenceColors = {
  vacation: '#D3E4FD', // Soft blue
  personal: '#FFDEE2', // Soft pink
  sick: '#FDE1D3', // Soft peach
  sick_leave: '#ea384c' // Red
};

const AbsencesCalendar = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [absences, setAbsences] = useState<VacationDay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

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
              </div>
              
              {loading ? (
                <div className="text-center py-4">Cargando ausencias...</div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Calendar
                      mode="single"
                      month={new Date(parseInt(selectedYear), 0)}
                      toMonth={new Date(parseInt(selectedYear), 11, 31)}
                      initialFocus
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
                        const typeLabel = 
                          absenceType === 'vacation' ? 'Vacacións' :
                          absenceType === 'personal' ? 'Persoal' :
                          absenceType === 'sick' ? 'Enfermidade' :
                          absenceType === 'sick_leave' ? 'Baixa médica' :
                          absenceType;
                        
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
                            <div className="text-sm font-medium">
                              {typeLabel}
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
    </div>
  );
};

export default AbsencesCalendar;
