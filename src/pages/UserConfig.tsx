import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useAuth } from '@/components/auth/useAuth';

const UserConfig = () => {
  const { currentUser } = useAuth();
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Xestión de perfil de usuario
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Perfil de Usuario</CardTitle>
            <CardDescription>
              Xestiona a túa información persoal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Nome:</p>
                  <p>{currentUser?.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email:</p>
                  <p>{currentUser?.email}</p>
                </div>
                <div>
                  <p className="font-medium">Rol:</p>
                  <p>{currentUser?.role === 'admin' ? 'Administrador' : 
                      currentUser?.role === 'director' ? 'Director' : 'Traballador'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserConfig;
