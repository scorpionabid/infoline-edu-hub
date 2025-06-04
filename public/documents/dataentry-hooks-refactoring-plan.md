# İnfoLine - DataEntry Hooks Refactoring Planı

## Sənədin Məqsədi

Bu sənəd `/src/hooks/dataEntry` qovluğunun detallı analizi və təmizlənmə planını təsvir edir. Məqsəd təkrarçılığı aradan qaldırmaq, kod keyfiyyətini artırmaq və performansı yaxşılaşdırmaqdır.

## Analiz Nəticələri

### Mövcud Vəziyyət

| Göstərici | Mövcud | Hədəf |
|-----------|--------|-------|
| **Fayl sayı** | 16 | 8-10 |
| **Təkrarçılıq** | 40% | <10% |
| **Böyük fayllar** | 4 fayl (>300 sətir) | 0 fayl |
| **Kod ölçüsü** | ~4,500 sətir | ~2,500 sətir |

### 🔴 Kritik Problemlər

#### 1. Təkrarçılıq Nəticəsi
- **Məktəb İdarəetməsi**: 3 fayl (`useSchool.ts`, `useSchoolSelector.ts`, `useSchoolManagement.ts`)
- **Data Entry**: 2 fayl (`useDataEntry.ts`, `useDataEntryManager.ts`) 
- **Type Definitions**: Müxtəlif tiplərdə eyni strukturlar

#### 2. Index.ts Uyğunsuzluğu
```typescript
// ❌ Problem: Kommentdə digər hookların köçürüldüyü deyilir, amma onlar hələ də mövcuddur
// Note: Other hooks have been moved to /hooks/business/dataEntry/ for better organization
// This folder now contains only the essential form-related hooks
```

#### 3. Köhnə/Lazımsız Fayllar
- `useDataUpdates.ts` - Excel məlumat yeniləmələri (40 sətir, az funksionallıq)
- `useQuickWins.ts` - Ümumi progress hesablamalar (60 sətir)
- `useIndexedData.ts` - Standart Map/Object əvəzinə (50 sətir)

#### 4. Aşırı Kompleks Fayllar
- `useDataEntry.ts` - **803 sətir** (15+ funksiya)
- `useDataEntryManager.ts` - **574 sətir** (real-time + status + conflict resolution)

## 🎯 Refactoring Strategiyası

### Mərhələ 1: Təcili Təmizlənmə (1 həftə)

#### 1.1 Köhnə Faylların Silinməsi
```bash
# Təcili silinməli fayllar
rm src/hooks/dataEntry/useDataUpdates.ts
rm src/hooks/dataEntry/useQuickWins.ts  
rm src/hooks/dataEntry/useIndexedData.ts
```

**Səbəblər:**
- `useDataUpdates.ts`: Funksionallıq `useDataEntry.ts`-də mövcuddur
- `useQuickWins.ts`: Az istifadə olunur, ümumi funksiyalar
- `useIndexedData.ts`: Native JavaScript Map/Object ilə əvəz edilə bilər

#### 1.2 Index.ts Düzəlişi
```typescript
// ✅ YENİ index.ts
export { default as useAutoSave } from './useAutoSave';
export { default as useRealTimeValidation } from './useRealTimeValidation';
export { default as useDataEntry } from './useDataEntry';
export { default as useSchool } from './useSchool';
export { default as useRealTimeDataEntry } from './useRealTimeDataEntry';
export { default as useErrorRecovery } from './useErrorRecovery';
```

### Mərhələ 2: Birləşdirmə və Təkmilləşdirmə (2 həftə)

#### 2.1 Məktəb Hooks Birləşdirmə

**Mövcud:**
```
useSchool.ts (85 sətir)
useSchoolSelector.ts (102 sətir)  
useSchoolManagement.ts (156 sətir)
```

**Hədəf:**
```typescript
// useSchool.ts - Vahid məktəb hook-u
export const useSchool = (options: UseSchoolOptions) => {
  // Basic school loading
  // School selection for sector admins
  // School management operations
  // Bulk operations
}

// İstifadə nümunəsi:
const { 
  school,           // Single school for school admin
  schools,          // Multiple schools for sector admin
  selectedSchool,   // Current selected school
  selectSchool,     // School selection function
  searchSchools,    // Search functionality
  bulkOperations    // Bulk notification, etc.
} = useSchool({ 
  mode: 'single' | 'selector' | 'management',
  sectorId,
  schoolId 
});
```

#### 2.2 DataEntry Hooks Refactoring

**Mövcud:**
```
useDataEntry.ts (803 sətir) - Çox böyük
useDataEntryManager.ts (574 sətir) - Çox kompleks
```

**Hədəf:**
```typescript
// useDataEntry.ts - Sadə form operations (200-250 sətir)
export const useDataEntry = ({ categoryId, schoolId }) => {
  // Basic form data management
  // Form validation
  // Save and submit operations
}

// useDataEntryState.ts - State management (150-200 sətir)
export const useDataEntryState = ({ categoryId, schoolId }) => {
  // Data loading
  // Status management
  // Cache management
}

// useDataEntryActions.ts - Business actions (100-150 sətir)
export const useDataEntryActions = ({ categoryId, schoolId }) => {
  // Approval/rejection
  // Excel import/export
  // Bulk operations
}
```

### Mərhələ 3: Optimallaşdırma (2 həftə)

#### 3.1 Type Unification
```typescript
// types/dataEntry.ts - Vahid type definition
export interface DataEntry {
  id: string;
  school_id: string;
  category_id: string;
  column_id: string;
  value: string;
  status: DataEntryStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export enum DataEntryStatus {
  DRAFT = 'draft',
  PENDING = 'pending', 
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
```

#### 3.2 Service Layer Extract
```typescript
// services/dataEntry/
├── dataEntryService.ts      // CRUD operations
├── schoolService.ts         // School operations
├── validationService.ts     // Validation logic
├── statusService.ts         // Status transitions
└── cacheService.ts          // Cache management
```

## 📋 İcra Planı

### Həftə 1: Təcili Təmizlənmə

**Gün 1-2:**
- [ ] Köhnə faylları sil (`useDataUpdates.ts`, `useQuickWins.ts`, `useIndexedData.ts`)
- [ ] `index.ts` düzəlt
- [ ] Import referanslarını yoxla və düzəlt

**Gün 3-5:**
- [ ] Type definitions vahidləşdir
- [ ] Test fayllarını yoxla və düzəlt
- [ ] Documentation yenilə

**Təslim ediləcəklər:**
- ✅ 3 köhnə fayl silinib
- ✅ İndex.ts düzəldilib  
- ✅ Type errors həll edilib

### Həftə 2: Məktəb Hooks Birləşdirmə

**Gün 1-3:**
- [ ] `useSchool.ts` yenidən yaz (composite pattern)
- [ ] `useSchoolSelector.ts` və `useSchoolManagement.ts` funksionallığı daxil et
- [ ] Unit test yaz

**Gün 4-5:**
- [ ] Köhnə faylları sil
- [ ] İmport referanslarını yenilə
- [ ] Integration test

**Təslim ediləcəklər:**
- ✅ Vahid `useSchool.ts` hook-u
- ✅ 2 köhnə fayl silinib
- ✅ Test coverage >80%

### Həftə 3: DataEntry Refactoring

**Gün 1-3:**
- [ ] `useDataEntry.ts` sadələşdir (200-250 sətir hədəfi)
- [ ] `useDataEntryState.ts` yarat
- [ ] Core logic ayır

**Gün 4-5:**
- [ ] `useDataEntryManager.ts` yenidən struktur et
- [ ] Real-time funksionallığı optimallaşdır
- [ ] Performance test

**Təslim ediləcəklər:**
- ✅ Sadə və fokuslu hook-lar
- ✅ Performans 30% yaxşılaşması
- ✅ Kod oxunaqlığı artırılmış

### Həftə 4: Service Layer və Finalizasiya

**Gün 1-3:**
- [ ] Service layer yarat
- [ ] Business logic hook-lardan service-ə köçür
- [ ] Cache strategiyası tətbiq et

**Gün 4-5:**
- [ ] E2E test
- [ ] Performance benchmark
- [ ] Documentation tamamla

**Təslim ediləcəklər:**
- ✅ Tam ayrılmış service layer
- ✅ E2E test suite
- ✅ Performans raportu

## 🎯 Gözlənilən Nəticələr

### Quantitative Metrics

| Metric | Əvvəl | Sonra | Yaxşılaşma |
|--------|-------|--------|------------|
| **Fayl sayı** | 16 | 8-10 | 37-50% azalma |
| **Kod sətirlər** | 4,500 | 2,500 | 44% azalma |
| **Bundle size** | 180KB | 120KB | 33% azalma |
| **Təkrarçılıq** | 40% | <10% | 75% azalma |
| **Test coverage** | 45% | 85% | 89% artım |

### Qualitative Improvements

1. **Kod Oxunaqlığı**: Hər hook öz məsuliyyət sahəsində
2. **Maintainability**: Daha az fayl, daha təmiz struktur
3. **Performance**: Cache və lazy loading tətbiqi
4. **Developer Experience**: TypeScript intellisense yaxşılaşması
5. **Testability**: Unit testlər daha asan yazılır

## 🚨 Risk Assessment

### Yüksək Risk
- **Breaking changes**: Mövcud komponentlər hook import yollarını dəyişməli
- **Integration bugs**: Real-time funksionallıq pozula bilər

**Mitigation:**
- Progressive refactoring (bir-bir fayl)
- Comprehensive testing hər mərhələdə
- Backward compatibility layer

### Orta Risk  
- **Performance regression**: Service layer əlavə latency yarada bilər
- **Type errors**: TypeScript strict mode problemləri

**Mitigation:**
- Performance benchmark hər commit-də
- TypeScript strict check automation

## 📝 Növbəti Addımlar

### Təcili (Bu həftə)
1. **Team Meeting**: Refactoring planını müzakirə et
2. **Branch yaradın**: `feature/dataentry-hooks-refactoring`
3. **Backup**: Mövcud kodu Git tag-lə backup et
4. **İlk addım**: `useDataUpdates.ts`, `useQuickWins.ts`, `useIndexedData.ts` sil

### Qısa müddət (2 həftə)
1. **CI/CD Pipeline**: Hook refactoring üçün test add et
2. **Documentation**: README faylları yenilə
3. **Linting Rules**: Hooks üçün xüsusi eslint rules
4. **Component Audit**: Hansı komponentlər təsir ediləcək siyahısı

### Uzun müddət (1 ay)
1. **Performance Monitoring**: Bundle analyzer setup
2. **Advanced Caching**: Service worker cache strategiyası
3. **Error Boundaries**: Hook səviyyəsində error handling
4. **Accessibility**: Hook-ların a11y güvenliği

## 👥 Responsibility Matrix

| Vəzifə | Birinci | İkinci | Review |
|--------|---------|--------|--------|
| **Köhnə fayl silmə** | Backend Dev | - | Tech Lead |
| **Type unification** | Frontend Dev | Backend Dev | Tech Lead |
| **Hook refactoring** | Frontend Dev | - | Senior Dev |
| **Service layer** | Backend Dev | Frontend Dev | Tech Lead |
| **Testing** | QA | Frontend Dev | Tech Lead |
| **Documentation** | Tech Writer | Frontend Dev | Tech Lead |

## 📊 Success Criteria

### Must Have ✅
- [ ] Bundle size <130KB
- [ ] Fayl sayı <12
- [ ] Test coverage >75%
- [ ] Zero breaking changes for end users

### Should Have 🎯  
- [ ] Performance 25%+ yaxşılaşması
- [ ] Developer productivity artımı
- [ ] Code maintainability score >8/10

### Could Have 🌟
- [ ] Advanced caching implementation
- [ ] Real-time performance optimization
- [ ] A11y improvements

---

**Sənəd versiyası**: 1.0  
**Hazırlandı**: 04 İyun 2025  
**Son yenilənmə**: 04 İyun 2025  
**Təsdiq edildi**: Gözləyir  

**Məsul**: Frontend Development Team  
**Review**: Tech Lead & Senior Developer