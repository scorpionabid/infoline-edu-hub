
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { DataEntryStatus } from '@/types/dataEntry';
import { ColumnValidationError } from '@/types/column';

interface StatusIndicatorProps {
  status?: DataEntryStatus;
  error?: ColumnValidationError;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, error }) => {
  // Xəta varsa, xəta göstəririk
  if (error) {
    return (
      <Alert variant="destructive" className="mt-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Xəta</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  // Status əsasında müvafiq indikator göstəririk
  switch (status) {
    case 'approved':
      return (
        <Alert variant="success" className="mt-2 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Təsdiqlənib</AlertTitle>
          <AlertDescription className="text-green-600">Bu məlumat təsdiqlənib və artıq dəyişdirilə bilməz.</AlertDescription>
        </Alert>
      );
    case 'pending':
      return (
        <Alert variant="warning" className="mt-2 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Təsdiq gözləyir</AlertTitle>
          <AlertDescription className="text-yellow-600">Bu məlumat hələ təsdiqlənməyib.</AlertDescription>
        </Alert>
      );
    case 'rejected':
      return (
        <Alert variant="destructive" className="mt-2 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-600">Rədd edilib</AlertTitle>
          <AlertDescription className="text-red-600">Bu məlumat rədd edilib, yenidən düzəliş etməli və təqdim etməlisiniz.</AlertDescription>
        </Alert>
      );
    case 'draft':
      return (
        <Alert variant="default" className="mt-2 bg-gray-50 border-gray-200">
          <Info className="h-4 w-4 text-gray-600" />
          <AlertTitle className="text-gray-600">Qaralama</AlertTitle>
          <AlertDescription className="text-gray-600">Bu məlumat qaralama kimi saxlanılıb.</AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
};
