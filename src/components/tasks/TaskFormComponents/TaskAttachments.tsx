
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUp, FilePlus2 } from 'lucide-react';
import { FileUploader } from '@/components/files/FileUploader';
import { TaskAttachment } from '@/utils/types';

interface TaskAttachmentsProps {
  taskId: string | undefined;
  attachments: TaskAttachment[];
  onAttachmentAdded: (attachment: TaskAttachment) => void;
  onAttachmentRemoved: (attachmentId: string) => void;
  canEdit: boolean;
  canAddResolutionAttachments: boolean;
  isUserAssignedToTask: boolean;
}

const TaskAttachments: React.FC<TaskAttachmentsProps> = ({
  taskId,
  attachments,
  onAttachmentAdded,
  onAttachmentRemoved,
  canEdit,
  canAddResolutionAttachments,
  isUserAssignedToTask
}) => {
  const taskFiles = attachments.filter(a => !a.isResolution);
  const resolutionFiles = attachments.filter(a => a.isResolution);

  return (
    <Tabs defaultValue="task-files">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="task-files" className="flex items-center">
          <FileUp className="h-4 w-4 mr-2" />
          Arquivos da tarefa
        </TabsTrigger>
        <TabsTrigger value="resolution-files" className="flex items-center">
          <FilePlus2 className="h-4 w-4 mr-2" />
          Arquivos de resolución
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="task-files" className="mt-4">
        <FileUploader
          taskId={taskId || ''}
          attachments={taskFiles}
          isResolution={false}
          onAttachmentAdded={onAttachmentAdded}
          onAttachmentRemoved={onAttachmentRemoved}
          readOnly={isUserAssignedToTask && !canEdit}
        />
      </TabsContent>
      
      <TabsContent value="resolution-files" className="mt-4">
        <FileUploader
          taskId={taskId || ''}
          attachments={resolutionFiles}
          isResolution={true}
          onAttachmentAdded={onAttachmentAdded}
          onAttachmentRemoved={onAttachmentRemoved}
          readOnly={!canAddResolutionAttachments}
        />
        
        {!canAddResolutionAttachments && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-md text-sm">
            <p className="text-orange-700">
              Solo os usuarios asignados a esta tarefa poden engadir arquivos de resolución.
            </p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

export default TaskAttachments;
