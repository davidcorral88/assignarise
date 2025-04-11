
import React, { createContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../../utils/types';
import { toast } from '@/components/ui/use-toast';
import { getUserByEmail, verifyUserPassword } from '@/utils/dataService';
import { DEFAULT_PASSWORD } from '@/utils/dbConfig';
import { createNewUser } from './authUtils';

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
      
      // Get user from PostgreSQL
      let user: User | undefined;
      console.log("Intentando obtener usuario de PostgreSQL:", email);
      
      try {
        user = await getUserByEmail(email);
        console.log("Usuario encontrado:", user);
        
        if (!user || !user.active) {
          console.log("Usuario no encontrado o inactivo");
          setLoading(false);
          toast({
            title: "Error de autenticación",
            description: "El usuario no existe o está inactivo.",
            variant: "destructive",
          });
          return false;
        }
        
        // Convert user.id to number for verification if it's a string
        const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;
        const isValid = await verifyUserPassword(userId, password);
        
        if (!isValid) {
          console.log("Contraseña incorrecta");
          setLoading(false);
          toast({
            title: "Error de autenticación",
            description: "Contraseña incorrecta.",
            variant: "destructive",
          });
          return false;
        }
        
        // Store user in sessionStorage
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(user);
        
        toast({
          title: "¡Bienvenido!",
          description: `Has iniciado sesión como ${user.name}`,
        });
        
        setLoading(false);
        return user;
        
      } catch (error) {
        console.error("Error al obtener usuario:", error);
        
        // Development fallback (remove in production)
        if (email === 'admin@example.com' && password === 'dc0rralIplan') {
          const fallbackUser: User = {
            id: 0,
            name: 'Administrador',
            email: 'admin@example.com',
            role: 'admin',
            active: true
          };
          
          sessionStorage.setItem('currentUser', JSON.stringify(fallbackUser));
          setCurrentUser(fallbackUser);
          setLoading(false);
          
          toast({
            title: "¡Bienvenido!",
            description: `Has iniciado sesión como ${fallbackUser.name} (modo fallback)`,
          });
          
          return fallbackUser;
        }
      }
      
      setLoading(false);
      toast({
        title: "Error de autenticación",
        description: "Error al verificar credenciales. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
      
    } catch (error) {
      console.error("Error en login:", error);
      setLoading(false);
      toast({
        title: "Error de autenticación",
        description: "Error al verificar credenciales. Inténtalo de nuevo.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  const logout = () => {
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    
    // Redirect to login page
    if (window?.location?.pathname !== '/login') {
      window.location.href = '/login';
    }
  };
  
  const updateCurrentUser = (user: User) => {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  };
  
  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated: !!currentUser, updateCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
