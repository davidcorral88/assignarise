
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { resetDatabase } from '@/utils/dataService';

export const ResetDatabaseButton3 = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (confirm('¿Estás seguro de que quieres restablecer la base de datos? Esta operación no se puede deshacer.')) {
      setIsLoading(true);
      try {
        await resetDatabase('reset_controldetarefas3');
        toast({
          title: 'Base de datos restablecida',
          description: 'La base de datos ha sido restablecida correctamente con la versión 3.',
          variant: 'default',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Ha ocurrido un error al restablecer la base de datos.',
          variant: 'destructive',
        });
        console.error('Error al restablecer la base de datos:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Button 
      variant="destructive" 
      onClick={handleReset} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Restableciendo...' : 'Restablecer Base de Datos (v3)'}
    </Button>
  );
};
