
import React, { useState, useEffect } from 'react';
import { Upload, AlertTriangle, Check, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addUser, getUserById } from '@/utils/mockData';
import { User } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { testPostgreSQLConnection } from '@/utils/migrationService';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ImportUsersButtonProps {
  onImportComplete: () => void;
}

const ImportUsersButton: React.FC<ImportUsersButtonProps> = ({ onImportComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [usePostgreSQL, setUsePostgreSQL] = useState(false);
  const [isPostgreSQLAvailable, setIsPostgreSQLAvailable] = useState(false);
  
  useEffect(() => {
    // Verificar si PostgreSQL está disponible
    const checkPostgreSQL = async () => {
      const isAvailable = await testPostgreSQLConnection();
      setIsPostgreSQLAvailable(isAvailable);
    };
    
    checkPostgreSQL();
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'json') {
      setErrors(['El archivo debe ser de tipo JSON (.json)']);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const data = JSON.parse(jsonContent);
        
        if (Array.isArray(data)) {
          setJsonData(data);
          setIsDialogOpen(true);
        } else {
          setErrors(['El archivo JSON debe contener un array de usuarios']);
        }
      } catch (error) {
        setErrors(['Error al procesar el archivo JSON. Compruebe el formato.']);
      }
    };
    
    reader.readAsText(file);
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const validateJsonData = (data: any[]) => {
    const validationErrors: string[] = [];
    
    // Check if required headers exist
    if (data.length === 0) {
      validationErrors.push('El archivo está vacío.');
      return validationErrors;
    }
    
    // Verify basic data structure
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.name) {
        validationErrors.push(`Fila ${i + 1}: Falta el nombre.`);
      }
      if (!row.email) {
        validationErrors.push(`Fila ${i + 1}: Falta el email.`);
      } else {
        // Simple email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          validationErrors.push(`Fila ${i + 1}: Email inválido.`);
        }
      }
      if (!row.role || (row.role !== 'worker' && row.role !== 'manager')) {
        validationErrors.push(`Fila ${i + 1}: Rol inválido (debe ser 'worker' o 'manager').`);
      }
      if (row.organism && row.organism !== 'Xunta' && row.organism !== 'iPlan') {
        validationErrors.push(`Fila ${i + 1}: Organismo inválido (debe ser 'Xunta' o 'iPlan').`);
      }
      if (row.emailATSXPTPG) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.emailATSXPTPG)) {
          validationErrors.push(`Fila ${i + 1}: Email ATSXPTPG inválido.`);
        }
      }
    }
    
    return validationErrors;
  };

  const processImport = async () => {
    const validationErrors = validateJsonData(jsonData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsLoading(true);
    const importResults = {
      success: 0,
      errors: 0,
    };

    // Process each row of data
    for (const item of jsonData) {
      try {
        const newUser: User = {
          id: item.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          email: item.email,
          role: item.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0D8ABC&color=fff`,
          organism: item.organism,
          phone: item.phone,
          emailATSXPTPG: item.emailATSXPTPG
        };
        
        if (usePostgreSQL) {
          // Importar a PostgreSQL
          try {
            const response = await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(newUser)
            });
            
            if (response.ok) {
              importResults.success++;
            } else {
              importResults.errors++;
            }
          } catch (error) {
            console.error("Error al importar usuario a PostgreSQL:", error);
            importResults.errors++;
          }
        } else {
          // Importar a localStorage
          // Check if user with this email already exists
          const existingUser = getUserById(item.id);
          if (existingUser) {
            importResults.errors++;
            continue;
          }
          
          addUser(newUser);
          importResults.success++;
        }
      } catch (error) {
        importResults.errors++;
      }
    }
    
    // Close dialog and notify results
    setIsLoading(false);
    setIsDialogOpen(false);
    
    if (importResults.errors === 0) {
      toast({
        title: "Importación completada",
        description: `Se importaron ${importResults.success} usuarios correctamente${usePostgreSQL ? ' a PostgreSQL' : ''}.`,
      });
    } else {
      toast({
        title: "Importación completada con errores",
        description: `Se importaron ${importResults.success} usuarios. Hubo ${importResults.errors} errores.`,
        variant: "destructive"
      });
    }
    
    // Notify parent component to refresh user list
    onImportComplete();
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          accept=".json"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
        <Button variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Importar JSON
        </Button>
      </div>
      
      {errors.length > 0 && (
        <div className="mt-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-destructive mr-2 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">Errores de validación:</p>
              <ul className="mt-1 text-sm list-disc pl-5">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Importar usuarios</DialogTitle>
            <DialogDescription>
              Se encontraron {jsonData.length} registros en el archivo JSON.
              ¿Desea continuar con la importación?
            </DialogDescription>
          </DialogHeader>
          
          {isPostgreSQLAvailable && (
            <div className="flex items-center space-x-2 mb-4">
              <Switch
                id="use-postgresql"
                checked={usePostgreSQL}
                onCheckedChange={setUsePostgreSQL}
              />
              <Label htmlFor="use-postgresql" className="flex items-center cursor-pointer">
                <Database className="h-4 w-4 mr-2" />
                Importar directamente a PostgreSQL
              </Label>
            </div>
          )}
          
          <div className="max-h-60 overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-left">Nome</th>
                  <th className="p-2 text-left">Teléfono</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Rol</th>
                </tr>
              </thead>
              <tbody>
                {jsonData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.phone || '-'}</td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jsonData.length > 10 && (
              <div className="p-2 text-center text-muted-foreground">
                Y {jsonData.length - 10} más...
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={processImport} disabled={isLoading} className="ml-2">
              {isLoading ? (
                <>
                  <span className="mr-2">Importando...</span>
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirmar importación
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImportUsersButton;
