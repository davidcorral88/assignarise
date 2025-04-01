
import React from 'react';
import { User } from '@/utils/types';

interface UserAvatarProps {
  user: User | null;
  size?: 'sm' | 'md' | 'lg';
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md' 
}) => {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  };
  
  const textSizeClass = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  // Extraer iniciales del nombre del usuario si está disponible
  const getInitials = () => {
    if (!user?.name) return 'UN';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };
  
  return (
    <div className={`${sizeClass[size]} rounded-full bg-primary flex items-center justify-center`}>
      {user?.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name || 'User avatar'} 
          className="h-full w-full rounded-full object-cover" 
        />
      ) : (
        <span className={`${textSizeClass[size]} font-medium text-primary-foreground`}>
          {getInitials()}
        </span>
      )}
    </div>
  );
};
