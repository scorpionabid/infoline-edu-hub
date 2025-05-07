
import React from 'react';

interface CompletionProgressProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const CompletionProgress: React.FC<CompletionProgressProps> = ({ 
  percentage, 
  size = 'md', 
  showText = true 
}) => {
  const sizeClass = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }[size];
  
  // Ensure percentage is between 0 and 100
  const safePercentage = Math.max(0, Math.min(100, percentage));
  
  // Determine color based on percentage
  const color = safePercentage < 30 ? 'bg-red-500' : 
               safePercentage < 70 ? 'bg-amber-500' : 
               'bg-green-500';

  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        <div className={`w-full bg-gray-200 rounded-full ${sizeClass} dark:bg-gray-700`}>
          <div 
            className={`${color} rounded-full ${sizeClass} transition-all duration-500 ease-out`} 
            style={{ width: `${safePercentage}%` }}
          ></div>
        </div>
        {showText && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[40px] text-right">
            {Math.round(safePercentage)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default CompletionProgress;
