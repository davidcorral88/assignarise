import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser, resetUserPassword } from '../utils/dataService';
import { User } from '../utils/types';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal, Plus, CheckSquare, ArrowLeft, Trash2, Edit, Filter, ChevronsUpDown } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { toNumericId } from '@/utils/typeUtils';

const UserList = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        setError(null);

        const usersData = await getUsers();
        setUsers(usersData);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
        setLoading(false);
      }
    };

    fetchUsersData();
  }, []);

  const filterUsers = () => {
    let filtered = users.filter(user => {
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = user.name.toLowerCase().includes(searchLower);
        const emailMatch = user.email.toLowerCase().includes(searchLower);

        if (!(nameMatch || emailMatch)) {
          return false;
        }
      }

      if (selectedRole && selectedRole !== '') {
        if (user.role !== selectedRole) {
          return false;
        }
      }

      return true;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        const aValue = a[sortField as keyof User];
        const bValue = b[sortField as keyof User];

        if (aValue === undefined || bValue === undefined) {
          return 0;
        }

        const aStr = typeof aValue === 'string' ? aValue.toLowerCase() : String(aValue);
        const bStr = typeof bValue === 'string' ? bValue.toLowerCase() : String(bValue);

        if (aStr < bStr) {
          return sortOrder === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortOrder === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const filteredUsers = filterUsers();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIndicator = (field: string) => {
    if (sortField === field) {
      return sortOrder === 'asc' ? "↑" : "↓";
    }
    return null;
  };

  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleDeleteUser = async (userId: string | number) => {
    const numericUserId = toNumericId(userId);
    if (numericUserId !== undefined) {
      try {
        await deleteUser(numericUserId);
        setUsers(prevUsers => prevUsers.filter(user => user.id !== numericUserId));
        toast({
          title: 'Usuario eliminado',
          description: 'El usuario ha sido eliminado correctamente.',
        });
      } catch (error) {
        console.error('Error deleting user:', error);
        toast({
          title: 'Error al eliminar usuario',
          description: 'No se pudo eliminar el usuario. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  const confirmDeleteUser = (userId: string | number) => {
    const numericUserId = toNumericId(userId);
    if (numericUserId !== undefined) {
      setSelectedUserId(numericUserId);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleResetPassword = async (userId: string | number) => {
    const numericUserId = toNumericId(userId);
    if (numericUserId !== undefined) {
      setSelectedUserId(numericUserId);
      setIsResetPasswordDialogOpen(true);
    }
  };

  const resetPassword = async () => {
    if (selectedUserId !== null) {
      try {
        const result = await resetUserPassword(selectedUserId);
        if (result.success) {
          toast({
            title: 'Contraseña restablecida',
            description: `La contraseña del usuario ha sido restablecida. Nueva contraseña: ${result.password}`,
          });
        } else {
          toast({
            title: 'Error al restablecer la contraseña',
            description: 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        toast({
          title: 'Error al restablecer la contraseña',
          description: 'No se pudo restablecer la contraseña. Inténtalo de nuevo.',
          variant: 'destructive',
        });
      } finally {
        setIsResetPasswordDialogOpen(false);
        setSelectedUserId(null);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <CheckSquare className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div>
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const canCreateUsers = currentUser?.role === 'admin';

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-0.5">
            <h2 className="text-2xl font-semibold tracking-tight">
              Lista de Usuarios
            </h2>
            <p className="text-muted-foreground">
              Aquí tes unha lista de todos os usuarios.
            </p>
          </div>
          {canCreateUsers && (
            <Button onClick={() => navigate('/users/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
            <CardDescription>
              Utiliza os filtros para refinar a lista de usuarios.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Buscar por nome, correo electrónico..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div>
              <Label htmlFor="role">Rol</Label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="director">Director</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('id')} className="cursor-pointer">
                  ID {getSortIndicator('id')}
                </TableHead>
                <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                  Nome {getSortIndicator('name')}
                </TableHead>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                  Correo electrónico {getSortIndicator('email')}
                </TableHead>
                <TableHead onClick={() => handleSort('role')} className="cursor-pointer">
                  Rol {getSortIndicator('role')}
                </TableHead>
                <TableHead>Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Accións</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResetPassword(user.id)}>
                          <Filter className="h-4 w-4 mr-2" />
                          Restablecer contrasinal
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => confirmDeleteUser(user.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará o usuario permanentemente. Estás seguro de que queres continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUserId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeleteUser(selectedUserId!)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restablecer contrasinal</AlertDialogTitle>
            <AlertDialogDescription>
              Estás seguro de que queres restablecer o contrasinal deste usuario? Enviarase un novo contrasinal ao seu correo electrónico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedUserId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={resetPassword}>Restablecer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default UserList;
