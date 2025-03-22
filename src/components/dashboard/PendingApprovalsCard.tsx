
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface PendingApprovalsCardProps {
  pendingApprovals: number;
  todayCount?: number;
  weekCount?: number;
  olderCount?: number;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ 
  pendingApprovals,
  todayCount = 8,
  weekCount = 15,
  olderCount
}) => {
  const { t } = useLanguage();
  const calculatedOlderCount = olderCount !== undefined ? olderCount : pendingApprovals - (todayCount + weekCount);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('pendingApprovals')}</CardTitle>
        <CardDescription>Forms waiting for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold">{pendingApprovals}</span>
            <Badge variant={pendingApprovals < 10 ? "success" : pendingApprovals < 30 ? "warning" : "destructive"}>
              {pendingApprovals < 10 ? "Low" : pendingApprovals < 30 ? "Medium" : "High"}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-500 mb-1" />
              <span className="text-sm font-medium">Today</span>
              <span className="text-xl font-bold">{todayCount}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-md">
              <Clock className="h-5 w-5 text-amber-500 mb-1" />
              <span className="text-sm font-medium">This Week</span>
              <span className="text-xl font-bold">{weekCount}</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mb-1" />
              <span className="text-sm font-medium">Older</span>
              <span className="text-xl font-bold">{calculatedOlderCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
