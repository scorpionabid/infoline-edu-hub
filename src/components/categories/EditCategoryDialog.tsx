import React from 'react';
import { AddCategoryDialog } from './AddCategoryDialog';

export interface EditCategoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryWithOrder;
  onSubmit: (categoryData: CategoryWithOrder) => Promise<boolean>;
  onClose: () => void;
}

const EditCategoryDialog: React.FC<EditCategoryDialogProps> = ({
  isOpen,
  onOpenChange,
  category,
  onSubmit,
  onClose,
}) => {
  return (
    <AddCategoryDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      onClose={onClose}
      category={category}
    />
  );
};

export default EditCategoryDialog;
