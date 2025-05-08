
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School, Region, Sector } from '@/types/school';
import SchoolForm from './SchoolForm';
import { useLanguage } from '@/context/LanguageContext';
import { useSchoolOperations } from '@/hooks/schools/useSchoolOperations';
import { toast } from '@/components/ui/use-toast';

export interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess?: () => void;
  regions: Region[];
  sectors: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
  isSubmitting?: boolean;
  onSubmit?: (schoolData: School) => Promise<void>;
}

const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSuccess,
  regions = [],
  sectors = [],
  regionNames = {},
  sectorNames = {},
  isSubmitting: externalSubmitting = false,
  onSubmit: externalSubmit
}) => {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateSchool } = useSchoolOperations();

  const handleSubmit = async (data: Partial<School>) => {
    if (externalSubmit) {
      await externalSubmit({ ...school, ...data });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const result = await updateSchool(school.id, {
        ...data,
        id: school.id
      });
      
      if (result?.error) {
        toast({
          title: t('schoolUpdateError'),
          description: result.error.message || t('unknownError'),
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: t('schoolUpdated'),
        description: t('schoolUpdatedDescription')
      });
      
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('School update error:', err);
      toast({
        title: t('schoolUpdateError'),
        description: err.message || t('unknownError'),
        variant: "destructive"
      });
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
          isSubmitting={isSubmitting || externalSubmitting}
          regions={regions}
          sectors={sectors}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting || externalSubmitting}>
            {t('cancel')}
          </Button>
          <Button type="submit" form="school-form" disabled={isSubmitting || externalSubmitting}>
            {(isSubmitting || externalSubmitting) ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
