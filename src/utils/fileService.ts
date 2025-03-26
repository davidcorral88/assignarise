
import { TaskAttachment } from './types';

// En una aplicación real, esta función subiría el archivo a un servidor
// En esta implementación de ejemplo, simplemente simula el proceso
export const uploadFile = (file: File, taskId: string, userId: string, isResolution: boolean): Promise<TaskAttachment> => {
  return new Promise((resolve) => {
    // Simular un retardo para la carga
    setTimeout(() => {
      // Crear una URL de objeto para el archivo (solo funcionará durante la sesión)
      const fileUrl = URL.createObjectURL(file);
      
      // Generar un ID único para el adjunto
      const attachmentId = `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Crear el objeto de adjunto
      const attachment: TaskAttachment = {
        id: attachmentId,
        taskId,
        fileName: file.name,
        fileUrl,
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
        isTaskResolution: isResolution
      };
      
      resolve(attachment);
    }, 500);
  });
};

// Función para descargar un archivo adjunto
export const downloadFile = (attachment: TaskAttachment): void => {
  const link = document.createElement('a');
  link.href = attachment.fileUrl;
  link.download = attachment.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Función para obtener el ícono adecuado según el tipo de archivo
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('zip') || fileType.includes('x-rar') || fileType.includes('x-7z-compressed')) {
    return 'file-archive';
  } else if (fileType.includes('image')) {
    return 'image';
  } else if (fileType.includes('pdf')) {
    return 'file-text';
  } else if (fileType.includes('word') || fileType.includes('document')) {
    return 'file-text';
  } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return 'file-spreadsheet';
  } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
    return 'file-presentation';
  } else if (fileType.includes('video')) {
    return 'file-video';
  } else if (fileType.includes('audio')) {
    return 'file-audio';
  } else {
    return 'file';
  }
};

// Función para formatear el tamaño del archivo
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Función para verificar si un tipo de archivo es una imagen
export const isImageFile = (fileType: string): boolean => {
  return fileType.includes('image');
};

// Función para verificar si un tipo de archivo es comprimido (.zip, .rar, .7z)
export const isCompressedFile = (fileType: string): boolean => {
  return fileType.includes('zip') || fileType.includes('x-rar') || fileType.includes('x-7z-compressed');
};

// En el futuro, aquí se implementarían funciones para integrar con servicios de almacenamiento como S3, Firebase, etc.
