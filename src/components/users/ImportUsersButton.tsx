
import React, { useState } from 'react';
import { Upload, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addUser, getUserById } from '@/utils/mockData';
import { User } from '@/utils/types';
import { toast } from '@/components/ui/use-toast';
import * as XLSX from 'xlsx';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImportUsersButtonProps {
  onImportComplete: () => void;
}

const ImportUsersButton: React.FC<ImportUsersButtonProps> = ({ onImportComplete }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [excelData, setExcelData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file type
    const fileType = file.name.split('.').pop()?.toLowerCase();
    if (fileType !== 'xlsx' && fileType !== 'xls') {
      setErrors(['El archivo debe ser de tipo Excel (.xlsx o .xls)']);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const binaryString = event.target?.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        setExcelData(data);
        setIsDialogOpen(true);
      } catch (error) {
        setErrors(['Error al procesar el archivo Excel. Compruebe el formato.']);
      }
    };
    
    reader.readAsBinaryString(file);
    // Reset input value so the same file can be selected again
    e.target.value = '';
  };

  const validateExcelData = (data: any[]) => {
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
    }
    
    return validationErrors;
  };

  const processImport = async () => {
    const validationErrors = validateExcelData(excelData);
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
    for (const row of excelData) {
      try {
        const newUser: User = {
          id: row.id || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID if not provided
          name: row.name,
          email: row.email,
          role: row.role,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name)}&background=0D8ABC&color=fff`
        };
        
        // Check if user with this email already exists
        const existingUser = getUserById(row.id);
        if (existingUser) {
          // If user exists, we could update it here
          // For now, just count as error
          importResults.errors++;
          continue;
        }
        
        addUser(newUser);
        importResults.success++;
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
        description: `Se importaron ${importResults.success} usuarios correctamente.`,
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
          accept=".xlsx, .xls"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileUpload}
        />
        <Button variant="outline" className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Importar Excel
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
              Se encontraron {excelData.length} registros en el archivo Excel.
              ¿Desea continuar con la importación?
            </DialogDescription>
          </DialogHeader>
          
          <div className="max-h-60 overflow-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="p-2 text-left">Nombre</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Rol</th>
                </tr>
              </thead>
              <tbody>
                {excelData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2">{row.email}</td>
                    <td className="p-2">{row.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {excelData.length > 10 && (
              <div className="p-2 text-center text-muted-foreground">
                Y {excelData.length - 10} más...
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
