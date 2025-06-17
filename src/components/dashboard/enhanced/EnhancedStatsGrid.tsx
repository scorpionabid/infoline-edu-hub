
import React from 'react';
import { ResponsiveGrid } from '@/components/ui/mobile-optimized-layout';
import { EnhancedDashboardCard } from './EnhancedDashboardCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  onClick?: () => void;
}

interface EnhancedStatsGridProps {
  stats: StatItem[];
  className?: string;
}

export const EnhancedStatsGrid: React.FC<EnhancedStatsGridProps> = ({
  stats,
  className
}) => {
  return (
    <ResponsiveGrid
      cols={{ mobile: 1, tablet: 2, desktop: 4 }}
      gap="md"
      className={cn('stagger-animation', className)}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.id}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <EnhancedDashboardCard
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
            variant={stat.variant}
            onClick={stat.onClick}
          />
        </div>
      ))}
    </ResponsiveGrid>
  );
};

export default EnhancedStatsGrid;
