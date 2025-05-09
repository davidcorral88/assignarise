
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { WorkdaySchedule } from '@/utils/types';
import { useAuth } from '@/components/auth/useAuth';

interface WorkdayScheduleTableProps {
  schedules: WorkdaySchedule[];
  onEdit: (schedule: WorkdaySchedule) => void;
  onDelete: (scheduleId: string) => void;
}

const WorkdayScheduleTable: React.FC<WorkdayScheduleTableProps> = ({ schedules, onEdit, onDelete }) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  // Helper function to format day hours display
  const formatHours = (hours: number | undefined) => {
    if (hours === undefined) return '-';
    return `${hours}h`;
  };

  // Helper function to format date display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo de xornada</TableHead>
          <TableHead className="text-center">Data inicio</TableHead>
          <TableHead className="text-center">Data fin</TableHead>
          <TableHead className="text-center">Luns</TableHead>
          <TableHead className="text-center">Martes</TableHead>
          <TableHead className="text-center">Mércores</TableHead>
          <TableHead className="text-center">Xoves</TableHead>
          <TableHead className="text-center">Venres</TableHead>
          {isAdmin && <TableHead className="text-right">Accións</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {schedules.length > 0 ? (
          schedules.map(schedule => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">{schedule.type}</TableCell>
              <TableCell className="text-center">{formatDate(schedule.startDate)}</TableCell>
              <TableCell className="text-center">{formatDate(schedule.endDate)}</TableCell>
              <TableCell className="text-center">{formatHours(schedule.mondayHours)}</TableCell>
              <TableCell className="text-center">{formatHours(schedule.tuesdayHours)}</TableCell>
              <TableCell className="text-center">{formatHours(schedule.wednesdayHours)}</TableCell>
              <TableCell className="text-center">{formatHours(schedule.thursdayHours)}</TableCell>
              <TableCell className="text-center">{formatHours(schedule.fridayHours)}</TableCell>
              {isAdmin && (
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
              )}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={isAdmin ? 9 : 8} className="text-center py-4">
              Non hai xornadas configuradas
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default WorkdayScheduleTable;
