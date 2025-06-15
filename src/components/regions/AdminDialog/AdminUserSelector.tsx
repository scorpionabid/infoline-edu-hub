import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/auth';

interface AdminUserSelectorProps {
  entityId: string | undefined;
  entityType: 'region' | 'sector' | 'school';
  selectedAdminId: string | null;
  onChange: (userId: string | null) => void;
}

const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  entityId,
  entityType,
  selectedAdminId,
  onChange
}) => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<FullUserData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!entityId) return;

      setLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('*')
          .eq('role', `${entityType.replace('region', 'regionadmin').replace('sector', 'sectoradmin').replace('school', 'schooladmin')}`);

        if (entityType === 'region') {
          query = query.eq('region_id', entityId);
        } else if (entityType === 'sector') {
          query = query.eq('sector_id', entityId);
        } else if (entityType === 'school') {
          query = query.eq('school_id', entityId);
        }

        const { data, error } = await query.order('full_name');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data as FullUserData[]);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [entityId, entityType]);

  return (
    <div>
      <Label htmlFor="admin">{t('admin')}</Label>
      <Select
        value={selectedAdminId || 'select-admin'}
        onValueChange={(value) => onChange(value === 'select-admin' ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder={t('selectAdmin')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="select-admin">{t('selectAdmin')}</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {loading && (
        <div className="mt-2 flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('loadingUsers')}
        </div>
      )}
    </div>
  );
};

export default AdminUserSelector;
