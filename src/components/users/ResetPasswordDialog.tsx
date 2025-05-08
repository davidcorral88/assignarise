
import React, { useState } from 'react';
import { KeyRound, Mail, AlertCircle, Check, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User } from '@/utils/types';
import { resetUserPassword } from '@/utils/apiService';

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [directPassword, setDirectPassword] = useState<string | null>(null);
  
  const handleResetPassword = async () => {
    setIsLoading(true);
    
    try {
      const result = await resetUserPassword(user.id);
      
      if (result.success) {
        setIsSuccess(true);
        
        // If email is disabled, server returns password directly
        if (result.password) {
          setDirectPassword(result.password);
          toast({
            title: "Contrasinal resetado",
            description: "O usuario ten as notificacións de correo desactivadas. O contrasinal mostrarase directamente.",
          });
        } else {
          toast({
            title: "Contrasinal resetado",
            description: `Enviouse un correo electrónico a ${user.emailATSXPTPG || user.email} co novo contrasinal.`,
          });
          
          // Close the dialog after a time
          setTimeout(() => {
            onOpenChange(false);
            setIsSuccess(false);
          }, 2000);
        }
      } else {
        throw new Error("Non se puido resetear o contrasinal");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Non se puido resetear o contrasinal. Inténtao de novo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(newState) => {
      // Reset state when dialog closes
      if (!newState) {
        setIsSuccess(false);
        setDirectPassword(null);
      }
      onOpenChange(newState);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="h-5 w-5 mr-2 text-primary" />
            Resetear contrasinal
          </DialogTitle>
          <DialogDescription>
            Resetear a contrasinal de <strong>{user.email}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {directPassword ? 
                  "Contrasinal resetado correctamente." :
                  "Enviouse un correo electrónico co novo contrasinal."}
              </AlertDescription>
            </Alert>
            
            {directPassword && (
              <div className="mt-4 p-4 bg-gray-50 border rounded">
                <Label className="font-medium text-sm text-gray-500">Novo contrasinal:</Label>
                <p className="font-mono text-base mt-1 p-2 bg-white border rounded">{directPassword}</p>
                <p className="text-xs text-amber-600 mt-2">
                  Anota este contrasinal, non se volverá a mostrar.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Usuario</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.emailATSXPTPG || user.email}
                </p>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                Xerarase un novo contrasinal aleatorio e enviarase por correo electrónico ao usuario.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                O usuario recibirá un correo electrónico co seu novo contrasinal.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter>
          {!isSuccess ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleResetPassword} 
                disabled={isLoading || isSuccess}
                className="ml-2"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">Procesando...</span>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                  </>
                ) : (
                  "Confirmar reset"
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => onOpenChange(false)}>
              {directPassword ? "Pechar" : "Aceptar"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
