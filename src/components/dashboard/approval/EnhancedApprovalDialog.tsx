
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
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface ApprovalItem {
  id: string;
  categoryName: string;
  schoolName: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  data?: any;
}

interface EnhancedApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  item?: ApprovalItem;
}

const EnhancedApprovalDialog: React.FC<EnhancedApprovalDialogProps> = ({
  isOpen,
  onClose,
  onApprove,
  onReject,
  item
}) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  if (!item) return null;

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(item.id, comment);
      toast.success(t('approvalSuccess'));
      setComment('');
      onClose();
    } catch (error) {
      console.error('Approval error:', error);
      toast.error(t('approvalError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error(t('rejectionReasonRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      await onReject(item.id, reason);
      toast.success(t('rejectionSuccess'));
      setReason('');
      onClose();
    } catch (error) {
      console.error('Rejection error:', error);
      toast.error(t('rejectionError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('approvalRequest')}</DialogTitle>
          <DialogDescription>
            {t('approvalRequestFrom')} <strong>{item.schoolName}</strong> {t('for')} <strong>{item.categoryName}</strong>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-muted-foreground">{t('submittedBy')}</p>
              <p className="font-medium">{item.submittedBy}</p>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">{t('submittedAt')}</p>
              <p className="font-medium">{new Date(item.submittedAt).toLocaleString()}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-medium">{t('approvalComment')}</h4>
            <Textarea
              placeholder={t('approvalCommentPlaceholder')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!reason.trim()) {
                  return setReason(t('defaultRejectionReason'));
                }
                handleReject();
              }}
              className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('rejecting') : t('reject')}
            </Button>
            
            <Button
              variant="default"
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('approving') : t('approve')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedApprovalDialog;
