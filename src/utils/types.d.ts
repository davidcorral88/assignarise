
// Add the TaskAttachment type 
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  createdBy: string;
}
