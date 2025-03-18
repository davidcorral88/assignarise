
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Layout } from '../components/layout/Layout';
import { ArrowLeft, Save, Clock, User as UserIcon, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { mockUsers, getUserById } from '../utils/mockData';
import { User, UserRole } from '../utils/types';
import { toast } from '@/components/ui/use-toast';

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    // Only managers can access this page
    if (currentUser?.role !== 'manager') {
      navigate('/dashboard');
    }
    
    if (isEditing && id) {
      const user = getUserById(id);
      if (user) {
        setName(user.name);
        setEmail(user.email);
        setRole(user.role);
      }
    }
    setLoading(false);
  }, [id, isEditing, currentUser, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un email válido',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would be an API call to save the user
      const user: User = {
        id: isEditing && id ? id : String(mockUsers.length + 1),
        name,
        email,
        role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`
      };
      
      toast({
        title: isEditing ? 'Usuario actualizado' : 'Usuario creado',
        description: isEditing ? 'El usuario ha sido actualizado correctamente.' : 'El usuario ha sido creado correctamente.',
      });
      
      // Navigate back to users list
      navigate('/users');
      
      setSubmitting(false);
    }, 800);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="pl-0 hover:pl-0 hover:bg-transparent" 
            onClick={() => navigate('/users')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a usuarios
          </Button>
          
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Información del usuario</CardTitle>
              <CardDescription>
                Ingresa los detalles del usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ingresa el nombre completo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Rol</Label>
                <RadioGroup value={role} onValueChange={(value) => setRole(value as UserRole)} className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="worker" id="worker" />
                    <Label htmlFor="worker" className="flex items-center cursor-pointer">
                      <UserIcon className="mr-1.5 h-4 w-4" />
                      Trabajador
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="manager" id="manager" />
                    <Label htmlFor="manager" className="flex items-center cursor-pointer">
                      <Shield className="mr-1.5 h-4 w-4" />
                      Gerente
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Nota: </span>
                  {role === 'manager' 
                    ? 'Los gerentes pueden crear, ver y editar todas las tareas y usuarios en el sistema.' 
                    : 'Los trabajadores solo pueden ver, crear y editar sus propias tareas asignadas.'}
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6">
              <Button className="w-full" type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEditing ? 'Actualizar usuario' : 'Crear usuario'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </Layout>
  );
};

export default UserForm;
