
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { WorkdaySchedule } from '@/utils/types';
import { getWorkdaySchedules } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const dayNames = ['Luns', 'Martes', 'Mércores', 'Xoves', 'Venres', 'Sábado', 'Domingo'];

const WorkdaySchedulesTab = () => {
  const [schedules, setSchedules] = useState<WorkdaySchedule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const data = await getWorkdaySchedules();
        setSchedules(data);
      } catch (error) {
        console.error('Error fetching workday schedules:', error);
        toast({
          title: 'Error',
          description: 'Non foi posible cargar as xornadas',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  // Helper function to determine if a day is included in the schedule
  const isDayIncluded = (schedule: WorkdaySchedule, dayIndex: number) => {
    // Check days_of_week array first
    if (schedule.days_of_week && Array.isArray(schedule.days_of_week)) {
      return schedule.days_of_week.includes(dayIndex + 1); // +1 because days_of_week is 1-7
    }

    // Fall back to individual day properties
    const dayProps = [
      schedule.monday,
      schedule.tuesday,
      schedule.wednesday,
      schedule.thursday,
      schedule.friday,
      schedule.saturday,
      schedule.sunday,
    ];

    return dayProps[dayIndex] === true;
  };

  // Helper function to get hours for a specific day
  const getHoursForDay = (schedule: WorkdaySchedule, dayIndex: number) => {
    if (!isDayIncluded(schedule, dayIndex)) return '-';

    const dayProps = [
      schedule.mondayHours,
      schedule.tuesdayHours,
      schedule.wednesdayHours,
      schedule.thursdayHours,
      schedule.fridayHours,
    ];

    // Return specific hours if available
    if (dayIndex < dayProps.length && dayProps[dayIndex] !== undefined) {
      return dayProps[dayIndex];
    }

    // Calculate hours from start/end times
    if (schedule.startTime && schedule.endTime) {
      const start = new Date(`1970-01-01T${schedule.startTime || schedule.start_time}`);
      const end = new Date(`1970-01-01T${schedule.endTime || schedule.end_time}`);
      
      // Calculate hours difference
      let hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      // Subtract break time if available
      if (schedule.breakStart && schedule.breakEnd) {
        const breakStart = new Date(`1970-01-01T${schedule.breakStart}`);
        const breakEnd = new Date(`1970-01-01T${schedule.breakEnd}`);
        const breakHours = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60 * 60);
        hours -= breakHours;
      }
      
      return hours.toFixed(1);
    }

    return '8.0'; // Default full workday
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-medium">Xornadas de traballo</h2>
      
      <Card>
        <CardContent className="p-4 overflow-auto">
          {loading ? (
            <div className="text-center py-4">Cargando xornadas...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Nome da xornada</TableHead>
                  <TableHead>Horario</TableHead>
                  {dayNames.map(day => (
                    <TableHead key={day} className="text-center">{day}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length > 0 ? (
                  schedules.map(schedule => (
                    <TableRow key={schedule.id}>
                      <TableCell className="font-medium">
                        {schedule.name}
                        {schedule.type && (
                          <Badge variant="outline" className="ml-2">
                            {schedule.type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {schedule.startTime || schedule.start_time} - {schedule.endTime || schedule.end_time}
                      </TableCell>
                      {dayNames.map((_, index) => (
                        <TableCell key={index} className="text-center">
                          {isDayIncluded(schedule, index) ? (
                            <span className="font-medium">{getHoursForDay(schedule, index)}h</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      Non hai xornadas rexistradas
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkdaySchedulesTab;
