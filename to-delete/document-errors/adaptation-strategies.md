
# Adaptasiya Strategiyaları

Bu sənəd InfoLine layihəsində müxtəlif API və data strukturları arasında adaptasiya etmək üçün istifadə edilən strategiyaları əhatə edir.

## 1. Adapterlər

**Problem**: Müxtəlif mənbələrdən gələn eyni məlumatların fərqli formatları.

**Həll**:
- Adaptasiya funksiyaları (adapter functions) yaradın
- Normalizasiya üçün yardımçı funksiyalar yazın
- İstifadəçi interfeysi və API arasında aralıq qat təşkil edin

**Nümunə**:
```typescript
// API-dən gələn istifadəçi formatı
interface ApiUser {
  id: string;
  full_name: string;
  email_address: string;
  user_role: string;
}

// Tətbiq daxilində istifadə ediləcək format
interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Adaptasiya funksiyası
function adaptUserFromApi(apiUser: ApiUser): AppUser {
  return {
    id: apiUser.id,
    name: apiUser.full_name,
    email: apiUser.email_address,
    role: mapApiRoleToAppRole(apiUser.user_role)
  };
}

// API-yə göndərmək üçün adaptasiya
function adaptUserToApi(appUser: AppUser): ApiUser {
  return {
    id: appUser.id,
    full_name: appUser.name,
    email_address: appUser.email,
    user_role: mapAppRoleToApiRole(appUser.role)
  };
}
```

## 2. Köməkçi Tiplər

**Problem**: Eyni və ya oxşar tiplərin təkrarlanması.

**Həll**:
- Mənbə tiplərindən törəmə tiplər yaradın
- TypeScript utility tiplərindən istifadə edin (Partial, Pick, Omit və s.)
- Intersection tiplər (& operatoru) ilə mövcud tipləri birləşdirin

**Nümunə**:
```typescript
// Əsas interfeys
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Form üçün Omit ilə şifrə və tarixi çıxarın
type UserFormData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// Yeni istifadəçi yaratmaq üçün
type UserCreateParams = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

// İstifadəçi yeniləmək üçün
type UserUpdateParams = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;

// Yalnız informasiya göstərmək üçün
type UserDisplayData = Pick<User, 'id' | 'name' | 'email' | 'role'>;

// Yeni xassələr əlavə etmək
type UserWithVerification = User & { 
  isVerified: boolean; 
  verificationCode?: string;
};
```

## 3. Tipi İstisna Etmə və Tip Təhlükəsizliyi

**Problem**: Tip təhlükəsizliyini pozmadan dinamik məlumatlarla işləmək.

**Həll**:
- Tip təhlükəsizliyini təmin edən assertionlar yazın
- Type guards funksiyaları yaradın
- Keylərin tipini məhdudlaşdırmaq üçün mapped types istifadə edin

**Nümunə**:
```typescript
// Type guard: istifadəçi obyektini təsdiqləmək
function isUser(obj: unknown): obj is User {
  if (!obj || typeof obj !== 'object') return false;
  
  return (
    typeof (obj as User).id === 'string' && 
    typeof (obj as User).name === 'string' && 
    typeof (obj as User).email === 'string'
  );
}

// API-dən alınan məlumatın tipini yoxlamaq
api.getUser().then(data => {
  if (isUser(data)) {
    // data burada User tipi kimi qəbul edilir
    console.log(data.name);
  } else {
    throw new Error('Invalid user data received');
  }
});

// Record tipindən istifadə etmək üçün
type UserRecord = Record<string, User>;
const usersByKey: UserRecord = {};
```

## 4. Normalizasiya

**Problem**: Müxtəlif mənbələrdən gələn və ya müxtəlif formatlarda olan məlumatları standartlaşdırmaq.

**Həll**:
- Bütün məlumatları normallaşdırmaq üçün funksiyalar yaradın
- Tarixləri və nömrələri standart formata çevirin
- Enumları və səyahət dəyərlərini normallaşdırın

**Nümunə**:
```typescript
// Tarix formatlarını normallaşdırmaq
function normalizeDateString(dateStr: string | Date | null): string {
  if (!dateStr) return '';
  
  try {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return date.toISOString();
  } catch (e) {
    console.error('Invalid date format:', dateStr);
    return '';
  }
}

// Status dəyərlərini normallaşdırmaq
function normalizeStatus(status: any): 'active' | 'inactive' | 'pending' {
  if (!status) return 'pending';
  
  const normalizedStatus = String(status).toLowerCase();
  
  if (['active', 'online', 'enabled', '1', 'true'].includes(normalizedStatus)) {
    return 'active';
  }
  
  if (['inactive', 'offline', 'disabled', '0', 'false'].includes(normalizedStatus)) {
    return 'inactive';
  }
  
  return 'pending';
}
```

## 5. Bildiriş və Məlumat Çevrilməsi

**Problem**: Bildiriş və məlumat strukturları arasında çevrilmə.

**Həll**:
- Bildiriş və məlumat adapteri yaradın
- Məlumat bazası formasından UI formasına çevrilmə funksiyaları yazın
- Xüsusi hallarda formatlaşdırma üçün funksiyalar təqdim edin

**Nümunə**:
```typescript
// Bildiriş tipləri
import { AppNotification, DashboardNotification } from "@/types/notification";

// DashboardNotification -> AppNotification adaptasiyası
export const adaptDashboardToAppNotification = (notification: DashboardNotification): AppNotification => {
  return {
    id: notification.id,
    title: notification.title || '',
    message: notification.message || '',
    createdAt: notification.createdAt || notification.date || new Date().toISOString(),
    isRead: notification.isRead || false,
    type: notification.type || 'info',
    link: notification.link,
    category: notification.category,
    priority: normalizePriority(notification.priority)
  };
};

// AppNotification -> DashboardNotification adaptasiyası
export const adaptAppToDashboardNotification = (notification: AppNotification): DashboardNotification => {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    date: notification.createdAt,
    isRead: notification.isRead,
    type: notification.type,
    link: notification.link,
    category: notification.category,
    priority: normalizePriority(notification.priority)
  };
};
```

## Həll olunmuş xətalar

| Xəta | Həlli | Tarix |
|------|-------|-------|
| Property 'createdAt' is missing in type 'DashboardNotification' but required in type 'AppNotification' | adaptDashboardToAppNotification funksiyası düzəldildi | 2025-05-08 |
| Type 'DashboardNotification[]' is not assignable to type 'AppNotification[]' | Bildiriş tiplərini adaptasiya edən funksiya əlavə edildi | 2025-05-08 |
| Property 'date' does not exist on type 'AppNotification' | notificationUtils.ts faylında adapting funksiyaları düzəldildi | 2025-05-08 |

## Digər xətalar

Burada əlavə adaptasiya xətalarını və həllərini qeyd edə bilərsiniz:

1. ...
2. ...
3. ...
