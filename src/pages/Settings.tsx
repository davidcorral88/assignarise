import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { DatabaseBackup, FileUp, RefreshCw, HardDrive, AlertCircle, CheckCircle2, Ban, Database } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { resetDatabase, downloadDatabaseBackup, importDatabaseFromJSON, getStorageUsage } from '@/utils/mockData';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import PostgreSQLMigration from '@/components/settings/PostgreSQLMigration';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [fileImportError, setFileImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [storageUsage, setStorageUsage] = useState(getStorageUsage());
  
  // Solo los gerentes pueden acceder a esta página
  React.useEffect(() => {
    if (currentUser?.role !== 'manager') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileImportError(null);
    setImportSuccess(false);
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Verificar que es un archivo JSON
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      setFileImportError('O arquivo debe ser de tipo JSON');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importDatabaseFromJSON(content);
        
        if (success) {
          setImportSuccess(true);
          toast({
            title: 'Base de datos importada',
            description: 'A base de datos foi importada correctamente',
          });
          // Actualizar uso de almacenamiento
          setStorageUsage(getStorageUsage());
        }
      } catch (error) {
        setFileImportError('O formato do arquivo é inválido');
      }
    };
    reader.onerror = () => {
      setFileImportError('Error ao ler o arquivo');
    };
    reader.readAsText(file);
  };
  
  const handleResetDatabase = () => {
    resetDatabase();
    toast({
      title: 'Base de datos restablecida',
      description: 'A base de datos foi restablecida aos valores iniciais',
    });
    // Actualizar uso de almacenamiento
    setStorageUsage(getStorageUsage());
  };
  
  const handleBackupDatabase = () => {
    downloadDatabaseBackup();
    // Actualizar uso de almacenamiento
    setStorageUsage(getStorageUsage());
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-1">
            Xestiona as configuracións da aplicación
          </p>
        </div>
        
        <Tabs defaultValue="database" className="w-full">
          <TabsList>
            <TabsTrigger value="database">Base de datos</TabsTrigger>
            <TabsTrigger value="postgresql">PostgreSQL</TabsTrigger>
            <TabsTrigger value="general">Xeral</TabsTrigger>
          </TabsList>
          
          <TabsContent value="database" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="mr-2 h-5 w-5" />
                  Almacenamento local
                </CardTitle>
                <CardDescription>
                  Esta aplicación utiliza o almacenamento local do navegador para gardar os datos.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Uso do almacenamento</Label>
                    <span className="text-sm">{storageUsage.toFixed(1)}%</span>
                  </div>
                  <Progress value={storageUsage} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    O almacenamento local está limitado a aproximadamente 5MB. Recomendamos realizar respaldos regulares.
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleBackupDatabase}
                    >
                      <DatabaseBackup className="mr-2 h-4 w-4" />
                      Crear respaldo
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Descarga un arquivo JSON coa base de datos actual.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => document.getElementById('import-file')?.click()}
                    >
                      <FileUp className="mr-2 h-4 w-4" />
                      Importar respaldo
                    </Button>
                    <input 
                      id="import-file" 
                      type="file" 
                      accept=".json,application/json" 
                      className="hidden"
                      onChange={handleImportFile} 
                      onClick={(e) => {
                        // Reset value to allow importing the same file multiple times
                        (e.target as HTMLInputElement).value = '';
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Importa un arquivo JSON coa base de datos.
                    </p>
                  </div>
                </div>
                
                {fileImportError && (
                  <div className="bg-destructive/15 p-3 rounded-md flex items-start">
                    <AlertCircle className="mr-2 h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-destructive">Erro de importación</h4>
                      <p className="text-sm text-destructive/90">{fileImportError}</p>
                    </div>
                  </div>
                )}
                
                {importSuccess && (
                  <div className="bg-green-100 p-3 rounded-md flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Importación correcta</h4>
                      <p className="text-sm text-green-700">A base de datos foi importada correctamente.</p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Restablecer base de datos
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Estás seguro?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción eliminará todos os datos engadidos e restablecerá a base de datos aos valores iniciais.
                        Esta acción non se pode desfacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetDatabase}>
                        Restablecer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Ban className="mr-2 h-5 w-5" />
                  Limitacións do almacenamento local
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Almacenamento</Badge>
                    <h3 className="font-medium mb-1">Límite de 5MB</h3>
                    <p className="text-sm text-muted-foreground">
                      O localStorage ten un límite de aproximadamente 5MB por dominio.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Sen sincronización</Badge>
                    <h3 className="font-medium mb-1">Datos non compartidos</h3>
                    <p className="text-sm text-muted-foreground">
                      Os datos non se comparten entre distintos dispositivos ou navegadores.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Persistencia</Badge>
                    <h3 className="font-medium mb-1">Almacenamento local</h3>
                    <p className="text-sm text-muted-foreground">
                      Os datos poden perderse se o usuario limpa o caché do navegador.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-muted-foreground mb-4">
                  Se precisas capacidades avanzadas ou almacenamento compartido, contacta co administrador 
                  para implementar unha base de datos externa.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="postgresql" className="space-y-4 pt-4">
            <PostgreSQLMigration />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Ventajas de PostgreSQL
                </CardTitle>
                <CardDescription>
                  PostgreSQL ofrece numerosas ventajas sobre el almacenamiento local del navegador.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Almacenamiento</Badge>
                    <h3 className="font-medium mb-1">Sin límites prácticos</h3>
                    <p className="text-sm text-muted-foreground">
                      PostgreSQL puede manejar grandes volúmenes de datos, superando las limitaciones del localStorage.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Multiusuario</Badge>
                    <h3 className="font-medium mb-1">Acceso concurrente</h3>
                    <p className="text-sm text-muted-foreground">
                      Permite que múltiples usuarios trabajen simultáneamente con los mismos datos.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Seguridad</Badge>
                    <h3 className="font-medium mb-1">Control de acceso</h3>
                    <p className="text-sm text-muted-foreground">
                      Proporciona robustos mecanismos de seguridad y control de acceso a los datos.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Respaldo</Badge>
                    <h3 className="font-medium mb-1">Copias de seguridad</h3>
                    <p className="text-sm text-muted-foreground">
                      Permite programar copias de seguridad automáticas para proteger los datos.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Escalabilidad</Badge>
                    <h3 className="font-medium mb-1">Crecimiento</h3>
                    <p className="text-sm text-muted-foreground">
                      Escala con su organización a medida que crece, sin necesidad de migrar a otra tecnología.
                    </p>
                  </div>
                  
                  <div className="p-4 border rounded-md">
                    <Badge variant="outline" className="mb-2">Estándar</Badge>
                    <h3 className="font-medium mb-1">SQL completo</h3>
                    <p className="text-sm text-muted-foreground">
                      Implementa el estándar SQL con extensiones avanzadas para consultas complejas.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start">
                <p className="text-sm text-muted-foreground mb-4">
                  Para aprovechar todas estas ventajas, configure un servidor PostgreSQL y use el asistente de migración.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="general" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuración xeral</CardTitle>
                <CardDescription>
                  Axusta as configuracións xerais da aplicación.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Non hai configuracións xerais dispoñibles actualmente.
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
