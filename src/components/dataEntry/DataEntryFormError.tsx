
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

interface DataEntryFormErrorProps {
  error: string | null;
  onBack: () => void;
}

const DataEntryFormError: React.FC<DataEntryFormErrorProps> = ({ error, onBack }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('error')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-destructive">
          {error}
        </div>
        <Button onClick={onBack} className="mt-4">{t('goBack')}</Button>
      </CardContent>
    </Card>
  );
};

export default DataEntryFormError;
