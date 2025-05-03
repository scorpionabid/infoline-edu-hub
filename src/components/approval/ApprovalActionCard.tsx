
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { useApprovalProcess } from '@/hooks/useApprovalProcess';

interface ApprovalActionCardProps {
  schoolId: string;
  schoolName: string;
  categoryId: string;
  categoryName: string;
  onComplete: () => void;
}

const ApprovalActionCard: React.FC<ApprovalActionCardProps> = ({
  schoolId,
  schoolName,
  categoryId,
  categoryName,
  onComplete
}) => {
  const { t } = useLanguageSafe();
  const { approveEntries, rejectEntries, loading } = useApprovalProcess();
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    const result = await approveEntries(schoolId, categoryId, categoryName);
    if (result.success) {
      onComplete();
    }
  };

  const handleReject = async () => {
    const result = await rejectEntries(schoolId, categoryId, categoryName, rejectionReason);
    if (result.success) {
      setIsRejecting(false);
      setRejectionReason('');
      onComplete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{t('pendingApproval')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('school')}</p>
              <p className="text-base">{schoolName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{t('category')}</p>
              <p className="text-base">{categoryName}</p>
            </div>
          </div>

          {isRejecting ? (
            <div className="space-y-2">
              <label htmlFor="rejection-reason" className="text-sm font-medium">
                {t('rejectionReason')} <span className="text-destructive">*</span>
              </label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('enterRejectionReason')}
                className="min-h-[100px]"
              />
            </div>
          ) : null}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {isRejecting ? (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsRejecting(false)}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {loading ? t('rejecting') : t('reject')}
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              onClick={() => setIsRejecting(true)}
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" />
              {t('reject')}
            </Button>
            <Button 
              variant="default" 
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {loading ? t('approving') : t('approve')}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApprovalActionCard;
