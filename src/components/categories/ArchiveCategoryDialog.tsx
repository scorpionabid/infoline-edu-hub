
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Category } from '@/types/category';
import { useLanguage } from '@/context/LanguageContext';

interface ArchiveCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onArchiveCategory: (categoryId: string) => Promise<boolean>;
}

export const ArchiveCategoryDialog: React.FC<ArchiveCategoryDialogProps> = ({
  open,
  onOpenChange,
  category,
  onArchiveCategory,
}) => {
  const { t } = useLanguage();
  
  const handleArchive = async () => {
    if (category) {
      const success = await onArchiveCategory(category.id);
      if (success) {
        onOpenChange(false);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('archiveCategory')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('archiveCategoryConfirmation')}
            <br />
            <span className="font-medium">{category?.name}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive}>
            {t('archive')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
