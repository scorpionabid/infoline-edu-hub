
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

interface UserErrorStateProps {
  error: string | null;
  onRetry?: () => void;
}

export const UserErrorState: React.FC<UserErrorStateProps> = ({ error, onRetry }) => {
  const { t } = useLanguage();
  
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Yeniləmə event-i yayımlayaq
      document.dispatchEvent(new Event('refresh-users'));
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <AlertCircle className="h-8 w-8 text-destructive mb-2" />
      <p className="text-sm text-destructive font-medium mb-1">
        {t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta'}
      </p>
      <p className="text-xs text-muted-foreground mb-3 px-4">
        {error || t('unexpectedError') || 'Gözlənilməz xəta'}
      </p>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh}
        className="flex items-center"
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        <span>{t('tryAgain') || 'Təkrar yoxla'}</span>
      </Button>
    </div>
  );
};
