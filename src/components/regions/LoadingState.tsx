
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';

interface LoadingStateProps {
  t: (key: string) => string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ t }) => (
  <TableRow>
    <TableCell colSpan={8} className="text-center py-6 h-[200px]">
      <div className="flex flex-col items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <span className="text-muted-foreground">{t('loadingRegions')}</span>
      </div>
    </TableCell>
  </TableRow>
);

export default LoadingState;
