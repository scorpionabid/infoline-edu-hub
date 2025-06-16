
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface User {
  id: string;
  full_name?: string;
  email?: string;
  role?: string;
}

interface AdminUserSelectorProps {
  users: User[];
  loading: boolean;
  selectedUserId?: string;
  onUserSelect: (userId: string) => void;
  error?: Error | null;
}

export const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  users,
  loading,
  selectedUserId,
  onUserSelect,
  error
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {t('loadingUsers') || 'İstifadəçilər yüklənir...'}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm">
        {t('errorLoadingUsers') || 'İstifadəçilər yüklənərkən xəta baş verdi'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">
          {t('searchUsers') || 'İstifadəçi axtarın'}
        </Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder={t('searchPlaceholder') || 'Ad və ya email daxil edin...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {t('noUsersFound') || 'İstifadəçi tapılmadı'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedUserId === user.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:bg-muted/50'
              }`}
              onClick={() => onUserSelect(user.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.full_name || user.email}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.role && (
                    <p className="text-xs text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  )}
                </div>
                {selectedUserId === user.id && (
                  <div className="w-2 h-2 bg-primary rounded-full" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUserSelector;
