
import { useState, useEffect } from 'react';
import { Task, User, TaskAttachment, TaskAssignment } from '@/utils/types';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth/useAuth';
import { toast } from '@/components/ui/use-toast';
import { getTaskById, addTask, updateTask, deleteTask, getUsersByIds } from '@/utils/dataService';

export const useTaskForm = (
  id: string | undefined,
  navigate: (path: string) => void
) => {
  const isEditMode = !!id;
  const { currentUser } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  
  // Form state
  const [tarefa, setTarefa] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('pending');
  const [priority, setPriority] = useState<string>('medium');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [allocatedHours, setAllocatedHours] = useState<number>(0);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [creatorUser, setCreatorUser] = useState<User | null>(null);
  
  const [category, setCategory] = useState<string>('');
  const [project, setProject] = useState<string>('');
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [assignedUserData, setAssignedUserData] = useState<Record<number, User | null>>({});
  const [recentlyAddedUsers, setRecentlyAddedUsers] = useState<Record<number, User | null>>({});

  const handleAddAssignment = () => {
    if (selectedUserId && allocatedHours > 0) {
      if (!assignments.some(a => {
        const aUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
        return aUserId === selectedUserId;
      })) {
        setAssignments([
          ...assignments,
          { 
            user_id: selectedUserId, 
            allocatedHours: allocatedHours 
          }
        ]);
        
        const selectedUser = availableUsers.find(u => u.id === selectedUserId);
        if (selectedUser) {
          setRecentlyAddedUsers(prev => ({
            ...prev,
            [selectedUserId]: selectedUser
          }));
          
          setAssignedUserData(prev => ({
            ...prev,
            [selectedUserId]: selectedUser
          }));
        }
        
        setSelectedUserId(null);
        setAllocatedHours(0);
      } else {
        toast({
          title: 'Usuario xa asignado',
          description: 'Este usuario xa está asignado á tarefa.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor selecciona un usuario e asigna horas.',
        variant: 'destructive',
      });
    }
  };
  
  const handleRemoveAssignment = (userId: number) => {
    setAssignments(assignments.filter(a => {
      const assignmentUserId = typeof a.user_id === 'string' ? parseInt(a.user_id, 10) : a.user_id;
      return assignmentUserId !== userId;
    }));
  };
  
  const handleAttachmentAdded = (attachment: TaskAttachment) => {
    setAttachments(prev => [...prev, attachment]);
  };
  
  const handleAttachmentRemoved = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const handleDeleteTask = async () => {
    if (isEditMode && id) {
      try {
        await deleteTask(id);
        toast({
          title: 'Tarefa eliminada',
          description: 'A tarefa foi eliminada correctamente.',
        });
        navigate('/tasks');
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: 'Erro',
          description: 'Ocorreu un erro ao eliminar a tarefa. Por favor, inténtao de novo.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tarefa.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor ingresa un nome para a tarefa',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const normalizedAssignments = assignments.map(assignment => {
        const userId = typeof assignment.user_id === 'string'
          ? parseInt(assignment.user_id, 10)
          : assignment.user_id;
          
        return {
          user_id: userId,
          allocatedHours: assignment.allocatedHours
        };
      });
      
      console.log("Normalized assignments for submission:", normalizedAssignments);
      console.log("Submitting with category:", category);
      console.log("Submitting with project:", project);
      
      const taskData: Task = {
        ...(isEditMode && task ? { id: task.id } : {}),
        title: tarefa,
        description: description || '',
        status: (status as 'pending' | 'in_progress' | 'completed') || 'pending',
        priority: (priority as 'low' | 'medium' | 'high') || 'medium',
        createdBy: currentUser?.id || 0,
        createdAt: task?.createdAt || new Date().toISOString(),
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        dueDate: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        tags: tags || [],
        assignments: normalizedAssignments,
        attachments: attachments || [],
        category: category || undefined,
        project: project || undefined,
      };
      
      console.log("Saving task data:", taskData);
      
      if (isEditMode) {
        await updateTask(task!.id, taskData);
        toast({
          title: 'Tarefa actualizada',
          description: 'A tarefa foi actualizada correctamente.',
        });
      } else {
        const savedTask = await addTask(taskData);
        console.log("Tarea creada con ID:", savedTask.id);
        toast({
          title: 'Tarefa creada',
          description: `A tarefa foi creada correctamente con ID: ${savedTask.id}`,
        });
      }
      
      setTimeout(() => {
        navigate('/tasks');
        setSubmitting(false);
      }, 800);
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: 'Erro',
        description: 'Ocorreu un erro ao gardar a tarefa. Por favor, inténtao de novo.',
        variant: 'destructive',
      });
      setSubmitting(false);
    }
  };

  return {
    task,
    setTask,
    tarefa,
    setTarefa,
    description,
    setDescription,
    status,
    setStatus,
    priority,
    setPriority,
    startDate,
    setStartDate,
    dueDate,
    setDueDate,
    tags,
    setTags,
    assignments,
    setAssignments,
    selectedUserId,
    setSelectedUserId,
    allocatedHours, 
    setAllocatedHours,
    attachments,
    setAttachments,
    creatorUser,
    setCreatorUser,
    category,
    setCategory,
    project,
    setProject,
    availableProjects,
    setAvailableProjects,
    loading,
    setLoading,
    submitting,
    setSubmitting,
    showDeleteDialog,
    setShowDeleteDialog,
    availableUsers,
    setAvailableUsers,
    assignedUserData,
    setAssignedUserData,
    recentlyAddedUsers,
    handleAddAssignment,
    handleRemoveAssignment,
    handleAttachmentAdded,
    handleAttachmentRemoved,
    handleDeleteTask,
    handleSubmit,
    isEditMode
  };
};
