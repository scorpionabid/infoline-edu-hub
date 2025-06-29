# Hook Strukturu

Bu sənəd, InfoLine layihəsində istifadə olunan hook strukturunu təsvir edir. Bu struktur, təkrarçılığı azaltmaq, performansı artırmaq və kodun daha yaxşı idarə olunmasını təmin etmək məqsədi ilə yaradılmışdır.

## Ümumi Struktur

Hook-lar aşağıdakı qovluq strukturunda təşkil olunmuşdur:

```
src/hooks/
├── core/             # Əsas utility hook-ları
├── api/              # API sorğuları üçün React Query əsaslı hook-lar
│   ├── categories/   # Kateqoriyalarla əlaqəli hook-lar
│   ├── dataEntry/    # Məlumat daxil etmə ilə əlaqəli hook-lar
│   └── ...
└── business/         # Business logic hook-ları
    ├── dataEntry/    # Məlumat daxil etmə ilə əlaqəli business hook-ları
    └── ...
```

## Core Hook-lar

Bu hook-lar, bütün tətbiq boyunca istifadə olunan əsas utility funksiyalarını təmin edir.

### useIndexedData

UUID və ya digər açarlarla indekslənmiş data strukturlarını yaratmaq üçün hook.

```typescript
import { useIndexedData } from '@/hooks/core/useIndexedData';

// İstifadə nümunəsi
const { map, getItem, hasItem } = useIndexedData(dataArray, 'id');

// map - Açar-dəyər cütlüklərindən ibarət obyekt
// getItem - ID ilə elementi almaq üçün funksiya
// hasItem - ID-nin mövcudluğunu yoxlamaq üçün funksiya
```

### useErrorHandler

Standartlaşdırılmış xəta emalı üçün hook.

```typescript
import { useErrorHandler } from '@/hooks/core/useErrorHandler';

// İstifadə nümunəsi
const { handleError } = useErrorHandler('ModulAdı');

// Xətanı emal etmək
try {
  // Əməliyyat
} catch (error) {
  handleError(error, 'Xəta baş verdi');
}
```

## API Hook-ları

Bu hook-lar, API ilə əlaqə qurmaq və server məlumatlarını idarə etmək üçün React Query istifadə edir.

### useCategoriesQuery

Kateqoriyaların siyahısını əldə etmək və idarə etmək üçün hook.

```typescript
import { useCategoriesQuery } from '@/hooks/api/categories/useCategoriesQuery';

// İstifadə nümunəsi
const {
  data,
  isLoading,
  isError,
  error,
  createCategory,
  updateCategory,
  deleteCategory
} = useCategoriesQuery({ 
  status: 'active',
  search: 'axtarış sözü'
});
```

### useCategoryQuery

Konkret bir kateqoriyanı və onun sütunlarını əldə etmək üçün hook.

```typescript
import { useCategoryQuery } from '@/hooks/api/categories/useCategoryQuery';

// İstifadə nümunəsi
const {
  category,
  columns,
  isLoading,
  isError,
  error
} = useCategoryQuery({ categoryId: 'kateqoriya-id' });
```

### useDataEntriesQuery

Məlumat daxil etmələrini əldə etmək və idarə etmək üçün hook.

```typescript
import { useDataEntriesQuery } from '@/hooks/api/dataEntry/useDataEntriesQuery';

// İstifadə nümunəsi
const {
  entries,
  isLoading,
  isError,
  error,
  saveEntries,
  updateStatus
} = useDataEntriesQuery({ 
  categoryId: 'kateqoriya-id',
  schoolId: 'məktəb-id'
});
```

## Business Hook-ları

Bu hook-lar, istifadəçi interfeysi ilə API arasında körpü rolunu oynayır və business logic-i idarə edir.

### useDataEntryState

Məlumat daxil etmə vəziyyətini idarə etmək üçün hook.

```typescript
import { useDataEntryState } from '@/hooks/business/dataEntry/useDataEntryState';

// İstifadə nümunəsi
const {
  entries,
  entriesMap,
  isLoading,
  error,
  updateEntryValue,
  getEntryByColumnId,
  hasEntryForColumn
} = useDataEntryState({ 
  categoryId: 'kateqoriya-id',
  schoolId: 'məktəb-id'
});
```

### useDataEntry

Məlumat daxil etmə formasını tam olaraq idarə etmək üçün yüksək səviyyəli hook.

```typescript
import { useDataEntry } from '@/hooks/business/dataEntry/useDataEntry';

// İstifadə nümunəsi
const {
  category,
  columns,
  entries,
  entriesMap,
  isLoading,
  isSaving,
  hasAllRequiredData,
  completionPercentage,
  updateEntryValue,
  saveAll,
  submitAll
} = useDataEntry({ 
  categoryId: 'kateqoriya-id',
  schoolId: 'məktəb-id',
  onComplete: () => console.log('Tamamlandı')
});
```

## React Query İntegrasiyası

Bütün API hook-ları, React Query v5 üzərində qurulmuşdur. Sorğu açarları `src/services/api/queryKeys.ts` faylında standartlaşdırılmışdır.

```typescript
import { categoryKeys, dataEntryKeys } from '@/services/api/queryKeys';

// Sorğu açarı nümunələri
const categoryListKey = categoryKeys.list({ status: 'active' });
const categoryDetailKey = categoryKeys.detail('kateqoriya-id');
const dataEntriesKey = dataEntryKeys.byCategoryAndSchool('kateqoriya-id', 'məktəb-id');
```

## Yeni Hook-lara Keçid

Təkrarçılığın qarşısını almaq və kodun daha yaxşı idarə olunmasını təmin etmək üçün, köhnə hook-lardan yeni hook-lara keçid tövsiyə olunur.

### Köhnə Hook-lar (Deprecated)

Aşağıdakı hook-lar köhnəlmiş və yeni versiyalarla əvəz olunmuşdur:

- `src/hooks/dataEntry/useDataEntryState.ts` → `src/hooks/business/dataEntry/useDataEntryState.ts`
- `src/hooks/dataEntry/useCategoryData.ts` → `src/hooks/api/categories/useCategoryQuery.ts`

### Yeni Hook-ların Üstünlükləri

1. **Daha Yaxşı Performans**: React Query-nin caching imkanları sayəsində təkrarlanan sorğuların qarşısı alınır.
2. **Daha Yaxşı Xəta Emalı**: Standartlaşdırılmış xəta emalı sistemi.
3. **Daha Aydın API**: Funksiyaların və parametrlərin daha aydın təşkili.
4. **Yüksək Dərəcədə Test Edilə Bilən**: Modullar ayrılmış olduğu üçün daha yaxşı test imkanları.

## Test Komponenti

Hook strukturunu test etmək üçün, Forms səhifəsində test komponenti əlavə edilmişdir. Bu komponent, yeni hook strukturunun necə işlədiyini göstərir və yeni hook-ların istifadə nümunəsini təqdim edir.

## Digər Resurslar

- [React Query Dokumentasiyası](https://tanstack.com/query/latest/docs/react/overview)
- [React Hooks Dokumentasiyası](https://reactjs.org/docs/hooks-intro.html)
