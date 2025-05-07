
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';

interface StatusCardsProps {
  completion: { total: number; completed: number; percentage: number };
  status: { pending: number; approved: number; rejected: number; total: number };
}

export const StatusCards: React.FC<StatusCardsProps> = ({ completion, status }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('totalForms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{status.total}</div>
          <p className="text-xs text-muted-foreground">{t('overallProgressDescription')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('approval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{status.approved}</div>
          <Progress
            value={(status.approved / status.total) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('pendingApproval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{status.pending}</div>
          <Progress
            value={(status.pending / status.total) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('rejected')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{status.rejected}</div>
          <Progress
            value={(status.rejected / status.total) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;
