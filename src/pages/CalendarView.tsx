
import React, { useState, useContext } from 'react';
import { Layout } from '../components/layout/Layout';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { getTasks, getTimeEntriesByUserId, addTimeEntryOld } from '../utils/mockData';
import { TimeEntry, Task } from '../utils/types';
import { AuthContext } from '../components/auth/AuthContext';

const CalendarView = () => {
  const { currentUser } = useContext(AuthContext);
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hours, setHours] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(
    currentUser ? getTimeEntriesByUserId(currentUser.id) : []
  );

  const tasks = getTasks().filter(task => 
    task.assignments.some(assignment => assignment.userId === currentUser?.id)
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTaskId || !hours) {
      toast({
        title: 'Erro',
        description: 'Por favor, completa todos os campos requiridos',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    // Parse hours (hh:mm) to number
    const [hoursVal, minutesVal] = hours.split(':').map(Number);
    const hoursNumber = hoursVal + (minutesVal / 60);
    
    // Create new time entry
    const newEntry: TimeEntry = {
      id: `te_${Date.now()}`,
      taskId: selectedTaskId,
      userId: currentUser?.id || '',
      hours: hoursNumber,
      date: format(selectedDate, 'yyyy-MM-dd'),
      notes: notes || undefined,
      category: category || undefined,
      project: project || undefined,
      activity: activity || undefined,
      timeFormat: hours
    };
    
    // Add to db - updated function name
    addTimeEntryOld(newEntry);
    
    // Update state
    setTimeEntries([...timeEntries, newEntry]);
    
    toast({
      title: 'Horas rexistradas',
      description: 'Rexistráronse as túas horas correctamente.',
    });
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setSubmitting(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedTaskId('');
    setHours('');
    setNotes('');
    setCategory('');
    setProject('');
    setActivity('');
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Calendario de Rexistro de Horas</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Selecciona unha data</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border mx-auto"
            />
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rexistrar horas para {format(selectedDate, 'dd/MM/yyyy')}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Tarefa</Label>
                <Select
                  value={selectedTaskId}
                  onValueChange={(value) => setSelectedTaskId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona unha tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.map((task: Task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours">Horas (hh:mm)</Label>
                <Input
                  id="hours"
                  type="text"
                  placeholder="08:00"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  pattern="([01]?[0-9]|2[0-3]):[0-5][0-9]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project">Proxecto</Label>
                <Input
                  id="project"
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activity">Actividade</Label>
                <Input
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Gardando...' : 'Gardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default CalendarView;
