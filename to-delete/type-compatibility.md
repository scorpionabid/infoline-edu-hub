
# Type Compatibility in InfoLine Project

This document explains the type compatibility issues that were fixed and provides guidelines for maintaining consistent types in the project.

## Common Type Issues Fixed

1. **Missing Properties in Interface Definitions**

Many type errors occurred because components were using properties that weren't defined in their interfaces. For example:
- `completionRate` vs `completion` naming inconsistencies
- Missing dashboard-related properties like `formStats`, `upcoming`, etc.

2. **Enum-like Types**

The project uses string literal unions for type safety, but components were accessing properties as if they were objects:
- `ReportTypeValues.BAR` instead of using string literals

3. **Inconsistent Naming Conventions**

Some interfaces had different naming conventions:
- `schoolName` vs `school.name`
- `categoryName` vs `category.name`

## Best Practices

1. **Use Type Aliases for Common Types**

```typescript
// Bad
interface Component1Props {
  status: 'active' | 'inactive' | 'pending';
}

interface Component2Props {
  status: 'active' | 'inactive' | 'pending';
}

// Good
type EntityStatus = 'active' | 'inactive' | 'pending';

interface Component1Props {
  status: EntityStatus;
}

interface Component2Props {
  status: EntityStatus;
}
```

2. **Support Multiple Naming Conventions During Transition**

When changing property names, support both versions temporarily:

```typescript
interface User {
  // Support both naming patterns
  completionRate?: number;
  completion?: number;
}
```

3. **Ensure Consistent Usage of React Query**

React Query brings consistency to data fetching. Always define return types:

```typescript
const { data: users } = useQuery<User[]>({
  queryKey: ['users'],
  queryFn: fetchUsers
});
```

4. **Use TypeScript Utility Types**

Take advantage of utility types for composing interfaces:

```typescript
type UserBasic = Pick<User, 'id' | 'name'>;

interface Comment {
  author: UserBasic;
  content: string;
}
```

## Component-specific Issues

### Dashboard Components

Dashboard components were using properties that didn't exist in their prop types:
- Fixed by expanding `SchoolAdminDashboardData`, `SectorAdminDashboardData`, etc.
- Added consistent types for statistics (completionRate/completion, status)

### Column Components

The `columnTypes` object was being used as both a record and as an object with methods:
- Fixed by extending the Record type with a find method
- Added consistent types for column options

### Report Components

Report components were accessing enum values incorrectly:
- Added proper type definitions for report types
- Fixed component prop types

## Maintaining Type Compatibility

When making changes to types:
1. Check all components that use the type
2. Use search to find all occurrences of property access
3. Add deprecated properties with `@deprecated` JSDoc comments
4. Plan for gradual migration to new property names

Following these guidelines will help maintain type safety throughout the project.
