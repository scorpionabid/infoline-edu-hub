import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { assignExistingUserAsSectorAdmin } from '@/services/sectorService';

const ExistingUserSectorAdminDialog = ({ isOpen, onClose, sectorId, sectorName, onSuccess }) => {
  const { t } = useLanguage();
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/getUsers');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data);
      } catch (e) {
        setError(t('errorFetchingUsers') || 'İstifadəçiləri əldə edərkən xəta baş verdi');
        toast.error(t('errorFetchingUsers') || 'İstifadəçiləri əldə edərkən xəta baş verdi');
      }
    };

    if (isOpen) {
      fetchUsers();
      setUserId('');
      setError('');
    }
  }, [isOpen, t]);

  const handleSubmit = async () => {
    if (!userId) {
      setError(t('selectUser') || 'Zəhmət olmasa istifadəçi seçin');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await assignExistingUserAsSectorAdmin(userId, sectorId);

      if (result.success) {
        toast.success(t('adminAssignedSuccessfully') || 'Admin uğurla təyin edildi');
        onSuccess();
        onClose();
      } else {
        setError(result.error || t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta baş verdi');
        toast.error(result.error || t('errorAssigningAdmin') || 'Admin təyin edilərkən xəta baş verdi');
      }
    } catch (e: any) {
      setError(e.message || t('unknownError') || 'Bilinməyən xəta');
      toast.error(e.message || t('unknownError') || 'Bilinməyən xəta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="userId" className="text-right">
            {t('selectUser') || 'İstifadəçi seçin'}
          </Label>
          <Select onValueChange={setUserId} defaultValue={userId} >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder={t('selectUser')} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t('cancel') || 'Ləğv et'}
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={loading}>
          {loading ? t('assigning') || 'Təyin edilir...' : t('assign') || 'Təyin et'}
        </Button>
      </div>
    </div>
  );
};

export default ExistingUserSectorAdminDialog;
