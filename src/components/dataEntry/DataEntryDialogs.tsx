
import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DataEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const DataEntryDialog: React.FC<DataEntryDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  onConfirm,
  onCancel,
  confirmText = 'Təsdiq et',
  cancelText = 'İmtina',
  isLoading = false
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>
        
        {children}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel || (() => onOpenChange(false))}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? t('processing') : confirmText}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataEntryDialog;
