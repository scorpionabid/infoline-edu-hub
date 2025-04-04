
import React from 'react';

interface DataEntryProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ 
  percentage, 
  size = 24, 
  strokeWidth = 2 
}) => {
  // Ensure percentage is between 0 and 100
  const normalizedPercentage = Math.min(100, Math.max(0, percentage));
  
  // Calculate circle dimensions
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;
  
  // Determine color based on percentage
  const getColor = () => {
    if (normalizedPercentage < 30) return '#ef4444'; // red
    if (normalizedPercentage < 70) return '#f59e0b'; // amber
    return '#10b981'; // green
  };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className="transform -rotate-90"
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeOpacity={0.2}
      />
      
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DataEntryProgress;
