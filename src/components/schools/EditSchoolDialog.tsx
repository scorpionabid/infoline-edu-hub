
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import SchoolForm from './SchoolForm';
import { School, Region, Sector } from '@/types/school';

interface EditSchoolDialogProps {
  school: School | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<School>) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  school,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  regionNames,
  sectorNames,
}) => {
  const { t } = useLanguage();

  if (!school) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('editSchool')}</DialogTitle>
          <DialogDescription>
            {t('editSchoolDescription')}
          </DialogDescription>
        </DialogHeader>
        <SchoolForm
          school={school}
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          regions={regions}
          sectors={sectors}
          regionNames={regionNames}
          sectorNames={sectorNames}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
