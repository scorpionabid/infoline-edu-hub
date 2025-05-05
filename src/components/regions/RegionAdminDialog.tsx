
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useSuperUsers } from '@/hooks/useSuperUsers';
import { toast } from 'sonner';
import { useRegionAdmins } from '@/hooks/useRegionAdmins';

export interface RegionAdminDialogProps {
  open: boolean;
  onClose: () => void;
  regionId: string;
}

export const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({ 
  open, 
  onClose, 
  regionId 
}) => {
  const { users, loading: usersLoading, error: usersError } = useSuperUsers();
  const { assignAdmin, loading, error } = useRegionAdmins();
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  
  useEffect(() => {
    if (open) {
      setSelectedUserId('');
    }
  }, [open]);
  
  const handleAssignAdmin = async () => {
    if (!selectedUserId) {
      toast.error('İstifadəçi seçilməlidir');
      return;
    }
    
    try {
      const result = await assignAdmin(selectedUserId, regionId);
      if (result && result.success) {
        toast.success('Region admini uğurla təyin edildi');
        onClose();
      } else if (result && !result.success) {
        toast.error(result.error || 'Xəta baş verdi');
      }
    } catch (err: any) {
      toast.error(err.message || 'Admin təyin edilərkən xəta baş verdi');
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Region Admini Təyin Et</DialogTitle>
          <DialogDescription>
            Regiona admin təyin etmək üçün istifadəçi seçin. Bu əməliyyat seçilən istifadəçiyə 
            regionda tam idarəetmə səlahiyyəti verəcək.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user">İstifadəçi</Label>
            {usersLoading ? (
              <div className="h-10 flex items-center">
                <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                <span className="ml-2">İstifadəçilər yüklənir...</span>
              </div>
            ) : usersError ? (
              <div className="text-red-500">İstifadəçiləri yüklərkən xəta: {usersError}</div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="İstifadəçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {users && users.length > 0 ? (
                    users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name || user.email}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-users" disabled>
                      İstifadəçi tapılmadı
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
          
          {error && (
            <div className="text-red-500 mt-2">
              Xəta: {error}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Ləğv et</Button>
          <Button 
            onClick={handleAssignAdmin} 
            disabled={!selectedUserId || loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                Gözləyin
              </div>
            ) : 'Təyin et'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegionAdminDialog;
