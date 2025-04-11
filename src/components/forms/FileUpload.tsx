
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Upload } from 'lucide-react';
import { TaskAttachment } from '@/utils/types';
import { uploadTaskAttachment } from '@/utils/fileService';
import { useAuth } from '@/components/auth/useAuth';
import { toNumericId } from '@/utils/typeUtils';

interface FileUploadProps {
  taskId: string;
  onFileUpload: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ taskId, onFileUpload }) => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Selecciona un archivo para subir",
        variant: "destructive"
      });
      return;
    }
    
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Necesitas iniciar sesión para subir archivos",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const userId = toNumericId(currentUser.id);
      
      if (userId === undefined) {
        throw new Error("ID de usuario inválido");
      }
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('taskId', taskId);
      formData.append('uploadedBy', userId.toString());
      
      await uploadTaskAttachment(formData);
      
      toast({
        title: "Éxito",
        description: "Archivo subido correctamente",
      });
      
      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Notify parent component to refresh attachments
      onFileUpload();
    } catch (error) {
      console.error('Error al subir archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo subir el archivo",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-4 mt-4 border-t pt-4">
      <h4 className="text-sm font-medium">Subir nuevo archivo</h4>
      
      <div className="space-y-2">
        <Label htmlFor="file">Archivo</Label>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            onChange={handleFileChange}
            className="max-w-sm border rounded p-2"
          />
          <Button 
            onClick={handleUpload} 
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Subir
              </>
            )}
          </Button>
        </div>
        {selectedFile && (
          <p className="text-xs text-muted-foreground">
            Archivo seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
