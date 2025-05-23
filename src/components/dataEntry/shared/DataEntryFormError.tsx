import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryFormErrorProps {
  error: string | null;
  onRetry?: () => void;
}

const DataEntryFormError: React.FC<DataEntryFormErrorProps> = ({ error, onRetry }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('error')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-destructive">
          {error || t('unknownError')}
        </div>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">{t('retry')}</Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DataEntryFormError;
