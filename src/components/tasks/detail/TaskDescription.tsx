
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/utils/types';
import { TaskStatusIcon } from './TaskStatusIcon';
import { TaskPriorityBadge, TaskStatusBadge, TagBadge } from './TaskBadges';
import { Folder, ListTodo } from 'lucide-react';

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
        
        {/* Category and Project badges */}
        {task.category && (
          <div className="flex items-center bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-md text-sm">
            <Folder className="h-3 w-3 mr-1" />
            <span>{task.category}</span>
          </div>
        )}
        
        {task.project && (
          <div className="flex items-center bg-green-50 text-green-700 px-2.5 py-0.5 rounded-md text-sm">
            <ListTodo className="h-3 w-3 mr-1" />
            <span>{task.project}</span>
          </div>
        )}
        
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
