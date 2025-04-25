
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatabaseBackup } from '@/components/settings/DatabaseBackup';
import { DatabaseImport } from '@/components/settings/DatabaseImport';
import PostgreSQLMigration from '@/components/settings/PostgreSQLMigration';
import { DailyReview } from '@/components/settings/DailyReview';
import { StorageUsage } from '@/components/settings/StorageUsage';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Xestiona a configuración da aplicación.
          </p>
        </div>
        <Tabs defaultValue="review">
          <TabsList>
            <TabsTrigger value="review">Revisión diaria</TabsTrigger>
            <TabsTrigger value="backup">Copia de seguridade</TabsTrigger>
            <TabsTrigger value="import">Importar datos</TabsTrigger>
            <TabsTrigger value="storage">Almacenamento</TabsTrigger>
            <TabsTrigger value="migration">Migración</TabsTrigger>
          </TabsList>
          <TabsContent value="review" className="space-y-4">
            <DailyReview />
          </TabsContent>
          <TabsContent value="backup" className="space-y-4">
            <DatabaseBackup />
          </TabsContent>
          <TabsContent value="import" className="space-y-4">
            <DatabaseImport />
          </TabsContent>
          <TabsContent value="storage" className="space-y-4">
            <StorageUsage />
          </TabsContent>
          <TabsContent value="migration" className="space-y-4">
            <PostgreSQLMigration />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Settings;
