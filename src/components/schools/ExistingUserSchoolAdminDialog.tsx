import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from "@/components/ui/use-toast";
import { useAvailableUsers } from '@/hooks/useAvailableUsers';
import { User } from '@/types/user';
import { School } from '@/types/school';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ExistingUserSchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (user: User) => Promise<void>;
  school: School | null;
}

const ExistingUserSchoolAdminDialog: React.FC<ExistingUserSchoolAdminDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  school,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { users, loading: usersLoading, fetchUsers } = useAvailableUsers();

  useEffect(() => {
    if (isOpen) {
      fetchUsers({ role: 'schooladmin' });
    }
  }, [isOpen, fetchUsers]);

  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAssign = async () => {
    if (!selectedUser || !school) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('assign_school_admin', {
        user_id_param: selectedUser.id,
        school_id_param: school.id,
        region_id_param: school.region_id,
        sector_id_param: school.sector_id
      });

      if (error) throw error;

      // Type assertion for the response
      const result = data as { success: boolean; error?: string };
      
      if (result && typeof result === 'object' && 'success' in result) {
        if (result.success) {
          toast.success(t('schoolAdminAssigned'));
          await onAssign(selectedUser);
          onClose();
        } else {
          const errorMessage = 'error' in result ? result.error : 'Unknown error';
          throw new Error(errorMessage || 'Assignment failed');
        }
      } else {
        // If data is successful but not in expected format
        toast.success(t('schoolAdminAssigned'));
        await onAssign(selectedUser);
        onClose();
      }
    } catch (error: any) {
      console.error('Error assigning school admin:', error);
      toast.error(error.message || t('errorAssigningAdmin'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignExistingAdmin')}</DialogTitle>
          <DialogDescription>
            {t('searchAndAssignAdmin')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="search">{t('searchUser')}</Label>
            <Input
              id="search"
              value={searchTerm}
              onChange={handleSearch}
              className="col-span-3"
            />
          </div>
          <div className="max-h-40 overflow-y-auto">
            {usersLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('noUsersFound')}</p>
            ) : (
              <ul className="space-y-2">
                {filteredUsers.map(user => (
                  <li
                    key={user.id}
                    className={`p-2 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground ${selectedUser?.id === user.id ? 'bg-accent text-accent-foreground' : ''}`}
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.full_name} ({user.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button type="button" onClick={handleAssign} disabled={!selectedUser || isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('assigning')}
              </>
            ) : (
              t('assignAdmin')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingUserSchoolAdminDialog;
