
import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HolidaysCalendar from '../components/calendars/HolidaysCalendar';
import WorkdaySchedulesTab from '../components/calendars/WorkdaySchedulesTab';
import AbsencesCalendar from '../components/calendars/AbsencesCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from 'lucide-react';

const Calendars = () => {
  const [activeTab, setActiveTab] = useState('holidays');

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendarios</h1>
            <p className="text-muted-foreground">
              Xestión de festivos, xornadas e ausencias
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <CardTitle>Calendarios</CardTitle>
            </div>
            <CardDescription>
              Configura os distintos calendarios da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="holidays"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="holidays">Festivos</TabsTrigger>
                <TabsTrigger value="workdays">Xornadas</TabsTrigger>
                <TabsTrigger value="absences">Ausencias</TabsTrigger>
              </TabsList>
              <TabsContent value="holidays" className="p-4">
                <HolidaysCalendar />
              </TabsContent>
              <TabsContent value="workdays" className="p-4">
                <WorkdaySchedulesTab />
              </TabsContent>
              <TabsContent value="absences" className="p-4">
                <AbsencesCalendar />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Calendars;
