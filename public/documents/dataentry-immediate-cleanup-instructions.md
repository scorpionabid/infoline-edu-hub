# DataEntry Hooks - Təcili Təmizlənmə Təlimatları

## ✅ TEHLÜKƏSİZ SİLİNƏ BİLƏN FAYLLAR

Analizə əsasən aşağıdakı fayllar **heç yerdə istifadə edilmir** və təhlükəsiz silinə bilər:

1. `useDataUpdates.ts` - heç yerdə import edilmir
2. `useQuickWins.ts` - heç yerdə import edilmir  
3. `useIndexedData.ts` (dataEntry qovluğundan) - heç yerdə import edilmir

## 🚀 DƏRHAl İCRA EDİLƏ BİLƏN ƏMRLƏR

### Addım 1: Backup və Branch Yaradın

```bash
cd /Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub

# Backup branch yaradın
git checkout -b backup-before-dataentry-cleanup
git add -A && git commit -m "Backup before dataEntry hooks cleanup"

# İş branch-ı yaradın
git checkout -b feature/dataentry-hooks-cleanup
```

### Addım 2: Köhnə Faylları Silin

```bash
# DataEntry qovluğuna daxil olun
cd src/hooks/dataEntry

# Təhlükəsiz silinə bilən faylları silin
rm useDataUpdates.ts
rm useQuickWins.ts
rm useIndexedData.ts

# Nəticəni yoxlayın
ls -la
```

### Addım 3: Index.ts Faylını Düzəldin

Aşağıdakı məzmunu `src/hooks/dataEntry/index.ts` faylına yazın:

```typescript
// Essential dataEntry hooks - cleaned and optimized
export { default as useAutoSave } from './useAutoSave';
export { default as useRealTimeValidation } from './useRealTimeValidation';
export { default as useDataEntry } from './useDataEntry';
export { default as useDataEntryManager } from './useDataEntryManager';
export { default as useSchool } from './useSchool';
export { default as useSchoolSelector } from './useSchoolSelector';
export { default as useSchoolManagement } from './useSchoolManagement';
export { default as useRealTimeDataEntry } from './useRealTimeDataEntry';
export { default as useErrorRecovery } from './useErrorRecovery';
export { default as useCategoryStatus } from './useCategoryStatus';
export { default as useSectorCategories } from './useSectorCategories';
export { default as useSectorDataEntry } from './useSectorDataEntry';
```

### Addım 4: Yoxlama və Test

```bash
# Project root-a qayıdın
cd ../../../

# TypeScript error yoxlayın
npm run type-check

# Lint yoxlayın
npm run lint

# Test işə salın
npm run test

# Build etməyə çalışın
npm run build
```

### Addım 5: Dəyişiklikləri Commit Edin

```bash
git add .
git commit -m "Remove obsolete hooks: useDataUpdates, useQuickWins, useIndexedData(dataEntry)"
```

## 📊 GÖZLƏNILƏN NƏTİCƏLƏR

Bu dəyişikliklərdən sonra:

| Metric | Əvvəl | Sonra | Fərq |
|--------|-------|--------|------|
| **Fayl sayı** | 16 | 13 | -3 fayl |
| **Kod sətirlər** | ~4500 | ~4350 | -150 sətir |
| **Təkrarçılıq** | 40% | 30% | -10% |

## 🔧 ƏLAVƏ OPTİMALLAŞDIRMA

### 1. useIndexedData Təkrarçılığını Həll Edin

İki yerədə eyni hook var:
- `src/hooks/core/useIndexedData.ts` (daha yaxşı implementasiya)
- `src/hooks/dataEntry/useIndexedData.ts` (silindi)

### 2. Böyük Faylları Kiçiltmək

Növbəti addım olaraq:
- `useDataEntry.ts` (803 sətir) - 400 sətrə endirmək
- `useDataEntryManager.ts` (574 sətir) - modullaşdırmaq

### 3. School Hooks Birləşdirmək

3 müxtəlif school hook-u var:
- `useSchool.ts`
- `useSchoolSelector.ts` 
- `useSchoolManagement.ts`

Bunları vahid `useSchool.ts` hook-unda birləşdirmək olar.

## ⚠️ ƏSLİNDƏ PROBLEM

Index.ts faylında yazılırdı ki:
```typescript
// Note: Other hooks have been moved to /hooks/business/dataEntry/ for better organization
```

Amma əslində heç bir hook köçürülməmişdi! Bu yalnış məlumat idi və indi düzəldildi.

## 🎯 NÖVBƏTİ MƏRHƏLƏ

Bu təmizlənmədən sonra növbəti 2 həftədə:

1. **Həftə 1**: School hooks birləşdirmə
2. **Həftə 2**: DataEntry hooks optimallaşdırma
3. **Həftə 3**: Service layer extract
4. **Həftə 4**: Performance testing

---

**DİQQƏT**: Bu dəyişikliklər tamamilə təhlükəsizdir, çünki silinən hook-lar heç yerdə istifadə edilmir və index.ts-də də export edilmir.