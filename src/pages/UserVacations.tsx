import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import UserVacationsCalendar from '@/components/calendar/UserVacationsCalendar';
import AllUsersVacationsCalendar from '@/components/calendar/AllUsersVacationsCalendar';
import { useAuth } from '@/components/auth/AuthContext';
import { getVacationDays, addVacationDay, removeVacationDay, getUsers } from '@/utils/dataService';
import { VacationDay, User, VacationType } from '@/utils/types';
import { Label } from '@/components/ui/label';

const UserVacations = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedType, setSelectedType] = useState<VacationType>('vacation');
  const [vacationDays, setVacationDays] = useState<VacationDay[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('add');
  const [isLoadingVacations, setIsLoadingVacations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchVacationDays = async () => {
      setIsLoadingVacations(true);
      try {
        const days = currentUser?.role === 'admin' && selectedUserId
          ? await getVacationDays(selectedUserId)
          : await getVacationDays(currentUser?.id);
        setVacationDays(days);
      } catch (error) {
        console.error('Error fetching vacation days:', error);
        toast({
          title: 'Error',
          description: 'Non se puideron cargar os días de vacacións',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingVacations(false);
      }
    };
    
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
        if (currentUser?.role === 'admin' && usersData.length > 0) {
          setSelectedUserId(usersData[0].id);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Non se puideron cargar os usuarios',
          variant: 'destructive',
        });
      }
    };
    
    fetchVacationDays();
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [currentUser, selectedUserId]);
  
  const handleAddVacationDay = async () => {
    if (!selectedDate) {
      toast({
        title: 'Erro',
        description: 'Selecciona unha data',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    
    try {
      const newVacationDay: VacationDay = {
        userId: currentUser?.role === 'admin' && selectedUserId ? selectedUserId : currentUser?.id || '',
        date: formattedDate,
        type: selectedType,
      };
      
      await addVacationDay(newVacationDay);
      
      // Update local state
      setVacationDays([...vacationDays, newVacationDay]);
      
      toast({
        title: 'Vacacións engadidas',
        description: `Día de ${formatVacationType(selectedType)} para o ${format(selectedDate, 'dd/MM/yyyy')} rexistrado`,
      });
    } catch (error) {
      console.error('Error adding vacation day:', error);
      toast({
        title: 'Erro',
        description: 'Non se puideron engadir as vacacións',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleRemoveVacationDay = async (vacationDay: VacationDay) => {
    setIsSubmitting(true);
    try {
      await removeVacationDay(vacationDay);
      
      // Update local state
      setVacationDays(vacationDays.filter(day => !(day.date === vacationDay.date && day.userId === vacationDay.userId && day.type === vacationDay.type)));
      
      toast({
        title: 'Vacacións eliminadas',
        description: `Día de ${formatVacationType(vacationDay.type)} para o ${vacationDay.date} eliminado`,
      });
    } catch (error) {
      console.error('Error removing vacation day:', error);
      toast({
        title: 'Erro',
        description: 'Non se puideron eliminar as vacacións',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
  };
  
  const formatVacationType = (type: VacationType) => {
    switch (type) {
      case 'vacation':
        return 'Vacacións';
      case 'personal':
        return 'Asuntos persoais';
      case 'sick':
        return 'Enfermidade';
      case 'sick_leave':
        return 'Baixa médica';
      default:
        return type;
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vacacións</h1>
            <p className="text-muted-foreground">
              Xestiona os teus días de vacacións e asuntos persoais.
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="add" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="add">Engadir Vacacións</TabsTrigger>
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            {currentUser?.role === 'admin' && (
              <TabsTrigger value="all">Todos os usuarios</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="add" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Engadir día de vacacións</CardTitle>
                <CardDescription>
                  Selecciona a data e o tipo de día que queres engadir.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {currentUser?.role === 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="user">Usuario</Label>
                    <Select value={selectedUserId} onValueChange={handleUserChange}>
                      <SelectTrigger id="user">
                        <SelectValue placeholder="Selecciona un usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="date">Data</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    className="rounded-md border"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={selectedType} onValueChange={(value) => setSelectedType(value as VacationType)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vacation">Vacacións</SelectItem>
                      <SelectItem value="personal">Asuntos persoais</SelectItem>
                      <SelectItem value="sick">Enfermidade</SelectItem>
                      <SelectItem value="sick_leave">Baixa médica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button onClick={handleAddVacationDay} disabled={isSubmitting}>
                  {isSubmitting ? 'Engadindo...' : 'Engadir Vacacións'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendario de vacacións</CardTitle>
                <CardDescription>
                  Aquí podes ver os teus días de vacacións.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingVacations ? (
                  <div>Cargando...</div>
                ) : (
                  <UserVacationsCalendar
                    vacationDays={vacationDays}
                    onRemoveVacationDay={handleRemoveVacationDay}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {currentUser?.role === 'admin' && (
            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <CardTitle>Calendario de vacacións de todos os usuarios</CardTitle>
                  <CardDescription>
                    Aquí podes ver os días de vacacións de todos os usuarios.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingVacations ? (
                    <div>Cargando...</div>
                  ) : (
                    <AllUsersVacationsCalendar
                      vacationDays={vacationDays}
                      onRemoveVacationDay={handleRemoveVacationDay}
                    />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserVacations;
