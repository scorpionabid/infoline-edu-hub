
import React from 'react';
import { Category } from '@/types/category';
import { AddCategoryDialog } from './AddCategoryDialog';

export type CategoryWithOrder = Category & {
  order?: number;
};

export interface EditCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithOrder;
  onUpdateCategory: (categoryData: CategoryWithOrder) => Promise<boolean>;
  onClose: () => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  category,
  onUpdateCategory,
  onClose,
}) => {
  return (
    <AddCategoryDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onAddCategory={onUpdateCategory}
      onClose={onClose}
      category={category}
    />
  );
};

export default EditCategoryDialog;

// Aşağıdakı export default olmayan versiyasını istifadə edə bilərik Categories.tsx faylı üçün
export { EditCategoryDialog };
