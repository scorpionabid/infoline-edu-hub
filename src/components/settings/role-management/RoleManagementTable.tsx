import React, { useState, useEffect } from "react";
import { useTranslation } from "@/contexts/TranslationContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  UserPlus, 
  Search,
  Filter,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import type { FullUserData, UserRole } from "@/types/auth";

interface UserWithRole extends FullUserData {
  entity_name?: string;
}

export const RoleManagementTable = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const roles: { value: UserRole; label: string }[] = [
    { value: 'superadmin', label: 'SuperAdmin' },
    { value: 'regionadmin', label: 'Region Admin' },
    { value: 'sectoradmin', label: 'Sektor Admin' },
    { value: 'schooladmin', label: 'Məktəb Admin' },
    { value: 'teacher', label: 'Müəllim' },
    { value: 'user', label: 'İstifadəçi' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_filtered_users', {
        p_role: roleFilter === 'all' ? null : [roleFilter],
        p_search: searchTerm || null,
        p_page: 1,
        p_limit: 100
      });

      if (error) throw error;

      const users = data?.map((row: any) => row.user_json) || [];
      setUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('errorFetchingUsers') || 'İstifadəçiləri yükləməkdə xəta baş verdi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, roleFilter]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Update user role in user_roles table
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success(t('roleUpdated') || 'Rol uğurla yeniləndi');
      fetchUsers();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(t('errorUpdatingRole') || 'Rolu yeniləməkdə xəta baş verdi');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'superadmin': return 'destructive';
      case 'regionadmin': return 'default';
      case 'sectoradmin': return 'secondary';
      case 'schooladmin': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleObj = roles.find(r => r.value === role);
    return roleObj?.label || role;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          {t('loading') || 'Yüklənir...'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('userRoles') || 'İstifadəçi Rolları'}</span>
          <Button 
            onClick={fetchUsers}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t('refresh') || 'Yenilə'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">{t('search') || 'Axtarış'}</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder={t('searchUsers') || 'İstifadəçi axtarın...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <Label htmlFor="role-filter">{t('filterByRole') || 'Rola görə filtr'}</Label>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allRoles') || 'Bütün rollar'}</SelectItem>
                {roles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Users Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('user') || 'İstifadəçi'}</TableHead>
                <TableHead>{t('email') || 'Email'}</TableHead>
                <TableHead>{t('role') || 'Rol'}</TableHead>
                <TableHead>{t('entity') || 'Entity'}</TableHead>
                <TableHead>{t('status') || 'Status'}</TableHead>
                <TableHead className="w-[50px]">{t('actions') || 'Əməliyyatlar'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    {t('noUsersFound') || 'İstifadəçi tapılmadı'}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.position}</div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{user.entity_name || '-'}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                        {user.status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog 
                        open={isEditDialogOpen && selectedUser?.id === user.id} 
                        onOpenChange={(open) => {
                          setIsEditDialogOpen(open);
                          if (!open) setSelectedUser(null);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{t('editUserRole') || 'İstifadəçi Rolunu Redaktə Et'}</DialogTitle>
                            <DialogDescription>
                              {user.full_name} üçün yeni rol seçin
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>{t('currentRole') || 'Cari rol'}</Label>
                              <div className="mt-1">
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {getRoleDisplayName(user.role)}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label>{t('newRole') || 'Yeni rol'}</Label>
                              <Select 
                                defaultValue={user.role}
                                onValueChange={(value: UserRole) => {
                                  if (selectedUser) {
                                    setSelectedUser({ ...selectedUser, role: value });
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsEditDialogOpen(false);
                                setSelectedUser(null);
                              }}
                            >
                              {t('cancel') || 'Ləğv et'}
                            </Button>
                            <Button
                              onClick={() => {
                                if (selectedUser) {
                                  handleRoleChange(selectedUser.id, selectedUser.role);
                                }
                              }}
                            >
                              {t('save') || 'Yadda saxla'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t('totalUsers') || 'Ümumi istifadəçi sayı'}: {users.length}
          </span>
          <span>
            {roleFilter !== 'all' && `${getRoleDisplayName(roleFilter)}: ${users.length}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};