import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Clock } from 'lucide-react';

interface ProxyNotificationStatusProps {
  hasUnsavedChanges: boolean;
  lastSaved: Date | null;
}

const ProxyNotificationStatus: React.FC<ProxyNotificationStatusProps> = ({
  hasUnsavedChanges,
  lastSaved
}) => {
  return (
    <div className="space-y-2">
      {hasUnsavedChanges && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Info className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Yadda saxlanılmamış dəyişikliklər var. Məlumatlar hər 30 saniyədə avtomatik yadda saxlanılır.
          </AlertDescription>
        </Alert>
      )}

      {lastSaved && (
        <Alert className="border-green-200 bg-green-50">
          <Clock className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Son yadda saxlama: {lastSaved.toLocaleTimeString()}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProxyNotificationStatus;
