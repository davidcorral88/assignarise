
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

interface ResetPasswordDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Contraseña predeterminada para usuarios nuevos
const DEFAULT_PASSWORD = 'dxm2025';

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleResetPassword = async () => {
    setIsLoading(true);
    
    try {
      // Simulamos un tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí se implementaría la lógica real para resetear la contraseña
      // Por ahora se establece a la contraseña predeterminada
      
      setIsSuccess(true);
      
      toast({
        title: "Contrasinal resetado",
        description: `A contrasinal foi resetada á predeterminada (${DEFAULT_PASSWORD}). Informa ó usuario para que a cambie no seguinte inicio de sesión.`,
      });
      
      // Cerrar el diálogo después de un tiempo
      setTimeout(() => {
        onOpenChange(false);
        setIsSuccess(false);
      }, 2000);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <KeyRound className="h-5 w-5 mr-2 text-primary" />
            Resetear contrasinal
          </DialogTitle>
          <DialogDescription>
            Resetear a contrasinal de <strong>{user.email}</strong> á predeterminada.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                A contrasinal do usuario foi reseteada á predeterminada.
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-start">
              <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Usuario</Label>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>
            </div>
            
            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                A contrasinal será reseteada a <strong>{DEFAULT_PASSWORD}</strong>
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                Debes informar ao usuario da nova contrasinal predeterminada.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter>
          {!isSuccess && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
