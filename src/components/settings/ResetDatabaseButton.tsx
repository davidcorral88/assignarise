
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { resetDatabase } from '@/utils/dataService';
import { TrashIcon, AlertOctagon } from 'lucide-react';

export const ResetDatabaseDialog: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = async () => {
    setIsSubmitting(true);
    try {
      resetDatabase();
      toast({
        title: 'Base de datos restablecida',
        description: 'Todos los datos han sido eliminados correctamente.',
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo restablecer la base de datos.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <TrashIcon className="mr-2 h-4 w-4" />
          Restablecer base de datos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center text-destructive">
            <AlertOctagon className="mr-2 h-5 w-5" />
            Confirmar restablecimiento
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente todos los datos de la aplicación. Esta operación no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleReset}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isSubmitting ? 'Restableciendo...' : 'Sí, restablecer todo'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ResetDatabaseDialog;
