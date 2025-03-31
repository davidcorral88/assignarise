
import { TaskAttachment } from './types';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import * as apiService from './apiService';

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isImageFile = (fileName: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  return imageExtensions.includes(ext);
};

export const uploadFile = async (file: File, userId: string, isResolution: boolean = false): Promise<TaskAttachment> => {
  return await uploadTaskAttachment('temp', file, userId, isResolution);
};

export const downloadFile = async (fileUrl: string, fileName: string): Promise<void> => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
    toast({
      title: 'Error al descargar archivo',
      description: 'No se pudo descargar el archivo solicitado',
      variant: 'destructive',
    });
  }
};

// Función para subir un archivo adjunto a una tarea
export const uploadTaskAttachment = async (
  taskId: string,
  file: File,
  userId: string,
  isResolution: boolean
): Promise<TaskAttachment | null> => {
  try {
    return await apiService.uploadTaskAttachment(taskId, file, userId, isResolution);
  } catch (error) {
    console.error('Error al subir archivo:', error);
    
    // Como fallback, crear un attachment local pero indicar que falló
    const attachment: TaskAttachment = {
      id: uuidv4(),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date().toISOString(),
      uploadedBy: userId,
      isResolution,
      fileUrl: URL.createObjectURL(file),
      taskId: taskId
    };
    
    toast({
      title: 'Error al subir archivo',
      description: 'No se pudo subir el archivo al servidor. Se creará una referencia local temporal.',
      variant: 'destructive',
    });
    
    return attachment;
  }
};

// Función para eliminar un archivo adjunto de una tarea
export const deleteTaskAttachment = async (
  taskId: string,
  attachmentId: string
): Promise<boolean> => {
  try {
    await apiService.deleteTaskAttachment(taskId, attachmentId);
    
    toast({
      title: 'Archivo eliminado',
      description: 'El archivo ha sido eliminado correctamente',
    });
    
    return true;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    
    toast({
      title: 'Error al eliminar archivo',
      description: 'No se pudo eliminar el archivo del servidor',
      variant: 'destructive',
    });
    
    return false;
  }
};

// Función para obtener los adjuntos de una tarea
export const getTaskAttachments = async (taskId: string): Promise<TaskAttachment[]> => {
  try {
    return await apiService.getTaskAttachments(taskId);
  } catch (error) {
    console.error('Error al obtener archivos adjuntos:', error);
    
    toast({
      title: 'Error al cargar archivos',
      description: 'No se pudieron cargar los archivos adjuntos',
      variant: 'destructive',
    });
    
    return [];
  }
};
