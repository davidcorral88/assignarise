
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/utils/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface DashboardHeaderProps {
  currentUser: User;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-muted-foreground mt-1">
          Benvido/a, {currentUser?.name}. {currentUser?.role === 'worker' ? 'Aquí tes as túas tarefas asignadas.' : 'Aquí tes un resumo de todas as tarefas.'}
        </p>
      </div>
      <Button 
        className="mt-4 md:mt-0" 
        onClick={() => navigate('/tasks/new')}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Nova tarefa
      </Button>
    </div>
  );
};
