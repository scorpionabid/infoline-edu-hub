
# Xəta idarəetmə qeydləri

## Lucide İkonları İlə Bağlı Xətalar

### Problem: RefreshCw/Info/Search kimi ikonların tanınmaması
- **Əsas xəta**: "Uncaught ReferenceError: RefreshCw is not defined"
- **Həlli**: İkonları lucide-react kitabxanasından düzgün import etmək lazımdır:
  ```js
  import { Loader2, CheckCircle, XCircle, Search, RefreshCw, Info } from 'lucide-react';
  ```
- **Təsir edən fayllar**: src/components/approval/Approval.tsx və digər icon istifadə edən fayllar
- **Tarixi**: 2025-05-08

## TypeScript Tip Uyğunsuzluq Xətaları

### PendingApproval interfeysində date/submittedAt ziddiyəti
- **Problem**: Bəzi komponentlər date istifadə edir, digərləri submittedAt istifadə edir
- **Həll**: PendingApproval tipində ikisinin də olmasını təmin etmək
- **Təsir edən fayllar**: src/types/dashboard.d.ts, src/components/approval/PendingApprovals.tsx

### DashboardNotification və AppNotification arası uyğunsuzluq
- **Problem**: isRead/read xüsusiyyət ziddiyyəti və priority tipində fərqlər
- **Həll**: Tip adapterlərində bu fərqləri nəzərə almaq
- **Təsir edən fayllar**: src/types/notification.ts, src/types/dashboard.ts

### SectorSchool tipi ilə bağlı xətalar
- **Problem**: Əksik və uyğun olmayan xüsusiyyətlər (completionRate/completion_rate, lastUpdate/updated_at və s.)
- **Həll**: SectorSchool tipinə çatışmayan xüsusiyyətləri əlavə etmək
- **Təsir edən fayllar**: src/types/school.ts, src/components/dashboard/SectorAdminDashboard.tsx
- **Tarixi**: 2025-05-08

### FormItem və DeadlineItem tiplərində xəta
- **Problem**: Bəzi komponentlər title və categoryId istifadə edirlər, lakin tiplərdə bunlar yox idi
- **Həll**: FormItem və DeadlineItem tiplərinə categoryId, title və category xüsusiyyətlərini əlavə etmək
- **Təsir edən fayllar**: src/types/dashboard.ts, src/components/dashboard/school-admin/FormTabs.tsx
- **Tarixi**: 2025-05-08

### usePermissions hook-unda olmayan xüsusiyyətlər
- **Problem**: canManageCategories, canManageSchools və s. kimi xüsusiyyətlər çağırılır, amma hook-da təyin edilməyib
- **Həll**: usePermissions hook-una çatışmayan xüsusiyyətləri əlavə etmək
- **Təsir edən fayllar**: src/hooks/auth/usePermissions.ts, src/components/layout/NavigationMenu.tsx, src/components/layout/SidebarNav.tsx
- **Tarixi**: 2025-05-08

### StatusCardsProps tipində formStats parametrinin olmaması
- **Problem**: StatusCards komponenti formStats parametri qəbul edir, amma tipində bu parametr yoxdur
- **Həll**: StatusCardsProps tipinə formStats parametrini əlavə etmək və komponentdə default dəyər təyin etmək
- **Təsir edən fayllar**: src/types/dashboard.ts, src/components/dashboard/StatusCards.tsx
- **Tarixi**: 2025-05-08
