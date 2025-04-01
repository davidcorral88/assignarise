
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail } from '@/utils/dataService';
import { defaultUsers } from '@/utils/dbConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Contraseña predeterminada para usuarios nuevos
const DEFAULT_PASSWORD = 'dxm2025';

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
      try {
        user = await getUserByEmail(email);
        
        // Update any 'manager' roles to 'director'
        if (user && user.role === 'director') {
          user.role = 'director';
        }
      } catch (error) {
        console.log("Error getting user from PostgreSQL", error);
        toast({
          title: 'Error de conexión',
          description: 'No se pudo conectar a la base de datos PostgreSQL',
          variant: 'destructive'
        });
        throw new Error('Error de conexión a la base de datos');
      }
      
      if (!user) {
        throw new Error('Usuario non atopado');
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
