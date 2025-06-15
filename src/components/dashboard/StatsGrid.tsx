
import React from 'react';
import StatsCard from './StatsCard';

export interface StatsGridItem {
  title: string;
  value: number | string;
  color?: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface StatsGridProps {
  children?: React.ReactNode;
  stats?: StatsGridItem[];
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ 
  children, 
  stats,
  className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4" 
}) => {
  return (
    <div className={className}>
      {children}
      {stats && stats.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.description}
          icon={stat.icon}
          color={stat.color}
          onClick={stat.onClick}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
