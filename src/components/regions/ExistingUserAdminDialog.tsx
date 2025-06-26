import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import { EnhancedRegion } from '@/types/region';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface ExistingUserAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: EnhancedRegion;
  onSuccess?: () => void;
}

export function ExistingUserAdminDialog({
  open,
  setOpen,
  region,
  onSuccess,
}: ExistingUserAdminDialogProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Search users function
  const searchUsers = async (term: string) => {
    if (!term || term.length < 3) {
      setUsers([]);
      return;
    }

    setSearching(true);
    try {
      // Bu hissədə gerçək API çağırışı olacaq
      // Müvəqqəti olaraq bir neçə nümunə istifadəçi qaytarırıq
      const mockUsers = [
        { id: '1', email: 'admin@example.com', full_name: 'Admin User' },
        { id: '2', email: 'user@example.com', full_name: 'Regular User' },
        { id: '3', email: term + '@example.com', full_name: 'Search User' },
      ];
      
      // API çağırışını simulyasiya etmək üçün kiçik bir gecikmə əlavə edirik
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(mockUsers.filter(user => 
        user.email.toLowerCase().includes(term.toLowerCase()) || 
        (user.full_name && user.full_name.toLowerCase().includes(term.toLowerCase()))
      ));
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: t('error'),
        description: t('users.searchError'),
        variant: 'destructive',
      });
    } finally {
      setSearching(false);
    }
  };

  // Assign admin function
  const assignAdmin = async () => {
    if (!selectedUser) return;

    setAssigning(true);
    try {
      // Bu hissədə API çağırışı olacaq
      console.log(`Assigning user ${selectedUser.id} as admin to region ${region.id}`);
      
      // API çağırışını simulyasiya etmək üçün kiçik bir gecikmə
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: t('success'),
        description: t('regions.adminAssignSuccess', { 
          name: selectedUser.full_name || selectedUser.email,
          region: region.name
        }),
      });
      
      if (onSuccess) {
        onSuccess();
      }
      setOpen(false);
    } catch (error) {
      console.error('Error assigning admin:', error);
      toast({
        title: t('error'),
        description: t('regions.adminAssignError'),
        variant: 'destructive',
      });
    } finally {
      setAssigning(false);
    }
  };

  // Handle search term change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader>
        <DialogTitle>{t('regions.assignAdmin')}</DialogTitle>
        <DialogDescription>
          {t('regions.assignAdminDescription', { region: region.name })}
        </DialogDescription>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-user">{t('users.searchUser')}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-user"
                placeholder={t('users.searchUserPlaceholder')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searching && (
              <div className="flex justify-center mt-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>

          {users.length > 0 && (
            <div className="border rounded-md">
              <div className="py-1">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className={`px-2 py-1.5 cursor-pointer hover:bg-accent ${
                      selectedUser?.id === user.id ? 'bg-accent' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchTerm.length > 0 && !searching && users.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {t('users.noUsersFound')}
            </p>
          )}

          {selectedUser && (
            <div className="mt-4 p-3 border rounded-md bg-accent/50">
              <p className="font-medium">{t('users.selectedUser')}</p>
              <p className="text-sm font-medium">{selectedUser.full_name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedUser.email}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => setOpen(false)}
          disabled={assigning}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={assignAdmin}
          disabled={!selectedUser || assigning}
        >
          {assigning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('common.processing')}
            </>
          ) : (
            t('regions.assignAdmin')
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
