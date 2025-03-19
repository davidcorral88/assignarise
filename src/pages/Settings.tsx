
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useAuth } from '@/components/auth/AuthContext';

const Settings = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Xestión da configuración da aplicación
          </p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Xeral</TabsTrigger>
            {isManager && <TabsTrigger value="advanced">Avanzada</TabsTrigger>}
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Configuración Xeral</CardTitle>
                <CardDescription>
                  Configuracións xerais da aplicación
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As opcións de configuración estarán dispoñibles proximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {isManager && (
            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Configuración Avanzada</CardTitle>
                  <CardDescription>
                    Opcións avanzadas de configuración (só para xerentes)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    As opcións de configuración avanzada estarán dispoñibles proximamente.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Configuración do Perfil</CardTitle>
                <CardDescription>
                  Xestiona o teu perfil de usuario
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  As opcións de configuración do perfil estarán dispoñibles proximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
