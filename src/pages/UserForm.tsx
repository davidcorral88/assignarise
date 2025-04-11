import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { getUserById, addUser, updateUser, getNextUserId } from '../utils/dataService';
import { User } from '../utils/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft, Save } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { toNumericId } from '@/utils/typeUtils';

const UserForm = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>({
    id: 0,
    name: '',
    email: '',
    role: 'user',
    active: true
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isNewUser, setIsNewUser] = useState<boolean>(true);

  useEffect(() => {
    const loadUser = async () => {
      if (userId) {
        try {
          const numericUserId = toNumericId(userId);
          if (numericUserId !== undefined) {
            const userData = await getUserById(numericUserId);
            if (userData) {
              setUser(userData);
              setIsNewUser(false);
            } else {
              navigate('/users');
            }
          }
        } catch (error) {
          console.error("Error loading user:", error);
          navigate('/users');
        }
      } else {
        // New user - get next available ID
        const getNextId = async () => {
          try {
            const nextId = await getNextUserId();
            setUser(prev => ({ ...prev, id: nextId }));
          } catch (error) {
            console.error("Error getting next user ID:", error);
          }
        };
        getNextId();
      }
    };
    
    loadUser();
  }, [userId, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setUser(prev => ({ ...prev, role: value }));
  };

  const handleActiveChange = (checked: boolean) => {
    setUser(prev => ({ ...prev, active: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isNewUser) {
        await addUser(user);
        toast({
          title: "Usuario creado",
          description: `El usuario ${user.name} ha sido creado correctamente.`,
        });
      } else {
        await updateUser(user.id, user);
        toast({
          title: "Usuario actualizado",
          description: `El usuario ${user.name} ha sido actualizado correctamente.`,
        });
      }
      navigate('/users');
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el usuario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-10">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/users')}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h2 className="text-3xl font-bold">
            {isNewUser ? 'Crear Usuario' : 'Editar Usuario'}
          </h2>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{isNewUser ? 'Nuevo Usuario' : 'Editar Usuario'}</CardTitle>
            <CardDescription>
              {isNewUser 
                ? 'Completa el formulario para crear un nuevo usuario.' 
                : 'Modifica los datos del usuario.'}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID</Label>
                <Input
                  id="id"
                  name="id"
                  value={user.id}
                  disabled
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={user.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select 
                  value={user.role} 
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="user">Usuario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="active" 
                  checked={user.active} 
                  onCheckedChange={handleActiveChange}
                />
                <Label htmlFor="active">Usuario activo</Label>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/users')}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
              >
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default UserForm;
