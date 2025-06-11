// ============================================================================
// İnfoLine Auth Context - DEPRECATED VERSION
// ============================================================================
// Bu fayl artıq istifadə olunmur.
// Zustand Auth Store istifadə edilir: /hooks/auth/stores/authStore.ts
// 
// DEPRECATED: Do not use this file anymore
// USE: useAuthStore from @/hooks/auth/useAuthStore instead

console.warn('WARNING: AuthContext is deprecated. Use useAuthStore instead.');

// Empty implementation to prevent breaking changes
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const useAuth = () => {
  throw new Error('useAuth from AuthContext is deprecated. Use useAuthStore instead.');
};
