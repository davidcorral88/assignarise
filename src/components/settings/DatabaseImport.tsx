
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

    // Verificar que el archivo tenga la extensión correcta
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'json') {
      toast({
        title: "Formato incorrecto",
        description: "O arquivo debe ter a extensión .json",
        variant: "destructive",
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsLoading(true);
    try {
      const fileContent = await file.text();
      
      // Validar que el contenido sea un JSON válido
      try {
        JSON.parse(fileContent);
      } catch (jsonError) {
        throw new Error("El archivo no contiene un JSON válido");
      }
      
      // Implementation for handling the imported data would go here
      // This is just a mock implementation
      
      toast({
        title: "Importación completada",
        description: "Os datos foron importados correctamente",
      });
    } catch (error) {
      toast({
        title: "Error de importación",
        description: error instanceof Error ? error.message : "Non se puideron importar os datos",
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
            Importa datos desde unha copia de seguridade
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
