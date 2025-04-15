
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatsItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface StatusCardsProps {
  stats?: StatsItem[];
  completionRate: number;
  pendingApprovalsCount?: number;
  additionalStats?: {
    activeUsers?: number;
    upcomingDeadlines?: number;
    recentSubmissions?: number;
  };
  className?: string;
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  stats, 
  completionRate, 
  pendingApprovalsCount = 0,
  additionalStats,
  className 
}) => {
  const { t } = useLanguage();

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
            {t('completionRate')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <Progress value={completionRate} className="h-2 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Clock className="mr-2 h-4 w-4 text-yellow-500" />
            {t('pendingApprovals')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingApprovalsCount}</div>
          <p className="text-xs text-muted-foreground mt-2">
            {t('itemsNeedingAttention')}
          </p>
        </CardContent>
      </Card>

      {additionalStats?.activeUsers !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-blue-500" />
              {t('activeUsers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('totalUsersInSystem')}
            </p>
          </CardContent>
        </Card>
      )}

      {additionalStats?.upcomingDeadlines !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              {t('upcomingDeadlines')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{additionalStats.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('categoriesWithDeadlines')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StatusCards;
