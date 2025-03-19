
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Filter, Briefcase, Stethoscope } from 'lucide-react';

const AllUsersVacationsCalendar: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);
  const [daysToShow, setDaysToShow] = useState<string[]>(["all", "vacation", "sick_leave"]);
  
  useEffect(() => {
    const allUsers = getUsers();
    setUsers(allUsers);
    
    if (allUsers.length > 0) {
      setSelectedUserId(allUsers[0].id);
    }
  }, []);
  
  const handleToggleChange = (value: string[]) => {
    // If "all" is being added or removed, handle special logic
    if (value.includes('all') && !daysToShow.includes('all')) {
      // If "all" is being added, remove other options
      setDaysToShow(['all']);
    } else if (!value.includes('all') && daysToShow.includes('all')) {
      // If "all" is being removed, add both other options
      setDaysToShow(['vacation', 'sick_leave']);
    } else if (value.length === 0) {
      // Don't allow empty selection, default to "all"
      setDaysToShow(['all']);
    } else {
      // For other changes, just update as normal
      setDaysToShow(value);
    }
  };
  
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
      
      <div className="flex justify-end">
        <ToggleGroup 
          type="multiple" 
          value={daysToShow}
          onValueChange={handleToggleChange}
        >
          <ToggleGroupItem value="all" aria-label="Mostrar todos">
            <Filter className="h-4 w-4 mr-2" />
            Todos
          </ToggleGroupItem>
          <ToggleGroupItem value="vacation" aria-label="Mostrar vacacións">
            <Briefcase className="h-4 w-4 mr-2" />
            Vacacións
          </ToggleGroupItem>
          <ToggleGroupItem value="sick_leave" aria-label="Mostrar baixas">
            <Stethoscope className="h-4 w-4 mr-2" />
            Baixa médica
          </ToggleGroupItem>
        </ToggleGroup>
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
