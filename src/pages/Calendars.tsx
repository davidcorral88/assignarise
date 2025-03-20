
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
import AllUsersVacationsCalendar from '@/components/calendar/AllUsersVacationsCalendar';
import UserVacationsCalendar from '@/components/calendar/UserVacationsCalendar';
import WorkdayScheduleTable from '@/components/schedule/WorkdayScheduleTable';

const Calendars = () => {
  const { currentUser } = useAuth();
  const isManager = currentUser?.role === 'manager';
  
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendarios</h1>
          <p className="text-muted-foreground">
            Xestión de festivos, vacacións, baixas e xornadas
          </p>
        </div>
        
        <Tabs defaultValue="holidays">
          <TabsList className="mb-4">
            <TabsTrigger value="holidays">Festivos</TabsTrigger>
            <TabsTrigger value="absences">Ausencias</TabsTrigger>
            <TabsTrigger value="workdays">Xornadas</TabsTrigger>
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
          
          <TabsContent value="absences">
            <Card>
              <CardHeader>
                <CardTitle>Ausencias</CardTitle>
                <CardDescription>
                  Xestión de vacacións e baixas médicas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isManager ? (
                  <AllUsersVacationsCalendar />
                ) : (
                  <UserVacationsCalendar userId={currentUser?.id} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="workdays">
            <Card>
              <CardHeader>
                <CardTitle>Xornadas de Traballo</CardTitle>
                <CardDescription>
                  {isManager 
                    ? "Configura as xornadas laborais" 
                    : "Visualiza as xornadas laborais configuradas"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WorkdayScheduleTable />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Calendars;
