
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School } from '@/types/school';
import SchoolForm from './SchoolForm';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolOperations } from '@/hooks/schools/useSchoolOperations';
import { toast } from 'sonner';

export interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess?: () => void;
}

const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSchool } = useSchoolOperations();

  const handleSubmit = async (data: Partial<School>) => {
    try {
      setIsSubmitting(true);
      
      const result = await updateSchool(school.id, {
        ...data,
        id: school.id
      });
      
      if (result?.error) {
        toast.error(t('schoolUpdateError'), {
          description: result.error.message || t('unknownError')
        });
        return;
      }
      
      toast.success(t('schoolUpdated'), {
        description: t('schoolUpdatedDescription')
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error('School update error:', err);
      toast.error(t('schoolUpdateError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('editSchool')}</DialogTitle>
        </DialogHeader>
        
        <SchoolForm 
          initialData={school} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="school-form" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
