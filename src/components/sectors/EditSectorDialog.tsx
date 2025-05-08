
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Sector, Region } from '@/types/supabase';
import SectorForm from './SectorForm';

interface EditSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sector: Sector;
  regions: Region[];
  onSubmit: (sectorData: Partial<Sector>) => Promise<void>;
  isSubmitting?: boolean;
}

const EditSectorDialog: React.FC<EditSectorDialogProps> = ({
  isOpen,
  onClose,
  sector,
  regions,
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();

  const handleSubmit = async (data: Partial<Sector>) => {
    await onSubmit({
      id: sector.id,
      ...data
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editSector')}</DialogTitle>
        </DialogHeader>
        <SectorForm
          initialData={sector}
          regions={regions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditSectorDialog;
