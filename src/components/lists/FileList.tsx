
import React, { useState } from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { Download, Eye, FileIcon, Trash2, FileImage } from 'lucide-react';
import { deleteTaskAttachment } from '@/utils/fileService';
import { TaskAttachment } from '@/utils/types';
import { format } from 'date-fns';
import { isImageFile, formatFileSize } from '@/utils/fileService';

interface FileListProps {
  taskId: string;
  attachments: TaskAttachment[];
  setAttachments: React.Dispatch<React.SetStateAction<TaskAttachment[]>>;
}

const FileList: React.FC<FileListProps> = ({ taskId, attachments, setAttachments }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [attachmentToDelete, setAttachmentToDelete] = useState<TaskAttachment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Filter attachments for this task
  const filteredAttachments = attachments.filter(attachment => 
    attachment.taskId?.toString() === taskId.toString()
  );

  const handleDeleteClick = (attachment: TaskAttachment) => {
    setAttachmentToDelete(attachment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!attachmentToDelete) return;
    
    try {
      await deleteTaskAttachment(attachmentToDelete.id);
      
      // Update local state
      setAttachments(prev => prev.filter(a => a.id !== attachmentToDelete.id));
      
      toast({
        title: "Éxito",
        description: "Archivo eliminado correctamente",
      });
    } catch (error) {
      console.error('Error al eliminar archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setAttachmentToDelete(null);
    }
  };
  
  const handlePreviewClick = (attachment: TaskAttachment) => {
    if (isImageFile(attachment.name)) {
      setPreviewUrl(attachment.path);
      setPreviewOpen(true);
    } else {
      // For non-image files, just download
      window.open(attachment.path, '_blank');
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  if (filteredAttachments.length === 0) {
    return <p className="text-muted-foreground py-4">No hay archivos adjuntos para esta tarea.</p>;
  }
  
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Tamaño</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead className="w-[120px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAttachments.map((attachment) => (
            <TableRow key={attachment.id}>
              <TableCell>
                {isImageFile(attachment.name) ? (
                  <FileImage className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileIcon className="h-5 w-5 text-gray-500" />
                )}
              </TableCell>
              <TableCell>{attachment.name}</TableCell>
              <TableCell>{formatFileSize(attachment.size)}</TableCell>
              <TableCell>{formatDate(attachment.uploadDate || '')}</TableCell>
              <TableCell className="flex space-x-2">
                {isImageFile(attachment.name) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handlePreviewClick(attachment)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver</span>
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => window.open(attachment.path, '_blank')}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Descargar</span>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDeleteClick(attachment)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                  <span className="sr-only">Eliminar</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este archivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Vista previa</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex justify-center p-4">
            <img 
              src={previewUrl} 
              alt="Vista previa" 
              className="max-h-[70vh] object-contain"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setPreviewOpen(false)}>Cerrar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FileList;
