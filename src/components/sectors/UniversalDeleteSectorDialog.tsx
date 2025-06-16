import React from 'react';
import { UniversalDialog, useUniversalDialog } from '@/components/core';
import { EnhancedSector } from '@/types/sector';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UniversalDeleteSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sector: EnhancedSector;
  onSuccess?: () => void;
}

export const UniversalDeleteSectorDialog: React.FC<UniversalDeleteSectorDialogProps> = ({
  isOpen,
  onClose,
  sector,
  onSuccess
}) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('sectors')
        .delete()
        .eq('id', sector.id);

      if (error) throw error;

      toast.success('Sektor uğurla silindi');
      onSuccess?.();
    } catch (error: any) {
      console.error('Sektor silmə xətası:', error);
      toast.error('Sektor silinərkən xəta: ' + error.message);
      throw error;
    }
  };

  const {
    isSubmitting,
    handleConfirm
  } = useUniversalDialog({
    type: 'delete',
    entity: 'sector',
    onConfirm: handleDelete
  });

  return (
    <UniversalDialog
      type="delete"
      entity="sector"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      data={sector}
      isSubmitting={isSubmitting}
    />
  );
};

export default UniversalDeleteSectorDialog;