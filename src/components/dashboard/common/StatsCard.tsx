
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCardProps } from '@/types/dashboard';

export function StatsCard({
  title,
  value,
  icon,
  description,
  trend,
  trendDirection = 'neutral'
}: StatsCardProps) {
  const trendColor = 
    trendDirection === 'up' ? 'text-green-500' : 
    trendDirection === 'down' ? 'text-red-500' : 
    'text-gray-500';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          {typeof icon === 'string' ? icon : icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <CardDescription>{description}</CardDescription>}
        {trend && (
          <p className={`text-xs mt-1 ${trendColor}`}>
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
