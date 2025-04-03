import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/context/LanguageContext';

interface CompletionRateCardProps {
  title: string;
  value: number;
  description?: string;
  className?: string;
  colors?: string[];
}

export const CompletionRateCard: React.FC<CompletionRateCardProps> = ({ 
  title, 
  value, 
  description,
  className,
  colors = ['#9b87f5', '#f3f4f6'] 
}) => {
  const { t } = useLanguage();
  
  const data = [
    { name: 'Completed', value: value },
    { name: 'Remaining', value: 100 - value }
  ];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-2xl font-bold">{value}%</div>
      </CardHeader>
      <CardContent>
        <div className="h-[80px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                startAngle={180}
                endAngle={0}
                innerRadius={30}
                outerRadius={40}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  className,
  trend
}) => {
  const { t } = useLanguage();
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="w-4 h-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className={cn(
            "text-xs mt-2 flex items-center",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}% {t('fromLastMonth')}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface StatusCardProps {
  title: string;
  count: number;
  total?: number;
  status: 'pending' | 'approved' | 'rejected' | 'overdue' | 'dueSoon';
  className?: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  count,
  total,
  status,
  className
}) => {
  const { t } = useLanguage();
  
  const getStatusColor = () => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'overdue': return 'bg-rose-100 text-rose-800';
      case 'dueSoon': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("px-2 py-1 rounded-md text-xs font-medium", getStatusColor())}>
          {t(status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{count}</div>
        {total !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {t('outOf')} {total} {t('total')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
