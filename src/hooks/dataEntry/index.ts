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
✅ Removed redundant hooks: useDataUpdates, useQuickWins, useIndexedData
✅ Organized by role-based folders: school/, sector/, common/
✅ Moved shared hooks to common/ folder for better organization
✅ Maintained backward compatibility through re-exports
✅ Improved maintainability with clear separation of concerns

STRUCTURE:
├── common/          → Shared hooks across all roles
├── school/          → School admin specific hooks
├── sector/          → Sector admin specific hooks  
├── types/           → TypeScript definitions
└── core hooks       → Main data entry functionality
*/
