
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SectorAdminUserSelectorProps {
  users: FullUserData[];
  loading: boolean;
  selectedUserId: string;
  onUserSelect: (userId: string) => void;
}

export const SectorAdminUserSelector: React.FC<SectorAdminUserSelectorProps> = ({
  users,
  loading,
  selectedUserId,
  onUserSelect
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="user-select">{t('selectUser') || 'İstifadəçi seçin'}</Label>
      <Select
        value={selectedUserId}
        onValueChange={onUserSelect}
        disabled={loading}
      >
        <SelectTrigger id="user-select">
          <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
        </SelectTrigger>
        <SelectContent>
          {loading && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {t('loading') || 'Yüklənir...'}
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="p-2 text-center text-sm text-muted-foreground">
              {t('noUsersFound') || 'İstifadəçi tapılmadı'}
            </div>
          )}
          {!loading && users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.full_name || 'İstifadəçi'} ({user.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
