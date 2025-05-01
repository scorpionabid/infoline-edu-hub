
import React from 'react';
import { 
  ArrowUpIcon, ArrowDownIcon, MinusIcon, 
  CheckCircle, XCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { Card, CardContent, CardTitle } from '@/components/ui/card';

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: string;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  onClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  onClick
}) => {
  // İkonunu təyin edirik
  const renderIcon = () => {
    switch (icon) {
      case 'check-circle':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'x-circle':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'clock':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'alert-triangle':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return null;
    }
  };

  // Trend ikonunu təyin edirik
  const renderTrend = () => {
    if (!trend) return null;
    
    const trendClasses = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600'
    };
    
    const trendIcons = {
      up: <ArrowUpIcon className={`h-4 w-4 ${trendClasses.up}`} />,
      down: <ArrowDownIcon className={`h-4 w-4 ${trendClasses.down}`} />,
      neutral: <MinusIcon className={`h-4 w-4 ${trendClasses.neutral}`} />
    };
    
    return (
      <div className={`flex items-center ${trendClasses[trend]}`}>
        {trendIcons[trend]}
        {trendValue && <span className="ml-1 text-xs">{trendValue}%</span>}
      </div>
    );
  };

  return (
    <Card 
      className={`shadow-sm ${onClick ? 'cursor-pointer hover:shadow transition-shadow' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="text-2xl font-bold">{value}</div>
          </div>
          {renderIcon()}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {renderTrend()}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
