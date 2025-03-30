
import React from 'react';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  t: (key: string) => string;
  onAddRegion: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ t, onAddRegion }) => (
  <TableRow>
    <TableCell colSpan={8} className="text-center py-6 h-[200px]">
      <div className="flex flex-col items-center justify-center">
        <span className="text-muted-foreground mb-2">{t('noRegionsFound')}</span>
        <Button 
          variant="outline" 
          onClick={onAddRegion}
          className="mt-2"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> {t('addRegion')}
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

export default EmptyState;
