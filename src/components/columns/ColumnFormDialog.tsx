// =============================================================================
// DEPRECATED - USE 'ColumnDialog' FROM '@/components/columns/unified/ColumnDialog' INSTEAD
// =============================================================================

console.warn(`
⚠️  DEPRECATED COMPONENT DETECTED ⚠️
The component 'ColumnFormDialog' is deprecated.
Please update to: import ColumnDialog from '@/components/columns/unified/ColumnDialog'

Migration example:
OLD:
  <ColumnFormDialog 
    open={open} 
    onOpenChange={setOpen}
    column={column}
    categoryId={categoryId}
    onSave={handleSave}
  />
  
NEW:
  <ColumnDialog 
    mode="edit"
    open={open} 
    onOpenChange={setOpen}
    column={column}
    categories={categories}
    onSave={handleSave}
  />
`);

// Re-export the unified component for backward compatibility
export { default } from './unified/ColumnDialog';
