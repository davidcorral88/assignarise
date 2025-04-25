
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PowerBITab } from '@/components/PowerBI/PowerBITab';

const PowerBI = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PowerBI</h1>
          <p className="text-muted-foreground">
            Análise de datos en PowerBI
          </p>
        </div>
        <PowerBITab />
      </div>
    </Layout>
  );
};

export default PowerBI;
