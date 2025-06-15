
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { EnhancedSector } from '@/types/sector';
import SectorForm from './SectorForm';

interface AddSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  regions: Region[];
  onSubmit: (sectorData: Partial<EnhancedSector>) => Promise<boolean>;
  isSubmitting?: boolean;
}

const AddSectorDialog: React.FC<AddSectorDialogProps> = ({
  isOpen,
  onClose,
  regions,
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useLanguage();

  const handleSubmit = async (data: Partial<EnhancedSector>) => {
    const success = await onSubmit({
      name: data.name || '',
      description: data.description || '',
      region_id: data.region_id || '',
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      region_name: regions.find(r => r.id === data.region_id)?.name
    });
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('sectors.addSector')}</DialogTitle>
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
