
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DataEntryStatus } from '@/types/dataEntry';
import { ColumnValidation } from '@/types/column';

interface StatusIndicatorProps {
  status: DataEntryStatus | 'partial';
  color: string;
  label: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ 
  status, 
  color,
  label 
}) => {
  return (
    <Badge 
      variant="outline" 
      className={`${color} font-medium`}
    >
      {label}
    </Badge>
  );
};

export default StatusIndicator;
