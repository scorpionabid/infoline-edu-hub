
import React from 'react';

export interface StatsGridProps {
  children: React.ReactNode;
  stats?: any; // For backward compatibility
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({ 
  children, 
  className = "grid gap-4 md:grid-cols-2 lg:grid-cols-4" 
}) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default StatsGrid;
