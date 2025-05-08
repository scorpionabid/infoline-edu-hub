
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PendingApproval } from '@/types/dashboard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { CheckIcon, XIcon, EyeIcon } from 'lucide-react';

interface ApprovalItemProps {
  item: PendingApproval;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  viewOnly?: boolean;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({
  item,
  onApprove,
  onReject,
  viewOnly = false
}) => {
  const { t } = useLanguage();
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleReject = () => {
    if (onReject && rejectReason.trim()) {
      onReject(item.id, rejectReason);
      setIsRejectDialogOpen(false);
      setRejectReason('');
    }
  };

  const formattedDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'PPp');
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-medium">{item.schoolName}</h3>
              <p className="text-sm text-muted-foreground">{item.categoryName}</p>
              <p className="text-xs text-muted-foreground">
                {t('submittedAt')}: {formattedDate(item.submittedAt)}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button size="sm" variant="outline">
                <EyeIcon className="h-4 w-4 mr-1" />
                {t('view')}
              </Button>
              
              {!viewOnly && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onApprove && onApprove(item.id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {t('approve')}
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setIsRejectDialogOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XIcon className="h-4 w-4 mr-1" />
                    {t('reject')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('rejectSubmission')}</DialogTitle>
            <DialogDescription>
              {t('rejectSubmissionDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder={t('rejectReasonPlaceholder')}
            className="min-h-[100px]"
          />
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRejectDialogOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              {t('reject')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovalItem;
