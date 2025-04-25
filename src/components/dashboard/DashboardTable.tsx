
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User } from '@/utils/types';
import { Search } from 'lucide-react';

interface TaskWithHours {
  id: number | string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  category?: string;
  project?: string;
  totalHours: number;
  workerHours: Record<number, number>;
  [key: string]: any;
}

interface DashboardTableProps {
  tasks: TaskWithHours[];
  users: User[];
  selectedWorkerId: number | null;
}

export const DashboardTable: React.FC<DashboardTableProps> = ({
  tasks,
  users,
  selectedWorkerId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tasks based on search term and selected worker
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.category?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.project?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no worker is selected or the task has hours for the selected worker
    const matchesWorker = !selectedWorkerId || (task.workerHours[selectedWorkerId] > 0);
    
    return matchesSearch && matchesWorker;
  });
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pendente':
      case 'pendiente':
        return 'bg-yellow-500';
      case 'en progreso':
      case 'en curso':
        return 'bg-blue-500';
      case 'completada':
      case 'completado':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta':
        return 'bg-red-500';
      case 'media':
        return 'bg-orange-500';
      case 'baja':
      case 'baixa':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tareas..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarefa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-right">Horas totales</TableHead>
              {selectedWorkerId && (
                <TableHead className="text-right">
                  Horas {users.find(u => u.id === selectedWorkerId)?.name}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={selectedWorkerId ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No se encontraron tareas que coincidan con los criterios de búsqueda
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map(task => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{task.category || 'Sin categoría'}</TableCell>
                  <TableCell className="text-right font-medium">{task.totalHours}</TableCell>
                  {selectedWorkerId && (
                    <TableCell className="text-right font-medium">
                      {task.workerHours[selectedWorkerId] || 0}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
