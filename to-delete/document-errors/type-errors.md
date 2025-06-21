
# TypeScript Type Error Resolution Guide

## Dashboard Module Type System

The dashboard module uses a comprehensive type system defined in `src/types/dashboard.d.ts`.

### Main Dashboard Data Types

- `SchoolAdminDashboardData`
- `RegionAdminDashboardData`
- `SectorAdminDashboardData`
- `SuperAdminDashboardData`

### Specialized Types

- `DashboardStatus` - Represents status counts for different states
- `DashboardFormStats` - Statistics for forms and their processing states
- `CategoryItem` - Information about a category and its completion
- `FormItem` - Form information including status
- `DeadlineItem` - Items with deadline information
- `PendingApproval` - Information about items pending approval
- `SchoolStat` - School statistics and completion rates
- `SectorStat` - Sector statistics and completion rates

### Common Resolution Patterns

1. **Missing type exports:**
   ```typescript
   // Error
   error TS2305: Module '"@/types/dashboard"' has no exported member 'CategoryItem'.
   
   // Solution
   // In dashboard.d.ts, ensure the type is explicitly exported
   export interface CategoryItem {
     id: string;
     name: string;
     // other properties
   }
   ```

2. **Optional properties access:**
   ```typescript
   // Error
   error TS2339: Property 'notifications' does not exist on type 'SchoolAdminDashboardData'.
   
   // Solution
   // 1. Add property to interface
   export interface SchoolAdminDashboardData {
     notifications?: AppNotification[];
     // other properties
   }
   
   // 2. Use optional chaining and nullish coalescing
   const notifications = data.notifications || [];
   ```

3. **Type compatibility errors:**
   ```typescript
   // Error
   Type '{ percentage: number; total: number; completed: number; }' is not assignable to type 'number'.
   
   // Solution
   // Make the type union compatible
   export interface SchoolAdminDashboardData {
     completion?: {
       percentage: number;
       total: number;
       completed: number;
     } | number | null;
   }
   ```

4. **Array type assertions and validation:**
   ```typescript
   // Error
   Type 'undefined[]' is missing properties from type...
   
   // Solution
   // Ensure proper type assertion with verification
   const categories: CategoryItem[] = Array.isArray(data.categories) 
     ? data.categories as CategoryItem[]
     : [];
   ```

### Implementation Notes

When working with dashboard data:
1. Always provide fallbacks for missing data
2. Handle both object and primitive value representations
3. Use proper type assertions when working with arrays
4. Consider using type guards for complex logic

## Component Props Resolution

Common pattern for component props errors:

1. **Missing component props interface:**
   ```typescript
   // Error
   Type '{ open: boolean; onClose: () => void; onCreate: (data: { title: string; description: string; type: string; }) => Promise<void>; }' is not assignable to type 'IntrinsicAttributes & CreateReportDialogProps'.
   
   // Solution
   // Define explicit props interface
   export interface CreateReportDialogProps {
     open: boolean;
     onClose: () => void;
     onCreate: (reportData: { title: string; description: string; type: string }) => Promise<void>;
   }
   ```

2. **Property missing in interface:**
   ```typescript
   // Error
   Property 'section' does not exist on type 'Column'.
   
   // Solution
   export interface Column {
     // existing properties
     section?: string; // Add the missing property
   }
   ```

3. **Icon type compatibility errors:**
   ```typescript
   // Error
   Type 'ForwardRefExoticComponent<...>' is not assignable to type 'LucideIcon'.
   
   // Solution
   // Use specific icon component imports instead of dynamic resolution
   import { TextIcon, AlignLeft, Hash } from 'lucide-react';
   
   // Define a mapping function that returns the correct component
   const getIconComponent = (iconName: string) => {
     switch(iconName) {
       case 'TextIcon': return TextIcon;
       case 'AlignLeft': return AlignLeft;
       case 'Hash': return Hash;
       default: return Circle;
     }
   };
   ```

## Recent Resolved Errors

| Error | Solution | Date |
|------|-------|-------|
| Module '"@/types/dashboard"' has no exported member 'CategoryItem' | Added CategoryItem export in dashboard.d.ts | 2025-05-16 |
| Property 'schoolStats' does not exist on type 'SectorAdminDashboardData' | Added schoolStats property to SectorAdminDashboardData interface | 2025-05-16 |
| Property 'section' does not exist on type 'Column' | Added section optional property to Column interface | 2025-05-16 |
| Property 'label' does not exist on type 'TabDefinition' | Added label optional property to TabDefinition interface | 2025-05-16 |
| Module '"@/hooks/common/useDebounce"' has no exported member 'useDebounce' | Created useDebounce.ts hook with proper default export | 2025-05-16 |
| Property 'field' does not exist on type 'IntrinsicAttributes & FormFieldProps' | Updated FormFields component to accept proper props structure | 2025-05-20 |
| Module '"@/types/dataEntry"' has no exported member 'DataEntryTableData' | Added DataEntryTableData interface to dataEntry.d.ts | 2025-05-20 |
| Module '"@/types/dataEntry"' has no exported member 'ValidationResult' | Added ValidationResult interface to dataEntry.d.ts | 2025-05-20 |
| Module '"@/types/report"' has no exported member named 'ReportChartProps' | Added ReportChartProps interface to report.ts | 2025-05-20 |
| Module '"@/types/report"' has no exported member 'ReportTypeValues' | Added ReportTypeValues enum to report.ts | 2025-05-20 |
| Property 'date' does not exist on type 'IntrinsicAttributes & DatePickerProps' | Updated DatePicker component with proper props interface | 2025-05-20 |
| Type 'ForwardRefExoticComponent<...>' is not assignable to type 'LucideIcon' | Added direct import of icons in ColumnTypeSelector | 2025-05-20 |
| Cannot find module '@/lib/constants' | Created constants.ts file with required exports | 2025-05-20 |
| UserRole type incompatibility between modules | Updated UserRole type to include all possible values | 2025-05-20 |
| Module '"@/types/role"' has no exported member 'normalizeRole' | Added normalizeRole function to role.ts | 2025-05-21 |
| Module '"@/types/category"' has no exported member 'CategoryWithColumns' | Added CategoryWithColumns interface to category.d.ts | 2025-05-21 |
| Property 'section' does not exist on type 'Column' | Updated Column interface to include section property | 2025-05-21 |
| Property 'label' does not exist on type 'TabDefinition' | Updated TabDefinition to include label property | 2025-05-21 |
| Property 'value' does not exist on type 'IntrinsicAttributes & DatePickerProps' | Updated DatePicker component to accept both value/onChange and selected/onSelect props | 2025-05-21 |
