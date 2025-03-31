
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { ResetDatabaseDialog } from '@/components/settings/ResetDatabaseDialog';

const ResetDatabaseButton = ({ onReset }: { onReset?: () => void }) => {
  const [showDialog, setShowDialog] = React.useState(false);

  return (
    <div>
      <Button 
        variant="destructive" 
        onClick={() => setShowDialog(true)}
        className="w-full"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Reiniciar Base de Datos
      </Button>
      
      <ResetDatabaseDialog 
        open={showDialog} 
        onOpenChange={setShowDialog}
        onConfirm={() => {
          if (onReset) onReset();
          setShowDialog(false);
        }}
      />
    </div>
  );
};

export default ResetDatabaseButton;
