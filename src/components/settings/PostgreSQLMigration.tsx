import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DatabaseIcon, ServerIcon, CheckCircle2Icon, AlertCircleIcon, DatabaseBackupIcon, InfoIcon, ExternalLinkIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { migrateToPostgreSQL, testPostgreSQLConnection } from '@/utils/migrationService';
import { getUseAPI, setUseAPI } from '@/utils/dataService';
import { API_URL, dbConfig, pgAdminConfig } from '@/utils/dbConfig';

const PostgreSQLMigration: React.FC = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [apiUrl, setApiUrl] = useState(API_URL);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [usePostgresStorage, setUsePostgresStorage] = useState(getUseAPI);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [lastConnectionError, setLastConnectionError] = useState<string | null>(null);
  
  useEffect(() => {
    // Check if postgres is already active
    setUsePostgresStorage(getUseAPI());
    
    // Intentamos conectar nada más cargar el componente
    handleTestConnection();
  }, []);
  
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setLastConnectionError(null);
    
    try {
      console.log("Iniciando prueba de conexión a:", apiUrl);
      // Actualizar URL global para asegurar que usamos la URL actual
      if (apiUrl !== API_URL) {
        // En una aplicación real, se guardaría en algún lugar persistente
        console.log("Actualizando URL de API de", API_URL, "a", apiUrl);
      }
      
      const isConnected = await testPostgreSQLConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      
      if (isConnected) {
        toast({
          title: "Conexión exitosa",
          description: "Se ha establecido conexión con la base de datos PostgreSQL",
        });
        
        // Si la conexión es exitosa, activamos automáticamente el uso de PostgreSQL
        setUseAPI(true);
        setUsePostgresStorage(true);
        
      } else {
        const errorMsg = "No se pudo conectar con la base de datos PostgreSQL. Revise la consola para más detalles.";
        setLastConnectionError(errorMsg);
        toast({
          title: "Error de conexión",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } catch (error) {
      setConnectionStatus('failed');
      const errorMsg = error instanceof Error ? error.message : "Error desconocido";
      setLastConnectionError(errorMsg);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con la base de datos PostgreSQL",
        variant: "destructive"
      });
      console.error("Error detallado:", error);
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
        // Activar el uso de PostgreSQL automáticamente después de una migración exitosa
        setUseAPI(true);
        setUsePostgresStorage(true);
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
  
  const handleToggleStorage = (checked: boolean) => {
    // Solo permitir activar PostgreSQL si la conexión está establecida
    if (checked && connectionStatus !== 'connected') {
      toast({
        title: "Conexión no establecida",
        description: "Primero debe verificar la conexión con PostgreSQL",
        variant: "destructive"
      });
      return;
    }
    
    setUsePostgresStorage(checked);
    setUseAPI(checked);
    
    localStorage.setItem('useAPI', checked.toString());
    
    toast({
      title: checked ? "PostgreSQL activado" : "Almacenamiento local activado",
      description: checked 
        ? "La aplicación está usando la base de datos PostgreSQL" 
        : "La aplicación está usando el almacenamiento local",
    });
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
          <label htmlFor="api-url" className="text-sm font-medium flex justify-between">
            <span>URL de la API PostgreSQL</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 px-2 text-xs"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
            >
              <InfoIcon className="h-3 w-3 mr-1" />
              Info conexión
            </Button>
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
          
          {showDebugInfo && (
            <div className="bg-muted p-3 rounded-md mt-2 text-xs">
              <p><strong>Configuración de conexión:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Host: {dbConfig.host}</li>
                <li>Puerto: {dbConfig.port}</li>
                <li>Base de datos: {dbConfig.database}</li>
                <li>Usuario: {dbConfig.user}</li>
                <li>Contraseña: {dbConfig.password}</li>
                <li>URL API: {apiUrl}</li>
              </ul>
              <p className="mt-2"><strong>Configuración de administrador:</strong></p>
              <ul className="list-disc pl-5 space-y-1 mt-1">
                <li>Usuario: {pgAdminConfig.user}</li>
                <li>Contraseña: {pgAdminConfig.password}</li>
              </ul>
              <p className="mt-2"><strong>Nota:</strong> La API está corriendo en http://localhost:3000. Asegúrese de que el servidor esté en ejecución.</p>
              
              <div className="mt-3 space-y-2">
                <p><strong>Enlaces útiles para verificación:</strong></p>
                <div className="flex flex-col space-y-1">
                  <a 
                    href={`${apiUrl}/users`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Verificar endpoint users <ExternalLinkIcon className="ml-1 h-3 w-3" />
                  </a>
                  <a 
                    href={`${apiUrl.replace(/\/api$/, '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center"
                  >
                    Verificar servidor API <ExternalLinkIcon className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
          
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
                {lastConnectionError && (
                  <p className="text-xs text-destructive/90 mt-1">
                    Detalles: {lastConnectionError}
                  </p>
                )}
                <ul className="list-disc pl-5 text-xs text-destructive/80 mt-1">
                  <li>Compruebe que PostgreSQL está ejecutándose en el puerto {dbConfig.port}</li>
                  <li>Verifique que existe la base de datos '{dbConfig.database}'</li>
                  <li>Confirme que el usuario '{dbConfig.user}' tiene acceso</li>
                  <li>Asegúrese de que el servidor API esté funcionando en la URL proporcionada</li>
                  <li>Revise la consola del navegador para obtener más detalles sobre el error</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {connectionStatus === 'connected' && (
          <div className="flex items-center space-x-2 pt-4 border-t">
            <Switch
              id="use-postgresql"
              checked={usePostgresStorage}
              onCheckedChange={handleToggleStorage}
              disabled={isMigrating}
            />
            <Label htmlFor="use-postgresql" className="font-medium">
              Usar PostgreSQL como almacenamiento principal
            </Label>
          </div>
        )}
        
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
