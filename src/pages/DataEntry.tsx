import React from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const DataEntry: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore(selectUser);

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('auth.login_required') || 'Giriş tələb olunur'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <DataEntryContainer />
    </div>
  );
};

export default DataEntry;