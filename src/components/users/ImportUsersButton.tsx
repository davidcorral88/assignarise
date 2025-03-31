
import React, { useState, useEffect } from 'react';
import { Upload, AlertTriangle, Check, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addUser, getUserById } from '@/utils/dataService';
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
import { useAuth } from '@/components/auth/AuthContext';

interface ImportUsersButtonProps {
  onImportComplete: () => void;
}

const ImportUsersButton: React.FC<ImportUsersButtonProps> = ({ onImportComplete }) => {
  const { currentUser } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [jsonData, setJsonData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPostgreSQLAvailable, setIsPostgreSQLAvailable] = useState(false);
  const isAdmin = currentUser?.role === 'admin';
  
  useEffect(() => {
    const checkPostgreSQL = async () => {
      try {
        const isAvailable = await testPostgreSQLConnection();
        setIsPostgreSQLAvailable(isAvailable);
        
        if (!isAvailable) {
          toast({
            title: "PostgreSQL no disponible",
            description: "No se puede conectar a la base de datos PostgreSQL. Contacte con el administrador.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error al verificar conexión PostgreSQL:", error);
        setIsPostgreSQLAvailable(false);
        
        toast({
          title: "Error de conexión",
          description: "No se puede verificar la conexión a PostgreSQL.",
          variant: "destructive"
        });
      }
    };
    
    checkPostgreSQL();
  }, [isDialogOpen]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
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
    e.target.value = '';
  };

  const validateJsonData = (data: any[]) => {
    const validationErrors: string[] = [];
    
    if (data.length === 0) {
      validationErrors.push('El archivo está vacío.');
      return validationErrors;
    }
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.name) {
        validationErrors.push(`Fila ${i + 1}: Falta el nombre.`);
      }
      if (!row.email) {
        validationErrors.push(`Fila ${i + 1}: Falta el email.`);
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row.email)) {
          validationErrors.push(`Fila ${i + 1}: Email inválido.`);
        }
      }
      if (!row.role || (row.role !== 'worker' && row.role !== 'manager' && row.role !== 'admin' && row.role !== 'director')) {
        validationErrors.push(`Fila ${i + 1}: Rol inválido (debe ser 'worker', 'manager', 'director' o 'admin').`);
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
    
    if (!isPostgreSQLAvailable) {
      toast({
        title: "PostgreSQL no disponible",
        description: "No se puede importar usuarios porque PostgreSQL no está disponible.",
        variant: "destructive"
      });
      setIsDialogOpen(false);
      return;
    }
    
    setIsLoading(true);
    const importResults = {
      success: 0,
      errors: 0,
    };

    for (const item of jsonData) {
      try {
        const newUser: User = {
          id: item.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          email: item.email,
          password: item.password || 'default_password', // Add default password if not provided
          role: item.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0D8ABC&color=fff`,
          organism: item.organism,
          phone: item.phone,
          emailATSXPTPG: item.emailATSXPTPG,
          active: item.active !== false
        };
        
        try {
          console.log(`Importando usuario: ${newUser.name} a PostgreSQL`);
          await addUser(newUser);
          importResults.success++;
        } catch (error) {
          console.error("Error al importar usuario:", error);
          importResults.errors++;
        }
      } catch (error) {
        importResults.errors++;
      }
    }
    
    setIsLoading(false);
    setIsDialogOpen(false);
    
    if (importResults.errors === 0) {
      toast({
        title: "Importación completada",
        description: `Se importaron ${importResults.success} usuarios correctamente a PostgreSQL.`,
      });
    } else {
      toast({
        title: "Importación completada con errores",
        description: `Se importaron ${importResults.success} usuarios. Hubo ${importResults.errors} errores.`,
        variant: "destructive"
      });
    }
    
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
              ¿Desea continuar con la importación a PostgreSQL?
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-blue-50 p-2 rounded text-xs text-blue-700 mb-3">
            Los datos se almacenarán en PostgreSQL.
          </div>
          
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
            <Button onClick={processImport} disabled={isLoading || !isPostgreSQLAvailable} className="ml-2">
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
