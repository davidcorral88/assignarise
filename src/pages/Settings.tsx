
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
          <Alert className="bg-green-50 border-green-200">
            <Database className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">
              PostgreSQL activado
            </AlertTitle>
            <AlertDescription className="text-green-700">
              La aplicación está utilizando PostgreSQL como sistema de almacenamiento principal de forma permanente.
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
