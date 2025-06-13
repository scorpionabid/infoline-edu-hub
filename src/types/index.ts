// ============================================================================
// İnfoLine Main Types Export - Central Index
// ============================================================================
// Bu fayl bütün type exports-ları mərkəzləşdirir və import path-ların 
// standartlaşdırılmasını təmin edir

// Auth Types (Əsas)
export * from './auth';

// Core Business Types  
export * from './category';
export * from './column'; 
export * from './dataEntry';
export * from './school';
export * from './sector';
export * from './region';

// Database and Supabase Types
export * from './supabase';
export * from './database.d';

// Form and UI Types
export * from './form';
export * from './notification';
// Report ilə bağlı tiplər artıq core/report-dan export olunur
export * from './core/report';

// Utility Types
export * from './permissions';
export * from './api';
export * from './excel';
export * from './file';
export * from './link';

// Backward Compatibility Aliases
export type { UserRole as Role } from './auth';
export type { FullUserData as UserData } from './auth';
export type { Category } from './category';
export type { Column } from './column';
export type { School } from './school';
export type { Sector } from './sector';
export type { Region } from './region';

// ============================================================================
// Deprecated Exports (Keçid dövründə uyğunluq üçün)
// Bu exports-lar yeni fayllardan yönləndirilir və tədricən silinəcək
// ============================================================================

// DEPRECATED: Use './auth' instead
export type { UserRole as UserRoleOld } from './auth';

// DEPRECATED: Use './auth' instead  
export type { FullUserData as FullUserDataOld } from './auth';
