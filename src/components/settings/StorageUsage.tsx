
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Database } from 'lucide-react';

export const StorageUsage: React.FC = () => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Almacenamiento</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        La aplicación utiliza exclusivamente PostgreSQL como sistema de almacenamiento.
        El almacenamiento local (localStorage) ha sido completamente desactivado.
      </p>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>PostgreSQL</span>
        <span>100%</span>
      </div>
      <Progress value={100} className="h-2 bg-primary/20" />
    </div>
  );
};
