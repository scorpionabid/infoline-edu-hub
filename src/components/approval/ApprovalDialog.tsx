
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
  title: string;
  description: string;
  entity: string;
  school: string;
  rejectionReason?: string;
  setRejectionReason?: (value: string) => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  title,
  description,
  entity,
  school,
  rejectionReason,
  setRejectionReason
}) => {
  const { t } = useLanguageSafe();
  const isReject = title.toLowerCase().includes('reject') || description.toLowerCase().includes('reject');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('school')}</p>
                <p className="text-sm">{school}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('category')}</p>
                <p className="text-sm">{entity}</p>
              </div>
            </div>
            
            {isReject && setRejectionReason && (
              <div className="mt-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  {t('rejectionReason')} <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  id="rejection-reason"
                  value={rejectionReason || ''}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('enterRejectionReason')}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isLoading || (isReject && (!rejectionReason || !rejectionReason.trim()))}
            variant={isReject ? "destructive" : "default"}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isReject ? t('reject') : t('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
