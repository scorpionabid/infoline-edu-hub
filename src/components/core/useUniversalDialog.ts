import { useState, useCallback } from 'react';
import { DialogType, EntityType } from './types';

interface UseUniversalDialogProps {
  type: DialogType;
  entity: EntityType;
  onConfirm: (data?: any) => Promise<void>;
}

interface UseUniversalDialogReturn {
  isOpen: boolean;
  data: any;
  isSubmitting: boolean;
  openDialog: (entityData?: any) => void;
  closeDialog: () => void;
  handleConfirm: () => Promise<void>;
}

/**
 * Universal hook for managing dialog state and operations
 */
export function useUniversalDialog({
  type,
  entity,
  onConfirm
}: UseUniversalDialogProps): UseUniversalDialogReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openDialog = useCallback((entityData?: any) => {
    setData(entityData);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setData(null);
    setIsSubmitting(false);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(data);
      closeDialog();
    } catch (error) {
      console.error(`Error in ${type} ${entity}:`, error);
      // Don't close dialog on error, let user retry
    } finally {
      setIsSubmitting(false);
    }
  }, [data, isSubmitting, onConfirm, type, entity, closeDialog]);

  return {
    isOpen,
    data,
    isSubmitting,
    openDialog,
    closeDialog,
    handleConfirm
  };
}