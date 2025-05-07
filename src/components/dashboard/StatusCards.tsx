
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { FormStats } from '@/types/dashboard';

interface StatusCardsProps {
  completion: { total: number; completed: number; percentage: number };
  status: { pending: number; approved: number; rejected: number; total: number };
  formStats?: FormStats;
}

export const StatusCards: React.FC<StatusCardsProps> = ({ completion, status, formStats }) => {
  const { t } = useLanguage();

  // formStats varsa onu, yoxsa status istifadə et
  const stats = formStats || {
    pending: status.pending,
    approved: status.approved,
    rejected: status.rejected,
    total: status.total,
    draft: 0 // FormStats tipinə uyğun əlavə olundu
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('totalForms')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{t('overallProgressDescription')}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('approval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          <Progress
            value={(stats.approved / (stats.total || 1)) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('pendingApproval')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          <Progress
            value={(stats.pending / (stats.total || 1)) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{t('rejected')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          <Progress
            value={(stats.rejected / (stats.total || 1)) * 100}
            className="h-2 mt-2"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;
