
# columnTypes Export Error

## Error Description
This error occurs when a component attempts to import the `columnTypes` object from `src/types/column.ts`, but this export is not available in the file.

```
Uncaught SyntaxError: The requested module '/src/types/column.ts' does not provide an export named 'columnTypes'
```

## Root Cause
The `columnTypes` object is referenced in components like `ColumnList.tsx` but wasn't exported from `src/types/column.ts`.

## Resolution Steps

1. **Add the `columnTypes` export in `src/types/column.ts`**:
   - Define a comprehensive object with column type definitions
   - Include type information, descriptions, and icons
   - Add a `find` helper function to lookup column types by name

2. **Update components that use `columnTypes`**:
   - Ensure consistent usage in `ColumnList.tsx` and other components
   - Use the `find` method for lookups

3. **Fix related imports**:
   - Check and update all components that import from `src/types/column.ts`

## Prevention
To prevent this issue in the future:

1. Always ensure that any imports match exported items exactly
2. When referencing a property exported from a module, check that it exists in that module
3. Use TypeScript to catch these errors at compile-time
4. Add proper JSDoc comments to exports for better documentation

## Related Components

- `src/components/columns/ColumnList.tsx`
- `src/components/columns/ColumnFormDialog.tsx` 
- `src/components/columns/columnDialog/ColumnTypeSelector.tsx`
