
import { useState } from 'react';

export interface UseUniversalDialogReturn {
  isOpen: boolean;
  data: any;
  isSubmitting: boolean;
  openDialog: (entityData?: any) => void;
  closeDialog: () => void;
  handleConfirm: (onConfirm?: () => void | Promise<void>) => Promise<void>;
}

export const useUniversalDialog = (): UseUniversalDialogReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = (entityData?: any) => {
    setData(entityData);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setData(null);
    setIsSubmitting(false);
  };

  const handleConfirm = async (onConfirm?: () => void | Promise<void>) => {
    if (!onConfirm) return;
    
    try {
      setIsSubmitting(true);
      await onConfirm();
      closeDialog();
    } catch (error) {
      console.error('Error in dialog confirmation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    data,
    isSubmitting,
    openDialog,
    closeDialog,
    handleConfirm
  };
};
