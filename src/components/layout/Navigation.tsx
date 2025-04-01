
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Clock, 
  Users, 
  Settings, 
  User,
  Calendar
} from 'lucide-react';

export const Navigation = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navigationItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Tarefas',
      path: '/tasks',
      icon: <CheckSquare className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Rexistro horario',
      path: '/time-tracking',
      icon: <Clock className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Usuarios',
      path: '/users',
      icon: <Users className="h-5 w-5" />,
      show: true // All users can see the Users section now
    },
    {
      name: 'Perfil',
      path: '/config',
      icon: <User className="h-5 w-5" />,
      show: true
    },
    {
      name: 'Calendarios',
      path: '/calendars',
      icon: <Calendar className="h-5 w-5" />,
      show: isAdmin  // Only visible for administrators
    },
    {
      name: 'Configuración',
      path: '/settings',
      icon: <Settings className="h-5 w-5" />,
      show: isAdmin  // Only visible for administrators
    }
  ];

  return (
    <nav className="space-y-1 py-2">
      {navigationItems
        .filter(item => item.show)
        .map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              w-full flex items-center px-3 py-2 text-sm rounded-md transition 
              ${isActive(item.path) 
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-foreground/60 hover:text-foreground hover:bg-muted'
              }
            `}
          >
            <span className={`mr-3 ${isActive(item.path) ? 'text-primary-foreground' : 'text-foreground/60'}`}>
              {item.icon}
            </span>
            {item.name}
          </button>
        ))}
    </nav>
  );
};
