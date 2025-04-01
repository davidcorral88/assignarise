
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getStatusText } from './TaskStatusIcon';

interface TaskStatusBadgeProps {
  status: string;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({ status }) => {
  return (
    <Badge variant="outline">
      Estado: {getStatusText(status)}
    </Badge>
  );
};

interface TaskPriorityBadgeProps {
  priority: string;
}

export const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
      default:
        return priority;
    }
  };
  
  return (
    <Badge variant="outline" className={`${getPriorityClass(priority)}`}>
      Prioridad: {getPriorityText(priority)}
    </Badge>
  );
};

interface TagBadgeProps {
  tag: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag }) => {
  return (
    <Badge key={tag} variant="secondary">
      {tag}
    </Badge>
  );
};
