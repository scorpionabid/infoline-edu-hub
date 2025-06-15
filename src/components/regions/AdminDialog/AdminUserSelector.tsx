
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleUser {
  id: string;
  full_name: string;
  email: string;
}

interface AdminUserSelectorProps {
  entityId?: string;
  entityType: 'region' | 'sector' | 'school';
  selectedAdminId?: string | null;
  onChange: (userId: string | null) => void;
}

const AdminUserSelector: React.FC<AdminUserSelectorProps> = ({
  entityId,
  entityType,
  selectedAdminId,
  onChange
}) => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!entityId) return;

      setLoading(true);
      try {
        const roleMap: Record<string, string> = {
          region: 'regionadmin',
          sector: 'sectoradmin', 
          school: 'schooladmin'
        };

        let queryBuilder = supabase
          .from('profiles')
          .select('id, full_name, email')
          .eq('role', roleMap[entityType]);

        if (entityType === 'region') {
          queryBuilder = queryBuilder.eq('region_id', entityId);
        } else if (entityType === 'sector') {
          queryBuilder = queryBuilder.eq('sector_id', entityId);
        } else if (entityType === 'school') {
          queryBuilder = queryBuilder.eq('school_id', entityId);
        }

        const { data, error } = await queryBuilder.order('full_name');

        if (error) {
          console.error('Error fetching users:', error);
          return;
        }

        setUsers(data || []);
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
      <Label htmlFor="admin">Admin</Label>
      <Select
        value={selectedAdminId || 'select-admin'}
        onValueChange={(value) => onChange(value === 'select-admin' ? null : value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Admin seçin" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="select-admin">Admin seçin</SelectItem>
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
          İstifadəçilər yüklənir...
        </div>
      )}
    </div>
  );
};

export default AdminUserSelector;
