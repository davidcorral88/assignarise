
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
  CardTitle, 
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { resetDatabase } from '@/utils/mockData';
import HolidaysCalendar from '@/components/calendar/HolidaysCalendar';

const Settings = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';
  const { toast } = useToast();
  
  const handleResetDatabase = () => {
    resetDatabase();
    
    toast({
      title: "Base de datos restablecida",
      description: "A base de datos foi restablecida con éxito cos datos iniciais",
    });
  };
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Xestión da configuración da aplicación
          </p>
        </div>
        
        <Tabs defaultValue="calendar">
          <TabsList className="mb-4">
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="general">Xeral</TabsTrigger>
            {isManager && <TabsTrigger value="advanced">Avanzada</TabsTrigger>}
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar">
            <Card>
              <CardHeader>
                <CardTitle>Calendario Anual</CardTitle>
                <CardDescription>
                  {isManager 
                    ? "Xestiona os días festivos para todo o persoal. Fai clic no calendario para engadir ou quitar festivos."
                    : "Visualiza os días festivos establecidos para a empresa."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HolidaysCalendar isEditable={isManager} />
              </CardContent>
            </Card>
          </TabsContent>
          
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
                <CardContent className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Precaución</AlertTitle>
                    <AlertDescription>
                      As seguintes opcións poden afectar ao funcionamento da aplicación. Utilice con precaución.
                    </AlertDescription>
                  </Alert>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Xestión de Datos</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Permite restablecer a base de datos. Esta acción non se pode desfacer.
                    </p>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="flex items-center">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Restablecer a base de datos
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>¿Está seguro?</DialogTitle>
                          <DialogDescription>
                            Esta acción eliminará todos os datos actuais e restablecerá a base de datos
                            cos exemplos iniciais. Esta acción non se pode desfacer.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex space-x-2 justify-end">
                          <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button 
                              variant="destructive" 
                              onClick={handleResetDatabase}
                            >
                              Restablecer
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
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
