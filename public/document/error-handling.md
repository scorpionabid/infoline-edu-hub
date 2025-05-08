
# Xəta Həll Etmə Qaydaları

Bu sənəd layihədə qarşılaşdığımız və həll etdiyimiz xətalar və onların həll yolları haqqında məlumat verir. Bu, gələcəkdə eyni xətalarla qarşılaşdıqda referans kimi istifadə edilə bilər.

## TypeScript Xətaları və Həlləri

### 1. İdxal və İxrac Xətaları

- **Xəta:** `Module X has no exported member Y`
- **Həll:** İdxal edilən modulun düzgün ixrac etdiyi elementləri yoxlayın. Lazım olan elementin ixrac edilib-edilmədiyini və adının düzgün olmasını yoxlayın.

### 2. Type Uyğunsuzluq Xətaları

- **Xəta:** `Type X is not assignable to type Y`
- **Həll:** Tip tərifləri arasında uyğunsuzluq var. Tiplərə yeni xassələr əlavə etmək və ya mövcud xassələri düzəltmək lazım ola bilər.

### 3. Olmayan Xassə Xətaları

- **Xəta:** `Property X does not exist on type Y`
- **Həll:** Tip tərifinə əksik olan xassəni əlavə edin və ya mövcud bir xassəni istifadə edin.

### 4. Requst/Response Tip Xətaları

- **Xəta:** API sorğu və cavab tipləri arasında uyğunsuzluq
- **Həll:** API adaptasiya funksiyaları yaradın ki, müxtəlif formatlarda olan məlumatlar uyğun tiplərə çevrilsinlər.

### 5. İstifadəçi Xassələri İlə Bağlı Xətalar

- **Xəta:** `Property X is missing in type Y but required in type Z`
- **Həll:** İstifadəçi və rol ilə bağlı tiplərdə çatışmayan xassələri əlavə edin və ya alternativ adları (aliases) dəstəkləyin.

### 6. Lucide İkonları İlə Bağlı Xətalar

- **Xəta:** `Uncaught ReferenceError: X is not defined`
- **Həll:** İstifadə edilən ikonların `lucide-react`-dən düzgün idxal edilməsini təmin edin.

## Xüsusi Xətalar

### 1. UsePermissions Hook Xətaları

- **Xəta:** `Property X does not exist on type UsePermissionsResult`
- **Həll:** 
  1. `permissionTypes.ts` faylında `UsePermissionsResult` interfeysini yeniləyin
  2. `usePermissions.ts` faylında çatışmayan xassələri əlavə edin və qaytarın

### 2. SectorSchool Type Xətaları

- **Xəta:** `Type SectorSchool is missing the following properties: region_id, sector_id`
- **Həll:** `SectorSchool` tərifini genişləndirib, region_id və sector_id-ni məcburi parametrlər kimi əlavə edin.

### 3. Bildiris/Notification Type Xətaları

- **Xəta:** `Property isRead is optional in type X but required in type Y`
- **Həll:** Bildiriş tiplərini uyğunlaşdırın və bir-birinə çevirilməsi üçün adapterlər yaradın.

### 4. ValidationRules Xətaları

- **Xəta:** `Object literal may only specify known properties, and minValue does not exist in type ValidationRules`
- **Həll:** `ValidationRules` interfeysində `minValue` xassəsini əlavə edin ki, mövcud kodun istifadə etdiyi bütün xassələri dəstəkləsin.

### 5. NotificationSettings Xətaları

- **Xəta:** `Type X is missing properties from type NotificationSettings: inApp, deadline`
- **Həll:** `NotificationSettings` interfeysini yeniləyib, çatışmayan xassələri əlavə edin və mövcud məlumatlar bizim tipimizdə olan bütün məcburi xassələrə malik olduğunu təmin edin.

### 6. Dashboard Type Xətaları

- **Xəta:** `Module "X" has no exported member FormStats/CompletionStats`
- **Həll:** `dashboard.ts` tipində lazım olan bütün tipləri əlavə edin və ya yenidən adlandırma edin.

### 7. İstifadəçi Formu Xətaları

- **Xəta:** `Object literal may only specify known properties, and full_name does not exist in type UserFormData`
- **Həll:** `UserFormData` interfeysində `full_name` xassəsini əlavə edin və ya `fullName` xassəsini istifadə edin.
