
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, UserPlus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AssignAdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (userId: string) => void;
  entityType: 'school' | 'sector' | 'region';
  entityName: string;
}

export const AssignAdminDialog: React.FC<AssignAdminDialogProps> = ({
  isOpen,
  onClose,
  onAssign,
  entityType,
  entityName
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name');

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('İstifadəçiləri yükləyərkən xəta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error('Zəhmət olmasa istifadəçi seçin');
      return;
    }

    setSubmitting(true);
    try {
      await onAssign(selectedUserId);
      onClose();
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      toast.error('Admin təyin etmə xətası: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUserId('');
    setSearchTerm('');
    onClose();
  };

  const getEntityTypeName = () => {
    switch (entityType) {
      case 'school': 
        return 'məktəb';
      case 'sector': 
        return 'sektor';
      case 'region': 
        return 'region';
      default: 
        return 'entity';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Admin təyin et
          </DialogTitle>
          <DialogDescription>
            <strong>"{entityName}"</strong> {getEntityTypeName()}, una admin təyin edin
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">İstifadəçi axtarışı</Label>
            <Input
              id="search"
              placeholder="Email və ya ad ilə axtarın..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">İstifadəçi seçin</Label>
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2">Yüklənir...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="İstifadəçi seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      {searchTerm ? 'Heç bir nəticə tapılmadı' : 'İstifadəçi yoxdur'}
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {user.full_name || 'Ad məlum deyil'}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {user.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Ləğv et
          </Button>
          <Button onClick={handleAssign} disabled={!selectedUserId || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Təyin edilir...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Təyin et
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
