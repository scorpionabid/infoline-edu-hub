
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UserErrorStateProps {
  error: string;
}

export const UserErrorState: React.FC<UserErrorStateProps> = ({ error }) => {
  return (
    <div className="flex items-center py-6 px-2 text-destructive gap-2">
      <AlertCircle className="h-4 w-4" />
      <span className="text-sm">{error}</span>
    </div>
  );
};
