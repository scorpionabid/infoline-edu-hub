
import React from 'react';
import { UniversalDialog, useUniversalDialog } from '@/components/core';
import { toast } from 'sonner';
import { categoriesApi } from '@/services/api/categories';

interface UniversalDeleteCategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  categoryName: string;
  onSuccess?: () => void;
}

export const UniversalDeleteCategoryDialog: React.FC<UniversalDeleteCategoryDialogProps> = ({
  isOpen,
  onClose,
  category,
  categoryName,
  onSuccess
}) => {
  const handleDelete = async () => {
    try {
      await categoriesApi.deleteCategory(category);
      toast.success('Kateqoriya uğurla silindi');
      onSuccess?.();
    } catch (error: any) {
      console.error('Kateqoriya silmə xətası:', error);
      toast.error('Kateqoriya silinərkən xəta: ' + error.message);
      throw error;
    }
  };

  const {
    isSubmitting,
    handleConfirm
  } = useUniversalDialog({
    type: 'delete',
    entity: 'category',
    onConfirm: handleDelete
  });

  return (
    <UniversalDialog
      type="delete"
      entity="category"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      data={{ name: categoryName, id: category }}
      isSubmitting={isSubmitting}
    />
  );
};

export default UniversalDeleteCategoryDialog;
