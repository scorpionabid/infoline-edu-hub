
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Check, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StatusCardsProps {
  data: {
    completionRate: number;
    pendingApprovals: number;
  };
}

export const StatusCards: React.FC<StatusCardsProps> = ({ data }) => {
  const { t } = useLanguage();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('completionRate')}
          </CardTitle>
          <Check className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="text-2xl font-bold">{data.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t('completionRateDescription')}
            </p>
            <Progress value={data.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('pendingApprovals')}
          </CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="text-2xl font-bold">{data.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              {t('pendingApprovalsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
