
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/context/LanguageContext';
import { Eye, Check, X } from 'lucide-react';

interface ApprovalItemProps {
  approval: {
    id: string;
    schoolName: string;
    categoryName: string;
    submittedAt: string;
    status: 'pending' | 'approved' | 'rejected';
  };
  onApprove: () => void;
  onReject: () => void;
  onView: () => void;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({
  approval,
  onApprove,
  onReject,
  onView
}) => {
  const { t } = useLanguage();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">{t('pending')}</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">{t('approved')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('rejected')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{approval.schoolName}</CardTitle>
            <p className="text-sm text-muted-foreground">{approval.categoryName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('submittedAt')}: {approval.submittedAt}
            </p>
          </div>
          {getStatusBadge(approval.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {t('view')}
          </Button>
          {approval.status === 'pending' && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={onApprove}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4" />
                {t('approve')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onReject}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                {t('reject')}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalItem;
