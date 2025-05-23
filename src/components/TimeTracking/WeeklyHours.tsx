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
import { ChevronLeft, ChevronRight, Plus, Clock, Search, X } from 'lucide-react';
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
import { hoursToTimeFormat, timeFormatToHours } from '@/lib/utils';
import { TimePicker } from '@/components/ui/time-picker';

interface WeeklyHoursProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  userId: string | number;
  onEntryAdded: (entry: TimeEntry) => void;
  onEntryDeleted?: (entryId: string | number) => void;
  selectedWeek: Date;
  onWeekChange: (newWeek: Date) => void;
}

const WeeklyHours: React.FC<WeeklyHoursProps> = ({ 
  tasks, 
  timeEntries,
  userId,
  onEntryAdded,
  onEntryDeleted,
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

  const updateHours = (taskId: string, dayDate: string, timeValue: string) => {
    setTaskHours(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        [dayDate]: timeValue
      }
    }));
  };

  const calculateTaskTotal = (taskId: string): string => {
    if (!taskHours[taskId]) return '00:00';
    
    const total = Object.values(taskHours[taskId])
      .reduce((sum, timeValue) => {
        const hoursNum = timeValue ? timeFormatToHours(timeValue) : 0;
        return sum + hoursNum;
      }, 0);
    
    return hoursToTimeFormat(total);
  };

  const calculateDayTotal = (dayIndex: number): string => {
    const dayDate = format(addDays(selectedWeek, dayIndex), 'yyyy-MM-dd');
    
    let total = 0;
    Object.keys(taskHours).forEach(taskId => {
      if (taskHours[taskId][dayDate]) {
        total += timeFormatToHours(taskHours[taskId][dayDate]) || 0;
      }
    });
    
    return hoursToTimeFormat(total);
  };

  const calculateWeekTotal = (): string => {
    let total = 0;
    
    Object.keys(taskHours).forEach(taskId => {
      Object.values(taskHours[taskId]).forEach(timeValue => {
        if (timeValue) {
          total += timeFormatToHours(timeValue) || 0;
        }
      });
    });
    
    return hoursToTimeFormat(total);
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

  const removeTaskFromWeek = (taskId: string) => {
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
    setTaskHours(prev => {
      const newHours = { ...prev };
      delete newHours[taskId];
      return newHours;
    });
  };

  const handleDeleteTimeEntry = async (taskId: string, dayDate: string) => {
    const existingEntry = findExistingEntry(taskId, dayDate);
    
    if (existingEntry) {
      setIsLoading(true);
      try {
        await deleteTimeEntry(existingEntry.id);
        
        setWeekTimeEntries(prev => {
          const updated = { ...prev };
          if (updated[taskId] && updated[taskId][dayDate]) {
            delete updated[taskId][dayDate];
          }
          return updated;
        });
        
        updateHours(taskId, dayDate, '');
        
        if (onEntryDeleted) {
          onEntryDeleted(existingEntry.id);
        }
        
        toast({
          title: 'Rexistro eliminado',
          description: 'As horas foron eliminadas correctamente',
        });
      } catch (error) {
        console.error('Error deleting time entry:', error);
        toast({
          title: 'Erro',
          description: 'Non se puido eliminar o rexistro',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const saveHours = async (taskId: string, dayDate: string) => {
    // If empty value, skip saving
    if (!taskHours[taskId][dayDate]) return;

    setIsLoading(true);
    try {
      // Convert time format to decimal hours for storage
      const timeValue = taskHours[taskId][dayDate];
      
      // If time value is 00:00, delete the entry if it exists
      if (timeValue === '00:00') {
        await handleDeleteTimeEntry(taskId, dayDate);
        return;
      }
      
      const hours = timeFormatToHours(timeValue);
      
      if (isNaN(hours) || hours === 0) {
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
          timeFormat: timeValue // Store original time format
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
          notes: `Rexistro semanal - ${format(parseISO(dayDate), 'EEEE', { locale: gl })}`,
          timeFormat: timeValue // Store original time format
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
        
        // Use timeFormat if available, otherwise convert from decimal
        const timeValue = entry.timeFormat || hoursToTimeFormat(entry.hours);
        hoursData[taskId][entryDate] = timeValue;
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
                        <span className="font-medium">{taskId} - {task.title}</span>
                      </div>
                    </td>
                    
                    {dayLabels.map(day => {
                      const hasEntry = weekTimeEntries[taskId]?.[day.date];
                      return (
                        <td key={day.date} className="p-2 text-center">
                          <div className="flex items-center justify-center group relative">
                            <TimePicker
                              className={`w-20 text-center ${hasEntry ? 'bg-green-50' : ''}`}
                              value={taskHours[taskId]?.[day.date] || ''}
                              onChange={(value) => updateHours(taskId, day.date, value)}
                              onBlur={() => saveHours(taskId, day.date)}
                            />
                            {hasEntry && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-[-25px] h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteTimeEntry(taskId, day.date)}
                              >
                                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            )}
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
                                <span className="font-medium">{taskId} - {task.title}</span>
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
