
import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';
import { deleteTimeEntry } from '@/utils/dataService';
import { TimeEntry } from '@/utils/types';
import { useAuth } from '@/components/auth/useAuth';
import { toNumericId } from '@/utils/typeUtils';

interface TimeEntryListProps {
  taskId: string;
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
}

const TimeEntryList: React.FC<TimeEntryListProps> = ({ taskId, timeEntries, setTimeEntries }) => {
  const { currentUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
  
  // Filter time entries for this task
  const filteredEntries = timeEntries.filter(entry => 
    entry.task_id.toString() === taskId.toString()
  );

  const handleDeleteClick = (entry: TimeEntry) => {
    setEntryToDelete(entry);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return;
    
    try {
      const entryId = toNumericId(entryToDelete.id);
      
      if (entryId === undefined) {
        throw new Error("ID de entrada no válido");
      }
      
      await deleteTimeEntry(entryId);
      
      // Update local state
      setTimeEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
      
      toast({
        title: "Éxito",
        description: "Registro de tiempo eliminado correctamente",
      });
    } catch (error) {
      console.error('Error al eliminar registro de tiempo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro de tiempo",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setEntryToDelete(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Calculate total hours
  const totalHours = filteredEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
  
  if (filteredEntries.length === 0) {
    return <p className="text-muted-foreground py-4">No hay registros de tiempo para esta tarea.</p>;
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuario</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Horas</TableHead>
            <TableHead>Notas</TableHead>
            <TableHead className="w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEntries.map(entry => (
            <TableRow key={entry.id}>
              <TableCell>{entry.user_id.toString() === currentUser?.id.toString() ? 'Yo' : '-'}</TableCell>
              <TableCell>{formatDate(entry.date)}</TableCell>
              <TableCell>{entry.hours}</TableCell>
              <TableCell>{entry.notes || '-'}</TableCell>
              <TableCell>
                {entry.user_id.toString() === currentUser?.id.toString() && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeleteClick(entry)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell colSpan={2} className="font-medium">Total</TableCell>
            <TableCell className="font-medium">{totalHours}</TableCell>
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este registro de tiempo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TimeEntryList;
