
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DataEntryStatus } from '@/types/dataEntry';

interface StatusIndicatorProps {
  status: DataEntryStatus | 'partial' | string;
  label: string;
  color: string;
}

export function StatusIndicator({ status, label, color }: StatusIndicatorProps) {
  return (
    <Badge className={cn("px-2 py-1 rounded-full", color)}>
      {label}
    </Badge>
  );
}
