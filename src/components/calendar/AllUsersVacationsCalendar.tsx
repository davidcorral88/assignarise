
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { 
  getUsers, 
  getHolidays, 
  getVacationDays 
} from '@/utils/mockData';
import { User, Holiday, VacationDay } from '@/utils/types';
import { format } from 'date-fns';
import UserVacationsCalendar from './UserVacationsCalendar';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";

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
          <CardHeader>
            <CardTitle>
              Vacacións e baixas de {users.find(u => u.id === selectedUserId)?.name}
            </CardTitle>
            <CardDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="bg-green-100">Vacacións</Badge>
                <Badge variant="outline" className="bg-amber-100">Baixa</Badge>
                <Badge variant="outline" className="bg-blue-100">Festivo</Badge>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserVacationsCalendar userId={selectedUserId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AllUsersVacationsCalendar;
