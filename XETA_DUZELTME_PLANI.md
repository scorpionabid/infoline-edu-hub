# İnfoLine Data Entry Xəta Düzəltmə Planı

## Problem:
- `data_entries` cədvəlinə POST sorğusunda `created_by` sahəsinə "system" string dəyəri göndərilir
- UUID sahəsinə string göndərilməsi 400 Bad Request xətası yaradır
- Console log: "invalid input syntax for type uuid: 'system'"

## Problem yerləri:

### 1. Yanlış Supabase çağırışları
Network activity göstərir ki, direkt REST API çağırışında:
```
POST /rest/v1/data_entries?columns="column_id","category_id","school_id","value","status","created_by","created_at","updated_at"&select=*
```

### 2. Düzgun çağırış olmalıdır:
```typescript
supabase.from('data_entries').insert([
  {
    column_id: uuid,
    category_id: uuid,
    school_id: uuid,
    value: string,
    status: string,
    created_by: uuid, // UUID, "system" yox!
    created_at: timestamp,
    updated_at: timestamp
  }
])
```

## Düzəltmə addımları:

### 1. services/api/dataEntry.ts - düzgündür ✅
UUID validation var və işləyir.

### 2. useDataEntriesQuery hook-unu yoxlayın
`src/hooks/api/dataEntry/useDataEntriesQuery.ts`-də user.id düzgün ötürülməsini yoxlayın.

### 3. Components-də direkt supabase çağırışları axtarın
Aşağıdakı patterns axtarın:
- `supabase.from('data_entries').insert()`
- Yanlış `columns` parametri göndərilməsi
- `created_by: 'system'` hardcode dəyəri

### 4. Yoxlanmalı fayllar:
- `/src/components/dataEntry/**/*.tsx`
- `/src/hooks/dataEntry/**/*.ts`
- `/src/services/dataEntryService.ts`

### 5. Network tab-dan yoxlayın:
- POST çağırışının body-sində `created_by` dəyərini yoxlayın
- `columns` parametrinin niyə URL query-də olduğunu yoxlayın

## Həll yolu:
1. Bütün data entry çağırışlarını `services/api/dataEntry.ts` vasitəsilə edin
2. Direkt supabase çağırışları aradan qaldırın
3. UUID validation-ı gücləndirin
4. "system" string-ini heç yerdə created_by sahəsinə təyin etməyin

## Test üçün:
1. Console-da user.id UUID formatında olduğunu yoxlayın
2. Network tab-da POST body-ni yoxlayın
3. Components-də console.log əlavə edin ki, dəyərləri izləyin
