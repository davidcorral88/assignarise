
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Clock, Eye, Search, ChartLineUp, ChartLine } from 'lucide-react';
import { Task } from '@/utils/types';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

interface TaskProgress {
  worked: number;
  allocated: number;
  percentage: number;
}

interface TaskHoursSummaryProps {
  tasks: Task[];
  taskProgress: Record<string, TaskProgress>;
  formatHoursToDecimal: (hours: number) => string;
}

export const TaskHoursSummary: React.FC<TaskHoursSummaryProps> = ({
  tasks,
  taskProgress,
  formatHoursToDecimal
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Sort tasks by hours worked and take top 10
  const sortedTasks = tasks
    .sort((a, b) => {
      const aProgress = taskProgress[typeof a.id === 'string' ? a.id : String(a.id)]?.worked || 0;
      const bProgress = taskProgress[typeof b.id === 'string' ? b.id : String(b.id)]?.worked || 0;
      return bProgress - aProgress;
    })
    .slice(0, 10);

  // Filter tasks based on search
  const filteredTasks = tasks.filter(task => {
    const taskId = typeof task.id === 'string' ? task.id : String(task.id);
    const searchLower = searchQuery.toLowerCase();
    return (
      taskId.toLowerCase().includes(searchLower) ||
      task.title.toLowerCase().includes(searchLower)
    );
  });

  // Use filtered tasks if there's a search query, otherwise use sorted tasks
  const displayedTasks = searchQuery ? filteredTasks : sortedTasks;

  // Simular datos de progreso xeral para todas as tarefas
  // Nunha implementación real, estes datos virían da API
  const getGeneralTaskProgress = (taskId: string): TaskProgress => {
    // Por defecto, simulamos valores para o progreso xeral que sexan diferentes ao progreso do usuario
    const userProgress = taskProgress[taskId] || { worked: 0, allocated: 0, percentage: 0 };
    
    // Creamos uns valores simulados para o progreso xeral da tarefa
    // nunha aplicación real, isto viría da base de datos
    const basedOnUserProgress = userProgress.percentage;
    const variation = Math.floor(Math.random() * 30) - 15; // Variación entre -15% e +15%
    const generalPercentage = Math.max(0, Math.min(100, basedOnUserProgress + variation));
    
    // Calculamos horas traballadas e asignadas baseándonos na porcentaxe
    const generalAllocated = userProgress.allocated * 2.5; // Asumimos que a asignación total é maior
    const generalWorked = (generalPercentage / 100) * generalAllocated;
    
    return {
      worked: generalWorked,
      allocated: generalAllocated,
      percentage: generalPercentage
    };
  };

  const chartConfig = {
    user: { label: "Usuario", theme: { light: "#2563eb", dark: "#3b82f6" } },
    general: { label: "Equipo", theme: { light: "#059669", dark: "#10b981" } }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolución das tarefas asignadas</CardTitle>
        <CardDescription>
          Visualiza o progreso das túas horas en cada tarefa asignada
        </CardDescription>
        <div className="flex items-center space-x-2 mt-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por ID ou nome da tarefa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <ChartContainer config={chartConfig} className="h-12">
            <ChartLegend>
              <ChartLegendContent />
            </ChartLegend>
          </ChartContainer>
        </div>
        
        <div className="space-y-6">
          {displayedTasks.length > 0 ? (
            displayedTasks.map(task => {
              const taskId = typeof task.id === 'string' ? task.id : String(task.id);
              const userProgress = taskProgress[taskId] || { worked: 0, allocated: 0, percentage: 0 };
              const generalProgress = getGeneralTaskProgress(taskId);
              
              return (
                <div key={task.id} className="p-4 rounded-lg border bg-muted/30">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg mb-1">{task.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1.5 h-4 w-4" />
                        <span>
                          Estado: {task.status === 'completed' ? 'Completada' : task.status === 'in_progress' ? 'En progreso' : 'Pendente'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:items-end">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/tasks/${taskId}`)}>
                        <Eye className="mr-2 h-3 w-3" />
                        Ver detalles
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    {/* Progreso do usuario */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 bg-primary rounded-sm mr-2"></div>
                          <span>Progreso persoal: {userProgress.percentage}%</span>
                        </div>
                        <span>
                          {formatHoursToDecimal(userProgress.worked)} / 
                          {formatHoursToDecimal(userProgress.allocated)} horas
                        </span>
                      </div>
                      <Progress value={userProgress.percentage} className="h-2 bg-secondary" />
                    </div>
                    
                    {/* Progreso xeral da tarefa */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm items-center">
                        <div className="flex items-center">
                          <div className="h-2.5 w-2.5 bg-green-500 rounded-sm mr-2"></div>
                          <span>Progreso do equipo: {generalProgress.percentage}%</span>
                        </div>
                        <span>
                          {formatHoursToDecimal(generalProgress.worked)} / 
                          {formatHoursToDecimal(generalProgress.allocated)} horas
                        </span>
                      </div>
                      <Progress value={generalProgress.percentage} className="h-2 bg-secondary" indicator="bg-green-500" />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Non se atoparon tarefas que coincidan coa búsqueda' : 'Non tes tarefas asignadas'}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
