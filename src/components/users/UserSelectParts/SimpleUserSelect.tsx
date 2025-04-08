import React, { useState, useEffect } from 'react';
import { Check, Search, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';
import { SimpleUser } from './useUserSelectData';

interface SimpleUserSelectProps {
  users: SimpleUser[];
  loading: boolean;
  error: string | null;
  value: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSelect: (value: string) => void;
  onRetry?: () => void;
}

export const SimpleUserSelect: React.FC<SimpleUserSelectProps> = ({
  users,
  loading,
  error,
  value,
  searchTerm,
  onSearchChange,
  onSelect,
  onRetry
}) => {
  const { t } = useLanguage();
  const [filteredUsers, setFilteredUsers] = useState<SimpleUser[]>([]);
  
  // Təhlükəsiz istifadə üçün users massivini əlavə yoxlama
  const safeUsers = users && Array.isArray(users) ? users : [];
  
  // Axtarış termini dəyişdikdə istifadəçiləri filtrlə
  useEffect(() => {
    if (!safeUsers || !Array.isArray(safeUsers)) {
      setFilteredUsers([]);
      return;
    }
    
    if (!searchTerm) {
      setFilteredUsers(safeUsers);
      return;
    }
    
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const filtered = safeUsers.filter(user => {
      if (!user) return false;
      
      const fullName = user.full_name || '';
      const email = user.email || '';
      
      return fullName.toLowerCase().includes(lowercaseSearchTerm) || 
             email.toLowerCase().includes(lowercaseSearchTerm);
    });
    
    setFilteredUsers(filtered);
  }, [safeUsers, searchTerm]);
  
  // Xəta komponenti
  const ErrorComponent = () => (
    <div className="p-4 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">{error}</p>
      {onRetry && (
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          onClick={onRetry}
        >
          Yenidən cəhd et
        </button>
      )}
    </div>
  );
  
  // Boş komponenti
  const EmptyComponent = () => (
    <div className="p-4 text-center">
      <p className="text-sm text-muted-foreground">
        {t('noUsersFound') || 'İstifadəçi tapılmadı'}
      </p>
    </div>
  );
  
  return (
    <div className="w-full rounded-md border border-input bg-background">
      {/* Axtarış sahəsi */}
      <div className="flex items-center border-b border-input px-3 py-2">
        <Search className="h-4 w-4 text-muted-foreground mr-2" />
        <input
          type="text"
          className="flex-1 bg-transparent outline-none"
          placeholder={t('searchUser') || "İstifadəçi axtar..."}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      {/* Məzmun */}
      <div className="max-h-[300px] overflow-auto">
        {error ? (
          <ErrorComponent />
        ) : loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <EmptyComponent />
        ) : (
          <div className="py-1">
            {filteredUsers.map((user) => {
              // Undefined və ya id-si olmayan istifadəçiləri keç
              if (!user || !user.id) return null;
              
              return (
                <button
                  key={user.id}
                  className={cn(
                    "flex items-center w-full px-3 py-2 text-left hover:bg-accent",
                    value === user.id && "bg-accent"
                  )}
                  onClick={() => onSelect(user.id)}
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
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
