
import React, { useCallback, useState } from 'react';
import { 
  Upload, 
  File, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  X, 
  Download,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskAttachment } from '@/utils/types';
import { uploadFile, downloadFile, formatFileSize, isImageFile } from '@/utils/fileService';
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
    attachment => attachment.isTaskResolution === isResolution
  );
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !event.target.files.length || !currentUser) {
      return;
    }
    
    setUploading(true);
    
    try {
      const file = event.target.files[0];
      const attachment = await uploadFile(file, taskId, currentUser.id, isResolution);
      onAttachmentAdded(attachment);
      
      toast({
        title: "Archivo cargado",
        description: `${file.name} foi cargado correctamente.`,
      });
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
    downloadFile(attachment);
  }, []);
  
  const handleDelete = useCallback((attachmentId: string) => {
    onAttachmentRemoved(attachmentId);
    
    toast({
      title: "Archivo eliminado",
      description: "O arquivo foi eliminado correctamente.",
    });
  }, [onAttachmentRemoved]);
  
  // Determinar qué ícono mostrar según el tipo de archivo
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) {
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => document.getElementById(`file-upload-${isResolution ? 'resolution' : 'initial'}`).click()}
            disabled={uploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? 'Cargando...' : 'Cargar arquivo'}
          </Button>
          <input
            id={`file-upload-${isResolution ? 'resolution' : 'initial'}`}
            type="file"
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
