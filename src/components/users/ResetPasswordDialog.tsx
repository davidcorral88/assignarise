
import React, { useState } from 'react';
import { KeyRound, Mail, AlertCircle, Check, Info, Copy } from 'lucide-react';
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
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [emailFailed, setEmailFailed] = useState(false);
  
  const handleResetPassword = async () => {
    setIsLoading(true);
    
    try {
      const result = await resetUserPassword(user.id);
      
      if (result.success) {
        setIsSuccess(true);
        
        // Check if email was sent successfully
        if (result.emailSent) {
          toast({
            title: "Contrasinal resetado",
            description: `Enviouse un correo electrónico a ${user.email} co novo contrasinal.`,
          });
        } else {
          // Email failed but we have the new password
          setNewPassword(result.newPassword || null);
          setEmailFailed(true);
          
          toast({
            title: "Contrasinal resetado",
            description: "O contrasinal foi resetado pero houbo un erro ao enviar o correo. O contrasinal móstrase na pantalla.",
            variant: "destructive",
          });
        }
        
        // Only close automatically if email succeeded
        if (result.emailSent) {
          setTimeout(() => {
            onOpenChange(false);
            setIsSuccess(false);
            setNewPassword(null);
            setEmailFailed(false);
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
  
  const copyPasswordToClipboard = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast({
        title: "Contrasinal copiado",
        description: "O contrasinal foi copiado ao portapapeis",
      });
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
            Resetear a contrasinal de <strong>{user.email}</strong>.
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="py-6">
            {emailFailed && newPassword ? (
              <div className="space-y-4">
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Non se puido enviar o correo electrónico. O novo contrasinal móstrase a continuación.
                  </AlertDescription>
                </Alert>
                
                <div className="p-3 bg-gray-100 rounded-md">
                  <div className="flex justify-between items-center">
                    <p className="font-mono text-sm">{newPassword}</p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={copyPasswordToClipboard}
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copiar contrasinal</span>
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  Deberá proporcionar este contrasinal ao usuario manualmente.
                </p>
              </div>
            ) : (
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Enviouse un correo electrónico co novo contrasinal.
                </AlertDescription>
              </Alert>
            )}
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
                Xerarase un novo contrasinal aleatorio e enviarase por correo electrónico ao usuario.
              </AlertDescription>
            </Alert>
            
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                O usuario recibirá un correo electrónico co seu novo contrasinal. 
                Se o envío do correo falla, mostrarase o contrasinal na pantalla.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <DialogFooter>
          {isSuccess && emailFailed ? (
            <Button 
              variant="outline" 
              onClick={() => {
                onOpenChange(false);
                setIsSuccess(false);
                setNewPassword(null);
                setEmailFailed(false);
              }}
            >
              Pechar
            </Button>
          ) : !isSuccess ? (
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
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetPasswordDialog;
