import React, { useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, UserCheck, UserX, Eye } from "lucide-react";
import { FullUserData } from '@/types/supabase';
import { useLanguage } from '@/context/LanguageContext';

interface UserListTableProps {
  users: FullUserData[];
  loading?: boolean;
  onEditUser?: (user: FullUserData) => void;
  onDeleteUser?: (user: FullUserData) => void;
  onViewUser?: (user: FullUserData) => void;
  onActivateUser?: (user: FullUserData) => void;
  onDeactivateUser?: (user: FullUserData) => void;
}

export default function UserListTable({
  users,
  loading = false,
  onEditUser,
  onDeleteUser,
  onViewUser,
  onActivateUser,
  onDeactivateUser
}: UserListTableProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-4 py-2 text-left">{t('name') || 'Ad'}</th>
            <th className="border border-gray-200 px-4 py-2 text-left">{t('role') || 'Rol'}</th>
            <th className="border border-gray-200 px-4 py-2 text-left">{t('email') || 'E-poçt'}</th>
            <th className="border border-gray-200 px-4 py-2 text-left">{t('status') || 'Status'}</th>
            <th className="border border-gray-200 px-4 py-2 text-center">{t('actions') || 'Əməliyyatlar'}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="border border-gray-200 px-4 py-2">
                <div>
                  <div className="font-medium">{user.full_name || user.name}</div>
                  {user.position && (
                    <div className="text-sm text-gray-500">{user.position}</div>
                  )}
                </div>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Badge variant="outline">
                  {user.role}
                </Badge>
              </td>
              <td className="border border-gray-200 px-4 py-2">
                {user.email}
              </td>
              <td className="border border-gray-200 px-4 py-2">
                <Badge
                  variant={
                    user.deletedAt 
                      ? "destructive" 
                      : user.status === "active" 
                      ? "success" 
                      : "destructive"
                  }
                >
                  {user.deletedAt 
                    ? t("deleted") || "Silinib"
                    : user.status === "active" 
                    ? t("active") 
                    : t("inactive")
                  }
                </Badge>
              </td>
              <td className="border border-gray-200 px-4 py-2 text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      disabled={user.deletedAt !== null}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onViewUser && (
                      <DropdownMenuItem onClick={() => onViewUser(user)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('view') || 'Bax'}
                      </DropdownMenuItem>
                    )}
                    
                    {onEditUser && (
                      <DropdownMenuItem 
                        onClick={() => onEditUser(user)}
                        disabled={user.deletedAt !== null}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        {t('edit') || 'Redaktə et'}
                      </DropdownMenuItem>
                    )}
                    
                    {user.status === "active" && onDeactivateUser && (
                      <DropdownMenuItem 
                        onClick={() => onDeactivateUser(user)}
                        disabled={user.deletedAt !== null}
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        {t('deactivate') || 'Deaktiv et'}
                      </DropdownMenuItem>
                    )}
                    
                    {user.status !== "active" && onActivateUser && (
                      <DropdownMenuItem 
                        onClick={() => onActivateUser(user)}
                        disabled={user.deletedAt !== null}
                      >
                        <UserCheck className="mr-2 h-4 w-4" />
                        {t('activate') || 'Aktiv et'}
                      </DropdownMenuItem>
                    )}
                    
                    {onDeleteUser && (
                      <DropdownMenuItem 
                        onClick={() => {
                          if (user.deletedAt) {
                            // Hard delete - permanent removal
                            onDeleteUser(user);
                          } else {
                            // Soft delete - mark as deleted
                            onDeleteUser(user);
                          }
                        }}
                        className="text-red-600"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        {user.deletedAt 
                          ? (t('deleteForever') || 'Həmişəlik sil')
                          : (t('delete') || 'Sil')
                        }
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {users.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {t('noUsersFound') || 'İstifadəçi tapılmadı'}
        </div>
      )}
    </div>
  );
}