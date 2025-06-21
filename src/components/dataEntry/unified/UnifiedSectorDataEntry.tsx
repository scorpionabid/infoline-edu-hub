
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

interface UnifiedSectorDataEntryProps {
  onComplete?: () => void;
  className?: string;
}

export const UnifiedSectorDataEntry: React.FC<UnifiedSectorDataEntryProps> = ({ 
  onComplete,
  className 
}) => {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('underDevelopment') || 'UnifiedSectorDataEntry komponenti hazırlanır.'}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default UnifiedSectorDataEntry;
