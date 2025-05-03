
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';

interface ColumnDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column | null;
  onEdit: (column: Column) => void;
  onDelete: (column: Column) => void;
}

const ColumnDetailsDialog: React.FC<ColumnDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  column,
  onEdit,
  onDelete
}) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {column?.name || t('columnDetails')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Bu bir stub komponentdir. Sütun detalları burada göstəriləcək.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDetailsDialog;
