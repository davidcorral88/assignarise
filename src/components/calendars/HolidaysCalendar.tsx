import React, { useState, useEffect } from 'react';
import { format, parseISO, getYear, addMonths, startOfYear } from 'date-fns';
import { gl } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Holiday } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import { getHolidays, addHoliday, removeHoliday } from '@/utils/dataService';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Edit, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';

const formSchema = z.object({
  date: z.date({
    required_error: "Selecciona unha data",
  }),
  name: z.string().min(1, "O nome é obrigatorio")
});

const HolidaysCalendar = () => {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const addForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const years = Array.from({ length: 10 }, (_, i) => (new Date().getFullYear() - 3 + i).toString());

  const months = Array.from({ length: 12 }, (_, i) => {
    return startOfYear(new Date(parseInt(selectedYear), 0));
  }).map((date, index) => addMonths(date, index));

  useEffect(() => {
    fetchHolidays();
  }, [selectedYear]);

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const holidaysData = await getHolidays(parseInt(selectedYear));
      setHolidays(holidaysData);
    } catch (error) {
      console.error('Error fetching holidays:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible cargar os festivos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const holidayDates = new Set(holidays.map(holiday => {
    // Ensure we're using the date part only (strip time if present)
    return holiday.date.split('T')[0];
  }));

  const handleAddHoliday = async (values: z.infer<typeof formSchema>) => {
    try {
      // Format the date as YYYY-MM-DD string
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      console.log('Adding holiday with formatted date:', formattedDate);
      
      // Construct a valid Holiday object
      const newHoliday: Holiday = {
        date: formattedDate,
        name: values.name
      };
      
      await addHoliday(newHoliday);
      await fetchHolidays(); // Refresh the holidays list
      
      toast({
        title: 'Festivo engadido',
        description: `${values.name} foi engadido correctamente`,
      });
      
      setIsAddDialogOpen(false);
      addForm.reset();
    } catch (error) {
      console.error('Error adding holiday:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible engadir o festivo',
        variant: 'destructive',
      });
    }
  };

  const handleEditHoliday = async (values: z.infer<typeof formSchema>) => {
    if (!selectedHoliday) return;
    
    try {
      const formattedDate = format(values.date, 'yyyy-MM-dd');
      console.log('Updating holiday with formatted date:', formattedDate);
      
      // First delete the existing holiday
      const originalDate = selectedHoliday.date.split('T')[0];
      
      // Create an updated holiday object
      const updatedHoliday: Holiday = {
        id: selectedHoliday.id,
        date: formattedDate,
        name: values.name
      };
      
      // Update using the original date and new holiday data
      await removeHoliday(originalDate);
      await addHoliday(updatedHoliday);
      await fetchHolidays(); // Refresh the holidays list
      
      toast({
        title: 'Festivo actualizado',
        description: `${values.name} foi actualizado correctamente`,
      });
      
      setIsEditDialogOpen(false);
      setSelectedHoliday(null);
      editForm.reset();
    } catch (error) {
      console.error('Error updating holiday:', error);
      toast({
        title: 'Error',
        description: 'Non foi posible actualizar o festivo',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHoliday = async (holiday: Holiday) => {
    // Prevent multiple deletion attempts
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      // Ensure we're using just the date portion (YYYY-MM-DD)
      const formattedDate = holiday.date.split('T')[0];
      console.log('Deleting holiday with formatted date:', formattedDate);
      
      // First remove the holiday from the local state to give immediate UI feedback
      setHolidays(prev => prev.filter(h => h.date.split('T')[0] !== formattedDate));
      
      await removeHoliday(formattedDate);
      
      toast({
        title: 'Festivo eliminado',
        description: `${holiday.name} foi eliminado correctamente`,
      });
      
      // Refresh the holidays list after a short delay to ensure backend has processed the deletion
      setTimeout(() => {
        fetchHolidays();
      }, 500);
    } catch (error) {
      console.error('Error deleting holiday:', error);
      
      // Add the holiday back to the local state if the deletion failed
      if (holidays.findIndex(h => h.date.split('T')[0] === holiday.date.split('T')[0]) === -1) {
        setHolidays(prev => [...prev, holiday]);
      }
      
      toast({
        title: 'Error',
        description: 'Non foi posible eliminar o festivo. Asegúrate de que aínda existe.',
        variant: 'destructive',
      });
      
      // Refresh to ensure our state matches the backend
      setTimeout(() => {
        fetchHolidays();
      }, 1000);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    
    // Parse the date string to a Date object for the form
    const holidayDate = parseISO(holiday.date);
    
    editForm.setValue('name', holiday.name);
    editForm.setValue('date', holidayDate);
    
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <Label htmlFor="year-select">Ano</Label>
            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger id="year-select" className="w-[180px]">
                <SelectValue placeholder="Selecciona un ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-1">
                <Plus size={16} />
                <span>Engadir Festivo</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Engadir novo festivo</DialogTitle>
                <DialogDescription>
                  Introduce a data e nome do festivo
                </DialogDescription>
              </DialogHeader>
              
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddHoliday)} className="space-y-4">
                  <FormField
                    control={addForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={addForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do festivo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsAddDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Gardar</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar festivo</DialogTitle>
                <DialogDescription>
                  Modifica a data ou nome do festivo
                </DialogDescription>
              </DialogHeader>
              
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEditHoliday)} className="space-y-4">
                  <FormField
                    control={editForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 opacity-50" />
                            <Input
                              type="date"
                              value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : null)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome do festivo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button variant="outline" type="button" onClick={() => setIsEditDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit">Actualizar</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="text-center mb-2 font-medium">
                  {format(month, 'MMMM yyyy', { locale: gl })}
                </div>
                <Calendar
                  mode="single"
                  month={month}
                  className="rounded-md border w-full"
                  locale={gl}
                  modifiers={{
                    holiday: (date) => {
                      const dateStr = format(date, 'yyyy-MM-dd');
                      return holidayDates.has(dateStr);
                    }
                  }}
                  modifiersStyles={{
                    holiday: {
                      color: 'white',
                      backgroundColor: '#ea384c'
                    }
                  }}
                  disabled
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-6">
          <CardContent className="p-4">
            <div className="text-center mb-4 font-medium">
              Listado de Festivos {selectedYear}
            </div>
            {loading ? (
              <div className="text-center py-4">Cargando festivos...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Accións</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.length > 0 ? (
                    holidays
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(holiday => (
                        <TableRow key={holiday.date}>
                          <TableCell>
                            {format(parseISO(holiday.date), 'dd/MM/yyyy', { locale: gl })}
                          </TableCell>
                          <TableCell>{holiday.name}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(holiday)}>
                                <Edit size={16} />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteHoliday(holiday)}
                                disabled={isDeleting}
                              >
                                <Trash2 size={16} />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4">
                        Non hai festivos rexistrados para este ano
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HolidaysCalendar;
