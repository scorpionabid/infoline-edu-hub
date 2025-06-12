// =============================================================================
// DEPRECATED - USE 'ColumnDialog' FROM '@/components/columns/unified/ColumnDialog' INSTEAD
// =============================================================================

console.warn(`
⚠️  DEPRECATED COMPONENT DETECTED ⚠️
The component 'CreateColumnDialog' is deprecated.
Please update to: import ColumnDialog from '@/components/columns/unified/ColumnDialog'

Migration example:
OLD:
  <CreateColumnDialog 
    open={open} 
    onOpenChange={setOpen}
    onSaveColumn={handleSave}
    categories={categories}
  />
  
NEW:
  <ColumnDialog 
    mode="create"
    open={open} 
    onOpenChange={setOpen}
    onSave={handleSave}
    categories={categories}
  />
`);

// Re-export the unified component for backward compatibility
export { default } from './unified/ColumnDialog';
