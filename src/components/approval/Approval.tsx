import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

type DataEntryStatus = 'draft' | 'pending' | 'approved' | 'rejected';

interface ApprovalProps {
  status: DataEntryStatus;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const Approval: React.FC<ApprovalProps> = ({
  status,
  onApprove,
  onReject,
  isLoading = false
}) => {
  const [rejectDialogOpen, setRejectDialogOpen] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleApprove = async () => {
    try {
      await onApprove();
      toast({
        title: t('approvalSuccess'),
        description: t('approvalSuccessMessage'),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('approvalError'),
        description: t('approvalErrorMessage'),
      });
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        variant: 'destructive',
        title: t('validationError'),
        description: t('rejectionReasonRequired'),
      });
      return;
    }

    try {
      await onReject(rejectionReason);
      setRejectDialogOpen(false);
      setRejectionReason('');
      toast({
        title: t('rejectionSuccess'),
        description: t('rejectionSuccessMessage'),
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: t('rejectionError'),
        description: t('rejectionErrorMessage'),
      });
    }
  };

  // Status dəyərlərinə görə badge göstər
  const renderStatusBadge = () => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            {t('approved')}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
            {t('rejected')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            {t('pending')}
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {t('draft')}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (status === 'approved' || status === 'rejected') {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground">{t('status')}:</span>
        {renderStatusBadge()}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-muted-foreground mr-2">{t('status')}: {renderStatusBadge()}</span>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-green-500 text-green-600 hover:bg-green-50",
            isLoading && "opacity-50 pointer-events-none"
          )}
          onClick={handleApprove}
          disabled={isLoading || status !== 'pending'}
        >
          <ThumbsUp className="h-4 w-4 mr-1" />
          {t('approve')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border-red-500 text-red-600 hover:bg-red-50",
            isLoading && "opacity-50 pointer-events-none"
          )}
          onClick={() => setRejectDialogOpen(true)}
          disabled={isLoading || status !== 'pending'}
        >
          <ThumbsDown className="h-4 w-4 mr-1" />
          {t('reject')}
        </Button>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectConfirmation')}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="mb-2 block">
              {t('rejectionReason')}
            </Label>
            <Textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('rejectionReasonPlaceholder')}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              {isLoading ? t('rejecting') : t('confirmReject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Approval;
