# Frontend Guidelines Document: İnfoLine - Məktəb Məlumatları Toplama Sistemi

## 1. Ümumi Frontend Arxitekturası

İnfoLine platformasının frontend strukturu React və TypeScript üzərində qurulmuş, Vite build tool ilə konfiqurasiya edilmişdir. Platforma shadcn/ui komponentlərindən və Tailwind CSS-dən istifadə edərək modern, responsiv və istifadəçi dostu interfeys təqdim edir.

### 1.1. Texniki Stack

- **Framework**: React 18
- **Dil**: TypeScript 4.9+
- **Styling**: Tailwind CSS 3.3+
- **Component Library**: shadcn/ui (Radix UI əsasında)
- **Build Tool**: Vite
- **Routing**: React Router 6
- **State Management**: React Context API + React Query
- **Form İdarəetməsi**: React Hook Form + Zod validasiya
- **Qrafiklər və Vizualizasiya**: Recharts
- **İkonlar**: Lucide Icons
- **Excel İşləmə**: SheetJS, PapaParse

## 2. Proyekt Strukturu

Mövcud frontend kodu aşağıdakı struktur əsasında təşkil edilmişdir:

```
src/
├── api/            # API sorğuları və wrapper-lər
├── components/     # UI komponentləri
│   ├── auth/       # Autentifikasiya ilə bağlı komponentlər
│   ├── categories/ # Kateqoriya idarəetməsi komponentləri
│   ├── columns/    # Sütun idarəetməsi komponentləri
│   ├── common/     # Ortaq komponentlər
│   ├── dashboard/  # Dashboard komponentləri
│   ├── dataEntry/  # Məlumat daxiletmə komponentləri
│   ├── layout/     # Layout komponentləri
│   ├── regions/    # Region idarəetməsi komponentləri
│   ├── sectors/    # Sektor idarəetməsi komponentləri
│   ├── schools/    # Məktəb idarəetməsi komponentləri
│   ├── ui/         # shadcn/ui komponentləri
│   └── users/      # İstifadəçi idarəetməsi komponentləri
├── context/        # React Context provider-lar
├── data/           # Statik məlumatlar və mock data
├── hooks/          # Custom React hooks
├── integrations/   # Xarici servislərlə inteqrasiyalar
├── lib/            # Utility funksiyalar
├── pages/          # Səhifə komponentləri
├── routes/         # Routing konfiqurasiyası
├── services/       # Servis funksiyaları
├── translations/   # Çoxdilli mətnlər
├── types/          # TypeScript tipləri və interfeyslər
└── utils/          # Köməkçi funksiyalar
```

## 3. Komponent Strukturu və Prinsipləri

### 3.1. Komponent Yaratma Qaydaları

- Hər bir komponent ayrı bir faylda yerləşdirilməlidir
- Komponent faylları PascalCase adlandırma konvensiyasına uyğun olmalıdır (məs., `UserList.tsx`)
- Kiçik, təkrar istifadə edilə bilən komponentlər yaratmağa üstünlük verilməlidir
- Komponentlər məsuliyyət ayırma (separation of concerns) prinsipinə əsasən yaradılmalıdır

### 3.2. Komponent Şablonu

```tsx
import React from "react";
import { ComponentProps } from "@/types/ui";

// Props interfeysi
interface ExampleComponentProps {
  title: string;
  description?: string;
  onAction: () => void;
}

/**
 * ExampleComponent - nümunə komponentin təsviri
 * 
 * @param {string} title - Komponentin başlığı
 * @param {string} description - Əlavə təsvir (optional)
 * @param {Function} onAction - Əməliyyat düyməsinə basdıqda çağırılacaq funksiya
 */
export const ExampleComponent: React.FC<ExampleComponentProps> = ({
  title,
  description,
  onAction,
}) => {
  // State və ya digər hook-lar buraya
  
  // Köməkçi funksiyalar buraya
  
  return (
    <div className="p-4 rounded-lg border">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
      <button
        className="mt-4 px-4 py-2 bg-primary text-white rounded"
        onClick={onAction}
      >
        Action
      </button>
    </div>
  );
};
```

### 3.3. Komponent Kateqoriyaları

Mövcud kodda aşağıdakı komponent kateqoriyaları istifadə olunur:

1. **Səhifə Komponentləri**: Tam səhifələri təmsil edən və routing vasitəsilə bağlanan komponentlər (məs., `Dashboard.tsx`)

2. **Layout Komponentləri**: Səhifələrin ümumi düzülüşünü təyin edən komponentlər (məs., `SidebarLayout.tsx`)

3. **Feature Komponentləri**: Müəyyən funksionallığı həyata keçirən komponentlər (məs., `CategoryList.tsx`)

4. **UI Komponentləri**: Kiçik, təkrar istifadə edilən interfeys komponentləri (məs., `Button.tsx`, `Card.tsx`)

5. **Form Komponentləri**: Məlumat daxil etmə və validasiya üçün xüsusiləşdirilmiş formalar (məs., `CategoryForm.tsx`)

6. **Dialog Komponentləri**: Modal pəncərələr və dialoqlar (məs., `AddRegionDialog.tsx`)

## 4. State İdarəetməsi

### 4.1. Kontekst İstifadəsi (Context API)

Mövcud kodda qlobal state idarəetməsi üçün React Context API istifadə olunur:

- **AuthContext**: İstifadəçi autentifikasiyası və rolu
- **LanguageContext**: Çoxdilli interfeys üçün
- **NotificationContext**: Sistem bildirişləri
- **ThemeContext**: İnterfeys teması

Nümunə:

```tsx
// Context provider-ı komponent ağacında yukarıda yerləşdirin
import { AuthProvider } from "@/context/auth";
import { LanguageProvider } from "@/context/LanguageContext";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <MainContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

// Komponentin içində context istifadəsi
import { useAuth } from "@/context/auth/useAuth";
import { useLanguage } from "@/context/LanguageContext";

function MainContent() {
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  
  // Komponent məntiqi
}
```

### 4.2. React Query istifadəsi

Server məlumatlarını əldə etmək, keşləmək və yeniləmək üçün React Query istifadə olunur:

```tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory } from "@/api/categoryApi";

// Məlumatları əldə etmək
const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 dəqiqə
  });
};

// Məlumatları yeniləmək
const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
```

### 4.3. Local State İdarəetməsi

Komponent-spesifik state üçün React-in özündəki state hook-ları istifadə olunur:

```tsx
// useState üçün
const [isOpen, setIsOpen] = useState(false);

// useReducer mürəkkəb state üçün
const [state, dispatch] = useReducer(reducer, initialState);

// useMemo hesablamaları keşləmək üçün
const filteredItems = useMemo(() => {
  return items.filter(item => item.status === "active");
}, [items]);

// useCallback funksiyaları keşləmək üçün
const handleSubmit = useCallback(() => {
  // Submit məntiqiniz
}, [/* dependencies */]);
```

## 5. Üslublandırma (Styling)

### 5.1. Tailwind CSS İstifadəsi

Bütün üslublandırma Tailwind CSS utility klasisifikatörləri ilə aparılır. Xüsusi CSS fayllarından mümkün qədər qaçınmaq lazımdır.

```tsx
// Tailwind istifadəsi
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
  <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
  <div className="flex gap-2">
    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
      Əsas
    </button>
    <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
      İkinci
    </button>
  </div>
</div>
```

### 5.2. shadcn/ui Komponentləri

shadcn/ui komponentləri standartlaşdırılmış UI elementləri üçün əsas qaynaq kimi istifadə olunmalıdır. Bu komponentlər `src/components/ui` qovluğunda yerləşir.

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Komponent nümunəsi
<Card>
  <CardHeader>
    <CardTitle>Profil Məlumatları</CardTitle>
  </CardHeader>
  <CardContent>
    <form className="space-y-4">
      <div className="space-y-2">
        <label>Ad</label>
        <Input placeholder="Adınızı daxil edin" />
      </div>
      <Button type="submit">Yadda saxla</Button>
    </form>
  </CardContent>
</Card>
```

### 5.3. Responsiv Dizayn

Bütün interfeys elementləri responsiv olmalıdır. Tailwind-in breakpoint klasisifikatörləri istifadə edilməlidir:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Məzmun buraya */}
</div>

<div className="hidden md:block">
  {/* Yalnız tablet və desktop-da görünür */}
</div>

<div className="block md:hidden">
  {/* Yalnız mobil cihazlarda görünür */}
</div>
```

### 5.4. Rəng Paleti və Tema

`tailwind.config.ts` faylında müəyyən edilmiş əsas rəng paleti istifadə olunmalıdır:

```js
// Əsas rənglər
colors: {
  primary: { ... },
  secondary: { ... },
  success: { ... },
  warning: { ... },
  danger: { ... },
  // və s.
}
```

```tsx
// İstifadə
<button className="bg-primary text-white">Primary Button</button>
<button className="bg-secondary text-white">Secondary Button</button>
<div className="text-success">Success Message</div>
```

## 6. Form İdarəetməsi

### 6.1. React Hook Form

Bütün formalar React Hook Form ilə yaradılmalıdır. Validasiya üçün Zod istifadə olunur.

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

// Validasiya sxemi
const formSchema = z.object({
  name: z.string().min(3, "Ad ən azı 3 simvol olmalıdır"),
  email: z.string().email("Düzgün e-poçt daxil edin"),
});

// Form komponenti
export function UserForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Formun submit məntiqiniz
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ad</FormLabel>
              <FormControl>
                <Input placeholder="Adınızı daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-poçt</FormLabel>
              <FormControl>
                <Input placeholder="E-poçt ünvanınızı daxil edin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit">Təsdiqlə</Button>
      </form>
    </Form>
  );
}
```

### 6.2. Form Validasiya Strategiyası

Zod validasiya sxemləri ayrı fayllarda və ya komponentlərin içində müəyyən edilə bilər:

```tsx
// types/schemas/categorySchema.ts
import * as z from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, "Kateqoriya adı ən azı 3 simvol olmalıdır"),
  description: z.string().optional(),
  assignment: z.enum(["all", "sectors"]),
  priority: z.number().min(1).max(10),
  deadline: z.date().optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
```

## 7. Routing

React Router v6 istifadə olunur. Routing konfiqurasiyası `src/routes/AppRoutes.tsx` faylında müəyyən edilir.

```tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/auth/useAuth";
import { Dashboard } from "@/pages/Dashboard";
import { Login } from "@/pages/Login";
import { NotFound } from "@/pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
```

## 8. Çoxdilli Dəstək

Çoxdilli dəstək üçün xüsusi hook və context strukturu istifadə olunur. Tərcümələr translations qovluğunda saxlanılır.

```tsx
// src/translations/index.ts
import { az } from "./az";
import { en } from "./en";
import { ru } from "./ru";
import { tr } from "./tr";

export const translations = {
  az,
  en,
  ru,
  tr,
};

// src/context/LanguageContext.tsx
import React, { createContext, useState, useContext } from "react";
import { translations } from "@/translations";
import { Language } from "@/types/language";

const LanguageContext = createContext<{
  language: Language;
  t: (key: string) => string;
  setLanguage: (lang: Language) => void;
}>({
  language: "az",
  t: (key) => key,
  setLanguage: () => {},
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>("az");
  
  const t = (key: string): string => {
    const keys = key.split(".");
    let translation: any = translations[language];
    
    for (const k of keys) {
      if (!translation[k]) return key;
      translation = translation[k];
    }
    
    return translation;
  };
  
  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

// İstifadəsi
import { useLanguage } from "@/context/LanguageContext";

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t("dashboard.title")}</h1>
      <p>{t("dashboard.welcome")}</p>
      
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
      >
        <option value="az">Azərbaycan</option>
        <option value="en">English</option>
        <option value="ru">Русский</option>
        <option value="tr">Türkçe</option>
      </select>
    </div>
  );
}
```

## 9. Xəta İdarəetməsi

Xətalar üçün standart yanaşma:

```tsx
// Sorğu xətalarının idarə edilməsi
const { data, error, isLoading } = useQuery({
  queryKey: ["data"],
  queryFn: fetchData,
});

// Komponentdə xətanın göstərilməsi
if (isLoading) return <div>Yüklənir...</div>;
if (error) return <div className="text-red-500">Xəta: {error.message}</div>;

// Global xəta işləyicisi
import { ErrorBoundary } from "react-error-boundary";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <h2 className="text-xl font-bold text-red-800">Xəta baş verdi</h2>
      <p className="text-red-600">{error.message}</p>
      <button 
        onClick={resetErrorBoundary}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      >
        Yenidən cəhd et
      </button>
    </div>
  );
}

// İstifadəsi
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## 10. Performans Optimallaşdırması

### 10.1. Memoizasiya

Ağır hesablamalar və uşaq komponentlərin yenidən renderini optimallaşdırmaq üçün React-in memoizasiya hook-larından istifadə edin:

```tsx
// useMemo ilə hesablamaları keşləyin
const filteredData = useMemo(() => {
  return data.filter(item => item.status === activeFilter);
}, [data, activeFilter]);

// useCallback ilə funksiyaları keşləyin
const handleSubmit = useCallback(() => {
  // Submit məntiqiniz
}, [/* dependencies */]);

// React.memo ilə komponentləri keşləyin
const MemoizedComponent = React.memo(MyComponent);
```

### 10.2. Lazy Loading

Böyük komponentləri və səhifələri lazy load edin:

```tsx
import React, { lazy, Suspense } from "react";

const LazyDashboard = lazy(() => import("@/pages/Dashboard"));

function App() {
  return (
    <Suspense fallback={<div>Yüklənir...</div>}>
      <LazyDashboard />
    </Suspense>
  );
}
```

## 11. Best Practices

### 11.1. Yeni Komponent Yaratma

Yeni komponentlər yaradarkən mövcud struktura və adlandırma konvensiyasına uyğun olmalıdır. Təkrardan qaçınmaq üçün əvvəlcə mövcud komponentləri yoxlayın.

### 11.2. API Sorğuları

API sorğuları `src/api` qovluğunda müəyyən edilməli və React Query hook-ları şəklində təqdim edilməlidir.

### 11.3. Tipləşdirmə

Bütün komponentlər, funksiyalar və dəyişənlər TypeScript ilə tipləşdirilməlidir. `any` tipi mümkün qədər az istifadə edilməlidir.

### 11.4. Kod Təmizliyi

Kod təmizliyi ESLint və Prettier konfiqurasiyasına uyğun olmalıdır. Ölü kod, istifadə olunmayan dəyişənlər və console.log-lar production kodda olmamalıdır.

## 12. Nümunə Tətbiqlər

### 12.1. Yeni Səhifə Yaratma

```tsx
// src/pages/NewPage.tsx
import React from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/layout/PageHeader";
import { useLanguage } from "@/context/LanguageContext";

export const NewPage: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <SidebarLayout>
      <PageHeader title={t("newPage.title")} />
      
      <div className="p-4">
        <h2 className="text-xl font-bold">{t("newPage.subtitle")}</h2>
        <p className="mt-2">{t("newPage.description")}</p>
        
        {/* Səhifənin əsas məzmunu */}
      </div>
    </SidebarLayout>
  );
};
```

### 12.2. Data Fetch və CRUD Əməliyyatları

```tsx
// src/hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/categoryApi";
import { Category, CreateCategoryDto, UpdateCategoryDto } from "@/types/category";

export const useCategories = () => {
  const queryClient = useQueryClient();
  
  const categoriesQuery = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getCategories,
  });
  
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryDto) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDto }) => 
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
  
  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    error: categoriesQuery.error,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
  };
};
```

Bu Frontend Guidelines Document, İnfoLine proyektinin frontend tərəfini strukturlaşdırmaq və inkişaf etdirmək üçün əhatəli bir təlimat təqdim edir. Sənəd mövcud kodun strukturu və best practices-ləri əsasında hazırlanmışdır və yeni problemlər yaratmaq əvəzinə mövcud işləmə prinsiplərini dəstəkləyir.