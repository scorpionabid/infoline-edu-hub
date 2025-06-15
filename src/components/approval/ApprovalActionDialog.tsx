
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ApprovalActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (comment?: string) => Promise<void>;
  action: 'approve' | 'reject';
  itemTitle: string;
  isLoading?: boolean;
}

const ApprovalActionDialog: React.FC<ApprovalActionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  itemTitle,
  isLoading = false
}) => {
  const { t } = useLanguage();
  const [comment, setComment] = useState('');

  const handleConfirm = async () => {
    await onConfirm(comment);
    setComment('');
    onClose();
  };

  const handleClose = () => {
    setComment('');
    onClose();
  };

  const isApprove = action === 'approve';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isApprove ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {isApprove ? t('approveItem') : t('rejectItem')}
          </DialogTitle>
          <DialogDescription>
            {isApprove 
              ? t('confirmApprovalMessage', { item: itemTitle })
              : t('confirmRejectionMessage', { item: itemTitle })
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="comment">
              {isApprove ? t('approvalComment') : t('rejectionReason')}
              {!isApprove && ' *'}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApprove 
                  ? t('approvalCommentPlaceholder')
                  : t('rejectionReasonPlaceholder')
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-2"
              rows={4}
              required={!isApprove}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || (!isApprove && !comment.trim())}
            className={isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isApprove ? t('approve') : t('reject')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalActionDialog;
