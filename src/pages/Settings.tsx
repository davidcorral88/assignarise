import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ResetDatabaseDialog } from '@/components/settings/ResetDatabaseDialog';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import { StorageUsage } from '@/components/settings/StorageUsage';
import { setUseAPI, getUseAPI } from '@/utils/dataService';

const Settings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [usePostgreSQL, setUsePostgreSQL] = useState(getUseAPI());
  
  useEffect(() => {
    // Only admin can access this page
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleUseAPIChange = (checked: boolean) => {
    setUsePostgreSQL(checked);
    setUseAPI(checked);
  };
  
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
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="use-postgresql">Usar PostgreSQL</Label>
            <Switch
              id="use-postgresql"
              checked={usePostgreSQL}
              onCheckedChange={handleUseAPIChange}
            />
          </div>
          
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
