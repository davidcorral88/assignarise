
import React, { useState } from 'react';
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
import HolidaysCalendar from '@/components/calendar/HolidaysCalendar';
import UserVacationsCalendar from '@/components/calendar/UserVacationsCalendar';
import AllUsersVacationsCalendar from '@/components/calendar/AllUsersVacationsCalendar';

const UserConfig = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Xestión de calendario, festivos, vacacións e baixas
          </p>
        </div>
        
        <Tabs defaultValue="holidays">
          <TabsList className="mb-4">
            <TabsTrigger value="holidays">Festivos</TabsTrigger>
            {isManager && <TabsTrigger value="all-users-vacations">Vacacións de Traballadores</TabsTrigger>}
            <TabsTrigger value="my-vacations">As Miñas Vacacións</TabsTrigger>
          </TabsList>
          
          <TabsContent value="holidays">
            <Card>
              <CardHeader>
                <CardTitle>Festivos</CardTitle>
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
          
          {isManager && (
            <TabsContent value="all-users-vacations">
              <Card>
                <CardHeader>
                  <CardTitle>Vacacións e Baixas dos Traballadores</CardTitle>
                  <CardDescription>
                    Xestiona os días de vacacións e baixas para todos os traballadores.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AllUsersVacationsCalendar />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="my-vacations">
            <Card>
              <CardHeader>
                <CardTitle>As Miñas Vacacións e Baixas</CardTitle>
                <CardDescription>
                  Xestiona os teus días de vacacións e baixas. Fai clic no calendario para marcar ou desmarcar días.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserVacationsCalendar userId={currentUser?.id} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserConfig;
