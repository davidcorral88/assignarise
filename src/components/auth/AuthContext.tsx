
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail } from '@/utils/dataService';

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
    // Check if user is stored in localStorage (simulating persistence)
    const storedUser = localStorage.getItem('currentUser');
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
      
      // Get user from PostgreSQL via adapter
      const user = await getUserByEmail(email);
      
      if (!user) {
        throw new Error('Usuario non atopado');
      }
      
      // Check if user is active
      if (user.active === false) {
        throw new Error('A túa conta está desactivada. Por favor, contacta co administrador.');
      }
      
      // En producción, aquí se validaría la contraseña usando un backend seguro
      // Este código es solo para demostración
      
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
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
    localStorage.removeItem('currentUser');
    toast({
      title: 'Sesión pechada',
      description: 'Pecháchela sesión correctamente',
    });
  };
  
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    logout,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
