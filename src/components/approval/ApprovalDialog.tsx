
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguageSafe } from '@/context/LanguageContext';
import ApprovalActionCard from './ApprovalActionCard';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  onComplete: () => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  categoryId,
  categoryName,
  onComplete
}) => {
  const { t } = useLanguageSafe();

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('reviewAndApprove')}</DialogTitle>
          <DialogDescription>
            {t('reviewCategoryDataDescription')}
          </DialogDescription>
        </DialogHeader>

        <ApprovalActionCard
          schoolId={schoolId}
          schoolName={schoolName}
          categoryId={categoryId}
          categoryName={categoryName}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
