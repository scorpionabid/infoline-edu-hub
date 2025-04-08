
import React from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { UserSelect } from '@/components/users/UserSelect';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AdminDialogFormProps {
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
  error: string | null;
  schoolId: string;
  schoolName: string;
  loading: boolean;
}

export const AdminDialogForm: React.FC<AdminDialogFormProps> = ({
  selectedUserId,
  onUserSelect,
  error,
  schoolId,
  schoolName,
  loading
}) => {
  const { t } = useLanguageSafe();

  return (
    <div className="space-y-4 py-2">
      {/* Xəta mesajı */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Məktəb məlumatları */}
      <div className="flex flex-col space-y-2">
        <p className="text-sm font-medium">Məktəb: <span className="font-bold">{schoolName || 'Seçilməmiş'}</span></p>
        <p className="text-sm text-muted-foreground">ID: {schoolId || 'Yoxdur'}</p>
      </div>
      
      {/* İstifadəçi seçimi */}
      <div className="flex flex-col space-y-2">
        <label className="text-sm font-medium">{t('selectUser') || 'İstifadəçi seçin'}</label>
        <UserSelect 
          value={selectedUserId}
          onChange={onUserSelect} 
          placeholder={t('selectUserPlaceholder') || 'İstifadəçi seçin'}
          disabled={loading}
        />
      </div>
    </div>
  );
};
