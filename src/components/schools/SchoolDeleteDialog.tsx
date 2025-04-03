
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';
import { AlertTriangle } from 'lucide-react';

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
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!school) return;
    
    setIsDeleting(true);
    try {
      const success = await onDeleteSchool(school.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Delete school error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {t('deleteSchool')}
          </DialogTitle>
          <DialogDescription>
            {t('deleteSchoolConfirmation', { name: school?.name || '' })}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t('deleteSchoolWarning')}
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            {t('cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolDeleteDialog;
