
import { toast } from '@/components/ui/use-toast';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule } from '@/utils/types';
import { API_URL } from './dbConfig';
import { setUseAPI } from './dataService';

// Verificar conexión con la base de datos PostgreSQL con más detalles de debugging
export const testPostgreSQLConnection = async (): Promise<boolean> => {
  try {
    console.log(`Verificando conexión con: ${API_URL}/users`);
    
    // Intentamos directamente con el endpoint de usuarios
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Conexión exitosa con PostgreSQL');
      const users = await response.json();
      console.log(`Se han recuperado ${users.length} usuarios de la base de datos`);
      
      // Activar automáticamente PostgreSQL si la conexión es exitosa
      setUseAPI(true);
      localStorage.setItem('useAPI', 'true');
      
      return true;
    } else {
      console.error('Error en la respuesta del servidor:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalle del error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error al verificar conexión con PostgreSQL:', error);
    
    // Información adicional de depuración sobre el entorno
    console.log('Información de configuración:');
    console.log('- API URL:', API_URL);
    console.log('- Navegador:', navigator.userAgent);
    
    // Verificamos si podría ser un problema de CORS
    if (error instanceof TypeError && error.message.includes('NetworkError')) {
      console.error('Posible error de CORS - Verificar configuración del servidor');
    }
    
    return false;
  }
};

// Función auxiliar para esperar entre solicitudes para evitar sobrecarga
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const migrateToPostgreSQL = async (): Promise<{success: boolean, message: string}> => {
  try {
    // Paso 1: Extraer todos los datos del localStorage
    const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]') as User[];
    const mockTasks = JSON.parse(localStorage.getItem('mockTasks') || '[]') as Task[];
    const mockTimeEntries = JSON.parse(localStorage.getItem('mockTimeEntries') || '[]') as TimeEntry[];
    const mockHolidays = JSON.parse(localStorage.getItem('mockHolidays') || '[]') as Holiday[];
    const mockVacationDays = JSON.parse(localStorage.getItem('mockVacationDays') || '[]') as VacationDay[];
    const mockWorkdaySchedules = JSON.parse(localStorage.getItem('mockWorkdaySchedules') || '[]') as WorkdaySchedule[];
    const mockWorkSchedule = JSON.parse(localStorage.getItem('mockWorkSchedule') || '{}');
    
    // Estadísticas para el reporte final
    const stats = {
      users: { total: mockUsers.length, success: 0, errors: 0, details: [] as string[] },
      tasks: { total: mockTasks.length, success: 0, errors: 0, details: [] as string[] },
      timeEntries: { total: mockTimeEntries.length, success: 0, errors: 0, details: [] as string[] },
      holidays: { total: mockHolidays.length, success: 0, errors: 0, details: [] as string[] },
      vacationDays: { total: mockVacationDays.length, success: 0, errors: 0, details: [] as string[] },
      workdaySchedules: { total: mockWorkdaySchedules.length, success: 0, errors: 0, details: [] as string[] }
    };
    
    // Paso 2: Migrar usuarios
    console.log("Iniciando migración de usuarios...");
    for (const user of mockUsers) {
      try {
        const response = await fetch(`${API_URL}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(user)
        });
        
        if (response.ok) {
          stats.users.success++;
        } else {
          const errorText = await response.text();
          stats.users.errors++;
          const errorDetail = `Error al migrar usuario ${user.id}: ${response.status} - ${errorText}`;
          stats.users.details.push(errorDetail);
          console.error(errorDetail);
        }
        // Pequeña pausa para evitar sobrecargar el servidor
        await sleep(100);
      } catch (error) {
        stats.users.errors++;
        const errorDetail = `Error al migrar usuario ${user.id}: ${error instanceof Error ? error.message : String(error)}`;
        stats.users.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 3: Migrar tareas
    console.log("Iniciando migración de tareas...");
    for (const task of mockTasks) {
      try {
        // Primero insertamos la tarea principal
        const taskWithoutTags = {...task};
        const tags = taskWithoutTags.tags || [];
        delete taskWithoutTags.tags;
        
        const taskResponse = await fetch(`${API_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskWithoutTags)
        });
        
        if (taskResponse.ok) {
          stats.tasks.success++;
          
          // Luego insertamos las etiquetas
          for (const tag of tags) {
            try {
              await fetch(`${API_URL}/task-tags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: task.id, tag })
              });
            } catch (error) {
              console.error(`Error al migrar etiqueta ${tag} para tarea ${task.id}:`, error);
            }
            await sleep(50);
          }
          
          // Y las asignaciones
          if (task.assignments && task.assignments.length > 0) {
            for (const assignment of task.assignments) {
              try {
                await fetch(`${API_URL}/task-assignments`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    taskId: task.id, 
                    userId: assignment.userId,
                    allocatedHours: assignment.allocatedHours
                  })
                });
              } catch (error) {
                console.error(`Error al migrar asignación para tarea ${task.id}:`, error);
              }
              await sleep(50);
            }
          }
        } else {
          const errorText = await taskResponse.text();
          stats.tasks.errors++;
          const errorDetail = `Error al migrar tarea ${task.id}: ${taskResponse.status} - ${errorText}`;
          stats.tasks.details.push(errorDetail);
          console.error(errorDetail);
        }
        await sleep(100);
      } catch (error) {
        stats.tasks.errors++;
        const errorDetail = `Error al migrar tarea ${task.id}: ${error instanceof Error ? error.message : String(error)}`;
        stats.tasks.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 4: Migrar registros de tiempo
    console.log("Iniciando migración de registros de tiempo...");
    for (const entry of mockTimeEntries) {
      try {
        const entryResponse = await fetch(`${API_URL}/time-entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry)
        });
        
        if (entryResponse.ok) {
          stats.timeEntries.success++;
        } else {
          const errorText = await entryResponse.text();
          stats.timeEntries.errors++;
          const errorDetail = `Error al migrar registro de tiempo ${entry.id}: ${entryResponse.status} - ${errorText}`;
          stats.timeEntries.details.push(errorDetail);
          console.error(errorDetail);
        }
        await sleep(100);
      } catch (error) {
        stats.timeEntries.errors++;
        const errorDetail = `Error al migrar registro de tiempo ${entry.id}: ${error instanceof Error ? error.message : String(error)}`;
        stats.timeEntries.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 5: Migrar festivos
    console.log("Iniciando migración de festivos...");
    for (const holiday of mockHolidays) {
      try {
        const holidayResponse = await fetch(`${API_URL}/holidays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(holiday)
        });
        
        if (holidayResponse.ok) {
          stats.holidays.success++;
        } else {
          const errorText = await holidayResponse.text();
          stats.holidays.errors++;
          const errorDetail = `Error al migrar festivo ${holiday.date}: ${holidayResponse.status} - ${errorText}`;
          stats.holidays.details.push(errorDetail);
          console.error(errorDetail);
        }
        await sleep(100);
      } catch (error) {
        stats.holidays.errors++;
        const errorDetail = `Error al migrar festivo ${holiday.date}: ${error instanceof Error ? error.message : String(error)}`;
        stats.holidays.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 6: Migrar días de vacaciones
    console.log("Iniciando migración de días de vacaciones...");
    for (const vacationDay of mockVacationDays) {
      try {
        const vacationResponse = await fetch(`${API_URL}/vacation-days`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vacationDay)
        });
        
        if (vacationResponse.ok) {
          stats.vacationDays.success++;
        } else {
          const errorText = await vacationResponse.text();
          stats.vacationDays.errors++;
          const errorDetail = `Error al migrar día de vacación para ${vacationDay.userId} en ${vacationDay.date}: ${vacationResponse.status} - ${errorText}`;
          stats.vacationDays.details.push(errorDetail);
          console.error(errorDetail);
        }
        await sleep(100);
      } catch (error) {
        stats.vacationDays.errors++;
        const errorDetail = `Error al migrar día de vacación: ${error instanceof Error ? error.message : String(error)}`;
        stats.vacationDays.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 7: Migrar horarios de trabajo
    console.log("Iniciando migración de horarios de trabajo...");
    for (const schedule of mockWorkdaySchedules) {
      try {
        const scheduleResponse = await fetch(`${API_URL}/workday-schedules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(schedule)
        });
        
        if (scheduleResponse.ok) {
          stats.workdaySchedules.success++;
        } else {
          const errorText = await scheduleResponse.text();
          stats.workdaySchedules.errors++;
          const errorDetail = `Error al migrar horario ${schedule.id}: ${scheduleResponse.status} - ${errorText}`;
          stats.workdaySchedules.details.push(errorDetail);
          console.error(errorDetail);
        }
        await sleep(100);
      } catch (error) {
        stats.workdaySchedules.errors++;
        const errorDetail = `Error al migrar horario: ${error instanceof Error ? error.message : String(error)}`;
        stats.workdaySchedules.details.push(errorDetail);
        console.error(errorDetail);
      }
    }
    
    // Paso 8: Migrar configuración general de horarios
    console.log("Iniciando migración de configuración general de horarios...");
    try {
      await fetch(`${API_URL}/work-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockWorkSchedule)
      });
    } catch (error) {
      console.error('Error al migrar configuración de horarios:', error);
    }
    
    // Calcular totales y verificar si la migración fue exitosa
    const totalItems = Object.values(stats).reduce((sum, stat) => sum + stat.total, 0);
    const totalSuccess = Object.values(stats).reduce((sum, stat) => sum + stat.success, 0);
    const totalErrors = Object.values(stats).reduce((sum, stat) => sum + stat.errors, 0);
    
    // Generar reporte detallado
    const errorDetails = Object.entries(stats)
      .filter(([_, stat]) => stat.details.length > 0)
      .map(([type, stat]) => {
        return `\n${type} (${stat.errors} errores):\n  - ${stat.details.join('\n  - ')}`;
      })
      .join('\n');
    
    // Guardar reporte en localStorage para diagnóstico
    localStorage.setItem('migrationReport', JSON.stringify({
      date: new Date().toISOString(),
      stats,
      totalItems,
      totalSuccess,
      totalErrors
    }));
    
    console.log("Reporte de migración:", {
      totalItems,
      totalSuccess,
      totalErrors,
      details: errorDetails
    });
    
    // Activar PostgreSQL independientemente del resultado
    setUseAPI(true);
    localStorage.setItem('useAPI', 'true');
    
    if (totalErrors === 0) {
      return {
        success: true,
        message: `Migración completada con éxito. Se migraron ${totalSuccess} elementos.`
      };
    } else {
      return {
        success: false,
        message: `Migración completada con errores. Migrados: ${totalSuccess}, Errores: ${totalErrors} de ${totalItems} elementos. Ver consola para detalles.`
      };
    }
  } catch (error) {
    console.error('Error durante la migración:', error);
    return {
      success: false,
      message: `Error durante la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
};

// Eliminar datos del localStorage después de la migración
export const clearLocalStorage = (): void => {
  const keysToRemove = [
    'mockUsers', 
    'mockTasks', 
    'mockTimeEntries', 
    'mockHolidays', 
    'mockVacationDays', 
    'mockWorkdaySchedules', 
    'mockWorkSchedule'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
  
  toast({
    title: "Datos locales eliminados",
    description: "Se han eliminado todos los datos de ejemplo del almacenamiento local"
  });
};
