# Tip Xətaları

Bu sənəd InfoLine layihəsində rast gəlinən tip xətaları və onların həll yollarını əhatə edir.

## 1. İnterfeys Uyğunsuzluqları

**Problem**: İnterfeys və tip təriflərinin müxtəlif fayllar arasında uyğunsuzluqları.

**Xəta Nümunələri**:
- `Type 'X' is not assignable to type 'Y'`
- `Property 'X' is missing in type 'A' but required in type 'B'`

**Həllər**:
- Mümkün olduğu qədər bir tərif mənbəyi istifadə edin
- Mövcud tipləri genişləndirməyə üstünlük verin, yeni tiplər yaratmaq əvəzinə
- Fayllar arasında tipləri düzgün ixrac və idxal edin

**Nümunə**:
```typescript
// Yanlış:
interface User { ... }
interface UserData { ... } // User ilə təxminən eyni

// Doğru:
interface User { ... }
interface UserWithDetails extends User { ... }
```

## 2. Məcburi və İsteğe bağlı Xassələr

**Problem**: Məcburi xassə gözlənilən yerdə isteğe bağlı xassə və ya əksinə.

**Xəta Nümunələri**:
- `Property 'X' is missing in type 'Y'`
- `Property 'X' is optional in type 'A' but required in type 'B'`

**Həllər**:
- Funksiya və komponent parametrlərində varsayılan dəyər verin
- Tipin tərifində xassənin məcburiliyi düzgün təyin edin (`?` işarəsi)
- İnterfeyslərin iyerarxiyasını düzgün qurun

**Nümunə**:
```typescript
// Xəta: interfeysdə name məcburi olduğu halda obyektdə verilməyib
interface UserProps {
  name: string; // məcburi xassə
  age?: number; // isteğe bağlı xassə
}

// Həll 1: Bütün məcburi xassələri təmin edin
const user: UserProps = {
  name: "Əli" // məcburi xassə təmin edildi
};

// Həll 2: Tipi dəyişdirin
interface OptionalUserProps {
  name?: string; // indi isteğe bağlıdır
  age?: number;
}
```

## 3. "Any" və "Unknown" İstifadəsi

**Problem**: `any` təhlükəsiz tiplərin təhlükəsizliyini azaldır.

**Xəta Nümunələri**:
- `Unsafe assignment of an 'any' value`
- `'X' is declared but its value is never read`

**Həllər**:
- `any` əvəzinə `unknown` istifadə edin və tip yoxlamasından keçirin
- Ümumi tiplər (Generics) istifadə edin
- Tip təhlükəsizliyini qorumaq üçün tip assertionları istifadə edin

**Nümunə**:
```typescript
// Yanlış:
function process(data: any) { 
  return data.someProperty; // təhlükəsizdir
}

// Doğru:
function process<T>(data: T) { 
  // tip təhlükəsizliyi qorunur
  return data;
}

// Yanlış:
const result: any = api.getData();

// Doğru:
const result: unknown = api.getData();
if (typeof result === 'object' && result !== null && 'property' in result) {
  // Təhlükəsiz işləmə
}
```

## 4. Obyekt Literal Xətaları

**Problem**: Tipə uyğun gəlməyən əlavə xassələrin təyin edilməsi.

**Xəta Nümunələri**:
- `Object literal may only specify known properties`
- `Type '{ a: string; b: number; c: boolean; }' is not assignable to type 'Props'`

**Həllər**:
- Yalnız tip təriflərində mövcud xassələri təyin edin
- Yeni əlavə ediləcək xassələr varsa, tipi yeniləyin
- İndeksləmə imzaları istifadə edin (`[key: string]: any`)

**Nümunə**:
```typescript
// Tip:
interface User {
  name: string;
  age: number;
}

// Yanlış:
const user: User = {
  name: "Ali",
  age: 30,
  address: "Bakı" // Xassə User tipində mövcud deyil
};

// Həll 1: İnterfeysə xassə əlavə edin
interface UserWithAddress extends User {
  address?: string;
}

// Həll 2: İndeksləmə imzası istifadə edin
interface FlexibleUser {
  name: string;
  age: number;
  [key: string]: any; // əlavə xassələrə icazə verir
}
```

## 5. Tip Çevrilməsi Xətaları

**Problem**: Uyğun olmayan tiplər arasında çevrilmələr.

**Xəta Nümunələri**:
- `Type 'string' is not assignable to type 'number'`
- `Argument of type 'X' is not assignable to parameter of type 'Y'`

**Həllər**:
- Tipləri çevirmək üçün uyğun funksiyalar istifadə edin (parseInt, parseFloat, və s.)
- Tip assertionlarını düzgün tətbiq edin
- Tip təhlükəsizliyini qorumaq üçün kontrol tiplər istifadə edin

**Nümunə**:
```typescript
// Yanlış:
const userInput = "42";
const value: number = userInput; // Xəta

// Doğru:
const userInput = "42";
const value: number = parseInt(userInput, 10);

// Tip Assertionu:
const element = document.getElementById('root') as HTMLDivElement;
```

## Həll olunmuş xətalar

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Property 'schoolName' does not exist on type 'PendingApproval' | PendingApproval interfeysinə 'schoolName' xassəsi əlavə edildi | 2025-05-08 |
| Property 'lastUpdate' is optional in type 'SchoolStat' but required in type 'SchoolStat' | SchoolStat interfeysi normallaşdırıldı və fayllar arasında uyğunlaşdırıldı | 2025-05-08 |
| Type 'number' is not assignable to string | Validation yoxlamaları üçün tip çevrilmələri əlavə edildi | 2025-05-08 |

## Digər xətalar

Burada olan xətaları və həllərini qeyd edə bilərsiniz:

1. ...
2. ...
3. ...

## PendingApproval Tip Xətaları

**Problem:** PendingApproval tipində `schoolName`, `categoryName` və `submittedAt` xassələri mövcud deyildi.

**Həll:** `dashboard.d.ts` və `dashboard.ts` fayllarda PendingApproval tipini genişləndirdik və əlavə xassələri əlavə etdik:

```typescript
export interface PendingApproval {
  id: string;
  schoolId?: string;
  schoolName: string;
  categoryId?: string;
  categoryName: string;
  submittedAt: string;
  date?: string;
  status: 'pending' | 'approved' | 'rejected';
}
```

## DashboardStatus və DashboardFormStats Tip Xətaları

**Problem:** DashboardStatus tipində `active` və `inactive` xassələri yox idi, DashboardFormStats tipində isə `dueSoon` və `overdue` xassələri mövcud deyildi.

**Həll:** `dashboard.ts` faylında bu tipləri tamamladıq və SchoolAdminDashboard komponentində istifadə etdiyimiz obyektləri bu tiplərə uyğunlaşdırdıq:

```typescript
export interface DashboardStatus {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  total: number;
  active: number; 
  inactive: number; 
}

export interface DashboardFormStats {
  pending: number;
  approved: number;
  rejected: number;
  draft?: number;
  dueSoon: number;
  overdue: number;
  incomplete?: number;
  total: number;
}
```

## DeadlineItem və FormItem Xassə Adları

**Problem:** `FormTabs.tsx` faylında `categoryName` xassəsi istifadə edilirdi, lakin tip təriflərində bu xassənin adı `category` idi.

**Həll:** Tiplərə `categoryName` xassəsini əlavə etdik:

```typescript
export interface DeadlineItem {
  // ... mövcud xassələr
  categoryName?: string;
}

export interface FormItem {
  // ... mövcud xassələr
  categoryName?: string;
}
```

## SchoolStats Tip Uyğunsuzluğu

**Problem:** `school.ts` və `dashboard.ts` fayllarda eyni adlı (SchoolStat) fərqli tiplər var idi.

**Həlli:** Tipdəki xassələrin adlarını uyğunlaşdırdıq.

## notificationUtils Funksiya Adları

**Problem:** `adaptDashboardToAppNotification` və `adaptAppToDashboardNotification` funksiyaları `notificationUtils.ts` faylında mövcud deyildi.

**Həll:** Bu funksiyaları əlavə etdik və mövcud `adaptDashboardNotificationToApp` və `adaptAppNotificationToDashboard` funksiyalarına istinad etdik:

```typescript
export const adaptDashboardToAppNotification = adaptDashboardNotificationToApp;
export const adaptAppToDashboardNotification = adaptAppNotificationToDashboard;
```
