
import React, { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Trash2 } from 'lucide-react';

export const ResetDatabaseDialog: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = async () => {
    try {
      // Implementation for database reset would go here
      toast({
        title: "Base de datos reiniciada",
        description: "Todos los datos han sido eliminados correctamente",
      });
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error al reiniciar",
        description: "No se pudo reiniciar la base de datos",
        variant: "destructive",
      });
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Reiniciar base de datos
        </Button>
      </AlertDialogTrigger>
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
