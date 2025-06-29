#!/bin/bash

# İnfoLine - Backup Files Cleanup Script
# Bu script layihədəki backup faylları təmizləyir

echo "🧹 Starting backup files cleanup..."

# Root directory backup files
echo "Removing root backup files..."
rm -f backup_LoginForm.tsx
rm -f backup_permissions_index.ts  
rm -f backup_useLocalStorageHook.ts
rm -f backup_usePermissions_old.ts
rm -f backup_useRegionAdmins.ts
rm -f backup_useSuperUsers.ts
rm -f eslint.config.js.backup

# Legacy cleanup scripts
echo "Removing legacy cleanup scripts..."
rm -f cleanup-hooks.sh
rm -f fix-switch-case.js
rm -f fix-switch-case.mjs
rm -f fix-switch-case.sh

# Analysis and planning documents (keeping only essential ones)
echo "Cleaning up planning documents..."
rm -f AUTH_IMPROVEMENT_PLAN_V2.md
rm -f AUTH_MINIMAL_FIX_PLAN.md  
rm -f AUTH_SYSTEM_ANALYSIS.md
rm -f HOOKS_CLEANUP_PLAN.md
rm -f REFACTORING_CLEANUP_PLAN.md
rm -f SUPABASE_TYPES_REFACTORING_COMPLETED.md
rm -f SUPABASE_TYPES_REFACTORING_PLAN.md

# SQL analysis files
echo "Removing analysis SQL files..."
rm -f analysis-queries.sql
rm -f find-problem-queries.sql
rm -f test_data.sql

echo "✅ Backup files cleanup completed!"
