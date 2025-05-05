
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

type IndicatorType = 'positive' | 'negative' | 'neutral' | 'warning';

interface SectorStatsCardProps {
  title: string;
  value: number;
  description: string;
  indicator: IndicatorType;
  percentage?: number;
}

const SectorStatsCard: React.FC<SectorStatsCardProps> = ({ 
  title, 
  value, 
  description, 
  indicator, 
  percentage 
}) => {
  const renderIndicator = () => {
    switch (indicator) {
      case 'positive':
        return (
          <div className="flex items-center text-green-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            {percentage && <span>{percentage}%</span>}
          </div>
        );
      case 'negative':
        return (
          <div className="flex items-center text-red-600">
            <TrendingDown className="mr-1 h-4 w-4" />
            {percentage && <span>{percentage}%</span>}
          </div>
        );
      case 'warning':
        return (
          <div className="flex items-center text-amber-600">
            <TrendingUp className="mr-1 h-4 w-4" />
            {percentage && <span>{percentage}%</span>}
          </div>
        );
      default:
        return (
          <div className="flex items-center text-gray-500">
            <Minus className="mr-1 h-4 w-4" />
            {percentage && <span>{percentage}%</span>}
          </div>
        );
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {renderIndicator()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

export default SectorStatsCard;
