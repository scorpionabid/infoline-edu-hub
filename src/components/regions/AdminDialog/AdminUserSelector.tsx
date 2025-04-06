
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, UserCheck, ShieldCheck } from 'lucide-react';

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

  // İstifadəçiləri filtrlə 
  const filteredUsers = React.useMemo(() => {
    // Bütün istifadəçiləri əldə et, SuperAdminləri çıxar
    return users
      .filter(user => user.role !== 'superadmin') 
      .sort((a, b) => {
        // RegionAdminləri əvvələ gətir
        if (a.role === 'regionadmin' && b.role !== 'regionadmin') return -1;
        if (a.role !== 'regionadmin' && b.role === 'regionadmin') return 1;
        return a.name.localeCompare(b.name);
      });
  }, [users]);

  // İstifadəçi rolunu ikona ilə göstər
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'regionadmin':
        return <ShieldCheck className="h-4 w-4 text-blue-500 mr-2" />;
      case 'sectoradmin':
        return <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />;
      case 'schooladmin':
        return <ShieldCheck className="h-4 w-4 text-amber-500 mr-2" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500 mr-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta baş verdi'}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-medium">{t('selectUser') || 'İstifadəçi seçin'}</h4>
      
      <Select 
        value={selectedUserId} 
        onValueChange={onUserChange}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('selectUser') || 'İstifadəçi seçin'} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{t('availableUsers') || 'Mövcud istifadəçilər'}</SelectLabel>
            {filteredUsers.length === 0 ? (
              <SelectItem value="no-users" disabled>
                {t('noUsersFound') || 'İstifadəçi tapılmadı'}
              </SelectItem>
            ) : (
              filteredUsers.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  <div className="flex items-center">
                    {getRoleIcon(user.role)}
                    <span>{user.name} ({user.email})</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      <p className="text-sm text-muted-foreground">
        {t('existingUserAdminHelp') || 'Seçilmiş istifadəçi bu region üçün admin səlahiyyətlərinə malik olacaq.'}
      </p>
    </div>
  );
};
