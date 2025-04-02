
import React, { createContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail, verifyUserPassword } from '@/utils/dataService';
import { DEFAULT_PASSWORD } from '@/utils/dbConfig';
import { createNewUser, getAdminUser } from './authUtils';

// Create the auth context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if session exists in sessionStorage (not localStorage)
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Simulating authentication delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check for admin credentials directly
      if (email === 'admin@ticmoveo.com' && password === 'dc0rralIplan') {
        const adminUser = getAdminUser();
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
        
        // More descriptive error message based on error type
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
      
      // Try to create a new user automatically if not found
      if (!user) {
        console.log('Usuario no encontrado:', email);
        
        // Try to create a new user if using the default password
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
      
      // Verify password
      const isPasswordValid = await verifyUserPassword(user.id, password);
      
      // Allow login with default password as a fallback
      if (!isPasswordValid && password !== DEFAULT_PASSWORD) {
        console.log("Contraseña incorrecta para:", email);
        throw new Error('Contraseña incorrecta');
      }
      
      console.log("Inicio de sesión exitoso para:", email);
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
