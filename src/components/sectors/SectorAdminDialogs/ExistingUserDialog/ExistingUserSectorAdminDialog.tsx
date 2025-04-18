
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUsers } from '@/hooks/users/useUsers';
import { FullUserData } from '@/types/supabase';
import { User } from '@/types/user';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { assignExistingUserAsSectorAdmin } from '@/services/sectorService';

interface ExistingUserSectorAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sectorId: string;
  sectorName: string;
  onSuccess: () => void;
}

const ExistingUserSectorAdminDialog: React.FC<ExistingUserSectorAdminDialogProps> = ({
  isOpen,
  onClose,
  sectorId,
  sectorName,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [availableUsers, setAvailableUsers] = useState<FullUserData[]>([]);
  
  const { users, loading, fetchUsers } = useUsers();
  
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen, fetchUsers]);
  
  useEffect(() => {
    // Mövcud istifadəçilər
    const availableUsers = users.filter(user => 
      !user.role || 
      (user.role !== 'sectoradmin' && user.role !== 'superadmin' && user.role !== 'regionadmin')
    );
    
    setAvailableUsers(availableUsers as unknown as FullUserData[]);
    
    // Axtarış sorğusuna görə filtrlənmiş istifadəçilər
    if (searchQuery) {
      const filtered = availableUsers.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [users, searchQuery]);
  
  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error(t('pleaseSelectUser'));
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await assignExistingUserAsSectorAdmin(selectedUserId, sectorId);
      
      if (result.success) {
        toast.success(t('sectorAdminAssigned'));
        onSuccess();
        onClose();
      } else {
        throw new Error(result.error || t('unknownError'));
      }
    } catch (err: any) {
      console.error('Error assigning sector admin:', err);
      setError(err);
      toast.error(err.message || t('errorAssigningSectorAdmin'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('assignExistingUserAsSectorAdmin')}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('sector')}</Label>
            <div className="p-2 border rounded bg-muted/50">{sectorName}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="searchQuery">{t('searchUsers')}</Label>
            <Input 
              id="searchQuery"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchByNameOrEmail')}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="selectedUser">{t('selectUser')}</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
              disabled={loading || filteredUsers.length === 0}
            >
              <SelectTrigger id="selectedUser">
                <SelectValue placeholder={t('selectUser')} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    {loading ? t('loading') : t('noUsersFound')}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {error && (
            <div className="bg-destructive/10 p-3 rounded text-destructive text-sm">
              {error.message}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedUserId || isSubmitting}>
            {isSubmitting ? t('assigning') : t('assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingUserSectorAdminDialog;
