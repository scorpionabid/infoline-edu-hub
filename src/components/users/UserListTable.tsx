
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Eye } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { Role } from '@/context/AuthContext';
import { FullUserData } from '@/types/supabase';
import { format } from 'date-fns';

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
  
  // Tarixin formatlanması üçün köməkçi funksiya
  const formatDate = (dateStr: string) => {
    try {
      if (!dateStr) return t('notAvailable');
      return format(new Date(dateStr), 'dd.MM.yyyy HH:mm');
    } catch (error) {
      return t('invalidDate');
    }
  };
  
  // Rol üçün badge üslubunu təyin edən funksiya
  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'regionadmin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'sectoradmin':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'schooladmin':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Status üçün badge üslubunu təyin edən funksiya
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Entity adını göstərən funksiya
  const getEntityName = (user: FullUserData) => {
    if (!user.adminEntity) return t('notAvailable');
    
    return user.adminEntity.name || t('notAvailable');
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">{t('fullName')}</TableHead>
            <TableHead className="font-medium">{t('email')}</TableHead>
            <TableHead className="font-medium">{t('role')}</TableHead>
            <TableHead className="font-medium">{t('adminEntity')}</TableHead>
            <TableHead className="font-medium">{t('status')}</TableHead>
            <TableHead className="font-medium">{t('createdAt')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {t('noUsersFound')}
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeStyle(user.role)}>
                    {t(user.role)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.adminEntity ? (
                    <span className="flex items-center gap-1">
                      {getEntityName(user)}
                    </span>
                  ) : (
                    t('notAvailable')
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeStyle(user.status)}>
                    {t(user.status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.created_at)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetails(user)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">{t('viewDetails')}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">{t('edit')}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user)}
                      className="text-destructive hover:text-destructive/90"
                      disabled={currentUserRole === user.role || user.id === 'current-user-id'}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">{t('delete')}</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserListTable;
