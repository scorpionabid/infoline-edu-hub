
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SectorStatsCardProps {
  title: string;
  value: number;
  description: string;
  indicator?: 'positive' | 'negative' | 'neutral' | 'warning';
}

const SectorStatsCard: React.FC<SectorStatsCardProps> = ({
  title,
  value,
  description,
  indicator = 'neutral'
}) => {
  // İndikatora görə rəng təyinatı
  const getIndicatorClass = () => {
    switch (indicator) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      case 'warning':
        return 'text-amber-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className={`text-3xl font-bold ${getIndicatorClass()}`}>
            {value}
          </div>
          {indicator !== 'neutral' && (
            <div className={`rounded-full w-3 h-3 ${indicator === 'positive' ? 'bg-green-500' : indicator === 'negative' ? 'bg-red-500' : 'bg-amber-500'}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SectorStatsCard;
