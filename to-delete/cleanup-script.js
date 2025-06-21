#!/usr/bin/env node

// İnfoLine Backup Cleanup Script
// Bu script bütün backup faylları silir

const fs = require('fs');
const path = require('path');

const backupFiles = [
  'src/components/layout/UserProfile.backup.tsx',
  'src/components/reports/SchoolColumnTable.tsx.backup',
  'src/context/auth/AuthContext.tsx.backup',
  'src/context/auth/useRole.ts.backup',
  'src/hooks/auth/authActions.ts.backup',
  'src/hooks/auth/permissionCheckers.ts.backup',
  'src/hooks/auth/permissionTypes.ts.backup',
  'src/hooks/auth/permissionUtils.ts.backup',
  'src/hooks/auth/stores/authStore.backup.ts',
  'src/hooks/auth/types.ts.backup',
  'src/hooks/auth/useAuthFetch.ts.backup',
  'src/hooks/auth/useAuthStore.ts.backup',
  'src/hooks/auth/useDataAccessControl.ts.backup',
  'src/hooks/auth/usePermissions.ts.backup',
  'src/hooks/auth/useSupabaseAuth.ts.backup',
  'src/hooks/auth/userDataService.ts.backup',
  'src/hooks/columns/useColumnsQuery.ts.backup',
  'src/hooks/entities/useSectors.ts.backup',
  'src/hooks/reports/useSchoolColumnReport.ts.backup',
  'src/hooks/sectors/useSectors.ts.backup',
  'src/hooks/sectors/useSectorsStore.ts.backup',
  'src/hooks/sectors.ts.backup',
  'src/types/columns.ts.backup'
];

console.log('🗑️  İnfoLine Backup Cleanup Script');
console.log('===================================');

let deletedCount = 0;
let errors = 0;

backupFiles.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Silindi: ${filePath}`);
      deletedCount++;
    } else {
      console.log(`⏭️  Tapılmadı: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Xəta: ${filePath} - ${error.message}`);
    errors++;
  }
});

console.log('\n📊 NƏTİCƏ:');
console.log(`   ✅ Silindi: ${deletedCount} fayl`);
console.log(`   ❌ Xəta: ${errors} fayl`);
console.log('===================================');

if (errors === 0) {
  console.log('🎉 Bütün backup fayllar uğurla silindi!');
} else {
  console.log(`⚠️  ${errors} faylda xəta baş verdi. Yenidən yoxlayın.`);
  process.exit(1);
}
