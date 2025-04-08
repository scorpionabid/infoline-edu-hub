
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/context/LanguageContext';

type User = {
  id: string;
  full_name: string;
  email: string;
};

interface UserSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function UserSelect({ value, onChange, placeholder, disabled }: UserSelectProps) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserData, setSelectedUserData] = useState<User | null>(null);

  // İstifadəçiləri yükləmə
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return; // Popover açıq deyilsə, istifadəçiləri yükləməyə ehtiyac yoxdur
      
      setLoading(true);
      setError(null);
      
      try {
        console.log('İstifadəçilər sorğulanır...');
        let query = supabase.from('profiles').select('id, full_name, email');
        
        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.limit(20);
        
        if (error) {
          console.error('İstifadəçiləri yükləyərkən xəta:', error);
          throw new Error(error.message || 'İstifadəçiləri yükləyərkən xəta baş verdi');
        }
        
        if (!data || !Array.isArray(data)) {
          console.log('API cavabı düzgün formatda deyil:', data);
          setUsers([]);
          return;
        }
        
        console.log(`${data.length} istifadəçi yükləndi`);
        setUsers(data as User[]);
      } catch (err) {
        console.error('İstifadəçiləri yükləyərkən istisna:', err);
        setError(err instanceof Error ? err.message : 'İstifadəçilər yüklənərkən xəta baş verdi');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [open, searchTerm]);

  // Seçilmiş istifadəçini yüklə (əgər varsa və users massivində yoxdursa)
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (!value || selectedUserData) return;
      
      // Əgər users massivində artıq seçilmiş istifadəçi varsa
      const existingUser = users.find(user => user.id === value);
      if (existingUser) {
        setSelectedUserData(existingUser);
        return;
      }
      
      // Əks təqdirdə, yüklə
      try {
        setLoading(true);
        console.log(`Seçilmiş istifadəçi yüklənir: ${value}`);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('id', value)
          .single();
        
        if (error) {
          console.error('Seçilmiş istifadəçini yükləyərkən xəta:', error);
          return;
        }
        
        if (!data) {
          console.log('Seçilmiş istifadəçi tapılmadı');
          return;
        }
        
        console.log('Seçilmiş istifadəçi yükləndi:', data);
        setSelectedUserData(data as User);
        
        // Users massivini də yeniləyək
        setUsers(prev => {
          if (prev.some(user => user.id === data.id)) {
            return prev;
          }
          return [...prev, data as User];
        });
      } catch (err) {
        console.error('Seçilmiş istifadəçini yükləyərkən istisna:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSelectedUser();
  }, [value, users, selectedUserData]);

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
          {loading ? (
            <Loader2 className="ml-2 h-4 w-4 shrink-0 animate-spin" />
          ) : (
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder={t('searchUser') || "İstifadəçi axtar..."} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          
          {error ? (
            <div className="flex items-center py-6 px-2 text-destructive gap-2">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <CommandEmpty>{t('noUsersFound') || 'İstifadəçi tapılmadı'}</CommandEmpty>
              <CommandGroup className="max-h-[300px] overflow-auto">
                {Array.isArray(users) && users.length > 0 ? (
                  users.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={user.id}
                      onSelect={() => handleSelect(user.id)}
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
                  <div className="text-center py-2 text-muted-foreground">
                    {t('noUsersFound') || 'İstifadəçi tapılmadı'}
                  </div>
                )}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
