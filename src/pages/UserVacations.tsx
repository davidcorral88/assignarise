import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../components/auth/AuthContext';
import {
  getUsers,
  getVacationDays,
  addVacationDay,
  removeVacationDay,
} from '../utils/dataService';
import { User, VacationDay } from '../utils/types';
import { format, parseISO } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';
import { Trash2, Calendar, Plus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Fix the vacation types in the relevant places
const UserVacations = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedType, setSelectedType] = useState<'vacation' | 'personal' | 'sick'>('vacation');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);

        if (currentUser?.role === 'admin') {
          setSelectedUser(fetchedUsers[0]?.id);
        } else {
          setSelectedUser(currentUser?.id);
        }

        const initialVacationDays = await getVacationDays(selectedUser);
        setVacationDays(initialVacationDays);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    const fetchVacationDays = async () => {
      if (selectedUser) {
        try {
          const fetchedVacationDays = await getVacationDays(selectedUser);
          setVacationDays(fetchedVacationDays);
        } catch (error) {
          console.error('Error fetching vacation days:', error);
          toast({
            title: 'Error',
            description: 'No se pudieron cargar los días libres',
            variant: 'destructive',
          });
        }
      }
    };

    fetchVacationDays();
  }, [selectedUser]);

  // Update the form submission to use the correct types
  const handleVacationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDate || !selectedType || !selectedUser) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor selecciona una fecha, tipo y usuario.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Convert sick_leave to sick to match the type definition
      const vacationType = selectedType === 'sick_leave' ? 'sick' : selectedType;

      const vacationDay: VacationDay = {
        userId: selectedUser,
        date: format(selectedDate, 'yyyy-MM-dd'),
        type: vacationType as 'vacation' | 'personal' | 'sick',
      };

      await addVacationDay(vacationDay);

      setVacationDays([...vacationDays, vacationDay]);

      toast({
        title: 'Día libre añadido',
        description: 'El día libre ha sido registrado correctamente.',
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedType('vacation');

    } catch (error) {
      console.error('Error al añadir día libre:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el día libre.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveVacationDay = async (vacationDay: VacationDay) => {
    try {
      await removeVacationDay(vacationDay);
      setVacationDays(vacationDays.filter(vd => vd.date !== vacationDay.date || vd.userId !== vacationDay.userId));
      toast({
        title: 'Día libre eliminado',
        description: 'El día libre ha sido eliminado correctamente.',
      });
    } catch (error) {
      console.error('Error al eliminar día libre:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el día libre.',
        variant: 'destructive',
      });
    }
  };

  // Update the getVacationTypeText function to handle the type conversions
  const getVacationTypeText = (type: string): string => {
    switch (type) {
      case 'vacation':
        return 'Vacaciones';
      case 'personal':
        return 'Asuntos propios';
      case 'sick':
      case 'sick_leave':
        return 'Baja médica';
      default:
        return type;
    }
  };

  const getVacationTypeColor = (type: string): string => {
    switch (type) {
      case 'vacation':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'sick':
      case 'sick_leave':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div>Cargando...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Gestión de días libres</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Formulario para añadir días libres */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Añadir día libre</CardTitle>
                <CardDescription>Selecciona los detalles del día libre.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentUser?.role === 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="user">Usuario</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Seleccionar fecha</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as 'vacation' | 'personal' | 'sick')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacaciones</SelectItem>
                      <SelectItem value="personal">Asuntos propios</SelectItem>
                      <SelectItem value="sick_leave">Baja médica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={handleVacationSubmit}>
                  <Plus className="mr-2 h-4 w-4" />
                  Añadir día libre
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Listado de días libres */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Lista de días libres</CardTitle>
                <CardDescription>Días libres registrados para este usuario.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {vacationDays.map(vacationDay => (
                        <tr key={`${vacationDay.userId}-${vacationDay.date}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {format(parseISO(vacationDay.date), 'PPP')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline" className={getVacationTypeColor(vacationDay.type)}>
                              {getVacationTypeText(vacationDay.type)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveVacationDay(vacationDay)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {vacationDays.length === 0 && (
                        <tr>
                          <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center">
                            No hay días libres registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserVacations;
