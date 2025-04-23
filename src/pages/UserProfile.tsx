
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById } from '../utils/dataService';
import { Layout } from '../components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/utils/types';
import { ArrowLeft, Phone, Mail, Shield, UserIcon, Building } from 'lucide-react';
import { useAuth } from '../components/auth/useAuth';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const canEdit = currentUser && 
    (currentUser.role === 'admin' || currentUser.id === parseInt(id || '0', 10));
    
  useEffect(() => {
    const loadUser = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const userData = await getUserById(parseInt(id, 10));
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
        toast({
          title: 'Error',
          description: 'Non se pudo cargar os datos do usuario',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [id]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };
  
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'director':
        return 'Director';
      case 'worker':
        return 'Traballador';
      default:
        return role;
    }
  };
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'director':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-6 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-100 rounded-md"></div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="container py-6">
          <div className="flex items-center mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Usuario non atopado</h2>
            <p className="text-muted-foreground mt-2">
              O usuario solicitado non existe ou foi eliminado.
            </p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-6 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate('/users')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver á lista
            </Button>
            <h1 className="text-2xl font-bold">Perfil do usuario</h1>
          </div>
          
          {canEdit && (
            <Button onClick={() => navigate(`/users/${user.id}/edit`)}>
              Editar perfil
            </Button>
          )}
        </div>
        
        <div className="grid gap-6 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar || undefined} alt={user.name} />
                    <AvatarFallback className="text-lg">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">{user.name}</CardTitle>
                    <Badge variant="outline" className={getRoleBadgeClass(user.role)}>
                      {user.role === 'admin' ? (
                        <Shield className="mr-1 h-3 w-3" />
                      ) : user.role === 'director' ? (
                        <Shield className="mr-1 h-3 w-3" />
                      ) : (
                        <UserIcon className="mr-1 h-3 w-3" />
                      )}
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    {user.active === false && (
                      <Badge variant="outline" className="ml-2 bg-red-50 text-red-800 border-red-100">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                {user.organization && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-100 flex items-center">
                    <Building className="mr-1 h-3 w-3" />
                    {user.organization}
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <Separator />
            
            <CardContent className="pt-6">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <p>{user.email}</p>
                    </div>
                  </div>
                  
                  {user.emailATSXPTPG && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Email ATSXPTPG</h3>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p>{user.emailATSXPTPG}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.phone && (
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Teléfono</h3>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p>{user.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                    <p>{user.active ? 'Activo' : 'Inactivo'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Organización</h3>
                    <p>{user.organization || 'Non especificada'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Notificacións por email</h3>
                    <p>{user.email_notification ? 'Activadas' : 'Desactivadas'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
