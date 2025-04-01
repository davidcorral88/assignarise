
import React from 'react';
import { Header } from './Header';
import { useAuth } from '../auth/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {isAuthenticated && <Header />}
      <main className="flex-1">
        <div className="container py-6 md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
};
