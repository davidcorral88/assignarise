
import { User } from '@/utils/types';
import { getUserByEmail, addUser, getNextUserId } from '@/utils/dataService';
import { toast } from '@/components/ui/use-toast';
import { DEFAULT_PASSWORD } from '@/utils/dbConfig';

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
      password: DEFAULT_PASSWORD,
      role: 'worker', // Default role is worker
      active: true
    };
    
    // Save the user to the database
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

// Admin user for direct authentication
export const getAdminUser = (): User => {
  return {
    id: 0, // Admin has ID 0 (now as number, not string)
    name: 'Administrador ATSXPTPG',
    email: 'admin@ticmoveo.com',
    password: '', // Empty password for security
    role: 'admin', // Explicitly set as admin role
    active: true
  };
};
