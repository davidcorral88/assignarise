
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KeyRound } from 'lucide-react';
import { useAuth } from '@/components/auth/useAuth';
import ChangePasswordDialog from '@/components/auth/ChangePasswordDialog';

const UserConfig = () => {
  const { currentUser } = useAuth();
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false);
  
  // Function to get role display name
  const getRoleDisplayName = (role: string | undefined) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'director':
        return 'Director';
      case 'worker':
        return 'Traballador';
      default:
        return 'Non especificado';
    }
  };
  
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
                  <p>{getRoleDisplayName(currentUser?.role)}</p>
                </div>
                <div>
                  <p className="font-medium">Organización:</p>
                  <p>{currentUser?.organization || currentUser?.organism || 'Non especificado'}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline"
              onClick={() => setChangePasswordDialogOpen(true)}
              className="flex items-center"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Cambiar contrasinal
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <ChangePasswordDialog 
        open={changePasswordDialogOpen} 
        onOpenChange={setChangePasswordDialogOpen} 
      />
    </Layout>
  );
};

export default UserConfig;
