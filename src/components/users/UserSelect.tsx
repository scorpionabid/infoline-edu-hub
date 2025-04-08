
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/context/LanguageContext';
import { UserSelectCommand } from './UserSelectParts/UserSelectCommand';
import { useUserSelectData } from './UserSelectParts/useUserSelectData';
import { UserLoadingState } from './UserSelectParts/UserLoadingState';

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserSelect({ value, onChange, placeholder, disabled }: UserSelectProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // İstifadəçi verilərini əldə etmək üçün xüsusi hook
  const { 
    users, 
    loading, 
    error, 
    selectedUserData,
    fetchUsers
  } = useUserSelectData(value, open, searchTerm);

  // İstifadəçi seçildikdə
  const handleSelect = (userId: string) => {
    const newValue = userId === value ? '' : userId;
    console.log(`İstifadəçi seçildi: ${userId} -> ${newValue}`);
    onChange(newValue);
    setOpen(false);
  };

  // Göstərilən mətn
  const displayText = selectedUserData 
    ? `${selectedUserData.full_name || 'İsimsiz İstifadəçi'} (${selectedUserData.email || ''})`
    : value 
      ? 'Yüklənir...' 
      : placeholder || t('selectUser') || 'İstifadəçi seçin';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayText}
          <UserLoadingState loading={loading} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <UserSelectCommand 
          users={users}
          loading={loading}
          error={error}
          value={value}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}
