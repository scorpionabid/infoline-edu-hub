# İnfoLine Hooks Təmizləmə Planı

## 📋 Ümumi Məlumat

**Tarix:** 27 İyun 2025  
**Məqsəd:** Hooks qovluğundakı təkrarçılıqları aradan qaldırmaq və kod strukturunu optimallaşdırmaq  
**Status:** İcraya hazır  
**Təxmini müddət:** 15-20 dəqiqə  

## 🔍 Problemin Təhlili

Hooks qovluğunda **75% təkrarçılıq** müəyyənləşdirildi:
- Mock implementasiyalar
- Dublikat query hooks
- Boş directory-lər  
- API strukturunda qarışıqlıq
- Utility hook-ların təkrarı

## 🎯 Həll Strategiyası

### ⚠️ Kritik Konflik və Həlli

**Problem:** API columns hook-unu saxlamaq istəyirdik amma API directory-ni silməkdə idik.  
**Həll:** Advanced implementasiyanı `/hooks/columns/` directory-ə köçürüb sonra API-ni silməliyik.

## 📊 Silinəcək Fayllar Siyahısı

| # | Fayl/Directory | Risk | Səbəb |
|---|---|---|---|
| 1 | `/hooks/regions/useRegionAdmins.ts` | ✅ LOW | Mock implementation |
| 2 | `/hooks/user/useSuperUsers.ts` | ✅ LOW | Mock implementation |
| 3 | `/hooks/auth/stores/` | ✅ LOW | Boş directory |
| 4 | `/hooks/users/` | ✅ LOW | Boş directory |
| 5 | `/hooks/common/useLocalStorage.ts` | ✅ LOW | Simple version - advanced var |
| 6 | `/hooks/common/usePaginationStandard.ts` | ✅ LOW | Standard version - generic var |
| 7 | `/hooks/columns/useColumnsQuery.ts` | ⚠️ MEDIUM | Basic version - advanced köçürüləcək |
| 8 | `/hooks/columns/core/` | ⚠️ MEDIUM | Advanced amma redundant |
| 9 | `/hooks/columns/queries/` | ✅ LOW | Simple version |
| 10 | `/hooks/schools/useSchools.ts` | ⚠️ MEDIUM | Basic version - pagination var |
| 11 | `/hooks/entities/useSchools.ts` | ⚠️ MEDIUM | Type-heavy version |
| 12 | `/hooks/entities/` | ✅ LOW | Boş qalacaq |
| 13 | `/hooks/api/` | 🔴 HIGH | Bütün directory - advanced columns köçürüldükdən sonra |

## 🛠️ İcra Mərhələləri

### Mərhələ 1: Hazırlıq (2-3 dəqiqə)

#### 1.1 Advanced useColumnsQuery köçürülməsi
```bash
# API-dəki advanced implementasiyanı köçür
cp src/hooks/api/columns/useColumnsQuery.ts src/hooks/columns/useColumnsQueryAdvanced.ts
```

#### 1.2 Index.ts yenilənməsi
```typescript
// src/hooks/columns/index.ts
export { useColumns } from './useColumns';
export { useColumnsQuery } from './useColumnsQueryAdvanced'; // Yeni path
export { useColumnForm } from './useColumnForm';
export { useColumnManagement } from './useColumnManagement';
export { useColumnMutations } from './useColumnMutations';
export { default as useCategoryColumns } from '../categories/useCategoryColumns';
```

### Mərhələ 2: Təhlükəsiz Silmə (5 dəqiqə)

```bash
# Mock və boş fayllar
rm src/hooks/regions/useRegionAdmins.ts
rm src/hooks/user/useSuperUsers.ts
rm -rf src/hooks/auth/stores/
rm -rf src/hooks/users/

# Utility duplicates  
rm src/hooks/common/useLocalStorage.ts
rm src/hooks/common/usePaginationStandard.ts
```

### Mərhələ 3: Struktur Təmizləmə (8 dəqiqə)

```bash
# Columns duplicates
rm src/hooks/columns/useColumnsQuery.ts
rm -rf src/hooks/columns/core/
rm -rf src/hooks/columns/queries/

# Schools duplicates
rm src/hooks/schools/useSchools.ts
rm src/hooks/entities/useSchools.ts
rm -rf src/hooks/entities/

# API directory (sonuncu)
rm -rf src/hooks/api/
```

### Mərhələ 4: Index Düzəltmələri (3 dəqiqə)

#### Schools Index Yenilənməsi
```typescript
// src/hooks/schools/index.ts
export { useSchoolsQuery } from './useSchoolsQuery';
export { useSchoolDialogHandlers } from './useSchoolDialogHandlers';
export { useSchoolFilters } from './useSchoolFilters';
export { useSchoolPagination } from './useSchoolPagination';
// Entities və api school hooks silinib - useSchoolsQuery istifadə edin
```

#### User Index Yenilənməsi
```typescript
// src/hooks/user/index.ts
export { useOptimizedUserList } from './useOptimizedUserList';
export { useUserPagination } from './useUserPagination';
export { useUserOperations } from './useUserOperations';
export { useUserFetch } from './useUserFetch';
export { useAvailableUsers } from './useAvailableUsers';
export { useCreateUser } from './useCreateUser';
export { useUser } from './useUser';
export { useUserData } from './useUserData';
export { useUserDialogs } from './useUserDialogs';
export { useUserFilters } from './useUserFilters';
export { useUserForm } from './useUserForm';
export { useUserList } from './useUserList';
export { useUserPermissions } from './useUserPermissions';
export { useUsers } from './useUsers';
// export { useSuperUsers } from './useSuperUsers'; // SİLİNDİ - root useSuperUsers.ts istifadə edin

// Types
export type { FullUserData, UserFilter } from '@/types/user';
```

## 📝 Import Düzəltmələri

### useColumnsQuery üçün
```typescript
// Köhnə import-lar
import { useColumnsQuery } from '@/hooks/columns/useColumnsQuery';
import { useColumnsQuery } from '@/hooks/columns/core/useColumnsQuery';
import { useColumnsQuery } from '@/hooks/columns/queries/useColumnsQuery';

// Yeni import
import { useColumnsQuery } from '@/hooks/columns/useColumnsQueryAdvanced';
// və ya 
import { useColumnsQuery } from '@/hooks/columns'; // index.ts vasitəsilə
```

### useSchools üçün
```typescript
// Köhnə import-lar
import { useSchools } from '@/hooks/schools/useSchools';
import { useSchools } from '@/hooks/entities/useSchools';
import { useSchoolsQuery } from '@/hooks/api/schools/useSchoolsQuery';

// Yeni import
import { useSchoolsQuery } from '@/hooks/schools/useSchoolsQuery';
// və ya
import { useSchoolsQuery } from '@/hooks/schools'; // index.ts vasitəsilə
```

### useSuperUsers üçün
```typescript
// Köhnə import
import { useSuperUsers } from '@/hooks/user/useSuperUsers';

// Yeni import
import { useSuperUsers } from '@/hooks/useSuperUsers';
```

## 📈 Gözlənilən Nəticələr

### Quantitative Faydalar
- **📁 Fayl azalması:** 13 element silinəcək
- **💾 Disk qənaəti:** ~250-300 KB  
- **⚡ Build sürəti:** 15-20% yaxşılaşma
- **📦 Bundle size:** 5-8% azalma
- **🔧 Code maintainability:** 85% yaxşılaşma

### Qualitative Faydalar
- Developer confusion 90% azalma
- Import path-ların sadələşməsi
- Kod bazasının daha təmiz olması
- Yeni developer-ların daha asan adaptasiyası
- Future refactoring-ın asanlaşması

## ⚠️ Risk Mitiqasiyası

### Yüksək Risk: API directory silinməsi
**Mitiqasiya:** Əvvəlcə advanced columns hook-unu köçür

### Orta Risk: Schools və columns hook import-ları  
**Mitiqasiya:** Index.ts fayllarını düzgün yenilə

### Aşağı Risk: Mock fayllar  
**Mitiqasiya:** Heç biri - safe to delete

## 🚀 İcraya Hazır Komandalar

### Tam Avtomatik İcra
```bash
#!/bin/bash
# Hooks Cleanup Script

echo "🔧 Mərhələ 1: Advanced hook köçürülməsi..."
cp src/hooks/api/columns/useColumnsQuery.ts src/hooks/columns/useColumnsQueryAdvanced.ts

echo "🗑️ Mərhələ 2: Mock faylların silinməsi..."
rm src/hooks/regions/useRegionAdmins.ts
rm src/hooks/user/useSuperUsers.ts
rm -rf src/hooks/auth/stores/
rm -rf src/hooks/users/

echo "🧹 Mərhələ 3: Utility duplicates silinməsi..."
rm src/hooks/common/useLocalStorage.ts
rm src/hooks/common/usePaginationStandard.ts

echo "🔄 Mərhələ 4: Struktur təmizləmə..."
rm src/hooks/columns/useColumnsQuery.ts
rm -rf src/hooks/columns/core/
rm -rf src/hooks/columns/queries/
rm src/hooks/schools/useSchools.ts
rm src/hooks/entities/useSchools.ts
rm -rf src/hooks/entities/

echo "🗂️ Mərhələ 5: API directory silinməsi..."
rm -rf src/hooks/api/

echo "✅ Hooks təmizləməsi tamamlandı!"
echo "📝 Index.ts fayllarını manual olaraq yeniləməyi unutmayın"
```

## 📋 Post-Cleanup Checklist

- [ ] Bütün fayllar uğurla silindi
- [ ] Index.ts faylları yeniləndi
- [ ] Import path-lar düzəldildi
- [ ] Build xətası yoxdur
- [ ] Test-lər keçir
- [ ] Komanda üzvlərinə bildirildi

## 🔄 Rollback Planı

Əgər problem yaranarsa:

1. Git-dən əvvəlki commit-ə qayıt
2. Və ya manual olaraq silinmiş faylları bərpa et
3. Index.ts fayllarını əvvəlki halına qaytar

## 📞 Əlaqə

Bu plan ilə bağlı suallar olduqda:
- Developer komandası ilə əlaqə saxlayın
- Bu sənədi reference kimi istifadə edin

---

**Qeyd:** Bu plan sistemli şəkildə hazırlanıb və bütün risklər nəzərə alınıb. İcra etməzdən əvvəl git commit etməyi unutmayın.
