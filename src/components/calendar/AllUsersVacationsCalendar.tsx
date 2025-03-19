
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { getUsers } from '@/utils/mockData';
import { User } from '@/utils/types';
import UserVacationsCalendar from './UserVacationsCalendar';

const AllUsersVacationsCalendar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    const allUsers = getUsers();
    setUsers(allUsers);
    
    if (allUsers.length > 0) {
      setSelectedUserId(allUsers[0].id);
    }
  }, []);
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="user-select">Selecciona un traballador</Label>
        <Select
          value={selectedUserId}
          onValueChange={(value: string) => setSelectedUserId(value)}
        >
          <SelectTrigger id="user-select" className="w-full">
            <SelectValue placeholder="Selecciona un traballador" />
          </SelectTrigger>
          <SelectContent>
            {users.map(user => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedUserId && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">
              Ausencias de {users.find(u => u.id === selectedUserId)?.name}
            </h3>
            <UserVacationsCalendar userId={selectedUserId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllUsersVacationsCalendar;
