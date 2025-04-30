
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { DataEntryStatus } from '@/types/dataEntry';
import { ColumnValidationError } from '@/types/column';

interface StatusIndicatorProps {
  status?: DataEntryStatus;
  error?: ColumnValidationError;
}

export const StatusIndicator = ({ status, error }: StatusIndicatorProps) => {
  if (error) {
    return (
      <div className="flex items-center text-destructive" title={error.message}>
        <AlertCircle className="h-4 w-4 mr-1" />
        <span className="text-xs">{error.message}</span>
      </div>
    );
  }

  if (status === 'approved') {
    return (
      <div className="flex items-center text-green-600" title="Təsdiqləndi">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span className="text-xs">Təsdiqləndi</span>
      </div>
    );
  }

  if (status === 'rejected') {
    return (
      <div className="flex items-center text-destructive" title="Rədd edildi">
        <AlertCircle className="h-4 w-4 mr-1" />
        <span className="text-xs">Rədd edildi</span>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div className="flex items-center text-amber-500" title="Gözləmədə">
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-xs">Gözləmədə</span>
      </div>
    );
  }

  return null;
};
