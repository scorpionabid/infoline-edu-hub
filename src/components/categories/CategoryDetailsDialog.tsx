
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';

interface CategoryDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddColumns: (categoryId: string) => void;
}

const CategoryDetailsDialog: React.FC<CategoryDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  category,
  onEdit,
  onDelete,
  onAddColumns
}) => {
  const { t } = useLanguage();
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {category?.name || t('categoryDetails')}
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-muted-foreground">
            Bu bir stub komponentdir. Kateqoriya detalları burada göstəriləcək.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDetailsDialog;
