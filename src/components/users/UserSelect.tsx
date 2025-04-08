
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let query = supabase.from('profiles').select('id, full_name, email');
        
        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
        }
        
        const { data, error } = await query.limit(10);
        
        if (error) throw error;
        setUsers(data as User[]);
      } catch (error) {
        console.error('İstifadəçiləri yükləyərkən xəta:', error);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [open, searchTerm]);

  // Seçilmiş istifadəçinin adını tapmaq üçün
  const selectedUser = users.find(user => user.id === value);
  const displayText = selectedUser 
    ? `${selectedUser.full_name} (${selectedUser.email})`
    : value 
      ? 'Yüklənir...' 
      : placeholder || 'İstifadəçi seçin';

  // Seçilmiş istifadəçi gözlənilmirsə, yüklə
  useEffect(() => {
    const loadSelectedUser = async () => {
      if (value && !selectedUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('id', value)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setUsers(prev => {
              // Əgər istifadəçi artıq siyahıda varsa, dublikat əlavə etmə
              if (prev.some(user => user.id === data.id)) {
                return prev;
              }
              return [...prev, data as User];
            });
          }
        } catch (error) {
          console.error('Seçilmiş istifadəçini yükləyərkən xəta:', error);
        }
      }
    };

    loadSelectedUser();
  }, [value, selectedUser]);

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
            placeholder="İstifadəçi axtar..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <CommandEmpty>İstifadəçi tapılmadı</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onChange(user.id === value ? '' : user.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{user.full_name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
