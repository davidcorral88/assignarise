
import React from 'react';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import ResetDatabaseDialog from './ResetDatabaseDialog';

const ResetDatabaseButton: React.FC = () => {
  return <ResetDatabaseDialog />;
};

export default ResetDatabaseButton;
