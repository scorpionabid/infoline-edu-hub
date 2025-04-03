
import React from 'react';
import { Category } from '@/types/category';
import { AddCategoryDialog, CategoryWithOrder } from './AddCategoryDialog';

export interface EditCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithOrder;
  onUpdateCategory: (categoryData: CategoryWithOrder) => Promise<boolean>;
  onClose: () => void;
}

export const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  category,
  onUpdateCategory,
  onClose,
}) => {
  const handleUpdateCategory = async (categoryData: CategoryWithOrder) => {
    const result = await onUpdateCategory(categoryData);
    if (result) {
      onClose();
    }
    return result;
  };

  return (
    <AddCategoryDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      onAddCategory={handleUpdateCategory}
      category={category}
    />
  );
};
