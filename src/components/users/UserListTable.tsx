
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { Role } from '@/context/AuthContext';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PencilIcon, Trash2Icon, EyeIcon, ShieldIcon, UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/utils/formatDateUtils';

interface UserListTableProps {
  users: FullUserData[];
  onEdit: (user: FullUserData) => void;
  onDelete: (user: FullUserData) => void;
  onViewDetails: (user: FullUserData) => void;
  currentUserRole?: Role;
}

const UserListTable: React.FC<UserListTableProps> = ({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  currentUserRole
}) => {
  const { t } = useLanguage();

  // İstifadəçinin statusuna əsasən badge'in tipini təyin edir
  const getStatusBadgeVariant = (status: 'active' | 'inactive' | 'blocked') => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  // İstifadəçinin roluna əsasən ikonasını təyin edir
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <ShieldIcon className="h-4 w-4 text-destructive" />;
      case 'regionadmin':
        return <ShieldIcon className="h-4 w-4 text-blue-500" />;
      case 'sectoradmin':
        return <ShieldIcon className="h-4 w-4 text-green-500" />;
      case 'schooladmin':
        return <ShieldIcon className="h-4 w-4 text-amber-500" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // istifadəçinin edlə bilib bilməyəcəyini təyin edir
  const canEditUser = (user: FullUserData) => {
    if (currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'regionadmin' && 
        (user.role === 'regionadmin' || user.role === 'sectoradmin' || user.role === 'schooladmin')) {
      return true;
    }
    return false;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noUsersFound')}</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('adminEntity')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getRoleIcon(user.role)}
                  <span>{t(user.role)}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(user.status)}>
                  {t(user.status)}
                </Badge>
              </TableCell>
              <TableCell>
                {user.adminEntity ? (
                  <div className="text-sm">
                    <div>{user.adminEntity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {user.adminEntity.type && t(user.adminEntity.type)}
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onViewDetails(user)}
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  
                  {canEditUser(user) && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEdit(user)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onDelete(user)}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserListTable;
