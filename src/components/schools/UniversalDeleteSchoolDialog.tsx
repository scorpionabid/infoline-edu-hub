import React from 'react';
import { UniversalDialog, useUniversalDialog } from '@/components/core';
import { School } from '@/types/school';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface UniversalDeleteSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School;
  onSuccess: () => void;
}

export const UniversalDeleteSchoolDialog: React.FC<UniversalDeleteSchoolDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSuccess
}) => {
  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('schools')
        .delete()
        .eq('id', school.id);

      if (error) throw error;

      toast.success('Məktəb uğurla silindi');
      onSuccess();
    } catch (error: any) {
      console.error('Məktəb silmə xətası:', error);
      toast.error('Məktəb silinərkən xəta: ' + error.message);
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  const {
    isSubmitting,
    handleConfirm
  } = useUniversalDialog({
    type: 'delete',
    entity: 'school',
    onConfirm: handleDelete
  });

  return (
    <UniversalDialog
      type="delete"
      entity="school"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      data={school}
      isSubmitting={isSubmitting}
    />
  );
};

// Export both old and new versions for gradual migration
export { UniversalDeleteSchoolDialog as NewDeleteSchoolDialog };
export default UniversalDeleteSchoolDialog;