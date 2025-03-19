
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { 
  getTasksByUserId, 
  getTimeEntriesByUserId, 
  getHolidays,
  getVacationDays,
  getWorkSchedule,
  addTimeEntry
} from '../utils/mockData';
import { 
  Task, 
  TimeEntry, 
  DailyHoursData 
} from '../utils/types';
import { format, parse, isWeekend, parseISO, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const CalendarView = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userTasks, setUserTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [vacationDays, setVacationDays] = useState<string[]>([]);
  const [sickLeaveDays, setSickLeaveDays] = useState<string[]>([]);
  const [dailyHoursData, setDailyHoursData] = useState<Map<string, DailyHoursData>>(new Map());
  const [workSchedule, setWorkSchedule] = useState<any>(null);
  
  // Form state
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [hours, setHours] = useState<string>('01:00');
  const [category, setCategory] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [activity, setActivity] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Only workers can access this page
    if (currentUser?.role !== 'worker') {
      navigate('/dashboard');
      return;
    }
    
    const fetchData = () => {
      if (currentUser) {
        const tasks = getTasksByUserId(currentUser.id);
        const entries = getTimeEntriesByUserId(currentUser.id);
        const holidaysList = getHolidays();
        const vacations = getVacationDays(currentUser.id);
        const schedule = getWorkSchedule();
        
        setUserTasks(tasks);
        setTimeEntries(entries);
        setWorkSchedule(schedule);
        
        // Format holidays, vacations, and sick leave days
        setHolidays(holidaysList.map(h => format(parseISO(h.date), 'yyyy-MM-dd')));
        
        const vacationsList: string[] = [];
        const sickLeaveList: string[] = [];
        vacations.forEach(v => {
          const formattedDate = format(parseISO(v.date), 'yyyy-MM-dd');
          if (v.type === 'vacation') {
            vacationsList.push(formattedDate);
          } else {
            sickLeaveList.push(formattedDate);
          }
        });
        
        setVacationDays(vacationsList);
        setSickLeaveDays(sickLeaveList);
        
        // Calculate daily hours
        calculateDailyHours(tasks, entries, holidaysList, vacations, schedule);
      }
    };
    
    fetchData();
  }, [currentUser, navigate]);
  
  const calculateDailyHours = (
    tasks: Task[],
    entries: TimeEntry[],
    holidays: any[],
    vacations: any[],
    schedule: any
  ) => {
    if (!schedule) return;
    
    const days = eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
    
    const dailyData = new Map<string, DailyHoursData>();
    
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayEntries = entries.filter(e => e.date === dateStr);
      
      // Calculate total hours for the day
      let totalHours = 0;
      dayEntries.forEach(entry => {
        if (entry.timeFormat) {
          // Parse hh:mm format
          const [hours, minutes] = entry.timeFormat.split(':').map(Number);
          totalHours += hours + (minutes / 60);
        } else {
          totalHours += entry.hours;
        }
      });
      
      // Check if day is a holiday
      const isHoliday = holidays.some(h => format(parseISO(h.date), 'yyyy-MM-dd') === dateStr);
      
      // Check if day is a vacation or sick leave
      const isVacation = vacations.some(v => 
        format(parseISO(v.date), 'yyyy-MM-dd') === dateStr && v.type === 'vacation'
      );
      
      const isSickLeave = vacations.some(v => 
        format(parseISO(v.date), 'yyyy-MM-dd') === dateStr && v.type === 'sick_leave'
      );
      
      // Determine required hours based on day and period
      let requiredHours = 0;
      
      // Skip weekends, holidays, vacations, and sick leaves
      if (!isWeekend(day) && !isHoliday && !isVacation && !isSickLeave) {
        // Check if current date is in a reduced period
        const month = day.getMonth() + 1;
        const dayOfMonth = day.getDate();
        const dateMMDD = `${month.toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
        
        let isReducedPeriod = false;
        if (schedule.reducedPeriods) {
          isReducedPeriod = schedule.reducedPeriods.some((period: any) => {
            const startDate = parse(period.start, 'MM-dd', new Date());
            const endDate = parse(period.end, 'MM-dd', new Date());
            const currentDate = parse(dateMMDD, 'MM-dd', new Date());
            
            // Adjust for periods that span year boundary (e.g., Dec to Jan)
            if (startDate > endDate) {
              return currentDate >= startDate || currentDate <= endDate;
            }
            
            return currentDate >= startDate && currentDate <= endDate;
          });
        }
        
        if (isReducedPeriod) {
          requiredHours = schedule.reducedHours.dailyHours;
        } else {
          // Regular hours
          const dayOfWeek = day.getDay();
          if (dayOfWeek === 5) { // Friday
            requiredHours = schedule.regularHours.friday;
          } else {
            requiredHours = schedule.regularHours.mondayToThursday;
          }
        }
      }
      
      const isComplete = totalHours >= requiredHours || isWeekend(day) || isHoliday || isVacation || isSickLeave;
      
      dailyData.set(dateStr, {
        date: day,
        hours: totalHours,
        isComplete,
        isHoliday,
        isVacation,
        isSickLeave
      });
    });
    
    setDailyHoursData(dailyData);
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsDialogOpen(true);
    // Reset form
    setSelectedTaskId('');
    setHours('01:00');
    setCategory('');
    setProject('');
    setActivity('');
    setNotes('');
  };
  
  const handlePreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };
  
  const getDayClass = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayData = dailyHoursData.get(dateStr);
    
    if (!dayData) return '';
    
    if (dayData.isHoliday) return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    if (dayData.isVacation) return 'bg-green-100 text-green-800 hover:bg-green-200';
    if (dayData.isSickLeave) return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
    
    return dayData.isComplete 
      ? 'bg-green-100 text-green-800 hover:bg-green-200'
      : 'bg-red-100 text-red-800 hover:bg-red-200';
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
    
    // Add to db
    addTimeEntry(newEntry);
    
    // Update state
    setTimeEntries([...timeEntries, newEntry]);
    
    toast({
      title: 'Horas rexistradas',
      description: 'Rexistráronse as túas horas correctamente.',
    });
    
    // Close dialog and reset form
    setIsDialogOpen(false);
    setSubmitting(false);
  };
  
  // Get unique categories, projects from tasks
  const categories = [...new Set(userTasks.map(t => t.category).filter(Boolean))];
  const projects = [...new Set(userTasks.map(t => t.project).filter(Boolean))];
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Calendario de horas</h1>
          <Button onClick={() => navigate('/time-tracking')}>
            Ver rexistro de horas
          </Button>
        </div>
        
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle>
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              Fai clic nun día para rexistrar horas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4">
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mér</div>
                <div>Xov</div>
                <div>Ven</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>
              
              <div className="mt-2 grid grid-cols-7 gap-2">
                {eachDayOfInterval({
                  start: startOfMonth(currentMonth),
                  end: endOfMonth(currentMonth)
                }).map((day, i) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayData = dailyHoursData.get(dateStr);
                  const dayOfMonth = day.getDate();
                  const dayOfWeek = day.getDay();
                  
                  // Calculate first day offset
                  let startOffset = 0;
                  if (i === 0) {
                    startOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust for Monday as first day
                  }
                  
                  return (
                    <React.Fragment key={dateStr}>
                      {i === 0 && startOffset > 0 && (
                        <div className="col-span-1" style={{ gridColumn: `span ${startOffset} / span ${startOffset}` }} />
                      )}
                      <Button
                        variant="outline"
                        className={`h-16 flex flex-col justify-between p-1 rounded-md hover:bg-gray-100 ${getDayClass(day)}`}
                        onClick={() => handleDateClick(day)}
                      >
                        <div className="self-end font-medium">
                          {dayOfMonth}
                        </div>
                        {dayData && !dayData.isHoliday && !dayData.isVacation && !dayData.isSickLeave && (
                          <div className="w-full text-xs">
                            {dayData.hours.toFixed(1)}h
                            {!dayData.isComplete && !isWeekend(day) && (
                              <AlertTriangle className="h-3 w-3 text-red-500 inline ml-1" />
                            )}
                          </div>
                        )}
                        {dayData?.isHoliday && (
                          <div className="w-full text-xs">Festivo</div>
                        )}
                        {dayData?.isVacation && (
                          <div className="w-full text-xs">Vacacións</div>
                        )}
                        {dayData?.isSickLeave && (
                          <div className="w-full text-xs">Baixa</div>
                        )}
                      </Button>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-100 mr-2"></div>
                <span>Completado</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-100 mr-2"></div>
                <span>Incompleto</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-blue-100 mr-2"></div>
                <span>Festivo</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-green-100 mr-2"></div>
                <span>Vacacións</span>
              </div>
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-amber-100 mr-2"></div>
                <span>Baixa</span>
              </div>
            </div>
          </CardFooter>
        </Card>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Rexistrar horas para {format(selectedDate, 'dd/MM/yyyy')}</DialogTitle>
              <DialogDescription>
                Introduce as horas traballadas para a tarefa seleccionada.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task">Tarefa *</Label>
                <Select
                  value={selectedTaskId}
                  onValueChange={setSelectedTaskId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {userTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hours">Horas (hh:mm) *</Label>
                <Input
                  id="hours"
                  type="time"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project">Proxecto</Label>
                  <Select value={project} onValueChange={setProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proxecto" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(proj => (
                        <SelectItem key={proj} value={proj}>
                          {proj}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="activity">Actuación</Label>
                <Input
                  id="activity"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="Actuación realizada"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Descrición</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe en detalle o traballo realizado"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Clock className="mr-2 h-4 w-4 animate-spin" />
                      Gardando...
                    </>
                  ) : (
                    'Gardar'
                  )}
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
