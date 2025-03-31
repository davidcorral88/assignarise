
import React, { useCallback, useState } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  FileSpreadsheet,
  FileLock2,
  X, 
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskAttachment } from '@/utils/types';
import { uploadTaskAttachment, deleteTaskAttachment, formatFileSize } from '@/utils/fileService';
import { 
  Card,
  CardContent
} from '@/components/ui/card';
import { useAuth } from '../auth/AuthContext';
import { toast } from '@/components/ui/use-toast';

interface FileUploaderProps {
  taskId: string;
  attachments: TaskAttachment[];
  isResolution: boolean;
  onAttachmentAdded: (attachment: TaskAttachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
  readOnly?: boolean;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  taskId,
  attachments,
  isResolution,
  onAttachmentAdded,
  onAttachmentRemoved,
  readOnly = false
}) => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  
  // Filtrar los adjuntos según el tipo (inicial o resolución)
  const filteredAttachments = attachments.filter(
    attachment => attachment.isResolution === isResolution
  );
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !currentUser) {
      return;
    }
    
    const file = event.target.files[0];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    // Verificar si el archivo es del tipo permitido (.zip, .rar, .7z)
    const allowedExtensions = ['zip', 'rar', '7z'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Tipo de arquivo non permitido",
        description: "Só se permiten arquivos comprimidos (.zip, .rar, .7z)",
        variant: "destructive",
      });
      // Limpiar el input para permitir cargar el mismo archivo repetidamente
      event.target.value = '';
      return;
    }
    
    setUploading(true);
    
    try {
      const attachment = await uploadTaskAttachment(taskId, file, currentUser.id, isResolution);
      if (attachment) {
        onAttachmentAdded(attachment);
        
        toast({
          title: "Arquivo cargado",
          description: `${file.name} foi cargado correctamente.`,
        });
      }
    } catch (error) {
      console.error('Error al cargar el archivo:', error);
      toast({
        title: "Error",
        description: "Non se puido cargar o arquivo. Inténteo de novo.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Limpiar el input para permitir cargar el mismo archivo repetidamente
      event.target.value = '';
    }
  }, [taskId, currentUser, isResolution, onAttachmentAdded]);
  
  const handleDownload = useCallback((attachment: TaskAttachment) => {
    // Create a direct download link for the attachment
    if (attachment.fileUrl) {
      const link = document.createElement('a');
      link.href = attachment.fileUrl;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      toast({
        title: "Error",
        description: "No se pudo descargar el archivo, URL no disponible",
        variant: "destructive",
      });
    }
  }, []);
  
  const handleDelete = useCallback((attachmentId: string) => {
    deleteTaskAttachment(taskId, attachmentId)
      .then(() => {
        onAttachmentRemoved(attachmentId);
        
        toast({
          title: "Archivo eliminado",
          description: "O arquivo foi eliminado correctamente.",
        });
      })
      .catch(error => {
        console.error('Error al eliminar el archivo:', error);
        toast({
          title: "Error",
          description: "Non se puido eliminar o arquivo.",
          variant: "destructive",
        });
      });
  }, [taskId, onAttachmentRemoved]);
  
  // Determinar qué ícono mostrar según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('zip') || fileType.includes('x-rar') || fileType.includes('x-7z-compressed')) {
      return <FileLock2 className="h-6 w-6 text-purple-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-6 w-6 text-blue-500" />;
    } else if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex flex-col gap-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById(`file-upload-${isResolution ? 'resolution' : 'initial'}`).click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Cargando...' : 'Cargar arquivo comprimido'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Só se permiten arquivos comprimidos (.zip, .rar, .7z)
          </p>
          <input
            id={`file-upload-${isResolution ? 'resolution' : 'initial'}`}
            type="file"
            accept=".zip,.rar,.7z"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>
      )}
      
      {filteredAttachments.length > 0 ? (
        <div className="space-y-2">
          {filteredAttachments.map((attachment) => (
            <Card key={attachment.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.fileType)}
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={attachment.fileName}>
                        {attachment.fileName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.fileSize)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDownload(attachment)}
                      title="Descargar"
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Descargar</span>
                    </Button>
                    
                    {!readOnly && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDelete(attachment.id)}
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Non hai arquivos {isResolution ? 'da resolución' : 'iniciais'} adjuntos.
        </div>
      )}
    </div>
  );
};

export default FileUploader;
