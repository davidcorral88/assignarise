
import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Timer, PlusCircle, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TimeEntry, User } from '@/utils/types';
import { UserAvatar } from './UserAvatar';
import { toast } from '@/components/ui/use-toast';
import { deleteTimeEntry } from '@/utils/dataService';

interface TimeEntryListProps {
  taskId: string;
  timeEntries: TimeEntry[];
  assignedUsers: Record<string, User | null>;
  currentUserId?: number;
  currentUserRole?: string;
  isAssignedToCurrentUser: boolean;
  onEntryDeleted?: () => void;
}

export const TimeEntryList: React.FC<TimeEntryListProps> = ({
  taskId,
  timeEntries,
  assignedUsers,
  currentUserId,
  currentUserRole,
  isAssignedToCurrentUser,
  onEntryDeleted
}) => {
  const navigate = useNavigate();
  
  const handleDeleteEntry = async (entryId: string | number) => {
    if (window.confirm('¿Estás seguro de querer eliminar este registro de horas?')) {
      try {
        await deleteTimeEntry(entryId);
        toast({
          title: 'Registro eliminado',
          description: 'El registro de horas ha sido eliminado correctamente'
        });
        if (onEntryDeleted) {
          onEntryDeleted();
        }
      } catch (error) {
        console.error('Error deleting time entry:', error);
        toast({
          title: 'Error',
          description: 'No se pudo eliminar el registro',
          variant: 'destructive'
        });
      }
    }
  };
  
  if (timeEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Timer className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">No hay horas registradas para esta tarea</p>
        {currentUserRole === 'worker' && isAssignedToCurrentUser && (
          <Button onClick={() => navigate('/time-tracking')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Registrar horas
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {timeEntries.map(entry => {
        const user = assignedUsers[entry.user_id];
        return (
          <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-3 flex-1">
              <UserAvatar user={user} />
              <div>
                <p className="font-medium">{user?.name || 'Usuario desconocido'}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(entry.date), 'dd/MM/yyyy')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{entry.hours} horas</Badge>
              {entry.notes && (
                <p className="text-sm text-muted-foreground">
                  "{entry.notes}"
                </p>
              )}
              {currentUserId === entry.user_id && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6" 
                  onClick={() => handleDeleteEntry(entry.id)}
                >
                  <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
