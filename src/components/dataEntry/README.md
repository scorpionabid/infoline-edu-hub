# İnfoLine DataEntry Modulu

Bu qovluq İnfoLine layihəsinin məlumat girişi modulunu təşkil edir. UUID indeksləmə yanaşması və adapter pattern istifadə edərək komponentlər arasında daha yaxşı əlaqə və performans təmin edir.

## 📂 Qovluq Strukturu

```
📂 components/dataEntry/
  ├── 📂 core/             // Əsas form komponentləri
  │   ├── DataEntryForm.tsx
  │   ├── FormFields.tsx
  │   ├── DataEntryFormContent.tsx
  │   └── index.ts
  ├── 📂 shared/           // Paylaşılan UI komponentləri
  │   ├── DataEntryFormLoading.tsx
  │   ├── DataEntryFormError.tsx
  │   └── index.ts
  ├── 📂 fields/           // Sahə komponentləri
  │   ├── FieldRendererSimple.tsx
  │   ├── FieldRenderer.tsx
  │   └── 📂 adapters/     // Sadələşdirilmiş sahə adapterleri
  │       ├── InputFieldAdapter.tsx
  │       ├── TextAreaAdapter.tsx
  │       ├── SelectAdapter.tsx
  │       ├── CheckboxAdapter.tsx
  │       ├── RadioAdapter.tsx
  │       └── DateAdapter.tsx
  ├── 📂 status/           // Status komponentləri
  │   ├── StatusBadge.tsx
  │   └── index.ts
  ├── 📂 utils/            // Köməkçi funksiyalar
  │   └── formUtils.ts
  └── index.ts             // Mərkəzi ixrac faylı
```

## 🧮 UUID İndeksləmə Sistemi

Məlumat girişində UUID açarları ilə işləmək üçün standartlaşdırılmış yanaşma:

```typescript
// src/utils/dataIndexing.ts
import { createIndexedMap, safeGetByUUID } from '@/utils/dataIndexing';

// Massivdən UUID-yə əsaslanan obyekt yaratmaq
const entriesMap = createIndexedMap(entries, 'column_id');

// UUID açarına təhlükəsiz giriş
const entry = safeGetByUUID(entriesMap, columnId);
```

## 🔄 FieldRenderer Adapter Pattern

Sahə komponentləri prop uyğunsuzluqlarını həll etmək üçün adapter pattern istifadə edir:

```typescript
// Sadələşdirilmiş FieldRenderer
<FieldRendererSimple
  type={column.type}
  value={field.value}
  onChange={field.onChange}
  disabled={disabled}
  required={!!column.is_required}
  readOnly={readOnly}
  options={column.options}
/>
```

## 📋 Import Qaydaları

Komponentləri import etmək üçün mərkəzi index faylını istifadə edin:

```typescript
// Tövsiyə olunan import üsulu
import { DataEntryForm, StatusBadge, FieldRendererSimple } from '@/components/dataEntry';
```

## ⚠️ Diqqət Edilməli Məqamlar

1. **UUID açarları ilə işləyərkən**:
   - Birbaşa massivdə axtarış (`find()`) əvəzinə indekslənmiş obyektlərdən istifadə edin
   - Açarın mövcudluğunu yoxlamadan əvvəl `safeGetByUUID()` funksiyasını istifadə edin

2. **Yeni sahələr əlavə edərkən**:
   - `fields/adapters/` qovluğunda uyğun adapter yaradın
   - `FieldRendererSimple.tsx` faylında yeni sahə tipini əlavə edin

3. **Yeni komponentlər yaradarkən**:
   - Uyğun qovluqda yerləşdirin
   - Əsas `index.ts` faylında ixrac edin

## 🚀 UUID İndeksləmə Performans Faydaları

- **Əvvəlki yanaşma**: Array.find() ilə O(n) axtarış mürəkkəbliyi
- **Yeni yanaşma**: Obyekt indeksləmə ilə O(1) axtarış mürəkkəbliyi

Nəticədə, böyük məlumat massivlərində axtarış xeyli sürətlənir və UUID açarları ilə bağlı xətalar aradan qalxır.
