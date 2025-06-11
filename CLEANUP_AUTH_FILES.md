# İnfoLine Auth Sistem Təmizləməsi

## SİLİNƏCƏK FAYLLAR (Təkrarçılıq və Deprecated)

### 1. Deprecated Auth Context
- [ ] `/src/context/AuthContext.tsx` - DEPRECATED, Zustand istifadə olunur

### 2. Duplicate Type Definitions 
- [ ] `/src/types/user.d.ts` - Duplicate, `/src/types/auth.ts` istifadə olunur
- [ ] `/src/types/user.ts` - Partial duplicate, `/src/types/auth.ts`-ə merge ediləcək
- [ ] `/src/types/role.ts` - Duplicate, `/src/types/auth.ts` istifadə olunur

### 3. Type Import Consolidation
- [ ] `/src/types/supabase.ts` - UserRole və FullUserData silmək, `/src/types/auth.ts`-dən import

## EXPORT KONSOLIDASIYASI

### Main Auth Types Export
```typescript
// /src/types/index.ts (yeni fayl)
export * from './auth';
export * from './supabase';
export * from './category';
// ...digər types
```

### Import Path Standardization
```typescript
// Əvvəl:
import { UserRole } from '@/types/user';
import { FullUserData } from '@/types/supabase';

// Sonra:
import { UserRole, FullUserData } from '@/types/auth';
```

## SİLMƏ ARDICILLIB

1. **Backup götür** - Silmədən əvvəl duplicate content-i yoxla
2. **Import references yoxla** - Hansı faylların bu types-ləri import etdiyini tap
3. **Import path-ları update et** - Hamısını `/src/types/auth.ts`-ə yönləndir  
4. **Test et** - TypeScript xətalarını həll et
5. **Sil** - Duplicate faylları sil

## TESPİT EDİLMİŞ IMPORT DEPENDENCY-LƏR

Bu fayllar yoxlanmalı və import path-ları update edilməlidir:
- `/src/routes/AppRoutes.tsx` - UserRole import
- `/src/components/**/*.tsx` - FullUserData imports
- `/src/hooks/**/*.ts` - Type imports  
- `/src/services/**/*.ts` - Type imports

## MERGE STRATEGY

### user.ts -> auth.ts merge
`/src/types/user.ts`-dəki unikal type-lar `/src/types/auth.ts`-ə əlavə et:
- `UserFilter` interface
- `UserFormData` specific fields
- `NotificationSettings` (əgər fərqli definisiya varsa)

### Testing Checklist
- [ ] Login/logout işləyir
- [ ] Permission system işləyir  
- [ ] Route protection işləyir
- [ ] Type definitions düzgündür
- [ ] No TypeScript errors
- [ ] No console errors
