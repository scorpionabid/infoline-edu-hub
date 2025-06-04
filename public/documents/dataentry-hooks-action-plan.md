# DataEntry Hooks Refactoring - Action Plan

## 🚀 Dərhal İcrası Lazım Olan Addımlar

### Addım 1: Köhnə Faylları Təcili Silmə

Bu fayllar təhlükəsiz şəkildə silinə bilər, çünki funksionallıqları başqa yerlərdə mövcuddur:

```bash
# Naviqasiya
cd /Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub/src/hooks/dataEntry

# Köhnə faylları sil
rm useDataUpdates.ts
rm useQuickWins.ts
rm useIndexedData.ts
```

**Import references yoxlanmalıdır:**
- `useDataUpdates` - axtarılmalı və əvəz edilməli
- `useQuickWins` - komponentlərdə axtarılmalı
- `useIndexedData` - native JS Map/Object-lə əvəz edilməli

### Addım 2: Index.ts Düzəlişi

```typescript
// src/hooks/dataEntry/index.ts - YENİ məzmun
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

### Addım 3: Dependency Audit

Hansı komponentlər silinəcək hook-ları istifadə edir:

```bash
# Axtarış komandaları
grep -r "useDataUpdates" src/
grep -r "useQuickWins" src/
grep -r "useIndexedData" src/
```

## 📋 Növbəti 7 Günün Planı

### Gün 1-2: Təcili Təmizlənmə

**Prioritet 1:**
- [ ] Köhnə faylları sil
- [ ] Import referanslarını yoxla
- [ ] TypeScript error-larını həll et

**Komandalar:**
```bash
# 1. Backup yarat
git checkout -b feature/dataentry-hooks-cleanup
git add -A && git commit -m "Backup before cleanup"

# 2. Köhnə faylları sil
rm src/hooks/dataEntry/useDataUpdates.ts
rm src/hooks/dataEntry/useQuickWins.ts  
rm src/hooks/dataEntry/useIndexedData.ts

# 3. Index düzəlt
# (yuxarıdakı index.ts məzmunu ilə)

# 4. Yoxla və commit et
npm run type-check
npm run lint
git add -A && git commit -m "Remove obsolete hooks"
```

### Gün 3-4: useSchool Hook-larının Birləşdirilməsi

**Prioritet 2:**
- [ ] useSchool.ts-ni genişləndir
- [ ] useSchoolSelector və useSchoolManagement funksionallığını daxil et
- [ ] Test yaz

**Gözlənilən nəticə:**
```typescript
// useSchool.ts - Yeni struktur
export const useSchool = (options: {
  mode: 'single' | 'selector' | 'management';
  schoolId?: string;
  sectorId?: string;
}) => {
  if (options.mode === 'single') {
    // Mövcud useSchool funksionallığı
  }
  
  if (options.mode === 'selector') {
    // useSchoolSelector funksionallığı
  }
  
  if (options.mode === 'management') {
    // useSchoolManagement funksionallığı
  }
  
  return { ... };
};
```

### Gün 5-7: Data Entry Hook-larının Sadələşdirilməsi

**Prioritet 3:**
- [ ] useDataEntry.ts-ni 400 sətirə endirmək
- [ ] useDataEntryManager.ts-ni optimallaşdırmaq
- [ ] Real-time funksionallığı ayrı fayl

## 🔍 Keyfiyyət Yoxlaması

### Hər Gün:
```bash
# Bundle size yoxla
npm run build
ls -la dist/ | grep -E "\.(js|css)$"

# Type check
npm run type-check

# Test coverage
npm run test:coverage
```

### Test Strategy:
```javascript
// useSchool.test.ts
describe('useSchool hook', () => {
  it('should handle single mode for school admin', () => {});
  it('should handle selector mode for sector admin', () => {});
  it('should handle management mode for sector admin', () => {});
});
```

## 📊 Progress Tracking

| Addım | Status | Deadline | Owner |
|-------|--------|----------|-------|
| Köhnə faylları sil | 🟡 Pending | Gün 2 | Dev Team |
| Index.ts düzəlt | 🟡 Pending | Gün 2 | Dev Team |
| Import refs yoxla | 🟡 Pending | Gün 3 | Dev Team |
| useSchool birləşdir | 🟡 Pending | Gün 5 | Frontend Dev |
| Tests yaz | 🟡 Pending | Gün 6 | QA/Dev |
| Performance test | 🟡 Pending | Gün 7 | Dev Team |

## 🚨 Risk Mitigation

### Risk 1: Breaking Changes
**Problem**: Silinən hook-ları istifadə edən komponentlər
**Həll**: 
```bash
# Axtarış et
grep -r "from.*dataEntry.*useDataUpdates" src/
# Tapılan yerlərə alternative hook təyin et
```

### Risk 2: Type Errors
**Problem**: Hook signature dəyişiklikləri
**Həll**: 
```typescript
// Backward compatibility
export const useSchoolLegacy = useSchool; // Temporary
```

### Risk 3: Performance Regression
**Problem**: Birləşdirilmiş hook-lar ağır ola bilər
**Həll**: 
```typescript
// Lazy loading
const useSchoolHeavy = lazy(() => import('./useSchoolHeavy'));
```

## 📞 Communication Plan

### Daily Standup Items:
- "DataEntry hooks cleanup status"
- "Any blocking issues with hook refactoring"
- "Performance impact measurements"

### Weekly Team Meeting:
- Progress review əsasında strategy update
- Next week priorities
- Risk assessment update

## 📝 Definition of Done

### Hər addım üçün:
- [ ] Code review completed
- [ ] Tests passing (unit + integration)
- [ ] TypeScript strict mode passing
- [ ] Bundle size checked
- [ ] Documentation updated
- [ ] No breaking changes for end users

### Final acceptance criteria:
- [ ] Hook count reduced from 16 to <12
- [ ] Bundle size <150KB
- [ ] Test coverage >80%
- [ ] All existing functionality preserved
- [ ] Performance same or better

---

**Bu sənəd real-time update ediləcək.**
**Son yenilənmə**: 04 İyun 2025
**Status**: Ready for execution