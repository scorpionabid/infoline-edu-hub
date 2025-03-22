
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive?: boolean;
    label?: string;
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20',
  };
  
  const borderClasses = {
    blue: 'border-l-blue-500',
    green: 'border-l-green-500',
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    purple: 'border-l-purple-500',
  };
  
  const renderTrend = () => {
    if (!trend) return null;
    
    const trendColor = trend.isPositive === undefined ? 'text-gray-500' : 
                       trend.isPositive ? 'text-green-500' : 'text-red-500';
    const TrendIcon = trend.isPositive === undefined ? Minus :
                      trend.isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={`flex items-center gap-1 text-xs ${trendColor} mt-1.5`}>
        <TrendIcon className="h-3.5 w-3.5" />
        <span>{trend.value}%</span>
        {trend.label && <span className="text-muted-foreground">({trend.label})</span>}
      </div>
    );
  };
  
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-l-4 ${borderClasses[color]}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{title}</p>
              <div className="text-2xl font-bold">{value}</div>
              {renderTrend()}
            </div>
            <div className={`p-2 rounded-full ${colorClasses[color]}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
