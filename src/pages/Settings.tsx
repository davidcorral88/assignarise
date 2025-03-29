
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetDatabaseDialog } from '@/components/settings/ResetDatabaseDialog';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import PostgreSQLMigration from '@/components/settings/PostgreSQLMigration';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Database } from 'lucide-react';
import { getUseAPI } from '@/utils/dataService';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Solo los administradores pueden acceder a esta página
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser || currentUser.role !== 'admin') {
    return null;
  }
  
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Configuración</CardTitle>
          <CardDescription>
            Axusta a configuración da aplicación
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <Alert className={getUseAPI() ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}>
            <Database className={`h-4 w-4 ${getUseAPI() ? "text-green-600" : "text-yellow-600"}`} />
            <AlertTitle className={getUseAPI() ? "text-green-800" : "text-yellow-800"}>
              {getUseAPI() ? "PostgreSQL activado" : "Almacenamiento local activado"}
            </AlertTitle>
            <AlertDescription className={getUseAPI() ? "text-green-700" : "text-yellow-700"}>
              {getUseAPI() 
                ? "La aplicación está utilizando PostgreSQL como sistema de almacenamiento principal." 
                : "La aplicación está utilizando el almacenamiento local. Se recomienda cambiar a PostgreSQL para un entorno de producción."}
            </AlertDescription>
          </Alert>
          
          <PostgreSQLMigration />
          <DatabaseBackup />
          <DatabaseImport />
          <StorageUsage />
          <ResetDatabaseDialog />
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
