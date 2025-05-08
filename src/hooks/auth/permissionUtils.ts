
import { UserRole } from '@/types/supabase';

export const hasPermission = (userRole: UserRole | undefined | null, requiredRoles: UserRole[]): boolean => {
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
};

export const canViewUsers = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canManageUsers = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin'].includes(role);
};

export const canViewRegions = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin'].includes(role);
};

export const canManageRegions = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return role === 'superadmin';
};

export const canViewSectors = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canManageSectors = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin'].includes(role);
};

export const canViewSchools = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin'].includes(role);
};

export const canManageSchools = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canViewCategories = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canManageCategories = (role: UserRole | undefined | null): boolean => {
  if (!role) return false;
  return role === 'superadmin';
};
