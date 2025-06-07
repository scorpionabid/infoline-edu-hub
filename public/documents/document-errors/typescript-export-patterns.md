
# TypeScript Export Patterns - Guidance Document

## Tip İdxal və İxrac Standartları / Type Import & Export Standards

TypeScript tiplərinin idxalı və ixracı zamanı aşağıdakı standart yanaşmalardan istifadə etmək tövsiyə olunur:

### 1. Tip İxrac Metodları / Type Export Methods

#### 1.1. Tip İxrac / Type Export

```typescript
// Type export
export type ReportTypeValues = 'bar' | 'pie' | 'line';

// Interface export
export interface Report {
  title: string;
  type: ReportTypeValues;
}
```

#### 1.2. Dəyər və Tip İxracı / Value and Type Export

```typescript
// Enum export (both value and type)
export enum ReportStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published'
}

// Constant with type assertion
export const REPORT_TYPE_VALUES = {
  BAR: 'bar' as const,
  PIE: 'pie' as const,
  LINE: 'line' as const
};

// Exported type derived from constant values
export type ReportTypeValues = typeof REPORT_TYPE_VALUES[keyof typeof REPORT_TYPE_VALUES];
```

### 2. Yenidən İxrac / Re-exporting

#### 2.1. Tip Yenidən İxrac / Type Re-export

```typescript
// Best practice - explicit syntax 
export type { Report, ReportChartProps } from './core/report';

// Values re-export
export { ReportStatus, REPORT_TYPE_VALUES } from './core/report';
```

#### 2.2. Daha Dəqiq Re-export / More Precise Re-export

```typescript
import { Report, ReportChartProps } from './core/report';
import { ReportStatus, REPORT_TYPE_VALUES } from './core/report';

// Named re-export
export type { Report, ReportChartProps };
export { ReportStatus, REPORT_TYPE_VALUES };
```

### 3. Idxal Standartları / Import Standards

```typescript
// Preferred pattern - separate type and value imports
import { REPORT_TYPE_VALUES } from '@/types/report';
import type { Report, ReportTypeValues } from '@/types/report';

// Alternative pattern
import { REPORT_TYPE_VALUES, type Report, type ReportTypeValues } from '@/types/report';
```

### 4. Xəta Nümunələri və Həlləri / Error Examples and Solutions

#### 4.1. "Does not provide an export named X"

**Xəta / Error:**
```
SyntaxError: The requested module '/src/types/core/report.ts' does not provide an export named 'ReportTypeValues'
```

**Həll / Solution:**
- Mənbə faylında tiplərin düzgün ixrac olunduğunu yoxlayın
- Type və interface açar sözlərini doğru istifadə edin
- Barrel exports-də (index.ts) düzgün ixrac edin

#### 4.2. Dairəvi Asılılıqlar / Circular Dependencies

**Xəta / Error:**
```
TypeError: Cannot read properties of undefined (reading 'X')
```

**Həll / Solution:**
- Core tip tərifləri və törəmə tiplər arasında dairəvi asılılıqlardan qaçının
- Interface extends istifadə edin və ya kompozisiya tətbiq edin

### 5. Tipin Düzgün Olmasını Təmin Edən Üsullar / Ways to Ensure Type Correctness

#### 5.1. Sabitlərdən Tip Düzəltmək / Deriving Types from Constants

```typescript
// Define constant first
export const CategoryStatuses = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived'
} as const;

// Then derive type from it
export type CategoryStatus = typeof CategoryStatuses[keyof typeof CategoryStatuses];
```

#### 5.2. Tip və Dəyər Uyğunluğunu Təmin Etmək / Ensuring Type and Value Consistency

```typescript
// When both constants and types are needed:
export const REPORT_TYPES = ['bar', 'pie', 'line'] as const;
export type ReportType = typeof REPORT_TYPES[number];
```

### 6. Imports və Re-exports Yaxşı Təcrübəsi / Best Practices for Imports and Re-exports

#### 6.1. Barrel Exports (index.ts)

```typescript
// Re-exporting from a central file
export * from './types';
export * from './constants';
export * from './interfaces';
```

#### 6.2. Seçmə Re-export / Selective Re-export

```typescript
// Only re-export what's needed
export { UserRole, UserStatus } from './user-types';
export type { User, UserProfile } from './user-interfaces';
```
