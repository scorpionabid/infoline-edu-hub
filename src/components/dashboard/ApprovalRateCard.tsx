
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';

interface ApprovalRateCardProps {
  rate: number;
  pendingCount: number;
}

const ApprovalRateCard: React.FC<ApprovalRateCardProps> = ({ rate, pendingCount }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {t('approvalRate')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-2xl font-bold">{rate}%</div>
          <Progress className="h-2" value={rate} />
          <p className="text-xs text-muted-foreground">
            {pendingCount} {t('pendingApprovals')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApprovalRateCard;
