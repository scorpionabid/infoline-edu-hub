
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const SectorAdminProxyDataEntry: React.FC = () => {
  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        SectorAdminProxyDataEntry komponenti hazırlanır.
      </AlertDescription>
    </Alert>
  );
};

export default SectorAdminProxyDataEntry;
