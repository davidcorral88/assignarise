
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail } from '@/utils/dataService';
import { mockUsers } from '@/utils/mockData';
import { defaultUsers } from '@/utils/dbConfig';

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
      
      // Check for admin credentials directly
      if (email === 'admin@ticmoveo.com' && password === 'dc0rralIplan') {
        const adminUser = defaultUsers[0];
        setCurrentUser(adminUser);
        localStorage.setItem('currentUser', JSON.stringify(adminUser));
        toast({
          title: 'Benvido/a!',
          description: `Iniciaches sesión como ${adminUser.name}`,
        });
        setLoading(false);
        return adminUser;
      }
      
      // First try to get user from PostgreSQL via adapter
      let user: User | undefined;
      try {
        user = await getUserByEmail(email);
      } catch (error) {
        console.log("Error getting user from PostgreSQL, falling back to mockUsers", error);
      }
      
      // If user not found in PostgreSQL, fallback to mockUsers only for existing users
      if (!user) {
        user = mockUsers.find(u => u.email === email);
      }
      
      if (!user) {
        throw new Error('Usuario non atopado');
      }
      
      // Check if user is active
      if (user.active === false) {
        throw new Error('A túa conta está desactivada. Por favor, contacta co administrador.');
      }
      
      // In production, password validation would be done securely by the backend
      // This is only for demonstration purposes
      
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
