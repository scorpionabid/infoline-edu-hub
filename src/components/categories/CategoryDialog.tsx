
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

const CategoryDialog: React.FC<CategoryDialogProps> = ({ 
  isOpen, 
  onClose, 
  category 
}) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {category ? t('editCategory') : t('createCategory')}
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

export default CategoryDialog;
