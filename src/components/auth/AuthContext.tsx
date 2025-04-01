
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail, addUser, getNextUserId } from '@/utils/dataService';
import { DEFAULT_PASSWORD } from '@/utils/dbConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if session exists in sessionStorage (not localStorage)
    // This is just for session persistence, not data storage
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);
  
  // Función para crear un nuevo usuario
  const createNewUser = async (email: string): Promise<User> => {
    try {
      // Obtener el siguiente ID de usuario
      const nextId = await getNextUserId();
      
      // Extraer el nombre del usuario del correo electrónico
      const namePart = email.split('@')[0];
      const name = namePart
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
      
      // Crear el objeto de usuario
      const newUser: User = {
        id: String(nextId),
        name: name,
        email: email,
        password: DEFAULT_PASSWORD,
        role: 'worker', // Por defecto, asignar rol de trabajador
        active: true
      };
      
      // Guardar el usuario en la base de datos
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
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulating authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check for admin credentials directly
      if (email === 'admin@ticmoveo.com' && password === 'dc0rralIplan') {
        // Ensure the admin user has the 'admin' role
        const adminUser: User = {
          id: 'admin-user',
          name: 'Administrador ATSXPTPG',
          email: 'admin@ticmoveo.com',
          password: '', // Empty password for security
          role: 'admin', // Explicitly set as admin role
          active: true
        };
        
        setCurrentUser(adminUser);
        sessionStorage.setItem('currentUser', JSON.stringify(adminUser));
        toast({
          title: 'Benvido/a!',
          description: `Iniciaches sesión como ${adminUser.name}`,
        });
        setLoading(false);
        return adminUser;
      }
      
      // Get user from PostgreSQL
      let user: User | undefined;
      console.log("Intentando obtener usuario de PostgreSQL:", email);
      
      try {
        user = await getUserByEmail(email);
        
        // Update any 'manager' roles to 'director'
        if (user && user.role === 'director') {
          user.role = 'director';
        }
      } catch (error) {
        console.error("Error getting user from PostgreSQL", error);
        
        // Mostrar un mensaje más descriptivo según el tipo de error
        let errorMessage = 'Error de conexión a la base de datos';
        if (error instanceof Error) {
          if (error.message.includes('Respuesta no válida')) {
            errorMessage = 'El servidor no está respondiendo correctamente. Por favor, contacte con el administrador.';
          } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            errorMessage = 'No se pudo conectar al servidor. Compruebe su conexión a Internet o contacte con el administrador.';
          }
        }
        
        toast({
          title: 'Error de conexión',
          description: errorMessage,
          variant: 'destructive'
        });
        throw new Error(errorMessage);
      }
      
      // Si el usuario no existe, intentar crearlo automáticamente
      if (!user) {
        console.log('Usuario no encontrado:', email);
        
        // Intentar crear un nuevo usuario si se utiliza la contraseña predeterminada
        if (password === DEFAULT_PASSWORD) {
          try {
            user = await createNewUser(email);
            console.log('Usuario creado automáticamente:', user);
          } catch (createError) {
            console.error('Error al crear usuario automáticamente:', createError);
            throw new Error('No se pudo crear el usuario automáticamente. Contacte con el administrador.');
          }
        } else {
          throw new Error('Usuario non atopado');
        }
      }
      
      // Check if user is active
      if (user.active === false) {
        throw new Error('A túa conta está desactivada. Por favor, contacta co administrador.');
      }
      
      // Comprobar la contraseña predeterminada para usuarios que no son administradores
      if (email !== 'admin@ticmoveo.com' && password === DEFAULT_PASSWORD) {
        console.log("Usuario accediendo con contraseña predeterminada:", email);
        
        // Autenticar con éxito usando la contraseña predeterminada
        setCurrentUser(user);
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        toast({
          title: 'Benvido/a!',
          description: `Iniciaches sesión como ${user.name}`,
        });
        
        setLoading(false);
        return user;
      }
      
      // In production, password validation would be done securely by the backend
      // This is only for demonstration purposes
      
      setCurrentUser(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
      toast({
        title: 'Benvido/a!',
        description: `Iniciaches sesión como ${user.name}`,
      });
      
      return user;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Erro de inicio de sesión',
        description: error instanceof Error ? error.message : 'Produciuse un erro durante o inicio de sesión',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    toast({
      title: 'Sesión pechada',
      description: 'Pecháchela sesión correctamente',
    });
  };
  
  const updateCurrentUser = (user: User) => {
    setCurrentUser(user);
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    updateCurrentUser,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
