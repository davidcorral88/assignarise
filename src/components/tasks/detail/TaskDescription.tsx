
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/types';
import { TaskStatusIcon } from './TaskStatusIcon';
import { TaskPriorityBadge, TaskStatusBadge, TagBadge } from './TaskBadges';
import { Briefcase, FolderOpen } from 'lucide-react';

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
      
      <div className="flex flex-wrap gap-2 mb-4">
        <TaskPriorityBadge priority={task.priority} />
        <TaskStatusBadge status={task.status} />
        
        {task.tags && task.tags.map(tag => (
          <TagBadge key={tag} tag={tag} />
        ))}
      </div>
      
      {/* Category and Project information */}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
        {task.category && (
          <div className="flex items-center gap-1">
            <FolderOpen className="h-4 w-4" />
            <span>Categoría: <span className="font-medium text-foreground">{task.category}</span></span>
          </div>
        )}
        
        {task.project && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-4 w-4" />
            <span>Proxecto: <span className="font-medium text-foreground">{task.project}</span></span>
          </div>
        )}
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
