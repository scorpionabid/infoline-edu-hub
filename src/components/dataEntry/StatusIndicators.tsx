
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ClockIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { DataEntrySaveStatus } from '@/types/dataEntry';

interface StatusIndicatorProps {
  status: 'draft' | 'pending' | 'approved' | 'rejected' | string;
  className?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          label: 'Təsdiqlənib',
          variant: 'success' as const,
          icon: CheckCircle
        };
      case 'rejected':
        return {
          label: 'Rədd edilib',
          variant: 'destructive' as const,
          icon: AlertCircle
        };
      case 'pending':
        return {
          label: 'Gözləmədə',
          variant: 'warning' as const,
          icon: ClockIcon
        };
      case 'draft':
        return {
          label: 'Qaralama',
          variant: 'outline' as const,
          icon: ClockIcon
        };
      default:
        return {
          label: status,
          variant: 'outline' as const,
          icon: ClockIcon
        };
    }
  };

  const { label, variant, icon: Icon } = getStatusConfig();

  return (
    <Badge 
      variant={variant} 
      className={cn('flex items-center gap-1', className)}
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
};

export const SaveStatusIndicator: React.FC<{status: DataEntrySaveStatus}> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case DataEntrySaveStatus.SAVED:
        return {
          label: 'Yadda saxlanılıb',
          variant: 'outline' as const,
          icon: CheckCircle
        };
      case DataEntrySaveStatus.SAVING:
        return {
          label: 'Yadda saxlanılır...',
          variant: 'outline' as const,
          icon: ClockIcon
        };
      case DataEntrySaveStatus.ERROR:
        return {
          label: 'Xəta',
          variant: 'destructive' as const,
          icon: AlertCircle
        };
      case DataEntrySaveStatus.SUBMITTING:
        return {
          label: 'Göndərilir...',
          variant: 'outline' as const,
          icon: ClockIcon
        };
      case DataEntrySaveStatus.SUBMITTED:
        return {
          label: 'Göndərildi',
          variant: 'success' as const,
          icon: CheckCircle
        };
      default:
        return {
          label: '',
          variant: 'outline' as const,
          icon: () => null
        };
    }
  };

  const { label, variant, icon: Icon } = getStatusConfig();
  
  if (status === DataEntrySaveStatus.IDLE) return null;

  return (
    <Badge 
      variant={variant} 
      className="flex items-center gap-1"
    >
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </Badge>
  );
};
