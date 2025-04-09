
import React from 'react';
import { BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TimeEntry, User } from '@/utils/types';
import { formatHoursToTimeFormat } from '@/utils/timeUtils';

interface AnalyticsChartProps {
  currentUser: User;
  tasks: Task[];
  timeEntries: TimeEntry[];
  loading: boolean;
}

// Custom tooltip formatter for time format display
const CustomTooltipFormatter = (value: number) => {
  return formatHoursToTimeFormat(value);
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ 
  currentUser, 
  tasks, 
  timeEntries,
  loading 
}) => {
  const getChartData = () => {
    if (!tasks || tasks.length === 0) {
      return [];
    }
    
    if (currentUser?.role === 'director' || currentUser?.role === 'admin') {
      // For directors, admins, and managers: tasks by status
      const statusCounts = {
        completed: tasks.filter(t => t.status === 'completed').length,
        in_progress: tasks.filter(t => t.status === 'in_progress').length,
        pending: tasks.filter(t => t.status === 'pending').length,
      };
      
      return [
        { name: 'Completadas', value: statusCounts.completed },
        { name: 'En progreso', value: statusCounts.in_progress },
        { name: 'Pendentes', value: statusCounts.pending },
      ];
    } else {
      // For workers: hours by task for their tasks
      const taskHours: Record<string, number> = {};
      
      if (!timeEntries || timeEntries.length === 0 || !tasks || tasks.length === 0) {
        return [];
      }
      
      // Group time entries by task
      timeEntries.forEach(entry => {
        // Safe comparison by converting both IDs to strings
        const entryTaskId = String(entry.task_id);
        const task = tasks.find(t => String(t.id) === entryTaskId);
        
        if (task) {
          const taskName = task.title.substring(0, 20) + (task.title.length > 20 ? '...' : '');
          taskHours[taskName] = (taskHours[taskName] || 0) + Number(entry.hours);
        }
      });
      
      return Object.entries(taskHours).map(([name, value]) => ({ 
        name, 
        value,
        formattedValue: formatHoursToTimeFormat(value) // Add formatted value for tooltip
      }));
    }
  };

  // Custom tooltip component to display hours in HH:MM format
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = currentUser?.role === 'director' || currentUser?.role === 'admin' 
        ? data.value 
        : formatHoursToTimeFormat(data.value);
      
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{`${label}`}</p>
          <p>{`${currentUser?.role === 'director' || currentUser?.role === 'admin' ? 'Tarefas' : 'Horas'}: ${value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Análise</CardTitle>
          <CardDescription>
            {currentUser?.role === 'director' || currentUser?.role === 'admin'
              ? 'Estado das tarefas' 
              : 'Horas traballadas por tarefa'}
          </CardDescription>
        </div>
        <BarChart2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-4">
          {!loading ? (
            <ResponsiveContainer width="100%" height="100%">
              {getChartData().length > 0 ? (
                <BarChart data={getChartData()}>
                  <XAxis dataKey="name" />
                  <YAxis 
                    tickFormatter={
                      currentUser?.role === 'worker' 
                        ? (value) => formatHoursToTimeFormat(value)
                        : undefined
                    } 
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    name={currentUser?.role === 'director' || currentUser?.role === 'admin' ? 'Tarefas' : 'Horas'} 
                  />
                </BarChart>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BarChart2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.role === 'director' || currentUser?.role === 'admin'
                      ? 'Non hai datos suficientes para mostrar a análise.' 
                      : 'Non hai horas rexistradas para mostrar.'}
                  </p>
                </div>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
