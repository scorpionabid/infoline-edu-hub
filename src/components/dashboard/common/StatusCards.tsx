import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem, StatsItem } from '@/types/dashboard';

interface StatusCardsProps {
  stats: StatsItem[] | any;
  completionRate?: number;
  pendingItems?: PendingItem[];
}

const StatusCards: React.FC<StatusCardsProps> = ({ 
  stats, 
  completionRate = 0, 
  pendingItems = []
}) => {
  const { t } = useLanguage();

  // Əgər stats array deyilsə, boş array istifadə et
  const statsArray = Array.isArray(stats) ? stats : 
    // Əgər stats obyektdirsə, onu array-ə çevir
    (stats && typeof stats === 'object') ? 
      Object.entries(stats).map(([key, value]) => ({
        label: key,
        value: value
      })) : [];

  const getChangeIcon = (changeType: 'increase' | 'decrease' | 'neutral') => {
    switch (changeType) {
      case 'increase':
        return (
          <div className="text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </div>
        );
      case 'decrease':
        return (
          <div className="text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsArray.length > 0 ? (
        statsArray.map((stat, index) => (
          <Card key={stat.label || index}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('noStats')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground">{t('noStatsAvailable')}</div>
          </CardContent>
        </Card>
      )}
      
      {pendingItems && pendingItems.length > 0 && (
        <PendingApprovalsCard pendingItems={pendingItems} />
      )}
    </div>
  );
};

export default StatusCards;
