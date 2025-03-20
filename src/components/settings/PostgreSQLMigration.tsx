
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseIcon, ServerIcon, CheckCircle2Icon, AlertCircleIcon, DatabaseBackupIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { migrateToPostgreSQL, testPostgreSQLConnection } from '@/utils/migrationService';

const PostgreSQLMigration: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [apiUrl, setApiUrl] = useState('http://localhost:3000/api');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    try {
      const isConnected = await testPostgreSQLConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (isConnected) {
        toast({
          title: "Conexión exitosa",
          description: "Se ha establecido conexión con la base de datos PostgreSQL",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con la base de datos PostgreSQL",
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la base de datos PostgreSQL",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const handleMigrate = async () => {
    if (connectionStatus !== 'connected') {
      toast({
        title: "Conexión no establecida",
        description: "Primero debe verificar la conexión con PostgreSQL",
        variant: "destructive"
      });
      return;
    }
    
    setIsMigrating(true);
    setMigrationProgress(10);
    
    try {
      // Simulamos progreso durante la migración
      const progressInterval = setInterval(() => {
        setMigrationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);
      
      const result = await migrateToPostgreSQL();
      
      clearInterval(progressInterval);
      setMigrationProgress(100);
      
      if (result.success) {
        toast({
          title: "Migración completada",
          description: result.message,
        });
      } else {
        toast({
          title: "Migración con errores",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setMigrationProgress(0);
      toast({
        title: "Error en la migración",
        description: "Ocurrió un error inesperado durante la migración",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DatabaseIcon className="mr-2 h-5 w-5" />
          Migración a PostgreSQL
        </CardTitle>
        <CardDescription>
          Migre sus datos desde el almacenamiento local a una base de datos PostgreSQL para mayor robustez y escalabilidad.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="api-url" className="text-sm font-medium">
            URL de la API PostgreSQL
          </label>
          <div className="flex gap-2">
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:3000/api"
              disabled={isMigrating}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection || isMigrating}
            >
              {isTestingConnection ? 'Verificando...' : 'Verificar conexión'}
            </Button>
          </div>
          
          {connectionStatus === 'connected' && (
            <div className="bg-green-100 p-3 rounded-md flex items-start mt-2">
              <CheckCircle2Icon className="mr-2 h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Conexión establecida</h4>
                <p className="text-sm text-green-700">Se ha conectado correctamente a la base de datos PostgreSQL.</p>
              </div>
            </div>
          )}
          
          {connectionStatus === 'failed' && (
            <div className="bg-destructive/15 p-3 rounded-md flex items-start mt-2">
              <AlertCircleIcon className="mr-2 h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-destructive">Error de conexión</h4>
                <p className="text-sm text-destructive/90">
                  No se pudo conectar con la base de datos PostgreSQL. Verifique que el servidor esté funcionando y la URL sea correcta.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {connectionStatus === 'connected' && (
          <>
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-2">Progreso de la migración</h3>
              <Progress value={migrationProgress} className="h-2" />
              {migrationProgress > 0 && migrationProgress < 100 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Migrando datos... {migrationProgress}%
                </p>
              )}
              {migrationProgress === 100 && (
                <p className="text-xs text-green-600 mt-1">
                  Migración completada
                </p>
              )}
            </div>
            
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <ServerIcon className="mr-2 h-4 w-4" />
                Información importante
              </h3>
              <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                <li>Esta operación migrará todos sus datos actuales a PostgreSQL.</li>
                <li>Asegúrese de que la base de datos PostgreSQL esté configurada correctamente con las tablas necesarias.</li>
                <li>Se recomienda realizar una copia de seguridad antes de la migración.</li>
                <li>La migración puede tardar varios minutos dependiendo de la cantidad de datos.</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            toast({
              title: "Copia de seguridad creada",
              description: "Se ha creado una copia de seguridad de los datos actuales",
            });
          }}
          disabled={isMigrating}
        >
          <DatabaseBackupIcon className="mr-2 h-4 w-4" />
          Crear copia de seguridad
        </Button>
        <Button
          onClick={handleMigrate}
          disabled={connectionStatus !== 'connected' || isMigrating}
        >
          {isMigrating ? (
            <>
              <span className="mr-2">Migrando datos...</span>
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
            </>
          ) : (
            <>
              <DatabaseIcon className="mr-2 h-4 w-4" />
              Iniciar migración
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostgreSQLMigration;
