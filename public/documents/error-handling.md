
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

