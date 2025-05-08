
# Həll Olunmuş Xətalar

Bu sənəd InfoLine layihəsində həll olunmuş xətaların qeydini saxlayır. Bu sənəd yeni xətaların həlli zamanı təkrarçılığın qarşısını almaq üçün nəzərdə tutulmuşdur.

## Tip Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Property 'schoolName' does not exist on type 'PendingApproval' | PendingApproval interfeysinə 'schoolName', 'categoryName' və 'submittedAt' xassələri əlavə edildi | 2025-05-08 |
| Property 'active' and 'inactive' are missing from DashboardStatus | DashboardStatus interfeysinə active və inactive xassələri əlavə edildi | 2025-05-08 |
| Type 'string' is not assignable to type 'number' | useColumnForm.ts faylında validasiya rəqəmləri uyğun formata dəyişdirildi | 2025-05-08 |
| Property 'selectedType', 'options', etc. does not exist on useColumnForm return type | useColumnForm tipinə çatışmayan xassələr əlavə edildi | 2025-05-08 |
| Property 'principal' does not exist on type 'SchoolStat' | SchoolStat tipinə principalName xassəsi əlavə edildi (principal əvəzinə) | 2025-05-08 |
| Property 'forms' does not exist on type 'SchoolAdminDashboardData' | SchoolAdminDashboardData tipi təkmilləşdirildi, formStats əlavə edildi | 2025-05-08 |

## İdxal Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Module '"@/types/notification"' has no exported member named 'adaptDashboardNotificationToApp' | '@/utils/notificationUtils.ts' faylı yaradıldı və funksiyanı ixrac etdi | 2025-05-08 |
| '"@/types/column"' has no exported member 'columnTypeDefinitions' | column.ts faylında müvafiq dəyişənlər əlavə edildi və export edildi | 2025-05-08 |
| Module '"@/types/dashboard"' has no exported member named 'DashboardStats' | DashboardStatus tipindən istifadə edildi | 2025-05-08 |
| Module '"@/types/dashboard"' has no exported member 'CompletionData' | DashboardCompletion interfeysi istifadə edildi | 2025-05-08 |

## Komponent Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Expected 1 arguments, but got 3 in ColumnFormDialog | Funksiyanın çağırılması düzəldildi | 2025-05-08 |
| Type 'DashboardNotification[]' is not assignable to type 'AppNotification[]' | adaptDashboardToAppNotification funksiyası ilə bildirişlər adaptasiya edildi | 2025-05-08 |
| Property 'schoolStats' does not exist on type 'IntrinsicAttributes & SchoolStatsCardProps' | SchoolStatsCardProps interfeysi təkmilləşdirildi | 2025-05-08 |
| Type 'void' cannot be tested for truthiness | Funksiya çağırışının nəticəsi düzgün yoxlanıldı | 2025-05-08 |

## İstifadəçi İnterfeys Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| This comparison appears to be unintentional because the types have no overlap | Bildiriş tiplərini müqayisə edərkən tipləri uyğunlaşdırmaq üçün düzgün tip assertionları əlavə edildi | 2025-05-08 |
| Property 'categoryId' does not exist on type 'DeadlineItem' | Düzgün property adları ilə əvəz edildi ('category') | 2025-05-08 |
| Property 'categoryName' does not exist on type 'DeadlineItem' | Düzgün property adları ilə əvəz edildi | 2025-05-08 |

## API və Data Adaptasiya Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Property 'createdAt' is missing in type 'DashboardNotification' but required in type 'AppNotification' | adaptDashboardToAppNotification funksiyası təkmilləşdirildi | 2025-05-08 |
| Property 'date' does not exist on type 'AppNotification' | notificationUtils.ts faylında adapting funksiyaları updated edildi | 2025-05-08 |
| Property 'read' does not exist on type 'AppNotification' | AppNotification tipində optional 'read' xassəsi əlavə edildi | 2025-05-08 |

## TypeScript Konfiqurasiya Xətaları

| Xəta | Həlli | Tarix |
|------|-------|-------|
| TS2305: Module has no exported member | Çatışmayan export əlavə edildi | 2025-05-08 |
| TS2322: Type is not assignable to type | Tip uyğunlaşdırma kodları əlavə edildi | 2025-05-08 |
| TS2339: Property does not exist on type | İnterfeyslərə çatışmayan xassələr əlavə edildi | 2025-05-08 |

Bu sənəd, InfoLine layihəsindəki xətaları qeyd etmək və həllərini izləmək üçün istifadə olunur. Həll edilən hər bir xəta buraya əlavə edilməlidir, belə ki, eyni problemlə gələcəkdə qarşılaşdıqda, komanda həllin necə tətbiq edildiyini tez bir zamanda tapa bilər.

Yeni həllədilmiş xətalar bu sənədə əlavə edildikcə, uyğun kateqoriya altında qeyd edilməlidir. Əgər yeni kateqoriya lazımdırsa, yeni bir bölmə yaratmaqdan çəkinməyin.
