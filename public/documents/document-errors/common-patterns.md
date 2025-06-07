
# Ümumi İstifadə Olunan Həllər və Şablonlar

Bu sənəd InfoLine layihəsində tez-tez rast gəlinən problemlər üçün ortaq həll yollarını və şablonları əhatə edir.

## 1. İstifadəçi Məlumatı İşləmə

### Problem və Həll
- API-dən gələn istifadəçi məlumatları müxtəlif formatlarda ola bilər
- Rol əsaslı giriş və səlahiyyətlər üçün məlumatların unikal formatı vacibdir

```typescript
// istifadəçi məlumatlarını standartlaşdırma
import { User as ApiUser } from '@/types/api';
import { User as AppUser } from '@/types/app';

export const normalizeUser = (user: ApiUser | any): AppUser => {
  return {
    id: user.id || user.user_id || '',
    name: user.name || user.full_name || '',
    email: user.email || user.email_address || '',
    role: user.role || user.user_role || 'user',
    permissions: user.permissions || [],
    status: user.status || 'active'
  };
};
```

## 2. Xəta İdarəetməsi

### Problem və Həll
- API sorğuları və ya digər əməliyyatlar zamanı yaranan xətalar
- İstifadəçiyə anlaşılan şəkildə xətaları göstərmək

```typescript
// xəta işləmə şablonu
export const handleError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Xəta baş verdi';
};

// İstifadə
try {
  await saveData();
} catch (error) {
  const errorMessage = handleError(error);
  toast.error(errorMessage);
}
```

## 3. Məlumat Yoxlaması (Validation)

### Problem və Həll
- Form məlumatlarında validasiya tələbləri
- Məlumat tiplərinin və dəyərlərin yoxlanması

```typescript
// məlumat validasiyası üçün ümumi şablon
export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^\+?[0-9]{10,14}$/;
  return re.test(phone);
};

export const validateRequired = (value: string | number | boolean | object): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
};
```

## 4. Tip Genişləndirmə və Kompozisiya

### Problem və Həll
- Tiplər arasında təkrarçılığı azaltmaq
- Mövcud tipləri genişləndirmək və yeni xassələr əlavə etmək

```typescript
// tip genişləndirmə şablonu
// Əsas tip
interface Base {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Genişləndirilmiş tiplər
interface User extends Base {
  name: string;
  email: string;
}

interface Post extends Base {
  title: string;
  content: string;
  authorId: string;
}

// Kompozisiya
type UserWithPosts = User & { posts: Post[] };
```

## 5. Veri Formatlaşdırma

### Problem və Həll
- Tarix, vaxt və digər məlumatların formatlaşdırılması
- Lokal və beynəlxalq formatlar arası konversiya

```typescript
// Tarix və məlumat formatlaşdırma şablonları
import { format } from 'date-fns';

export const formatDate = (date: string | Date | number, formatStr = 'dd.MM.yyyy'): string => {
  if (!date) return '';
  try {
    return format(new Date(date), formatStr);
  } catch (e) {
    console.error('Tarix formatlaşdırma xətası:', e);
    return '';
  }
};

export const formatCurrency = (amount: number, currency = 'AZN'): string => {
  return new Intl.NumberFormat('az-AZ', { 
    style: 'currency', 
    currency 
  }).format(amount);
};
```

## 6. React Komponentlər İşləmə

### Problem və Həll
- React komponentlərinin prop tiplərini yoxlamaq
- Düzgün prop dəyərlərini təmin etmək
- Prop dəyərlərinin varsayılan hallarını təyin etmək

```typescript
// React komponent şablonu
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  fullWidth = false,
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
```

## Həll olunmuş xətalar

| Problem | Həll | Tarix |
|---------|------|-------|
| Müxtəlif formatlarda gələn notification məlumatlarının işlənməsi | adaptAppToDashboardNotification və adaptDashboardToAppNotification funksiyaları yazıldı | 2025-05-08 |
| React useRef və forwardRef istifadəsində tip xətaları | useRef<HTMLElement> şablonu əlavə edildi | 2025-05-08 |
| DashboardStatus və DashboardFormStats uyğunsuzluqları | Ümumi status interface-ləri əlavə edildi | 2025-05-08 |

## Digər şablonlar

Burada əlavə şablonları və həllərini qeyd edə bilərsiniz:

1. ...
2. ...
3. ...
