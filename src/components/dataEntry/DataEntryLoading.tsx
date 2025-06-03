
import React from 'react';
import { Loader2 } from 'lucide-react';

export const DataEntryLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-15rem)]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <span className="ml-2 text-lg">Yüklənir...</span>
    </div>
  );
};
