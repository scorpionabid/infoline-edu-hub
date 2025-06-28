// ============================================================================
// İnfoLine Auth System - useAuthStore Legacy Adapter File
// ============================================================================
// Bu fayl köhnə istifadələri dəstəkləmək üçündür
// Bütün real auth implementasiyası artıq './authStore.ts' və digər modular fayllardadır

// Tip idxalları - tipli bir interface təmin etmək üçün
import type { AuthState, UserRole, FullUserData } from '@/types/auth'; // Updated to unified types

// Yeni modular auth store və selektorları idxal edirik
import { useAuthStore } from './authStore';

// Bütün selektorları idxal edirik
import {
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectSession,
  selectUserRole,
  selectRegionId,
  selectSectorId,
  selectSchoolId,
  selectUpdateProfile,
  selectUpdatePassword,
  selectHasPermission,
  selectSignOut,
  shouldAuthenticate,
  isProtectedRoute
} from './authStore';

// getRedirectPath funksiyası - yeni modular strukturda mövcud olmadığı üçün burada təmin edirik
// Bu köhnə kodla uyğunluq üçün lazımdır
export function getRedirectPath(userRole: string | null): string {
  if (!userRole) return '/dashboard';
  switch (userRole.toLowerCase()) {
    case 'superadmin': 
      return '/dashboard';
    case 'admin': 
      return '/dashboard';
    case 'regionadmin': 
      return '/dashboard';
    case 'sectoradmin': 
      return '/dashboard';
    case 'schooladmin': 
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

// Bütün önəmli ixraclar - bu, köhnə 'örtük' və 'qarışıq'
// 'import-from-relative' xətalarından uzaqlaşır
// Hər şey birbaşa ixrac edilir, tipli olmaqla
export {
  // Store
  useAuthStore,
  
  // State selectors
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  selectSession,
  selectUserRole,
  selectRegionId,
  selectSectorId,
  selectSchoolId,
  selectUpdateProfile,
  selectUpdatePassword,
  selectHasPermission,
  selectSignOut,
  
  // Route helpers
  shouldAuthenticate,
  isProtectedRoute,
  
  // Types for compatibility - using proper TypeScript syntax for re-exporting types
  type AuthState,
  type UserRole,
  type FullUserData
};
