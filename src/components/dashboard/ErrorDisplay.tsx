
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  error: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h2 className="text-lg font-medium mb-2">Erro ao cargar datos</h2>
      <p className="text-muted-foreground mb-6">{error}</p>
      <Button 
        onClick={() => window.location.reload()} 
        variant="default"
      >
        Intentar de novo
      </Button>
    </div>
  );
};
