
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { CheckSquare, Clock, Users } from 'lucide-react';

// Importamos los componentes nuevos
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentTasksList } from '../components/dashboard/RecentTasksList';
import { AnalyticsChart } from '../components/dashboard/AnalyticsChart';
import { ErrorDisplay } from '../components/dashboard/ErrorDisplay';
import { useDashboardData } from '../utils/hooks/useDashboardData';
import { formatHoursToTimeFormat } from '../utils/timeUtils';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Utilizamos el hook personalizado para obtener los datos
  const { userTasks, userTimeEntries, userCount, loading, error } = useDashboardData({ currentUser });
  
  // Si no hay usuario (no autenticado), mostrar estado de carga hasta que ocurra la redirección
  if (!currentUser) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }
  
  // Estado de error
  if (error && !loading) {
    return (
      <Layout>
        <div className="space-y-8">
          <DashboardHeader currentUser={currentUser} />
          <ErrorDisplay error={error} />
        </div>
      </Layout>
    );
  }
  
  // Calculate total hours registered
  const totalHoursRegistered = userTimeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
  const formattedTotalHours = formatHoursToTimeFormat(totalHoursRegistered);
  
  return (
    <Layout>
      <div className="space-y-8 animate-fade-in">
        <DashboardHeader currentUser={currentUser} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard 
            title="Tarefas totais"
            value={userTasks.length}
            icon={<CheckSquare className="h-4 w-4 text-muted-foreground" />}
            description={currentUser?.role === 'worker'
              ? 'Tarefas asignadas a ti'
              : 'Todas as tarefas no sistema'}
          />
          
          <StatCard 
            title="En progreso"
            value={userTasks.filter(task => task.status === 'in_progress').length}
            icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            description="Tarefas actualmente en progreso"
          />
          
          {(currentUser?.role === 'director' || currentUser?.role === 'admin') ? (
            <StatCard 
              title="Usuarios"
              value={userCount}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              description="Usuarios rexistrados no sistema"
            />
          ) : (
            <StatCard 
              title="Horas rexistradas"
              value={formattedTotalHours}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
              description="Total de horas rexistradas"
            />
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentTasksList 
            tasks={userTasks}
            loading={loading}
            currentUser={currentUser}
          />
          
          <AnalyticsChart 
            currentUser={currentUser}
            tasks={userTasks}
            timeEntries={userTimeEntries}
            loading={loading}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
