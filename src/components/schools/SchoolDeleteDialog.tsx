
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { School } from '@/types/school';
import { DeleteDialog } from './school-dialogs';

interface SchoolDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onDeleteSchool: (schoolId: string) => Promise<boolean>;
  onClose: () => void;
}

export const SchoolDeleteDialog: React.FC<SchoolDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  school,
  onDeleteSchool,
  onClose
}) => {
  const { t } = useLanguage();

  const handleDelete = async () => {
    if (!school) return;
    
    try {
      await onDeleteSchool(school.id);
      onClose();
    } catch (error) {
      console.error('Məktəbi silmə xətası:', error);
    }
  };

  return (
    <DeleteDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      school={school}
      onDelete={handleDelete}
    />
  );
};
