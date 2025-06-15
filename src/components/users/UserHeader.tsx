
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserRole, UserStatus } from '@/types/user';

interface UserHeaderProps {
  entityTypes: string[];
  onUserAddedOrEdited: () => void;
}

const UserHeader: React.FC<UserHeaderProps> = ({ entityTypes, onUserAddedOrEdited }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>('active');

  const handleRoleChange = (role: string) => {
    // Validate role before setting
    const validRoles: UserRole[] = ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'user'];
    if (validRoles.includes(role as UserRole)) {
      setSelectedRole(role as UserRole);
    }
  };

  const handleStatusChange = (status: string) => {
    // Validate status before setting
    const validStatuses: UserStatus[] = ['active', 'inactive'];
    if (validStatuses.includes(status as UserStatus)) {
      setSelectedStatus(status as UserStatus);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">İstifadəçilər</h1>
        <p className="text-gray-600">Sistem istifadəçilərini idarə edin</p>
      </div>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Yeni İstifadəçi
      </Button>
    </div>
  );
};

export default UserHeader;
