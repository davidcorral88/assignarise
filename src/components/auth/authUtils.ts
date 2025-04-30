
import { User } from '@/utils/types';
import { getUserByEmail, addUser, getNextUserId } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';

// Function to create a new user
export const createNewUser = async (email: string): Promise<User> => {
  try {
    // Get the next user ID (now it's a number)
    const nextId = await getNextUserId();
    
    // Extract the user's name from email
    const namePart = email.split('@')[0];
    const name = namePart
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
    
    // Create the user object with numeric ID
    const newUser: User = {
      id: nextId,
      name: name,
      email: email,
      password: '', // No default password, will be set through password reset or db directly
      role: 'worker', // Default role is worker
      active: true
    };
    
    // Save the user to the database
    // This will now also save the password in the user_passwords table
    // due to our backend changes
    await addUser(newUser);
    
    toast({
      title: 'Usuario creado',
      description: `Se ha creado automáticamente una cuenta para ${email}`,
    });
    
    return newUser;
  } catch (error) {
    console.error('Error al crear nuevo usuario:', error);
    throw new Error('No se pudo crear el usuario automáticamente');
  }
};
