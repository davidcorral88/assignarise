
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TasksChart } from '@/components/dashboard/TasksChart';
import { HoursPerWorkerChart } from '@/components/dashboard/HoursPerWorkerChart';
import { HoursByCategoryChart } from '@/components/dashboard/HoursByCategoryChart';
import { WorkerSelector } from '@/components/dashboard/WorkerSelector';
import { DashboardControls } from '@/components/dashboard/DashboardControls';
import { DashboardTable } from '@/components/dashboard/DashboardTable';
import { useQuery } from '@tanstack/react-query';
import * as apiService from '@/utils/apiService';
import { User, TimeEntry, Task } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { addDays, subDays, format } from 'date-fns';

const TaskDashboard = () => {
  const [selectedWorker, setSelectedWorker] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  // Fetch all users
  const { 
    data: users, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const allUsers = await apiService.getUsers();
      return allUsers.filter(user => user.role !== 'admin'); // Filter out admins
    }
  });

  // Fetch time entries based on date range and selected worker
  const { 
    data: timeEntries, 
    isLoading: entriesLoading, 
    error: entriesError 
  } = useQuery({
    queryKey: ['timeEntries', dateRange, selectedWorker],
    queryFn: async () => {
      const startDate = format(dateRange.from, 'yyyy-MM-dd');
      const endDate = format(dateRange.to, 'yyyy-MM-dd');
      
      if (selectedWorker) {
        return await apiService.getTimeEntriesByUserId(selectedWorker, startDate, endDate);
      } else {
        return await apiService.getTimeEntries(startDate, endDate);
      }
    }
  });
  
  // Fetch tasks data
  const { 
    data: tasks, 
    isLoading: tasksLoading, 
    error: tasksError 
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiService.getTasks
  });
  
  const isLoading = usersLoading || entriesLoading || tasksLoading;
  const hasError = usersError || entriesError || tasksError;
  
  // Calculate task data by worker for chart
  const getHoursByWorker = () => {
    if (!timeEntries || !users) return [];
    
    const hoursByWorker = users.map(user => {
      const userEntries = timeEntries.filter(entry => entry.user_id === user.id);
      const totalHours = userEntries.reduce((sum, entry) => sum + parseFloat(entry.hours.toString()), 0);
      
      return {
        name: user.name,
        hours: parseFloat(totalHours.toFixed(2)),
        id: user.id
      };
    }).sort((a, b) => b.hours - a.hours); // Sort by hours descending
    
    return hoursByWorker;
  };
  
  // Calculate hours by category for the pie chart
  const getHoursByCategory = () => {
    if (!timeEntries || !tasks) return [];
    
    const categories: Record<string, number> = {};
    
    timeEntries.forEach(entry => {
      const task = tasks.find(t => t.id === entry.task_id);
      const category = task?.category || 'Sin categoría';
      
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += parseFloat(entry.hours.toString());
    });
    
    return Object.keys(categories).map(category => ({
      name: category,
      value: parseFloat(categories[category].toFixed(2))
    }));
  };
  
  // Get the tasks with hours data for the table
  const getTasksWithHours = () => {
    if (!timeEntries || !tasks || !users) return [];
    
    return tasks.map(task => {
      const taskEntries = timeEntries.filter(entry => entry.task_id === task.id);
      const totalHours = taskEntries.reduce((sum, entry) => sum + parseFloat(entry.hours.toString()), 0);
      
      const workerHours: Record<number, number> = {};
      taskEntries.forEach(entry => {
        if (!workerHours[entry.user_id]) {
          workerHours[entry.user_id] = 0;
        }
        workerHours[entry.user_id] += parseFloat(entry.hours.toString());
      });
      
      return {
        ...task,
        totalHours: parseFloat(totalHours.toFixed(2)),
        workerHours
      };
    });
  };
  
  if (hasError) {
    return (
      <Layout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error al cargar los datos del cuadro de mando. Por favor, inténtelo de nuevo más tarde.
          </AlertDescription>
        </Alert>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cuadro de Mando</h1>
          <p className="text-muted-foreground">
            Visualización de datos sobre tarefas e horas rexistradas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full md:w-1/2">
                  <WorkerSelector 
                    users={users || []}
                    selectedWorkerId={selectedWorker}
                    onSelect={setSelectedWorker}
                    isLoading={isLoading}
                  />
                </div>
                <div className="w-full md:w-1/2">
                  <DateRangePicker 
                    date={dateRange}
                    setDate={setDateRange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Exportar</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardControls 
                data={getTasksWithHours()} 
                users={users || []}
                dateRange={dateRange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Horas por Traballador</CardTitle>
              <CardDescription>Distribución de horas rexistradas por cada traballador</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <HoursPerWorkerChart data={getHoursByWorker()} />
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Horas por Categoría</CardTitle>
              <CardDescription>Distribución de horas según la categoría de las tarefas</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {isLoading ? (
                <Skeleton className="w-full h-full" />
              ) : (
                <HoursByCategoryChart data={getHoursByCategory()} />
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Rexistro de tarefas</CardTitle>
            <CardDescription>
              {selectedWorker && users ? 
                `Tarefas asignadas a ${users.find(u => u.id === selectedWorker)?.name}` : 
                'Todas las tarefas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="w-full h-96" />
            ) : (
              <DashboardTable 
                tasks={getTasksWithHours()} 
                users={users || []}
                selectedWorkerId={selectedWorker}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TaskDashboard;
