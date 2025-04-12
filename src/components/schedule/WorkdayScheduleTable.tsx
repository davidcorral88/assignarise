
import React from 'react';
import { format, parseISO } from 'date-fns';
import { gl } from 'date-fns/locale';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { WorkdaySchedule } from '@/utils/types';

interface WorkdayScheduleTableProps {
  schedules: WorkdaySchedule[];
  onEdit: (schedule: WorkdaySchedule) => void;
  onDelete: (scheduleId: string) => void; // Updated to accept string ID
}

const WorkdayScheduleTable: React.FC<WorkdayScheduleTableProps> = ({ schedules, onEdit, onDelete }) => {
  // Helper function to format day hours display
  const formatHours = (hours: number | undefined) => {
    if (hours === undefined) return '-';
    return `${hours}h`;
  };
  
  // Helper function to format weekdays
  const getDaysString = (schedule: WorkdaySchedule) => {
    const days = [];
    if (schedule.monday) days.push('L');
    if (schedule.tuesday) days.push('M');
    if (schedule.wednesday) days.push('X');
    if (schedule.thursday) days.push('J');
    if (schedule.friday) days.push('V');
    if (schedule.saturday) days.push('S');
    if (schedule.sunday) days.push('D');
    
    return days.join(', ');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Período</TableHead>
          <TableHead>Días</TableHead>
          <TableHead>Horas</TableHead>
          <TableHead className="text-right">Accións</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.length > 0 ? (
          schedules.map(schedule => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.name}</TableCell>
              <TableCell>{schedule.type}</TableCell>
              <TableCell>
                {schedule.startDate && schedule.endDate ? (
                  <>
                    {format(parseISO(schedule.startDate), 'dd/MM', { locale: gl })}
                    {' - '}
                    {format(parseISO(schedule.endDate), 'dd/MM', { locale: gl })}
                  </>
                ) : '-'}
              </TableCell>
              <TableCell>{getDaysString(schedule)}</TableCell>
              <TableCell>
                <div className="flex flex-col text-xs">
                  {schedule.mondayHours !== undefined && <span>L: {formatHours(schedule.mondayHours)}</span>}
                  {schedule.tuesdayHours !== undefined && <span>M: {formatHours(schedule.tuesdayHours)}</span>}
                  {schedule.wednesdayHours !== undefined && <span>X: {formatHours(schedule.wednesdayHours)}</span>}
                  {schedule.thursdayHours !== undefined && <span>J: {formatHours(schedule.thursdayHours)}</span>}
                  {schedule.fridayHours !== undefined && <span>V: {formatHours(schedule.fridayHours)}</span>}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(schedule)}>
                    <Edit size={16} />
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(schedule.id)}>
                    <Trash2 size={16} />
                    <span className="sr-only">Eliminar</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-4">
              Non hai xornadas configuradas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default WorkdayScheduleTable;
