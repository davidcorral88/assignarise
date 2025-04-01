
import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

interface TaskStatusIconProps {
  status: string;
  className?: string;
}

export const TaskStatusIcon: React.FC<TaskStatusIconProps> = ({ status, className }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className={`h-5 w-5 text-green-500 ${className}`} />;
    case 'in_progress':
      return <Clock className={`h-5 w-5 text-amber-500 ${className}`} />;
    case 'pending':
      return <Circle className={`h-5 w-5 text-gray-400 ${className}`} />;
    default:
      return null;
  }
};

export const getStatusText = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'Completada';
    case 'in_progress':
      return 'En progreso';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
};
