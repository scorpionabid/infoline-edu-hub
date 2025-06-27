
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

interface ProgressWidgetProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    period: string;
  };
  status?: 'on-track' | 'at-risk' | 'behind';
  className?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  title,
  currentValue,
  targetValue,
  unit = '%',
  trend,
  status = 'on-track',
  className = ''
}) => {
  const progressPercentage = Math.min((currentValue / targetValue) * 100, 100);
  
  const getStatusColor = () => {
    switch (status) {
      case 'on-track':
        return 'text-green-600';
      case 'at-risk':
        return 'text-yellow-600';
      case 'behind':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = () => {
    const variants = {
      'on-track': { label: 'Vaxtında', className: 'bg-green-100 text-green-800' },
      'at-risk': { label: 'Risk altında', className: 'bg-yellow-100 text-yellow-800' },
      'behind': { label: 'Gecikir', className: 'bg-red-100 text-red-800' }
    };
    
    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    return trend.direction === 'up' ? (
      <TrendingUp className="h-3 w-3 text-green-600" />
    ) : (
      <TrendingDown className="h-3 w-3 text-red-600" />
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-2 mb-2">
          <div className={`text-2xl font-bold ${getStatusColor()}`}>
            {currentValue}{unit}
          </div>
          <div className="text-sm text-muted-foreground">
            / {targetValue}{unit}
          </div>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 mb-2"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{Math.round(progressPercentage)}% tamamlanıb</span>
          </div>
          
          {trend && (
            <div className="flex items-center space-x-1">
              {getTrendIcon()}
              <span className={trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}>
                {trend.direction === 'up' ? '+' : ''}{trend.value}{unit} {trend.period}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressWidget;
