
/**
 * Servicio mejorado para gestionar el almacenamiento en localStorage
 * con mejor manejo de errores y opciones de compresión
 */

import { toast } from '@/components/ui/use-toast';

// Tamaño máximo aproximado de localStorage (4.5MB para ser conservadores)
const MAX_STORAGE_SIZE = 4.5 * 1024 * 1024;

/**
 * Guarda datos en localStorage con manejo de errores
 */
export const saveToStorage = <T>(key: string, data: T): boolean => {
  try {
    const serialized = JSON.stringify(data);
    
    // Comprobar si excedemos el límite de localStorage
    if (serialized.length > MAX_STORAGE_SIZE) {
      console.error(`Error: Los datos para ${key} exceden el límite de localStorage`);
      toast({
        title: 'Erro de almacenamento',
        description: 'Os datos son demasiado grandes para almacenar localmente',
        variant: 'destructive',
      });
      return false;
    }
    
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Error ao gardar ${key} en localStorage:`, error);
    toast({
      title: 'Erro de almacenamento',
      description: 'Non foi posible gardar os datos localmente',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Recupera datos de localStorage con manejo de errores
 */
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serialized = localStorage.getItem(key);
    if (serialized === null) {
      return defaultValue;
    }
    return JSON.parse(serialized) as T;
  } catch (error) {
    console.error(`Error ao recuperar ${key} de localStorage:`, error);
    toast({
      title: 'Erro de almacenamento',
      description: 'Non foi posible recuperar os datos localmente',
      variant: 'destructive',
    });
    return defaultValue;
  }
};

/**
 * Elimina datos de localStorage con manejo de errores
 */
export const removeFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error ao eliminar ${key} de localStorage:`, error);
    return false;
  }
};

/**
 * Comprueba el espacio utilizado en localStorage y devuelve un porcentaje
 */
export const getStorageUsage = (): number => {
  try {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        totalSize += (key.length + (value?.length || 0)) * 2; // Aproximación (2 bytes por carácter)
      }
    }
    return (totalSize / MAX_STORAGE_SIZE) * 100;
  } catch (error) {
    console.error('Error ao calcular o uso de almacenamento:', error);
    return 0;
  }
};

/**
 * Exporta todos los datos de localStorage como JSON
 */
export const exportDatabaseToJSON = (): string => {
  try {
    const exportObj: Record<string, any> = {};
    
    // Exportar solo las claves relacionadas con la aplicación
    const keysToExport = [
      'mockUsers', 
      'mockTasks', 
      'mockTimeEntries', 
      'mockHolidays', 
      'mockVacationDays', 
      'mockWorkdaySchedules', 
      'mockWorkSchedule'
    ];
    
    keysToExport.forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        exportObj[key] = JSON.parse(data);
      }
    });
    
    return JSON.stringify(exportObj, null, 2);
  } catch (error) {
    console.error('Error ao exportar a base de datos:', error);
    return '';
  }
};

/**
 * Importa datos JSON previamente exportados a localStorage
 */
export const importDatabaseFromJSON = (jsonData: string): boolean => {
  try {
    const importObj = JSON.parse(jsonData);
    
    // Comprobar validez básica del formato
    if (typeof importObj !== 'object' || importObj === null) {
      throw new Error('Formato de datos inválido');
    }
    
    // Importar cada clave a localStorage
    Object.entries(importObj).forEach(([key, value]) => {
      saveToStorage(key, value);
    });
    
    return true;
  } catch (error) {
    console.error('Error ao importar a base de datos:', error);
    toast({
      title: 'Erro de importación',
      description: 'Non foi posible importar os datos',
      variant: 'destructive',
    });
    return false;
  }
};

/**
 * Crea un respaldo de la base de datos como archivo descargable
 */
export const downloadDatabaseBackup = () => {
  const data = exportDatabaseToJSON();
  if (!data) {
    toast({
      title: 'Erro de respaldo',
      description: 'Non foi posible crear o arquivo de respaldo',
      variant: 'destructive',
    });
    return;
  }
  
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  
  a.href = url;
  a.download = `control-tarefas-backup-${date}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  toast({
    title: 'Respaldo creado',
    description: 'O respaldo da base de datos foi descargado correctamente',
  });
};
