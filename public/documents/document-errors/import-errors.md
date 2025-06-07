
# İdxal (Import) Xətaları və Həlləri

Bu sənəd InfoLine layihəsində rast gəlinən import xətaları və onların həll yollarını əhatə edir.

## 1. Mövcud Olmayan Modul İdxalı

**Problem**: İdxal edilmək istənilən modul və ya fayl mövcud deyil.

**Xəta Nümunələri**:
- `Module '"@/types/notification"' has no exported member named 'adaptDashboardNotificationToApp'`
- `Cannot find module '@/components/SomeComponent' or its corresponding type declarations`

**Həllər**:
- İdxal yollarını yoxlayın
- Mövcud olduğunu iddia etdiyiniz modulu və ya faylı yaradın
- Faylı və ya modulu düzgün ixrac edin

**Nümunə**:
```typescript
// Xəta:
import { adaptDashboardNotificationToApp } from '@/types/notification';

// Həll:
// 1. Notification.ts faylında funksiyanın mövcud olmasını təmin edin
export const adaptDashboardNotificationToApp = (notification) => {
  // funksiya implementasiyası
};

// 2. Əgər funksiyanın adı dəyişibsə, düzgün adla idxal edin
import { adaptAppToDashboardNotification } from '@/types/notification';
```

## 2. Yanlış İdxal Yolları

**Problem**: İdxal yolu səhv yazılıb və ya modul başqa bir yerdədir.

**Xəta Nümunələri**:
- `Module not found: Error: Can't resolve '@/components/ui/Input'`
- `Module not found: Error: Can't resolve '../utils/helpers'`

**Həllər**:
- İdxal yolunu düzgünləşdirin
- Növbəti (relative) və mütləq (absolute) yol istifadəsini düzgün tətbiq edin
- Faylın düzgün adını istifadə edin (böyük-kiçik hərflərə diqqət yetirin)

**Nümunə**:
```typescript
// Xəta: Komponent adı "Input" deyil, "input" ola bilər
import { Input } from '@/components/ui/Input';

// Həll: Düzgün ad və yolla idxal
import { Input } from '@/components/ui/input';
```

## 3. Dəyişdirilmiş İxrac (Export) Strukturu

**Problem**: İdxal edilən moduldakı ixrac strukturu dəyişib.

**Xəta Nümunələri**:
- `Named export 'X' not found`
- `'X' is not exported from 'Y'`

**Həllər**:
- Moduldakı ixrac strukturunu yoxlayın
- Default export və named export fərqini nəzərə alın
- Düzgün ixrac və idxal tipini istifadə edin

**Nümunə**:
```typescript
// Modul faylı:
// export default function Something() { ... }
// YANLIŞ idxal:
import { Something } from './Something';
// DOĞRU idxal:
import Something from './Something';

// Və ya əksinə:
// export function Something() { ... }
// YANLIŞ idxal:
import Something from './Something';
// DOĞRU idxal:
import { Something } from './Something';
```

## 4. Barrel Exports Problemləri

**Problem**: Barrel exports (index.ts vasitəsilə ixrac) istifadə edərkən yaranan problemlər.

**Xəta Nümunələri**:
- `Export 'X' was not found in 'Y'`
- `Attempted import error: 'X' is not exported from 'Y'`

**Həllər**:
- Barrel exports faylını (index.ts) düzgün konfiqurasiya edin
- Re-export əməliyyatlarının düzgün aparılmasını təmin edin
- Dairəvi asılılıqlardan (circular dependencies) qaçının

**Nümunə**:
```typescript
// types/index.ts
export * from './user';
export * from './dashboard';
export * from './notification';

// İdxal:
import { User, Dashboard, Notification } from '@/types';
```

## 5. Tipler və Həqiqi İmplementasiya Arasında Uyğunsuzluq

**Problem**: İdxal edilən modul və ya tipin real implementasiyası idxal edilən interfeysə uyğun gəlmir.

**Xəta Nümunələri**:
- `Property 'X' is missing in type 'Y' but required in type 'Z'`
- `Type 'X' is not assignable to type 'Y'`

**Həllər**:
- İnterfeysləri və implementasiyanı uyğunlaşdırın
- Tip və implementasiya fayllarlnı birlikdə yeniləyin
- Tip adaptasiyası üçün adapter funksiyalar yazın

**Nümunə**:
```typescript
// İnterfeys:
interface User {
  id: string;
  name: string;
  email: string;
}

// İmplementasiyada email xassəsi yoxdur:
const user = {
  id: '123',
  name: 'Anar'
};

// Həll: Adaptor funksiyası yazın
function adaptToUser(data: any): User {
  return {
    id: data.id,
    name: data.name,
    email: data.email || ''
  };
}
```

## Həll olunmuş xətalar

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Module '"@/types/notification"' has no exported member named 'adaptDashboardNotificationToApp' | `notificationUtils.ts` faylında funksiya yaradıldı və ixrac edildi | 2025-05-08 |
| '"@/types/column"' has no exported member 'columnTypeDefinitions' | `column.ts` faylında `columnTypeDefinitions` əlavə edildi | 2025-05-08 |
| Module '"@/types/dashboard"' has no exported member named 'DashboardStats' | `DashboardStatus` tipindən istifadə edildi | 2025-05-08 |

## Digər xətalar

Burada əlavə idxal xətalarını və həllərini qeyd edə bilərsiniz:

1. ...
2. ...
3. ...
