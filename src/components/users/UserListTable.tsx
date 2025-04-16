
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FullUserData } from '@/types/supabase';
import { Role } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface UserListTableProps {
  users: FullUserData[];
  onEdit: (user: FullUserData) => void;
  onDelete: (user: FullUserData) => void;
  onViewDetails: (user: FullUserData) => void;
  currentUserRole?: Role;
  renderRow?: (user: any) => React.ReactElement;
}

const UserListTable: React.FC<UserListTableProps> = ({
  users,
  onEdit,
  onDelete,
  onViewDetails,
  currentUserRole,
  renderRow
}) => {
  const { t } = useLanguage();
  
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'regionadmin': return 'purple';
      case 'sectoradmin': return 'yellow';
      case 'schooladmin': return 'green';
      default: return 'outline';
    }
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'secondary';
      case 'blocked': return 'destructive';
      default: return 'outline';
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('noUsersFound')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('name')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => {
            // İstifadəçi öz təqdim etdiyi renderRow funksiyasını istifadə edərsə
            if (renderRow) {
              return renderRow(user);
            }
            
            // Standart sətir renderləmə
            return (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>{t(user.role)}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(user.status)}>{t(user.status)}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onViewDetails(user)}
                      title={t('viewDetails')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onEdit(user)}
                      title={t('edit')}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => onDelete(user)}
                      title={t('delete')}
                      className="text-destructive hover:text-destructive/90"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserListTable;
