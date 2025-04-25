
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from '@/utils/types';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkerSelectorProps {
  users: User[];
  selectedWorkerId: number | null;
  onSelect: (userId: number | null) => void;
  isLoading: boolean;
}

export const WorkerSelector: React.FC<WorkerSelectorProps> = ({
  users,
  selectedWorkerId,
  onSelect,
  isLoading
}) => {
  if (isLoading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const handleSelect = (value: string) => {
    if (value === 'all') {
      onSelect(null);
    } else {
      onSelect(parseInt(value, 10));
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Seleccionar Traballador</label>
      <Select 
        value={selectedWorkerId?.toString() || 'all'} 
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Todos os traballadores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os traballadores</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
