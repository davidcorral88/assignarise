
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { 
  Clock, 
  Users, 
  ChevronDown, 
  LogOut, 
  User,
  Menu,
  X,
  Settings,
  BarChart3,
  Calendar,
  KeyRound
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import ChangePasswordDialog from '../auth/ChangePasswordDialog';

export const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Check if user is admin
  const isAdmin = currentUser?.role === 'admin';

  const navLinks = [
    {
      to: '/dashboard',
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      label: 'Panel',
      show: true
    },
    {
      to: '/tasks',
      icon: <Clock className="mr-2 h-4 w-4" />,
      label: 'Tarefas',
      show: true
    },
    {
      to: '/users',
      icon: <Users className="mr-2 h-4 w-4" />,
      label: 'Usuarios',
      show: true // All users can now see the Users section
    },
    {
      to: '/calendars',
      icon: <Calendar className="mr-2 h-4 w-4" />,
      label: 'Calendarios',
      show: isAdmin // Only admin can see Calendars
    },
    {
      to: '/time-tracking',
      icon: <Clock className="mr-2 h-4 w-4" />,
      label: 'Rexistro de Horas',
      show: true
    },
    {
      to: '/settings',
      icon: <Settings className="mr-2 h-4 w-4" />,
      label: 'Configuración',
      show: isAdmin  // Only admin can see Settings
    }
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!currentUser) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          {/* Logo Transporte Público de Galicia - Left */}
          <div className="h-10 mr-4">
            <img 
              src="/lovable-uploads/8612bd3a-aae6-4470-9f8c-90f0a60578c0.png" 
              alt="Transporte Público de Galicia Logo" 
              className="h-full object-contain"
            />
          </div>

          <Link to="/dashboard" className="flex items-center mr-8 font-semibold text-xl">
            <Clock className="h-6 w-6 mr-2 text-primary" />
            <span className="animate-fade-in" style={{ color: "#007bc4" }}>Control de Tarefas</span>
          </Link>

          {isMobile ? (
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
              <span className="sr-only">Alternar menú</span>
            </Button>
          ) : (
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks
                .filter(link => link.show)
                .map(link => (
                  <Button
                    key={link.to}
                    variant={isActive(link.to) ? "default" : "ghost"}
                    asChild
                    className="transition-all duration-200"
                  >
                    <Link to={link.to} className="flex items-center">
                      {link.icon}
                      {link.label}
                    </Link>
                  </Button>
                ))}
            </nav>
          )}
        </div>

        <div className="flex items-center">
          {/* Logo iPlan - Right */}
          <div className="h-10 mr-4">
            <img 
              src="/lovable-uploads/0ceff2cd-db6e-45af-93ff-b54176c93864.png" 
              alt="iPlan Logo" 
              className="h-full object-contain"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {currentUser.role === 'admin' 
                      ? 'Administrador' 
                      : currentUser.role === 'director' 
                        ? 'Director' 
                        : 'Traballador'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => navigate('/user-config')}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setChangePasswordOpen(true)}
                className="cursor-pointer"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                <span>Cambiar contrasinal</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Pechar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isMobile && mobileMenuOpen && (
        <div className="md:hidden w-full bg-background border-b animate-slide-in">
          <nav className="flex flex-col p-4 space-y-2">
            {navLinks
              .filter(link => link.show)
              .map(link => (
                <Button
                  key={link.to}
                  variant={isActive(link.to) ? "default" : "ghost"}
                  asChild
                  className="justify-start transition-all duration-200"
                  onClick={closeMobileMenu}
                >
                  <Link to={link.to} className="flex items-center">
                    {link.icon}
                    {link.label}
                  </Link>
                </Button>
              ))}
          </nav>
        </div>
      )}

      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
        user={currentUser}
      />
    </header>
  );
};

export default Header;
