
import React from 'react';
import { ChevronsUpDown, Loader2 } from 'lucide-react';

interface UserLoadingStateProps {
  loading: boolean;
}

export const UserLoadingState: React.FC<UserLoadingStateProps> = ({ loading }) => {
  return loading ? (
    <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
  ) : (
    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  );
};
