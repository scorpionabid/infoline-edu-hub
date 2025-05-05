
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PendingApprovalItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, XCircle } from 'lucide-react';

interface EnhancedApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comments?: string) => void;
  onReject: (id: string, reason: string) => void;
  item?: PendingApprovalItem;
  isProcessing?: boolean;
}

export const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  item,
  isProcessing = false
}) => {
  const { t } = useLanguage();
  const [comments, setComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [mode, setMode] = useState<'view' | 'approve' | 'reject'>('view');

  // Reset the state when the dialog is closed
  React.useEffect(() => {
    if (!isOpen) {
      setComments('');
      setRejectionReason('');
      setMode('view');
    }
  }, [isOpen]);

  const handleApprove = () => {
    if (item) {
      onApprove(item.id, comments);
    }
  };

  const handleReject = () => {
    if (item && rejectionReason.trim()) {
      onReject(item.id, rejectionReason);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'view' 
              ? t('pendingApprovalDetails') 
              : mode === 'approve' 
                ? t('approveSubmission') 
                : t('rejectSubmission')
            }
          </DialogTitle>
          <DialogDescription>
            {mode === 'view' 
              ? t('reviewSubmissionDetails') 
              : mode === 'approve' 
                ? t('addCommentsOptional') 
                : t('explainRejectionReason')
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t('school')}</Label>
            <div className="col-span-3">{item.schoolName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t('category')}</Label>
            <div className="col-span-3">{item.categoryName}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t('submittedBy')}</Label>
            <div className="col-span-3">{item.submittedBy}</div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">{t('submittedAt')}</Label>
            <div className="col-span-3">{new Date(item.submittedAt).toLocaleString()}</div>
          </div>

          {mode === 'approve' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="comments">
                {t('comments')}
              </Label>
              <Textarea
                id="comments"
                className="col-span-3"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t('optionalComments')}
              />
            </div>
          )}

          {mode === 'reject' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="rejectionReason">
                {t('reason')}
              </Label>
              <Textarea
                id="rejectionReason"
                className="col-span-3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('explainWhyRejecting')}
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {mode === 'view' ? (
            <>
              <Button variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button variant="destructive" onClick={() => setMode('reject')}>
                <XCircle className="mr-2 h-4 w-4" />
                {t('reject')}
              </Button>
              <Button onClick={() => setMode('approve')}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {t('approve')}
              </Button>
            </>
          ) : mode === 'approve' ? (
            <>
              <Button variant="outline" onClick={() => setMode('view')} disabled={isProcessing}>
                {t('back')}
              </Button>
              <Button onClick={handleApprove} disabled={isProcessing}>
                {isProcessing ? t('processing') : t('confirmApproval')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setMode('view')} disabled={isProcessing}>
                {t('back')}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject} 
                disabled={isProcessing || !rejectionReason.trim()}
              >
                {isProcessing ? t('processing') : t('confirmRejection')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
