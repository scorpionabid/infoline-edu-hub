
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FullUserData } from '@/types/user';
import { Label } from '@/components/ui/label';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface AdminUserSelectorProps {
  users: FullUserData[];
  loading: boolean;
  error: Error | null;
  selectedUserId: string;
  onUserChange: (value: string) => void;
}

export const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  users,
  loading,
  error,
  selectedUserId,
  onUserChange
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-2">
      <Label htmlFor="user-select">{t('selectUser') || 'İstifadəçi seçin'}</Label>
      
      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-destructive flex items-center gap-2 text-sm py-2">
          <AlertCircle className="h-4 w-4" />
          <span>{t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta baş verdi'}</span>
        </div>
      ) : (
        <Select 
          value={selectedUserId || "none"} 
          onValueChange={(value) => onUserChange(value === "none" ? "" : value)}
        >
          <SelectTrigger id="user-select" className="w-full">
            <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('selectUser') || 'İstifadəçi seçin'}</SelectItem>
            {users.length > 0 ? (
              users.map((user, index) => (
                <SelectItem 
                  key={user.id || `user-${index}`} 
                  value={user.id || `user-${index}-${Math.random().toString(36).slice(2)}`}
                >
                  {user.full_name || user.email} 
                  {user.email && ` (${user.email})`}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-users" disabled>
                {t('noUsersFound') || 'İstifadəçi tapılmadı'}
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
