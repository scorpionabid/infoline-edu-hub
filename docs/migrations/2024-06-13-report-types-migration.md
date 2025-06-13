# Report Types Migration Guide

## Overview

This document outlines the migration from decentralized report type definitions to a centralized type system in the InfoLine application. The changes include:

1. Consolidating all report-related types into `@/types/core/report.ts`
2. Updating property naming to use `snake_case` to match backend conventions
3. Removing duplicate type definitions across the codebase
4. Updating all imports to use the new centralized types

## Changes Made

### 1. Centralized Type Definitions

All report-related types have been consolidated into `src/types/core/report.ts`. This includes:

- `Report` interface
- `ReportType` enum and `ReportTypeValues` type
- `ReportStatus` enum
- `ReportFilter` interface
- Component props interfaces

### 2. Property Naming Convention

All properties have been updated to use `snake_case` to match the backend/database conventions:

| Old (camelCase) | New (snake_case) |
|-----------------|------------------|
| `createdBy`     | `created_by`     |
| `isTemplate`    | `is_template`    |
| `sharedWith`    | `shared_with`    |
| `updatedAt`     | `updated_at`     |


### 3. Updated Imports

All imports have been updated from:

```typescript
import { Report, ReportType } from '@/types/report';
```

to:

```typescript
import { Report, ReportType } from '@/types/core/report';
```

## Migration Steps

### For Developers

1. **Update Imports**
   - Replace all imports from `@/types/report` with `@/types/core/report`
   - Update any destructured property names to use `snake_case`

2. **Update Component Props**
   - Ensure all components using report data handle the new `snake_case` property names
   - Update any form handling or data manipulation code to use the new property names

3. **Update Tests**
   - Update test fixtures and mocks to use the new property names
   - Ensure all tests pass with the updated type definitions

### For Code Reviewers

When reviewing pull requests, please ensure:

1. All report-related types are imported from `@/types/core/report`
2. Property names use `snake_case` when working with report data
3. No duplicate type definitions exist in other files

## Common Issues and Solutions

### Type Errors After Migration

If you encounter type errors after updating imports:

1. Check that all property names use `snake_case`
2. Ensure all required fields are provided when creating or updating reports
3. Verify that the correct type is being imported

### Missing Type Definitions

If you encounter missing type definitions:

1. Check if the type exists in `@/types/core/report.ts`
2. If not, add it to the centralized type definitions
3. Update any related components to use the centralized type

## Rollback Plan

If issues arise during deployment:

1. Revert to the previous commit before the type migration
2. Restore any backed-up type definitions
3. Update imports back to their original locations

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Supabase TypeScript Guide](https://supabase.com/docs/guides/with-typescript)
- [Project TypeScript Conventions](link-to-project-docs)
