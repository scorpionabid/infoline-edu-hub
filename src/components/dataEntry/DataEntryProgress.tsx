
import React from 'react';

interface DataEntryProgressProps {
  percentage: number;
  strokeWidth?: number;
}

const DataEntryProgress: React.FC<DataEntryProgressProps> = ({ percentage, strokeWidth = 4 }) => {
  const radius = 50 - (strokeWidth / 2);
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  // İrəliləmə faizinə görə rəngin təyin edilməsi
  const getProgressColor = (value: number) => {
    if (value >= 75) return "#22C55E"; // yaşıl
    if (value >= 50) return "#3B82F6"; // mavi
    if (value >= 25) return "#F59E0B"; // sarı
    return "#EF4444"; // qırmızı
  };

  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      {/* Arxa fon dairəsi */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        stroke="#e6e6e6"
        strokeWidth={strokeWidth}
      />
      
      {/* İrəliləmə dairəsi */}
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="transparent"
        stroke={getProgressColor(percentage)}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 50 50)"
        strokeLinecap="round"
      />
      
      {/* İrəliləmə faizinin göstərilməsi */}
      <text
        x="50"
        y="50"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="20"
        fontWeight="bold"
        fill={getProgressColor(percentage)}
      >
        {percentage}%
      </text>
    </svg>
  );
};

export default DataEntryProgress;
