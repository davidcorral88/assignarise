import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  addTask, 
  addTimeEntry, 
  addUser, 
  getTaskById, 
  getTimeEntriesByUserId, 
  getUserByEmail 
} from '@/utils/apiService';
import { Task, TimeEntry, User } from '@/utils/types';

interface FileUploaderProps {
  onUploadComplete?: () => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showFileDialog?: boolean;
}

export function FileUploader({
  onUploadComplete,
  acceptedFileTypes = ".csv,.xlsx,.json",
  maxFileSizeMB = 10,
  buttonText = "Importar datos",
  variant = "outline",
  size = "default",
  className = "",
  showFileDialog = true
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      setError(`El archivo es demasiado grande. El tamaño máximo es ${maxFileSizeMB}MB.`);
      setFile(null);
      return;
    }
    
    // Check file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    const acceptedTypes = acceptedFileTypes.split(',').map(type => 
      type.startsWith('.') ? type.substring(1) : type
    );
    
    if (fileExtension && !acceptedTypes.includes(fileExtension)) {
      setError(`Tipo de archivo no permitido. Tipos aceptados: ${acceptedFileTypes}`);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
  };

  const processJsonData = async (jsonData: any) => {
    try {
      // Process users
      if (jsonData.users && Array.isArray(jsonData.users)) {
        for (const userData of jsonData.users) {
          // Check if user already exists
          const existingUser = await getUserByEmail(userData.email);
          if (!existingUser) {
            await addUser(userData);
          }
        }
      }
      
      // Process tasks
      if (jsonData.tasks && Array.isArray(jsonData.tasks)) {
        for (const taskData of jsonData.tasks) {
          // Check if task already exists
          const existingTask = await getTaskById(taskData.id);
          if (!existingTask) {
            await addTask(taskData);
          }
        }
      }
      
      // Process time entries
      if (jsonData.timeEntries && Array.isArray(jsonData.timeEntries)) {
        for (const entryData of jsonData.timeEntries) {
          // Check if time entry already exists by checking user's entries
          const userEntries = await getTimeEntriesByUserId(String(entryData.userId));
          const exists = userEntries.some(entry => 
            entry.date === entryData.date && 
            entry.taskId === entryData.taskId &&
            Math.abs(entry.hours - entryData.hours) < 0.01
          );
          
          if (!exists) {
            await addTimeEntry(entryData);
          }
        }
      }
      
      return {
        users: jsonData.users?.length || 0,
        tasks: jsonData.tasks?.length || 0,
        timeEntries: jsonData.timeEntries?.length || 0
      };
    } catch (error) {
      console.error('Error processing JSON data:', error);
      throw new Error('Error al procesar los datos JSON');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 100);
      
      // Read file
      const fileContent = await readFileAsText(file);
      let jsonData;
      
      try {
        jsonData = JSON.parse(fileContent);
      } catch (e) {
        throw new Error('El archivo no contiene JSON válido');
      }
      
      // Process the data
      const result = await processJsonData(jsonData);
      
      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Show success message
      toast({
        title: 'Importación completada',
        description: `Se importaron ${result.users} usuarios, ${result.tasks} tareas y ${result.timeEntries} registros de tiempo.`,
      });
      
      // Close dialog and reset state
      setTimeout(() => {
        setIsDialogOpen(false);
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
        if (onUploadComplete) onUploadComplete();
      }, 1000);
      
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido durante la carga');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Error al leer el archivo'));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsText(file);
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderFileUploadContent = () => (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file-upload" className="text-sm text-muted-foreground mb-1">
          Selecciona un archivo JSON para importar
        </Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex items-center gap-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={triggerFileInput}
            className="flex-1"
            disabled={isUploading}
          >
            <FileText className="mr-2 h-4 w-4" />
            Seleccionar archivo
          </Button>
          <Button 
            type="button" 
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="flex-1"
          >
            <Upload className="mr-2 h-4 w-4" />
            Importar
          </Button>
        </div>
        {file && (
          <p className="text-sm text-muted-foreground mt-2">
            Archivo seleccionado: {file.name}
          </p>
        )}
      </div>
      
      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Procesando datos...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </>
  );

  if (!showFileDialog) {
    return (
      <div className={className}>
        {renderFileUploadContent()}
      </div>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Upload className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Importar datos</DialogTitle>
          <DialogDescription>
            Sube un archivo JSON con datos de usuarios, tareas y registros de tiempo.
          </DialogDescription>
        </DialogHeader>
        
        {renderFileUploadContent()}
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => setIsDialogOpen(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
