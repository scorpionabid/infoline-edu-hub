
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface ExistingUserAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: EnhancedRegion | null;
  onSuccess: () => void;
}

export const ExistingUserAdminDialog: React.FC<ExistingUserAdminDialogProps> = ({
  open,
  setOpen,
  region,
  onSuccess
}) => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigningUser, setAssigningUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (error) throw error;

      // İstifadəçi rollarını əldə edək
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Rolları və profil məlumatlarını birləşdirək
      const usersWithRoles = data.map(user => {
        const userRole = userRoles?.find(role => role.user_id === user.id);
        return {
          ...user,
          role: userRole?.role || 'user'
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('İstifadəçilər yüklənərkən xəta:', error);
      toast.error(t('errorLoadingUsers'));
    } finally {
      setLoading(false);
    }
  };

  const assignAdmin = async (userId: string) => {
    if (!region) {
      toast.error(t('regionNotFound'));
      return;
    }

    try {
      setAssigningUser(userId);
      
      // Assign region admin funksiyasını çağırırıq
      const { data, error } = await supabase.rpc('assign_region_admin', {
        user_id_param: userId,
        region_id_param: region.id
      });
      
      if (error) throw error;
      
      const result = data as { success: boolean; error?: string };
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }
      
      toast.success(t('adminAssigned'));
      setOpen(false);
      onSuccess();
      
    } catch (error: any) {
      console.error('Admin təyin edilərkən xəta:', error);
      toast.error(error.message || t('errorAssigningAdmin'));
    } finally {
      setAssigningUser(null);
    }
  };

  // İstifadəçiləri axtarış və mövcud rola görə filter edək
  const filteredUsers = users.filter(user => 
    (user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     user.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
    // SuperAdmin roluna sahib istifadəçiləri göstərməməliyik
    user.role !== 'superadmin'
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>
            {t('assignExistingUserAsAdmin')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder={t('searchUsers')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('currentRole')}</TableHead>
                    <TableHead className="text-right">{t('action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.full_name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{t(user.role || 'user')}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => assignAdmin(user.id)}
                            disabled={assigningUser === user.id}
                          >
                            {assigningUser === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            {t('assign')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        {t('noUsersFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            {t('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExistingUserAdminDialog;
