
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { changeUserPassword } from '@/utils/dataService';
import { useAuth } from './useAuth';
import { User } from '@/utils/types';

type ChangePasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser?: User; // Optional: if provided, admin is changing another user's password
}

const ChangePasswordDialog: React.FC<ChangePasswordDialogProps> = ({
  open,
  onOpenChange,
  targetUser,
}) => {
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isAdminChangingUserPassword = currentUser?.role === 'admin' && targetUser;
  
  // Set the user ID based on whether admin is changing another user's password
  const userId = targetUser ? targetUser.id : currentUser?.id;

  const form = useForm<ChangePasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    if (!userId) return;
    
    if (data.newPassword !== data.confirmPassword) {
      form.setError('confirmPassword', {
        type: 'manual',
        message: 'As contrasinais non coinciden',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // If admin is changing another user's password, use the admin override
      const success = await changeUserPassword(
        userId, 
        data.currentPassword, 
        data.newPassword,
        isAdminChangingUserPassword // Use admin override if admin is changing another user's password
      );
      
      if (success) {
        toast({
          title: 'Contrasinal actualizado',
          description: isAdminChangingUserPassword
            ? `O contrasinal de ${targetUser?.name} foi actualizado correctamente`
            : 'O seu contrasinal foi actualizado correctamente',
        });
        
        onOpenChange(false);
        form.reset();
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro',
        description: 'Non se puido cambiar o contrasinal. Comprobe que o contrasinal actual é correcto.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            {isAdminChangingUserPassword 
              ? `Cambiar contrasinal de ${targetUser.name}`
              : 'Cambiar contrasinal'}
          </DialogTitle>
          <DialogDescription>
            {isAdminChangingUserPassword 
              ? `Introduce un novo contrasinal para ${targetUser.email}`
              : 'Introduce o teu contrasinal actual e un novo contrasinal'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {!isAdminChangingUserPassword && (
              <FormField
                control={form.control}
                name="currentPassword"
                rules={{ required: 'O contrasinal actual é obrigatorio' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contrasinal actual</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...field}
                          autoComplete="current-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showCurrentPassword ? 'Ocultar' : 'Amosar'} contrasinal
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="newPassword"
              rules={{ required: 'O novo contrasinal é obrigatorio' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Novo contrasinal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        {...field}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showNewPassword ? 'Ocultar' : 'Amosar'} contrasinal
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              rules={{ required: 'Debe confirmar o novo contrasinal' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirma o novo contrasinal</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...field}
                        autoComplete="new-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword ? 'Ocultar' : 'Amosar'} contrasinal
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gardando...
                  </>
                ) : (
                  'Cambiar contrasinal'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
