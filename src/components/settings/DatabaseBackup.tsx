
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Download } from 'lucide-react';

export const DatabaseBackup: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      // Implementation for backup creation would go here
      
      // Create a mock backup for demonstration
      const data = localStorage;
      const backup = JSON.stringify(data);
      
      // Create a blob and download it
      const blob = new Blob([backup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Copia de seguridad creada",
        description: "Se ha descargado la copia de seguridad en su dispositivo",
      });
    } catch (error) {
      toast({
        title: "Error de respaldo",
        description: "No se pudo crear la copia de seguridad",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Copia de seguridad</h3>
          <p className="text-sm text-muted-foreground">
            Descarga una copia de seguridad de todos los datos
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleBackup}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Creando...</span>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
