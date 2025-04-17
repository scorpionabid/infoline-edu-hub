
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { School } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2, Search, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useUsers } from '@/hooks/useUsers';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SchoolAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  school: School | null;
  onSubmit: (schoolId: string, userId: string) => Promise<void>;
  isSubmitting?: boolean;
}

const SchoolAdminDialog: React.FC<SchoolAdminDialogProps> = ({
  isOpen,
  onClose,
  school,
  onSubmit,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  // İstifadəçiləri yükləyək
  const { users, loading } = useUsers();
  const [filteredUsers, setFilteredUsers] = useState(users);

  // Axtarış dəyişdikdə istifadəçiləri filtrlə
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  // Dialog açıldıqda və ya məktəb dəyişdikdə seçimi sıfırla
  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(null);
      setSearchTerm('');
    }
  }, [isOpen, school]);

  const handleSubmit = async () => {
    if (!school || !selectedUserId) return;
    await onSubmit(school.id, selectedUserId);
  };

  if (!school) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('assignSchoolAdmin')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center border rounded-md px-3 py-2">
            <Search className="h-4 w-4 mr-2 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers')}
              className="border-0 p-0 shadow-none focus-visible:ring-0 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="border rounded-md p-1">
            <ScrollArea className="h-[250px]">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mb-2" />
                  <p>{t('noUsersFound')}</p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 cursor-pointer rounded-md flex items-center ${
                        selectedUserId === user.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name || user.email}</p>
                        {user.full_name && <p className="text-sm text-muted-foreground">{user.email}</p>}
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                      {user.id === school.admin_id && (
                        <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-1">
                          {t('currentAdmin')}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!selectedUserId || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('processing')}
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

export default SchoolAdminDialog;
