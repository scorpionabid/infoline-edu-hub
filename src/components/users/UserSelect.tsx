
import React, { useState, useEffect } from 'react';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/context/LanguageContext';
import { SimpleUserSelect } from "./UserSelectParts/SimpleUserSelect";
import { useUserSelectData } from './UserSelectParts/useUserSelectData';

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  description?: string;
}

export function UserSelect({ value, onChange, placeholder, disabled, label, description }: UserSelectProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    users,
    loading,
    error,
    fetchUsers,
    selectedUser
  } = useUserSelectData(value);
  
  // Təhlükəsiz istifadə üçün users massivini əlavə yoxlama
  const safeUsers = users && Array.isArray(users) ? users.map((user, index) => {
    // Ensure user.id is never empty
    if (!user.id || user.id === '') {
      return {
        ...user,
        id: `user-${index}-${Math.random().toString(36).slice(2)}`
      };
    }
    return user;
  }) : [];
  
  const displayText = selectedUser
    ? (selectedUser.full_name || selectedUser.email || 'İsimsiz İstifadəçi')
    : (placeholder || 'İstifadəçi seçin');
  
  const handleSelect = (userId: string) => {
    onChange(userId);
    setOpen(false);
  };
  
  // Popover açıldıqda istifadəçiləri yenidən yüklə
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open, fetchUsers]);

  return (
    <div className="space-y-1">
      {label && <Label htmlFor="user">{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            <span>{displayText}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <SimpleUserSelect
            users={safeUsers}
            value={value}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onSelect={handleSelect}
            loading={loading}
            error={error}
            onRetry={fetchUsers}
          />
        </PopoverContent>
      </Popover>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
