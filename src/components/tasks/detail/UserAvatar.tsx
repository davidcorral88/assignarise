
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
  
  return (
    <div className={`${sizeClass[size]} rounded-full bg-primary flex items-center justify-center`}>
      {user?.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full" />
      ) : (
        <span className={`${textSizeClass[size]} font-medium text-primary-foreground`}>
          {user?.name ? user.name.substring(0, 2) : 'UN'}
        </span>
      )}
    </div>
  );
};
