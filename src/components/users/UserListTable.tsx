
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { FullUserData } from '@/types/supabase';
import { Role } from '@/context/AuthContext';

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

  if (users.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <h3 className="text-lg font-medium">{t('noUsersFound')}</h3>
        <p className="text-muted-foreground mt-2">{t('tryAnotherFilter')}</p>
      </div>
    );
  }

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return t('notAvailable');
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return t('invalidDate');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'regionadmin':
        return 'bg-blue-100 text-blue-800';
      case 'sectoradmin':
        return 'bg-green-100 text-green-800';
      case 'schooladmin':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // SuperAdmin və RegionAdmin bütün istifadəçiləri redaktə edə bilər,
  // digər adminlər yalnız özlərindən aşağı səviyyəlilərə müdaxilə edə bilər
  const canEditUser = (user: FullUserData) => {
    if (currentUserRole === 'superadmin') return true;
    if (currentUserRole === 'regionadmin' && user.role !== 'superadmin') return true;
    if (currentUserRole === 'sectoradmin' && 
        (user.role === 'schooladmin' || user.role === 'schoolteacher')) return true;
    return false;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('fullName')}</TableHead>
            <TableHead>{t('email')}</TableHead>
            <TableHead>{t('role')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('lastLogin')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.full_name} />
                    <AvatarFallback className="text-xs">
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="font-medium">{user.full_name}</div>
                </div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant="outline" className={getRoleBadgeStyle(user.role)}>
                  {t(user.role)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={getStatusBadgeStyle(user.status)}>
                  {t(user.status)}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(user.last_login)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">{t('openMenu')}</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewDetails(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>{t('viewDetails')}</span>
                    </DropdownMenuItem>
                    {canEditUser(user) && (
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        <span>{t('edit')}</span>
                      </DropdownMenuItem>
                    )}
                    {canEditUser(user) && (
                      <DropdownMenuItem 
                        onClick={() => onDelete(user)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>{t('delete')}</span>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserListTable;
