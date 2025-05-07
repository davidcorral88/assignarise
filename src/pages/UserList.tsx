import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/useAuth';
import { Layout } from '../components/layout/Layout';
import { 
  Users, 
  PlusCircle, 
  Search, 
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Pencil,
  Trash2,
  AlertCircle,
  Phone,
  Check,
  X,
  KeyRound,
  Eye,
  FileJson,
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/use-toast';
import { getUsers, getUserById, updateUser, deleteUser } from '../utils/dataService';
import { User } from '../utils/types';
import ImportUsersButton from '../components/users/ImportUsersButton';
import ResetPasswordDialog from '../components/users/ResetPasswordDialog';

const UserList = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = currentUser?.role === 'admin';
  const canDeleteUsers = isAdmin;
  const canResetPassword = isAdmin;
  const canManageUsers = isAdmin;
  
  const canEditUser = (userId: number): boolean => {
    if (!currentUser) return false;
    
    if (currentUser.role === 'admin') return true;
    
    return currentUser.id === userId;
  };
  
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const loadedUsers = await getUsers();
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios desde PostgreSQL',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(
          user => 
            user.name.toLowerCase().includes(query) || 
            user.email.toLowerCase().includes(query)
        )
      );
    }
  }, [users, searchQuery]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Usuario eliminado",
        description: `${selectedUser.name} foi eliminado correctamente.`,
      });
      
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
    
    setShowDeleteDialog(false);
    setSelectedUser(null);
  };
  
  const handleToggleActive = async (userId: number, currentActive?: boolean) => {
    try {
      const user = await getUserById(userId);
      if (user) {
        const updatedUser = {
          ...user,
          active: currentActive === undefined ? true : !currentActive
        };
        await updateUser(userId, updatedUser);
        
        loadUsers();
        
        toast({
          title: updatedUser.active ? "Usuario activado" : "Usuario desactivado",
          description: `${user.name} foi ${updatedUser.active ? 'activado' : 'desactivado'} correctamente.`,
        });
      }
    } catch (error) {
      console.error('Error toggling user active state:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del usuario",
        variant: "destructive"
      });
    }
  };
  
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setShowResetPasswordDialog(true);
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
            <p className="text-muted-foreground mt-1">
              Xestiona os usuarios do sistema
            </p>
          </div>
          {canManageUsers && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <ImportUsersButton onImportComplete={loadUsers} />
              {isAdmin && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    const jsonStr = JSON.stringify(users, null, 2);
                    const blob = new Blob([jsonStr], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const date = new Date().toISOString().split('T')[0];
                    a.href = url;
                    a.download = `users-${date}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Usuarios exportados",
                      description: "O arquivo JSON foi descargado correctamente",
                    });
                  }}
                >
                  <FileJson className="mr-2 h-4 w-4" />
                  Descargar JSON
                </Button>
              )}
              <Button 
                onClick={() => navigate('/users/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Novo usuario
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuarios..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="rounded-md border animate-scale-in overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Email ATSXPTPG</TableHead>
                <TableHead>Organización</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Accións</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Cargando usuarios...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.phone ? (
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {user.phone}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Non dispoñible</span>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.emailATSXPTPG || (
                        <span className="text-muted-foreground text-sm">Non dispoñible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.organization || (
                        <span className="text-muted-foreground text-sm">Non dispoñible</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === 'admin' ? (
                        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                          <Shield className="mr-1 h-3 w-3" />
                          Administrador
                        </Badge>
                      ) : user.role === 'director' ? (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          <Shield className="mr-1 h-3 w-3" />
                          Director
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          <UserIcon className="mr-1 h-3 w-3" />
                          Traballador
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Checkbox 
                          checked={user.active !== false}
                          onCheckedChange={() => handleToggleActive(user.id, user.active)}
                          aria-label={user.active !== false ? "Usuario activo" : "Usuario inactivo"}
                          disabled={!isAdmin}
                        />
                        {user.active !== false ? (
                          <span className="ml-2 text-xs text-green-600">Activo</span>
                        ) : (
                          <span className="ml-2 text-xs text-red-600">Inactivo</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Accións</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Accións</DropdownMenuLabel>
                          
                          <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver perfil
                          </DropdownMenuItem>
                          
                          {canEditUser(user.id) && (
                            <DropdownMenuItem onClick={() => navigate(`/users/${user.id}/edit`)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          
                          {canResetPassword && (
                            <DropdownMenuItem 
                              onClick={() => handleResetPassword(user)}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Resetear contrasinal
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              
                              <DropdownMenuItem 
                                onClick={() => handleToggleActive(user.id, user.active)}
                              >
                                {user.active !== false ? (
                                  <>
                                    <X className="mr-2 h-4 w-4 text-red-500" />
                                    <span className="text-red-500">Desactivar</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="mr-2 h-4 w-4 text-green-500" />
                                    <span className="text-green-500">Activar</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            </>
                          )}
                          
                          {canDeleteUsers && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-500"
                                onClick={() => handleDeleteUser(user)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center py-8">
                      <Users className="h-10 w-10 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground">Non se atoparon usuarios</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-destructive mr-2" />
              Confirmar eliminación
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a <strong>{selectedUser?.name}</strong>?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {selectedUser && (
        <ResetPasswordDialog 
          open={showResetPasswordDialog} 
          onOpenChange={setShowResetPasswordDialog}
          user={selectedUser}
        />
      )}
    </Layout>
  );
};

export default UserList;
