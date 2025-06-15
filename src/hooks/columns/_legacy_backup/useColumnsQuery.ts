// =============================================================================
// DEPRECATED - USE '@/hooks/columns' INSTEAD
// =============================================================================
// This file is kept for backward compatibility only.
// Please update your imports to use the new unified API from '@/hooks/columns'

console.warn(`
⚠️  DEPRECATED IMPORT DETECTED ⚠️
The import '@/hooks/columns/useColumnsQuery' is deprecated.
Please update to: import { useColumnsQuery } from '@/hooks/columns'

Migration guide:
OLD: import { useColumnsQuery } from '@/hooks/columns/useColumnsQuery'
NEW: import { useColumnsQuery } from '@/hooks/columns'
`);

export { useColumnsQuery, useActiveColumnsQuery } from './core/useColumnsQuery';
export default useColumnsQuery;
