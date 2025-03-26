
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';

export const DatabaseImport: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      
      // Implementation for handling the imported data would go here
      // This is just a mock implementation
      
      toast({
        title: "Importación completada",
        description: "Los datos se han importado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error de importación",
        description: "No se pudieron importar los datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Importar datos</h3>
          <p className="text-sm text-muted-foreground">
            Importa datos desde una copia de seguridad
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />
        <Button 
          variant="outline" 
          onClick={handleImportClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <span>Importando...</span>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
