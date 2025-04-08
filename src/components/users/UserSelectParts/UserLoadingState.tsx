
import React from 'react';
import { Loader2, ChevronsUpDown } from 'lucide-react';

interface UserLoadingStateProps {
  loading: boolean;
}

export const UserLoadingState: React.FC<UserLoadingStateProps> = ({ loading }) => {
  return loading ? (
    <Loader2 className="ml-2 h-4 w-4 shrink-0 opacity-50 animate-spin" />
  ) : (
    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
  );
};
