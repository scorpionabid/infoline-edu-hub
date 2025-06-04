// Sector Admin Data Entry Hooks
// This module contains hooks specifically for SectorAdmin role

export { default as useSchoolManagement } from './useSchoolManagement';
export { default as useSchoolSelector } from './useSchoolSelector';
export { default as useSectorCategories } from './useSectorCategories';
export { useSectorDataEntry } from './useSectorDataEntry';

// Sector admin typically works with:
// - Multiple schools in their sector
// - School selection and management
// - Data approval workflow
// - Sector-level categories
// - Sector-specific data entries
