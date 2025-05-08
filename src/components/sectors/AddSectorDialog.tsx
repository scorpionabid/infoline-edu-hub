
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Sector, Region } from '@/types/supabase';
import SectorForm from './SectorForm';

interface AddSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  regions: Region[];
  onSubmit: (sectorData: Partial<Sector>) => Promise<void>;
  isSubmitting?: boolean;
}

const AddSectorDialog: React.FC<AddSectorDialogProps> = ({
  isOpen,
  onClose,
  regions,
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();

  const handleSubmit = async (data: Partial<Sector>) => {
    await onSubmit({
      name: data.name,
      description: data.description,
      region_id: data.region_id,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addSector')}</DialogTitle>
        </DialogHeader>
        <SectorForm
          regions={regions}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddSectorDialog;
