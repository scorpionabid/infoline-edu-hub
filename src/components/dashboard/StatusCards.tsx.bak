
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, Clock, XCircle, BarChart3 } from 'lucide-react';

interface StatusCardsProps {
  completedCount: number;
  pendingCount: number;
  rejectedCount: number;
  totalCount: number;
  isLoading?: boolean;
}

const StatusCards: React.FC<StatusCardsProps> = ({
  completedCount,
  pendingCount,
  rejectedCount,
  totalCount,
  isLoading = false
}) => {
  const { t } = useLanguage();

  const cards = [
    {
      title: t('completed'),
      value: completedCount,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: t('pending'),
      value: pendingCount,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: t('rejected'),
      value: rejectedCount,
      icon: XCircle,
      color: 'text-red-600'
    },
    {
      title: t('total'),
      value: totalCount,
      icon: BarChart3,
      color: 'text-blue-600'
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {isLoading ? '...' : card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatusCards;
