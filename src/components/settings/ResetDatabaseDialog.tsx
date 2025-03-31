
import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { resetDatabase } from '@/utils/dataService';

interface ResetDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const ResetDatabaseDialog: React.FC<ResetDatabaseDialogProps> = ({ 
  open, 
  onOpenChange,
  onConfirm 
}) => {
  const handleReset = async () => {
    try {
      resetDatabase();
      toast({
        title: "Base de datos reiniciada",
        description: "Todos los datos han sido eliminados correctamente",
      });
      onConfirm();
    } catch (error) {
      console.error('Error al reiniciar la base de datos:', error);
      toast({
        title: "Error al reiniciar",
        description: "No se pudo reiniciar la base de datos",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción elimina todos los datos de la aplicación. No es posible recuperarlos una vez eliminados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset}>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
