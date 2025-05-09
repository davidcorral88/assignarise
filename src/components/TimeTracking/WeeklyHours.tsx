import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, parseISO, getDay, addWeeks, subWeeks } from 'date-fns';
import { es, gl } from 'date-fns/locale';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Plus, Clock, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';
import { Task, TimeEntry } from '@/utils/types';
import { addTimeEntry, updateTimeEntry, deleteTimeEntry } from '@/utils/dataService';

interface WeeklyHoursProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  userId: string | number;
  onEntryAdded: (entry: TimeEntry) => void;
  selectedWeek: Date;
  onWeekChange: (newWeek: Date) => void;
}

const WeeklyHours: React.FC<WeeklyHoursProps> = ({ 
  tasks, 
  timeEntries,
  userId,
  onEntryAdded,
  selectedWeek,
  onWeekChange
}) => {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [weekTimeEntries, setWeekTimeEntries] = useState<Record<string, Record<string, TimeEntry>>>({});
  const [taskHours, setTaskHours] = useState<Record<string, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const goToPreviousWeek = () => {
    onWeekChange(subWeeks(selectedWeek, 1));
  };

  const goToNextWeek = () => {
    onWeekChange(addWeeks(selectedWeek, 1));
  };

  const addTaskToWeek = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      toast({
        title: 'Tarefa xa engadida',
        description: 'Esta tarefa xa está no rexistro semanal',
      });
      return;
    }
    
    setSelectedTasks(prev => [...prev, taskId]);
    
    setTaskHours(prev => {
      const newHours: Record<string, string> = {};
      for (let i = 0; i < 7; i++) {
        const dayDate = format(addDays(selectedWeek, i), 'yyyy-MM-dd');
        newHours[dayDate] = '';
      }
      return { ...prev, [taskId]: newHours };
    });
  };

  const updateHours = (taskId: string, dayDate: string, hours: string) => {
    if (isNaN(parseFloat(hours)) && hours !== '') return;
    
    setTaskHours(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [dayDate]: hours
      }
    }));
  };

  const calculateTaskTotal = (taskId: string): string => {
    if (!taskHours[taskId]) return '0:00';
    
    const total = Object.values(taskHours[taskId])
      .reduce((sum, hours) => {
        const hoursNum = hours ? parseFloat(hours) : 0;
        return sum + hoursNum;
      }, 0);
    
    return formatHoursToTimeFormat(total);
  };

  const calculateDayTotal = (dayIndex: number): string => {
    const dayDate = format(addDays(selectedWeek, dayIndex), 'yyyy-MM-dd');
    
    let total = 0;
    Object.keys(taskHours).forEach(taskId => {
      if (taskHours[taskId][dayDate]) {
        total += parseFloat(taskHours[taskId][dayDate]) || 0;
      }
    });
    
    return formatHoursToTimeFormat(total);
  };

  const calculateWeekTotal = (): string => {
    let total = 0;
    
    Object.keys(taskHours).forEach(taskId => {
      Object.values(taskHours[taskId]).forEach(hours => {
        if (hours) {
          total += parseFloat(hours) || 0;
        }
      });
    });
    
    return formatHoursToTimeFormat(total);
  };

  const formatHoursToTimeFormat = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}:${minutes.toString().padStart(2, '0')}`;
  };

  const findExistingEntry = (taskId: string, dayDate: string): TimeEntry | undefined => {
    return timeEntries.find(entry => {
      const entryTaskId = typeof entry.task_id === 'string' 
        ? entry.task_id 
        : String(entry.task_id);
      
      const entryDate = format(new Date(entry.date), 'yyyy-MM-dd');
      
      return entryTaskId === taskId && entryDate === dayDate;
    });
  };

  const saveHours = async (taskId: string, dayDate: string) => {
    if (!taskHours[taskId][dayDate] || taskHours[taskId][dayDate] === '0') return;

    setIsLoading(true);
    try {
      const hours = parseFloat(taskHours[taskId][dayDate]);
      
      if (isNaN(hours)) {
        toast({
          title: 'Erro',
          description: 'O valor de horas non é válido',
          variant: 'destructive',
        });
        return;
      }

      const userIdAsNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
      
      const existingEntry = findExistingEntry(taskId, dayDate);
      
      let entry;
      
      if (existingEntry) {
        entry = await updateTimeEntry(existingEntry.id, {
          task_id: parseInt(taskId, 10),
          user_id: userIdAsNumber,
          hours,
          date: dayDate,
          notes: `Rexistro semanal - ${format(parseISO(dayDate), 'EEEE', { locale: gl })}`,
          category: existingEntry.category,
          project: existingEntry.project,
          activity: existingEntry.activity,
          timeFormat: existingEntry.timeFormat
        });
        
        toast({
          title: 'Rexistro actualizado',
          description: 'As horas foron actualizadas correctamente',
        });
      } else {
        entry = await addTimeEntry({
          task_id: parseInt(taskId, 10),
          user_id: userIdAsNumber,
          hours,
          date: dayDate,
          notes: `Rexistro semanal - ${format(parseISO(dayDate), 'EEEE', { locale: gl })}`
        });
        
        toast({
          title: 'Rexistro gardado',
          description: 'As horas foron rexistradas correctamente',
        });
      }

      setWeekTimeEntries(prev => ({
        ...prev,
        [taskId]: {
          ...prev[taskId],
          [dayDate]: entry
        }
      }));

      onEntryAdded(entry);
    } catch (error) {
      console.error('Error saving hours:', error);
      toast({
        title: 'Erro',
        description: 'Non se puideron gardar as horas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const entriesByTaskAndDay: Record<string, Record<string, TimeEntry>> = {};
    const hoursData: Record<string, Record<string, string>> = {};
    
    timeEntries.forEach(entry => {
      const taskId = typeof entry.task_id === 'string' 
        ? entry.task_id 
        : String(entry.task_id);

      const entryDate = format(new Date(entry.date), 'yyyy-MM-dd');
      const weekStartDate = format(selectedWeek, 'yyyy-MM-dd');
      const weekEndDate = format(addDays(selectedWeek, 6), 'yyyy-MM-dd');
      
      if (entryDate >= weekStartDate && entryDate <= weekEndDate) {
        if (!entriesByTaskAndDay[taskId]) {
          entriesByTaskAndDay[taskId] = {};
          
          if (!selectedTasks.includes(taskId)) {
            setSelectedTasks(prev => [...prev, taskId]);
          }
        }
        
        entriesByTaskAndDay[taskId][entryDate] = entry;
        
        if (!hoursData[taskId]) {
          hoursData[taskId] = {};
          
          for (let i = 0; i < 7; i++) {
            const dayDate = format(addDays(selectedWeek, i), 'yyyy-MM-dd');
            hoursData[taskId][dayDate] = '';
          }
        }
        
        hoursData[taskId][entryDate] = String(entry.hours);
      }
    });
    
    setWeekTimeEntries(entriesByTaskAndDay);
    
    selectedTasks.forEach(taskId => {
      if (!hoursData[taskId]) {
        hoursData[taskId] = {};
        
        for (let i = 0; i < 7; i++) {
          const dayDate = format(addDays(selectedWeek, i), 'yyyy-MM-dd');
          hoursData[taskId][dayDate] = '';
        }
      }
    });
    
    setTaskHours(hoursData);
  }, [selectedWeek, timeEntries, selectedTasks]);

  const dayLabels = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(selectedWeek, i);
    return {
      weekday: format(day, 'EEE', { locale: gl }).toUpperCase(),
      dayNum: format(day, 'd'),
      date: format(day, 'yyyy-MM-dd')
    };
  });

  const filteredTasks = tasks
    .filter(task => {
      const taskId = typeof task.id === 'string' ? task.id : String(task.id);
      if (selectedTasks.includes(taskId)) return false;
      
      const searchLower = searchQuery.toLowerCase();
      const titleMatches = task.title.toLowerCase().includes(searchLower);
      const idMatches = taskId.toLowerCase().includes(searchLower);
      
      return titleMatches || idMatches;
    });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Horas semanais</CardTitle>
            <CardDescription>
              Rexistra as horas traballadas por día e tarefa
            </CardDescription>
          </div>
          
          <div className="flex items-center mt-4 sm:mt-0 space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToPreviousWeek}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center font-medium">
              Semana do {format(selectedWeek, 'dd/MM/yyyy')}
            </div>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={goToNextWeek}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium p-2 min-w-[180px]">
                  Tarefa
                </th>
                {dayLabels.map(day => (
                  <th key={day.date} className="font-medium p-2 text-center min-w-[80px]">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-muted-foreground">{day.weekday}</span>
                      <span>{day.dayNum}</span>
                    </div>
                  </th>
                ))}
                <th className="font-medium p-2 text-center min-w-[80px]">
                  TOTAL
                </th>
              </tr>
              
              <tr className="border-b bg-muted/30 text-sm">
                <td className="p-2 text-right text-muted-foreground">Horas diarias</td>
                {Array.from({ length: 7 }, (_, i) => (
                  <td key={i} className="p-2 text-center">
                    {calculateDayTotal(i)}
                  </td>
                ))}
                <td className="p-2 text-center font-bold">
                  {calculateWeekTotal()}
                </td>
              </tr>
            </thead>
            
            <tbody>
              {selectedTasks.map((taskId) => {
                const task = tasks.find(t => {
                  const tId = typeof t.id === 'string' ? t.id : String(t.id);
                  return tId === taskId;
                });
                
                if (!task) return null;
                
                return (
                  <tr key={taskId} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-primary" />
                        <span className="font-medium">{task.title}</span>
                      </div>
                    </td>
                    
                    {dayLabels.map(day => {
                      const hasEntry = weekTimeEntries[taskId]?.[day.date];
                      return (
                        <td key={day.date} className="p-2 text-center">
                          <div className="flex items-center justify-center">
                            <Input
                              className={`w-20 text-center ${hasEntry ? 'bg-green-50' : ''}`}
                              value={taskHours[taskId]?.[day.date] || ''}
                              onChange={(e) => updateHours(taskId, day.date, e.target.value)}
                              onBlur={() => saveHours(taskId, day.date)}
                              type="number"
                              step="0.1"
                              min="0"
                              placeholder="0.0"
                            />
                          </div>
                        </td>
                      );
                    })}
                    
                    <td className="p-2 text-center font-medium">
                      {calculateTaskTotal(taskId)}
                    </td>
                  </tr>
                );
              })}
              
              <tr>
                <td colSpan={9} className="p-2">
                  <div className="flex">
                    <Select onValueChange={addTaskToWeek}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Engadir tarefa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-2">
                          <div className="flex w-full items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground/70" />
                            <input
                              className="flex w-full rounded-md bg-transparent py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:outline-none"
                              placeholder="Buscar por ID ou nome..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                        <SelectSeparator />
                        {filteredTasks.length > 0 ? (
                          filteredTasks.map(task => {
                            const taskId = typeof task.id === 'string' ? task.id : String(task.id);
                            return (
                              <SelectItem key={taskId} value={taskId}>
                                <span className="font-medium">{taskId}</span>
                                <span className="ml-2 text-muted-foreground">
                                  - {task.title}
                                </span>
                              </SelectItem>
                            );
                          })
                        ) : (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            Non se atoparon tarefas
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyHours;
