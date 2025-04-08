
import React from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { useLanguage } from '@/context/LanguageContext';
import { User } from './types';
import { UserErrorState } from './UserErrorState';
import { UserEmptyState } from './UserEmptyState';

interface UserSelectCommandProps {
  users: User[];
  loading: boolean;
  error: string | null;
  value: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string) => void;
}

export const UserSelectCommand: React.FC<UserSelectCommandProps> = ({
  users,
  loading,
  error,
  value,
  searchTerm,
  onSearchChange,
  onSelect
}) => {
  const { t } = useLanguage();
  
  // Təhlükəsiz istifadə üçün users massivini əlavə yoxlama
  const safeUsers = Array.isArray(users) ? users : [];

  return (
    <Command>
      <CommandInput 
        placeholder={t('searchUser') || "İstifadəçi axtar..."} 
        value={searchTerm}
        onValueChange={onSearchChange}
      />
      
      {error ? (
        <UserErrorState error={error} />
      ) : loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <CommandEmpty>{t('noUsersFound') || 'İstifadəçi tapılmadı'}</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {safeUsers.length > 0 ? (
              safeUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.id}
                  onSelect={() => onSelect(user.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{user.full_name || 'İsimsiz İstifadəçi'}</span>
                    <span className="text-xs text-muted-foreground">{user.email || ''}</span>
                  </div>
                </CommandItem>
              ))
            ) : (
              <UserEmptyState />
            )}
          </CommandGroup>
        </>
      )}
    </Command>
  );
};
