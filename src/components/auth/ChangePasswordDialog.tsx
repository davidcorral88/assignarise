import React, { useState } from 'react';
import { LockKeyhole, AlertTriangle, Check } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { changeUserPassword } from '@/utils/apiService';
import { User } from '@/utils/types';
import { toNumericId } from '@/utils/typeUtils';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null;
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const handleReset = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setIsSuccess(false);
  };
  
  const handleCloseDialog = () => {
    handleReset();
    onOpenChange(false);
  };
  
  const handleChangePassword = async () => {
    setError('');
    
    if (!currentPassword.trim()) {
      setError('Debes ingresar tu contraseña actual');
      return;
    }
    
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Debes ingresar y confirmar la nueva contraseña');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const userId = toNumericId(user?.id);
      
      if (userId === undefined) {
        throw new Error('ID de usuario inválido');
      }
      
      const success = await changeUserPassword(
        userId,
        currentPassword,
        newPassword,
        false
      );
      
      if (success) {
        setIsSuccess(true);
        toast({
          title: "Contraseña cambiada",
          description: "Tu contraseña ha sido actualizada correctamente.",
        });
        
        setTimeout(() => {
          handleCloseDialog();
        }, 2000);
      } else {
        setError('La contraseña actual es incorrecta o ha ocurrido un error');
      }
    } catch (error) {
      console.error('Error cambiando la contraseña:', error);
      setError('Error al cambiar la contraseña. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <LockKeyhole className="h-5 w-5 mr-2 text-primary" />
            Cambiar contraseña
          </DialogTitle>
          <DialogDescription>
            Cambia la contraseña de tu cuenta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isSuccess && (
            <Alert className="bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                Contraseña cambiada correctamente.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="current">Contraseña actual</Label>
            <Input
              id="current"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isLoading || isSuccess}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="new">Nueva contraseña</Label>
            <Input
              id="new"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isLoading || isSuccess}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="confirm">Confirmar contraseña</Label>
            <Input
              id="confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading || isSuccess}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isLoading || isSuccess}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleChangePassword} disabled={isLoading || isSuccess} className="ml-2">
            {isLoading ? (
              <>
                <span className="mr-2">Cambiando...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              </>
            ) : (
              "Cambiar contraseña"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
