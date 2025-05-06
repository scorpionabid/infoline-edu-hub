
import React, { useState } from 'react';
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
import { useApprovalProcess } from '@/hooks/useApprovalProcess';

interface ApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  onComplete?: () => void;
}

const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  open,
  onOpenChange,
  schoolId,
  schoolName,
  categoryId,
  categoryName,
  onComplete
}) => {
  const { t } = useLanguageSafe();
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { approveEntries, rejectEntries, loading } = useApprovalProcess();

  const handleConfirm = async () => {
    try {
      if (dialogAction === 'approve') {
        await approveEntries(schoolId, categoryId, categoryName);
      } else if (dialogAction === 'reject' && rejectionReason) {
        await rejectEntries(schoolId, categoryId, categoryName, rejectionReason);
      }
      
      if (onComplete) onComplete();
      onOpenChange(false);
      
    } catch (error) {
      console.error("Təsdiq/rədd əməliyyatında xəta:", error);
    }
  };

  const handleActionSelect = (action: 'approve' | 'reject') => {
    setDialogAction(action);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {dialogAction === 'approve' 
              ? t('approveData')
              : dialogAction === 'reject'
              ? t('rejectData')
              : t('reviewData')}
          </DialogTitle>
          <DialogDescription>
            {dialogAction === 'approve'
              ? t('approveDataDescription')
              : dialogAction === 'reject'
              ? t('rejectDataDescription')
              : t('selectAction')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('school')}</p>
                <p className="text-sm">{schoolName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{t('category')}</p>
                <p className="text-sm">{categoryName}</p>
              </div>
            </div>
            
            {dialogAction === null && (
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="default" 
                  className="flex-1"
                  onClick={() => handleActionSelect('approve')}
                >
                  {t('approve')}
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                  onClick={() => handleActionSelect('reject')}
                >
                  {t('reject')}
                </Button>
              </div>
            )}
            
            {dialogAction === 'reject' && (
              <div className="mt-2">
                <label htmlFor="rejection-reason" className="text-sm font-medium">
                  {t('rejectionReason')} <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  id="rejection-reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t('enterRejectionReason')}
                  className="mt-1 min-h-[100px]"
                />
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-end">
          {dialogAction !== null && (
            <Button
              variant="outline"
              onClick={() => setDialogAction(null)}
              disabled={loading}
            >
              {t('back')}
            </Button>
          )}
          
          {dialogAction !== null && (
            <Button 
              onClick={handleConfirm} 
              disabled={loading || (dialogAction === 'reject' && !rejectionReason.trim())}
              variant={dialogAction === 'reject' ? "destructive" : "default"}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {dialogAction === 'approve' ? t('approve') : t('reject')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalDialog;
