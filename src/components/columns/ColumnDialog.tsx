
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Column } from '@/types/column';

interface ColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  column: Column | null;
  categoryId: string;
}

const ColumnDialog: React.FC<ColumnDialogProps> = ({ 
  isOpen, 
  onClose, 
  column,
  categoryId
}) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {column ? t('editColumn') : t('createColumn')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Bu bir stub komponentdir. Faktiki implementasiya üçün form əlavə edilməlidir.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
