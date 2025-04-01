
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/types';
import { TaskStatusIcon } from './TaskStatusIcon';
import { TaskPriorityBadge, TaskStatusBadge, TagBadge } from './TaskBadges';

interface TaskDescriptionProps {
  task: Task;
}

export const TaskDescription: React.FC<TaskDescriptionProps> = ({ task }) => {
  return (
    <>
      <div className="flex items-center gap-2">
        <TaskStatusIcon status={task.status} />
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <TaskPriorityBadge priority={task.priority} />
        <TaskStatusBadge status={task.status} />
        
        {task.tags && task.tags.map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Descripción</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">{task.description}</p>
        </CardContent>
      </Card>
    </>
  );
};
