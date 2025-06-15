// =============================================================================
// DEPRECATED - USE '@/hooks/columns' INSTEAD
// =============================================================================

console.warn(`
⚠️  DEPRECATED IMPORT DETECTED ⚠️
The import '@/hooks/columns/useColumnMutations' is deprecated.
Please update to: import { useColumnMutations } from '@/hooks/columns'
`);

export { useColumnMutations } from './mutations/useColumnMutations';
export default useColumnMutations;
