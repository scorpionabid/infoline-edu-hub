
import { UserRole } from '@/types/supabase';

// Basic permission checks for different resources
// These can be expanded as needed with more specific logic

export const canViewUsers = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canManageUsers = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin'].includes(role);
};

export const canViewRegions = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin'].includes(role);
};

export const canManageRegions = (role: UserRole | null): boolean => {
  return !!role && ['superadmin'].includes(role);
};

export const canViewSectors = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canManageSectors = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin'].includes(role);
};

export const canViewSchools = (role: UserRole | null): boolean => {
  return !!role;
};

export const canManageSchools = (role: UserRole | null): boolean => {
  return !!role && ['superadmin', 'regionadmin', 'sectoradmin'].includes(role);
};

export const canViewCategories = (role: UserRole | null): boolean => {
  return !!role;
};

export const canManageCategories = (role: UserRole | null): boolean => {
  return !!role && ['superadmin'].includes(role);
};
