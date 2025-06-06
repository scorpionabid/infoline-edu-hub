
// Essential dataEntry hooks - cleaned and optimized structure
// Refactored to organized folder structure for better maintainability

// ==============================================
// CORE HOOKS (remaining in root for main functionality)
// ==============================================
export { default as useDataEntry } from './useDataEntry';
export { default as useDataEntryManager } from './useDataEntryManager';
export { default as useRealTimeDataEntry } from './useRealTimeDataEntry';

// ==============================================
// COMMON SHARED HOOKS
// ==============================================
export * from './common';

// ==============================================
// UNIFIED HOOKS (NEW)
// ==============================================
export * from './unified';

// ==============================================
// SCHOOL ADMIN HOOKS
// ==============================================
export * from './school';

// ==============================================
// SECTOR ADMIN HOOKS  
// ==============================================
export * from './sector';

// ==============================================
// TYPE DEFINITIONS
// ==============================================
export * from './types';

/* 
REFACTORING COMPLETED:
✅ Added unified data entry management system
✅ Fixed TypeScript compatibility issues
✅ Created single source of truth for forms
✅ Maintained backward compatibility through re-exports
✅ Improved maintainability with clear separation of concerns

STRUCTURE:
├── common/          → Shared hooks across all roles
├── unified/         → NEW: Unified data entry management
├── school/          → School admin specific hooks
├── sector/          → Sector admin specific hooks  
├── types/           → TypeScript definitions
└── core hooks       → Main data entry functionality
*/
