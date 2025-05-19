
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { School, Region, Sector } from '@/types/school';
import SchoolForm from './SchoolForm';

interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSubmit: (schoolData: School) => Promise<void>;
  onSuccess?: () => void;
  regions?: Region[];
  sectors?: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
  isSubmitting?: boolean;
}

const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSubmit,
  onSuccess,
  isSubmitting,
  regions = [],
  sectors = [],
  regionNames = {},
  sectorNames = {}
}) => {
  const { t } = useLanguage();

  const handleSubmit = async (data: Partial<School>) => {
    await onSubmit(data as School);
    if (onSuccess) onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('editSchool')}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto pr-1 max-h-[calc(90vh-120px)]">
          <SchoolForm
            initialData={school}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || false}
            regions={regions}
            sectors={sectors}
            regionNames={regionNames}
            sectorNames={sectorNames}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
