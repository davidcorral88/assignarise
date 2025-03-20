
import { toast } from '@/components/ui/use-toast';
import { User, Task, TimeEntry, Holiday, VacationDay, WorkdaySchedule } from '@/utils/types';
import { API_URL } from './dbConfig';

// Definir la URL de la API PostgreSQL con las credenciales correctas
// const API_URL = 'http://localhost:5433/api'; 
// Los detalles de autenticación (usuario, contraseña, etc.) deben manejarse en el servidor

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
      users: { total: mockUsers.length, success: 0, errors: 0 },
      tasks: { total: mockTasks.length, success: 0, errors: 0 },
      timeEntries: { total: mockTimeEntries.length, success: 0, errors: 0 },
      holidays: { total: mockHolidays.length, success: 0, errors: 0 },
      vacationDays: { total: mockVacationDays.length, success: 0, errors: 0 },
      workdaySchedules: { total: mockWorkdaySchedules.length, success: 0, errors: 0 }
    };
    
    // Paso 2: Migrar usuarios
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
          stats.users.errors++;
          console.error(`Error al migrar usuario ${user.id}:`, await response.text());
        }
      } catch (error) {
        stats.users.errors++;
        console.error(`Error al migrar usuario ${user.id}:`, error);
      }
    }
    
    // Paso 3: Migrar tareas
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
            await fetch(`${API_URL}/task-tags`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ taskId: task.id, tag })
            });
          }
          
          // Y las asignaciones
          if (task.assignments && task.assignments.length > 0) {
            for (const assignment of task.assignments) {
              await fetch(`${API_URL}/task-assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  taskId: task.id, 
                  userId: assignment.userId,
                  allocatedHours: assignment.allocatedHours
                })
              });
            }
          }
        } else {
          stats.tasks.errors++;
          console.error(`Error al migrar tarea ${task.id}:`, await taskResponse.text());
        }
      } catch (error) {
        stats.tasks.errors++;
        console.error(`Error al migrar tarea:`, error);
      }
    }
    
    // Paso 4: Migrar registros de tiempo
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
          stats.timeEntries.errors++;
          console.error(`Error al migrar registro de tiempo ${entry.id}:`, await entryResponse.text());
        }
      } catch (error) {
        stats.timeEntries.errors++;
        console.error(`Error al migrar registro de tiempo:`, error);
      }
    }
    
    // Paso 5: Migrar festivos
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
          stats.holidays.errors++;
          console.error(`Error al migrar festivo ${holiday.date}:`, await holidayResponse.text());
        }
      } catch (error) {
        stats.holidays.errors++;
        console.error(`Error al migrar festivo:`, error);
      }
    }
    
    // Paso 6: Migrar días de vacaciones
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
          stats.vacationDays.errors++;
          console.error(`Error al migrar día de vacación:`, await vacationResponse.text());
        }
      } catch (error) {
        stats.vacationDays.errors++;
        console.error(`Error al migrar día de vacación:`, error);
      }
    }
    
    // Paso 7: Migrar horarios de trabajo
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
          stats.workdaySchedules.errors++;
          console.error(`Error al migrar horario ${schedule.id}:`, await scheduleResponse.text());
        }
      } catch (error) {
        stats.workdaySchedules.errors++;
        console.error(`Error al migrar horario:`, error);
      }
    }
    
    // Paso 8: Migrar configuración general de horarios
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
    
    if (totalErrors === 0) {
      return {
        success: true,
        message: `Migración completada con éxito. Se migraron ${totalSuccess} elementos.`
      };
    } else {
      return {
        success: false,
        message: `Migración completada con errores. Migrados: ${totalSuccess}, Errores: ${totalErrors} de ${totalItems} elementos.`
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

// Verificar conexión con la base de datos PostgreSQL
export const testPostgreSQLConnection = async (): Promise<boolean> => {
  try {
    console.log(`Verificando conexión con: ${API_URL}/health-check`);
    
    const response = await fetch(`${API_URL}/health-check`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      console.log('Conexión exitosa con PostgreSQL');
      return true;
    } else {
      console.error('Error en la respuesta del servidor:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error al verificar conexión con PostgreSQL:', error);
    return false;
  }
};
