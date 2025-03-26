
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResetDatabaseDialog } from '@/components/settings/ResetDatabaseDialog';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import PostgreSQLMigration from '@/components/settings/PostgreSQLMigration';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Only admin can access this page
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
