
# Xəta Həlləri Sənədi

Bu sənəd InfoLine layihəsində üzləşilən xətaları, onların həll yollarını və bu xətalara gələcəkdə rast gəlinməməsi üçün strategiyaları əhatə edir.

## Tip Xətaları

### 1. İnterfeys Uyğunsuzluqları

**Problem**: İnterfeys və tip təriflərinin müxtəlif fayllar arasında uyğunsuzluqları.

**Həll**:
- Mümkün olduğu qədər bir tərif mənbəyi istifadə edin.
- Mövcud tipləri genişləndirməyə üstünlük verin, yeni tiplər yaratmaq əvəzinə.

**Nümunə**:
```typescript
// Yanlış:
interface User { ... }
interface UserData { ... } // User ilə təxminən eyni

// Doğru:
interface User { ... }
interface UserWithDetails extends User { ... }
```

### 2. İdxal (Import) Xətaları

**Problem**: Düzgün olmayan və ya mövcud olmayan modullardan idxal.

**Həll**:
- İdxal yollarını yoxlayın.
- Barrel exports istifadə edin: index.ts vasitəsilə modulu ixrac edin.

**Nümunə**:
```typescript
// src/types/index.ts
export * from './user';
export * from './dashboard';
```

### 3. İsteğe Bağlı Xassələr

**Problem**: Məcburi xassə gözlənilən yerdə isteğe bağlı xassə.

**Həll**:
- Funksiya və komponent parametrlərində varsayılan dəyər verin.
- Zod və ya class-validator istifadə edin.

**Nümunə**:
```typescript
function processUser(user: User, options: Options = {}) {
  // ...
}
```

### 4. "Any" və "Unknown" İstifadəsi

**Problem**: `any` təhlükəsiz tiplərin təhlükəsizliyini azaldır.

**Həll**:
- `any` əvəzinə `unknown` istifadə edin və tip yoxlamasından keçirin.
- Ümumi tiplər (Generics) istifadə edin.

**Nümunə**:
```typescript
// Yanlış:
function process(data: any) { ... }

// Doğru:
function process<T>(data: T) { ... }

// Yanlış:
const result: any = api.getData();

// Doğru:
const result: unknown = api.getData();
if (typeof result === 'object' && result !== null) {
  // ...
}
```

### 5. Obyekt Literal Xətaları

**Problem**: Tipə uyğun gəlməyən əlavə xassələrin təyin edilməsi.

**Həll**:
- Yalnız tip təriflərində mövcud xassələri təyin edin.
- Yeni əlavə ediləcək xassələr varsa, tipi yeniləyin.

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

// Doğru:
interface UserWithAddress extends User {
  address?: string;
}

const userWithAddress: UserWithAddress = {
  name: "Ali",
  age: 30,
  address: "Bakı"
};
```

## Komponent və Props Xətaları

### 1. Props Uyğunsuzluğu

**Problem**: Props tipləri ötürülən dəyərlərlə uyğun gəlmir.

**Həll**:
- Props interface-ni düzgün təyin edin.
- PropTypes və ya TypeScript istifadə edin.
- Çoxlu props əvəzinə bir obyekt ötürün.

### 2. DOM Element Xətaları

**Problem**: JSX elementlərinə ötürülən xassələrin DOM tipləri ilə uyğunsuzluğu.

**Həll**:
- React.ComponentProps<> və ya JSX.IntrinsicElements tipindən istifadə edin.

**Nümunə**:
```typescript
type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary';
};
```

## Adaptasiya Strategiyaları

### 1. Adapterlər

**Problem**: Müxtəlif mənbələrdən gələn eyni məlumatların fərqli formatları.

**Həll**:
- Adaptor funksiyaları yaradın.
- Normalizasiya üçün yardımçı funksiyalar yazın.

**Nümunə**:
```typescript
function adaptUserFromApi(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    name: apiUser.fullName,
    // ...əlavə xassələri adaptasiya et
  };
}
```

### 2. Köməkçi Tiplər

**Problem**: Eyni və ya oxşar tiplərin təkrarlanması.

**Həll**:
- Mənbə tiplərindən törəmə tiplər yaradın.
- Utility tiplərindən istifadə edin (Partial, Pick, Omit və s.).

**Nümunə**:
```typescript
type UserFormData = Omit<User, 'id'> & {
  confirmPassword?: string;
};
```

## Bildirilmiş Xəta Həlləri

### 1. "columnTypes" və "columnTypeDefinitions" mövcud deyil

**Xəta**: `columnTypes` və ya `columnTypeDefinitions` export edilmir.

**Həll**: `column.d.ts` faylında əlavə və export edildi:
```typescript
export const columnTypeDefinitions: Record<string, { ... }> = { ... };
export const columnTypes = columnTypeDefinitions;
```

### 2. "date" xassəsi "PendingApproval" tipində mövcud deyil

**Xəta**: PendingApproval tipində "date" xassəsi təyin edilməyib.

**Həll**: `dashboard.d.ts` faylında PendingApproval tipinə "date" xassəsi əlavə edildi:
```typescript
export interface PendingApproval {
  // ... digər xassələr
  date?: string; // əlavə edildi
}
```

### 3. DashboardStatus və DashboardFormStats uyğunsuzluqları

**Xəta**: Status obyektlərinə məcburi xassələr çatışmır.

**Həll**: Tam DashboardStatus tipi təyin edildi və istifadə olundu:
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
```

### 4. Logo komponenti tapılmadı 

**Xəta**: Sidebar komponentində istifadə edilən Logo komponenti mövcud deyildi.

**Həll**: `src/components/layout/Logo.tsx` yaradıldı və komponent əlavə edildi.

### 5. SectorSchool interfeysi üçün çatışmayan xassələr

**Xəta**: SectorSchool interfeysi üçün bir sıra xassələr əskik idi.

**Həll**: `school.ts` faylında SectorSchool interfeysinə əlavə xassələr əlavə edildi:
```typescript
export interface SectorSchool extends School {
  // ... digər xassələr
  lastUpdate?: string;
  pendingForms?: number;
  formsCompleted?: number;
  totalForms?: number;
  // ... və s.
}
```

## Ən Yaxşı Praktikalar

1. **Tip tərifləmələrini təşkil edin**:
   - `types/` qovluğunda sahəyə görə qruplaşdırın.
   - Əlaqədar tipləri eyni faylda saxlayın.

2. **İnterfeyslərdə konvensiya saxlayın**:
   - Camel case istifadə edin: `userId` vs `user_id`.
   - Adi formatları (snake_case, camelCase) qarışdırmayın.

3. **İnterfeyslərə şərh əlavə edin**:
   - Mürəkkəb xassələr üçün JSDoc şərhləri yazın.

4. **Tip genişləndirmə və kompozisiyadan istifadə edin**:
   - İnterfeyslər arasında təkrarı azaldın.

5. **Test tiplərini yazın**:
   - Mürəkkəb tiplər üçün yoxlama testləri əlavə edin.
   - Type guard funksiyaları yazın.

Bu sənəd müntəzəm olaraq yenilənəcək və yeni xəta həlləri əlavə ediləcəkdir.

## Əlavə Edilmiş Son Xətalar

### 1. Obyekt literal xətaları

**Xəta**: UserFormData tipində "full_name", "sector_id", "region_id", "school_id" xassələri mövcud deyil, onların əvəzinə "fullName", "sectorId", "regionId", "schoolId" istifadə edilməlidir.

**Həll**: `user.ts` və `user.d.ts` fayllarında tipləri birləşdirdik və hər iki formaya dəstək əlavə etdik:
```typescript
export interface UserFormData {
  email: string;
  fullName: string;
  full_name?: string; // Əlavə edildi
  // ... və s.
}
```

### 2. Column tipləri ilə bağlı xətalar

**Xəta**: "ColumnType", "ColumnFormValues" və digər tiplərin olmaması ilə bağlı TypeScript xətaları.

**Həll**: Bu tiplər üçün tam təriflər `column.d.ts` faylında yaradıldı.

### 3. Uyğunsuz prop tipləri

**Xəta**: EditSchoolDialog və başqa komponentlərdə gözlənilməyən proplar.

**Həll**: EditSchoolDialog və SchoolForm komponentləri üçün tam prop tipləri əlavə edildi.

### 4. SectorAdminDashboard-da formStats çatışmır

**Xəta**: SectorAdminDashboard komponentində StatusCards propunun daxilində formStats məcburi idi, lakin təmin edilmirdi.

**Həll**: Komponentdə formStats-ı mövcud məlumatlardan yaratdıq:
```typescript
formStats={data.formStats || {
  pending: data.status.pending,
  approved: data.status.approved,
  rejected: data.status.rejected,
  total: data.status.total,
  dueSoon: 0,
  overdue: 0
}}
```
