
import { toast } from '@/components/ui/use-toast';
import { API_URL } from './dbConfig';

interface MigrationReport {
  success: boolean;
  message: string;
  details?: {
    entityType: string;
    totalEntities: number;
    migratedEntities: number;
    errors: any[];
  }[];
  timestamp: string;
}

/**
 * Prueba la conexión con la base de datos PostgreSQL a través de la API
 * @returns true si la conexión es exitosa, false en caso contrario
 */
export const testPostgreSQLConnection = async (): Promise<boolean> => {
  try {
    console.log('Probando conexión a PostgreSQL en:', API_URL);
    const response = await fetch(`${API_URL}/status`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error de conexión a PostgreSQL:', errorText);
      return false;
    }
    
    const data = await response.json();
    console.log('Respuesta del estado de PostgreSQL:', data);
    
    return data.status === 'connected';
  } catch (error) {
    console.error('Error al probar la conexión a PostgreSQL:', error);
    return false;
  }
};

/**
 * Borra los datos locales después de una migración exitosa a PostgreSQL
 * Este proceso solo debe realizarse después de confirmar que todos los datos 
 * se han migrado correctamente a PostgreSQL
 */
export const clearLocalStorage = (): void => {
  try {
    // Lista de claves de datos de la aplicación para borrar
    const appKeys = [
      'mockUsers', 
      'mockTasks', 
      'mockTimeEntries', 
      'mockHolidays', 
      'mockVacationDays', 
      'mockWorkdaySchedules', 
      'mockWorkSchedule'
    ];
    
    // Borrar cada clave de datos de la aplicación
    appKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Conservar las configuraciones y preferencias del usuario
    // como el informe de migración para referencia
    
    toast({
      title: 'Datos locales eliminados',
      description: 'Los datos locales han sido eliminados después de la migración a PostgreSQL.',
    });
    
    console.log('localStorage limpiado después de la migración a PostgreSQL');
  } catch (error) {
    console.error('Error al limpiar localStorage:', error);
    
    toast({
      title: 'Error al borrar datos',
      description: 'No se pudieron eliminar los datos locales. Consulta la consola para más detalles.',
      variant: 'destructive',
    });
  }
};

/**
 * Migra todos los datos del almacenamiento local a PostgreSQL
 */
export const migrateToPostgreSQL = async (): Promise<{ success: boolean; message: string }> => {
  console.log('Iniciando migración a PostgreSQL...');
  
  const migrationReport: MigrationReport = {
    success: true,
    message: 'Migración completada con éxito',
    details: [],
    timestamp: new Date().toISOString()
  };
  
  try {
    // Comprobar primero si la conexión a PostgreSQL está disponible
    const isConnected = await testPostgreSQLConnection();
    if (!isConnected) {
      throw new Error('No se pudo establecer conexión con PostgreSQL');
    }
    
    // Migrar las entidades en orden lógico para mantener las relaciones
    const entityTypes = [
      { name: 'users', endpoint: '/migration/users' },
      { name: 'work-schedule', endpoint: '/migration/work-schedule' },
      { name: 'workday-schedules', endpoint: '/migration/workday-schedules' },
      { name: 'holidays', endpoint: '/migration/holidays' },
      { name: 'tasks', endpoint: '/migration/tasks' },
      { name: 'time-entries', endpoint: '/migration/time-entries' },
      { name: 'vacation-days', endpoint: '/migration/vacation-days' }
    ];
    
    for (const entity of entityTypes) {
      console.log(`Migrando ${entity.name}...`);
      try {
        const response = await fetch(`${API_URL}${entity.endpoint}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al migrar ${entity.name}: ${errorText}`);
        }
        
        const result = await response.json();
        console.log(`Migración de ${entity.name} completada:`, result);
        
        migrationReport.details?.push({
          entityType: entity.name,
          totalEntities: result.total || 0,
          migratedEntities: result.migrated || 0,
          errors: result.errors || []
        });
        
        if (result.errors && result.errors.length > 0) {
          console.warn(`Advertencias durante la migración de ${entity.name}:`, result.errors);
          migrationReport.success = false;
          if (migrationReport.message === 'Migración completada con éxito') {
            migrationReport.message = 'Migración completada con advertencias';
          }
        }
      } catch (error) {
        console.error(`Error durante la migración de ${entity.name}:`, error);
        migrationReport.success = false;
        migrationReport.message = `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`;
        
        migrationReport.details?.push({
          entityType: entity.name,
          totalEntities: 0,
          migratedEntities: 0,
          errors: [{ message: error instanceof Error ? error.message : 'Error desconocido' }]
        });
      }
    }
    
    // Guardar el informe de migración en localStorage para posible diagnóstico
    localStorage.setItem('lastMigrationReport', JSON.stringify(migrationReport));
    
    if (!migrationReport.success) {
      console.warn('Migración completada con advertencias o errores:', migrationReport);
      return {
        success: false,
        message: migrationReport.message + '. Consulta la consola para más detalles.'
      };
    }
    
    console.log('Migración completada con éxito:', migrationReport);
    return {
      success: true,
      message: 'Migración completada con éxito. Todos los datos se han transferido a PostgreSQL.'
    };
  } catch (error) {
    console.error('Error durante el proceso de migración:', error);
    
    // Guardar el informe de migración fallida
    migrationReport.success = false;
    migrationReport.message = `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    localStorage.setItem('lastMigrationReport', JSON.stringify(migrationReport));
    
    return {
      success: false,
      message: `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};
