
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/context/LanguageContext';
import { StatusCardsProps } from '@/types/dashboard';

const StatusCards: React.FC<StatusCardsProps> = ({ completion, status, formStats }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('completionRate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completion.percentage}%</div>
          <Progress value={completion.percentage} className="h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completion.completed} / {completion.total} {t('completed')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('pendingSubmissions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{status.pending}</div>
          <Progress value={(status.pending / (status.total || 1)) * 100} className="h-2 mt-2 bg-amber-100" />
          <p className="text-xs text-muted-foreground mt-2">
            {status.pending} {t('submissionsPending')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('approvedSubmissions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{status.approved}</div>
          <Progress value={(status.approved / (status.total || 1)) * 100} className="h-2 mt-2 bg-green-100" />
          <p className="text-xs text-muted-foreground mt-2">
            {status.approved} {t('submissionsApproved')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {t('rejectedSubmissions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{status.rejected}</div>
          <Progress value={(status.rejected / (status.total || 1)) * 100} className="h-2 mt-2 bg-red-100" />
          <p className="text-xs text-muted-foreground mt-2">
            {status.rejected} {t('submissionsRejected')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;
