
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload, FileText, AlertCircle, Trash2, File, FileX } from 'lucide-react';
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
import { Task, TimeEntry, User, TaskAttachment } from '@/utils/types';
import { v4 as uuidv4 } from 'uuid';

interface FileUploaderProps {
  onUploadComplete?: () => void;
  acceptedFileTypes?: string;
  maxFileSizeMB?: number;
  buttonText?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showFileDialog?: boolean;
  // New props for task attachments
  taskId?: string;
  attachments?: TaskAttachment[];
  isResolution?: boolean;
  onAttachmentAdded?: (attachment: TaskAttachment) => void;
  onAttachmentRemoved?: (attachmentId: string) => void;
  readOnly?: boolean;
}

export function FileUploader({
  onUploadComplete,
  acceptedFileTypes = ".csv,.xlsx,.json",
  maxFileSizeMB = 10,
  buttonText = "Importar datos",
  variant = "outline",
  size = "default",
  className = "",
  showFileDialog = true,
  // New props with defaults
  taskId,
  attachments = [],
  isResolution = false,
  onAttachmentAdded,
  onAttachmentRemoved,
  readOnly = false
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter attachments based on isResolution
  const filteredAttachments = attachments.filter(
    attachment => attachment.isResolution === isResolution
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      setFile(null);
      return;
    }
    
    // Check file size
    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      setError(`O arquivo é demasiado grande. O tamaño máximo é ${maxFileSizeMB}MB.`);
      setFile(null);
      return;
    }
    
    // Check file type if specified
    if (acceptedFileTypes !== "*") {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      const acceptedTypes = acceptedFileTypes.split(',').map(type => 
        type.startsWith('.') ? type.substring(1) : type
      );
      
      if (fileExtension && !acceptedTypes.includes(fileExtension)) {
        setError(`Tipo de archivo non permitido. Tipos aceptados: ${acceptedFileTypes}`);
        setFile(null);
        return;
      }
    }
    
    setFile(selectedFile);
  };

  // Function to handle task attachment upload
  const handleTaskAttachmentUpload = async () => {
    if (!file || !taskId || !onAttachmentAdded) {
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 50);
      
      // In a real app, this would upload to a server
      // For demo, we'll simulate upload and create attachment object
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Create attachment object
      const newAttachment: TaskAttachment = {
        id: uuidv4(),
        fileName: file.name,
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        uploadedBy: 1, // Use current user ID
        isResolution: isResolution,
        fileUrl: URL.createObjectURL(file),
        fileType: file.type,
        taskId: taskId
      };
      
      // Call the callback
      onAttachmentAdded(newAttachment);
      
      toast({
        title: 'Arquivo engadido',
        description: 'O arquivo foi engadido correctamente á tarefa.',
      });
      
      // Reset form
      setFile(null);
      setIsUploading(false);
      setUploadProgress(0);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error uploading attachment:', error);
      setError('Ocorreu un erro ao subir o arquivo');
      setIsUploading(false);
      setUploadProgress(0);
    }
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
    
    // If this is a task attachment upload
    if (taskId && onAttachmentAdded) {
      await handleTaskAttachmentUpload();
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

  const handleRemoveAttachment = (attachmentId: string) => {
    if (onAttachmentRemoved) {
      onAttachmentRemoved(attachmentId);
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

  // Render attachment list
  const renderAttachments = () => {
    if (filteredAttachments.length === 0) {
      return (
        <div className="text-center py-4 text-muted-foreground">
          Non hai arquivos {isResolution ? 'de resolución' : ''} adxuntos.
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-4">
        {filteredAttachments.map(attachment => (
          <div 
            key={attachment.id} 
            className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <File className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">{attachment.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.fileSize)} • {formatDate(attachment.uploadDate)}
                </p>
              </div>
            </div>
            {!readOnly && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveAttachment(attachment.id)}
                className="h-8 w-8 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Helper functions
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const renderFileUploadContent = () => (
    <>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="file-upload" className="text-sm text-muted-foreground mb-1">
          {taskId 
            ? `Selecciona un arquivo para adxuntar ${isResolution ? '(resolución)' : ''}`
            : 'Selecciona un archivo JSON para importar'
          }
        </Label>
        <Input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileChange}
          className="hidden"
          disabled={readOnly}
        />
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={triggerFileInput}
              className="flex-1"
              disabled={isUploading || readOnly}
            >
              <FileText className="mr-2 h-4 w-4" />
              Seleccionar arquivo
            </Button>
            <Button 
              type="button" 
              onClick={handleUpload}
              disabled={!file || isUploading || readOnly}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              {taskId ? 'Adxuntar' : 'Importar'}
            </Button>
          </div>
        )}
        {file && (
          <p className="text-sm text-muted-foreground mt-2">
            Arquivo seleccionado: {file.name}
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

      {/* Render attachments list if this is for task attachments */}
      {taskId && renderAttachments()}
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
