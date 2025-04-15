
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem } from '@/types/dashboard';
import PendingApprovalsCard from './PendingApprovalsCard';

interface StatusCardsProps {
  stats: {
    id: string;
    title: string;
    value: number;
    change: number;
    changeType: 'increase' | 'decrease' | 'neutral';
  }[];
  pendingItems?: PendingItem[];
}

const StatusCards: React.FC<StatusCardsProps> = ({ stats, pendingItems = [] }) => {
  const { t } = useLanguage();

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
      {stats.map((stat) => (
        <Card key={stat.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center space-x-1">
                <span className="text-xs">{stat.change}%</span>
                {getChangeIcon(stat.changeType)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {pendingItems && pendingItems.length > 0 && (
        <PendingApprovalsCard pendingItems={pendingItems} />
      )}
    </div>
  );
};

export default StatusCards;
