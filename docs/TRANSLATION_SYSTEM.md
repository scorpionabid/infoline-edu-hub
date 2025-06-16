# 🌐 İnfoLine Translation System

Bu sənəd İnfoLine tətbiqində yeni translation sisteminin istifadəsini izah edir.

## 📋 Ümumi Baxış

İnfoLine artıq 4 dili dəstəkləyir:
- 🇦🇿 **Azərbaycan** (əsas dil)
- 🇺🇸 **English**
- 🇷🇺 **Русский**
- 🇹🇷 **Türkçe**

## 🚀 Təkmil Translation Sistemi

### Əsas Xüsusiyyətlər
- ✅ **Smart Translation Hook** - avtomatik fallback və context-aware tərcümə
- ✅ **Module-based Structure** - təşkil edilmiş translation modulları
- ✅ **Development Tools** - real-time translation coverage monitoring
- ✅ **Validation System** - translation quality və completeness yoxlaması
- ✅ **Performance Optimized** - lazy loading və caching
- ✅ **Type Safe** - TypeScript dəstəyi və auto-completion

## 📁 Struktur

```
src/
├── translations/
│   ├── az/                    # Azərbaycan tərcümələri
│   │   ├── core.ts           # Ümumi sahələr və əməliyyatlar
│   │   ├── dashboard.ts      # Dashboard spesifik
│   │   ├── userManagement.ts # İstifadəçi idarəetməsi
│   │   ├── auth.ts          # Authentication
│   │   ├── navigation.ts    # Naviqasiya
│   │   └── ...
│   ├── en/                   # English translations
│   ├── ru/                   # Russian translations
│   └── tr/                   # Turkish translations
├── hooks/translation/
│   └── useSmartTranslation.ts # Təkmil translation hook
├── utils/
│   └── translationValidator.ts # Validation və coverage tools
└── components/dev/
    └── TranslationDevPanel.tsx # Development monitoring tool
```

## 🛠️ İstifadə

### 1. Əsas Translation Hook

```tsx
import { useTranslation } from '@/contexts/TranslationContext';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('core.actions.save')}</button>
    </div>
  );
};
```

### 2. Smart Translation Hook (Tövsiyə edilir)

```tsx
import { useSmartTranslation } from '@/hooks/translation/useSmartTranslation';

const MyComponent = () => {
  const { tSafe, tModule, tValidation } = useSmartTranslation();
  
  return (
    <div>
      {/* Avtomatik fallback ilə */}
      <h1>{tSafe('dashboard.title', 'Dashboard')}</h1>
      
      {/* Module-specific */}
      <p>{tModule('userManagement', 'title')}</p>
      
      {/* Form validation */}
      <span>{tValidation('email', 'invalid_email')}</span>
    </div>
  );
};
```

### 3. Context və Interpolation

```tsx
const { tContext, tNumber, tDate } = useSmartTranslation();

// Rəqəmlərlə
const count = 42;
<p>{tNumber('dashboard.stats.total_users', count)}</p>

// Tarixlərlə  
const date = new Date();
<p>{tDate('dashboard.activity.last_updated', date)}</p>

// Context ilə
<p>{tContext('userManagement.invitation.expires', { 
  days: 7,
  user: 'John' 
})}</p>
```

## 📊 Translation Modulları

### Core Module (`core.ts`)
Ümumi istifadə olunan mətnlər:
- `core.actions.*` - əsas əməliyyatlar (save, delete, edit)
- `core.status.*` - statuslar (active, pending, completed)
- `core.loading.*` - yükləmə vəziyyətləri
- `core.messages.*` - ümumi mesajlar

### Dashboard Module (`dashboard.ts`)
Dashboard spesifik mətnlər:
- `dashboard.stats.*` - statistika göstəriciləri
- `dashboard.cards.*` - dashboard kartları
- `dashboard.filters.*` - filtrlər və axtarış

### User Management Module (`userManagement.ts`)
İstifadəçi idarəetməsi:
- `userManagement.actions.*` - istifadəçi əməliyyatları
- `userManagement.form.*` - form sahələri
- `userManagement.roles.*` - rol adları
- `userManagement.messages.*` - success/error mesajları

## 🔧 Development Tools

### Translation Dev Panel
Development modunda sağ aşağı küncdə Translation Dev Panel görünür:

- **Overview** - ümumi translation coverage
- **Modules** - hər modulun detallı statusu
- **Tools** - utility funkciyalar

### Console Commands

```javascript
// Coverage report yaradır
TranslationValidator.generateConsoleReport('az');

// HTML report download edir
TranslationValidator.generateHTMLReport('az');

// Cache təmizləyir
TranslationValidator.clearCache();
```

### Hardcoded Text Finder

```bash
# Hardcoded mətnləri tapır
node scripts/findHardcodedTexts.js src analysis/hardcoded-texts.json

# Implementation script işə salır
chmod +x scripts/implementTranslation.sh
./scripts/implementTranslation.sh
```

## ✅ Best Practices

### 1. Translation Key Naming
```typescript
// ✅ Yaxşı nümunələr
'core.actions.save'
'userManagement.form.email'
'dashboard.stats.total_users'

// ❌ Pis nümunələr  
'saveButton'
'email'
'totalUsers'
```

### 2. Fallback Strategy
```tsx
// ✅ Həmişə fallback təmin edin
const title = tSafe('page.title', 'Default Title');

// ✅ Module-based access istifadə edin
const label = tModule('userManagement', 'actions.create_user');
```

### 3. Validation Messages
```tsx
// ✅ Validation üçün xüsusi funksiya
const errorMessage = tValidation('email', 'invalid_format');

// ✅ Context parametrləri
const lengthError = tValidation('password', 'min_length', { min: 8 });
```

## 📈 Coverage Goals

### Prioritet Səviyyələri

#### Critical (100% coverage tələb olunur)
- ✅ `core` - ümumi komponentlər
- ✅ `navigation` - naviqasiya elementləri  
- ✅ `auth` - authentication

#### High Priority (90%+ coverage)
- 🔄 `dashboard` - dashboard elementləri
- 🔄 `userManagement` - istifadəçi idarəetməsi
- 🔄 `validation` - form validation

#### Medium Priority (80%+ coverage)
- 🔄 `dataEntry` - məlumat daxil etmə
- 🔄 `schools` - məktəb idarəetməsi  
- 🔄 `reports` - hesabatlar

## 🧪 Testing

### Translation Coverage Tests

```bash
# Bütün testləri işə salır
npm test src/__tests__/translation/

# Spesifik module test edir
npm test -- --testNamePattern="core module"
```

### Manual Testing Checklist

- [ ] Login flow - bütün mətnlər Azərbaycan dilində
- [ ] Dashboard - statistika və navigation
- [ ] User management - form və mesajlar  
- [ ] Language switching - real-time dəyişiklik
- [ ] Error states - düzgün tərcümə edilmiş xəta mesajları

## 🚨 Troubleshooting

### Ümumi Problemlər

1. **Translation key tapılmır**
   ```
   [dashboard.title] - key missing
   ```
   **Həll:** Translation faylında key əlavə edin və ya fallback istifadə edin

2. **Component translation istifadə etmir**
   ```tsx
   // Yanlış
   <h1>Dashboard</h1>
   
   // Düzgün
   <h1>{t('dashboard.title')}</h1>
   ```

3. **Performance problemləri**
   - Translation cache-ini yoxlayın
   - Module lazy loading istifadə edin

### Debug Commands

```javascript
// Console-da mövcud translation-ları göstərir
console.log(Object.keys(translations));

// Spesifik module yoxlayır
TranslationValidator.validateModule('dashboard', 'az');

// Cache vəziyyətini göstərir
console.log(translationCache);
```

## 📝 Yeni Translation Əlavə Etmək

### 1. Yeni Module Yaratmaq

```typescript
// src/translations/az/myModule.ts
export const myModule = {
  title: 'Modulun Başlığı',
  actions: {
    create: 'Yarat',
    update: 'Yenilə'
  },
  form: {
    name: 'Ad',
    description: 'Təsvir'
  }
} as const;

export type MyModule = typeof myModule;
export default myModule;
```

### 2. Index faylını yeniləmək

```typescript
// src/translations/az/index.ts
import myModule from './myModule.js';

export {
  // ...mövcud modullar
  myModule,
};
```

### 3. Type definisiyalarını yeniləmək

```typescript
// src/types/translation.ts
export type LanguageTranslations = {
  // ...mövcud modullar
  myModule: TranslationModule;
};
```

## 🎯 Roadmap

### Tamamlanan ✅
- [x] Core translation sistemi
- [x] Smart translation hooks
- [x] Development tools
- [x] Validation system
- [x] Critical modules (auth, navigation, core)

### Davam edən 🔄
- [ ] Data entry modules
- [ ] Reports translation
- [ ] Settings pages
- [ ] Error boundaries

### Planlaşdırılan 📋
- [ ] RTL language support
- [ ] Translation automation tools
- [ ] Performance optimization
- [ ] Mobile-specific translations

## 🤝 Töhfə vermək

Translation-a töhfə vermək üçün:

1. Hardcoded mətnləri tapın: `node scripts/findHardcodedTexts.js`
2. Translation key əlavə edin
3. Component-i yeniləyin
4. Test coverage yoxlayın
5. Pull request yaradın

## 📞 Dəstək

Translation sistemi ilə bağlı problemlər üçün:
- Development panel istifadə edin
- Console command-ları yoxlayın  
- Test coverage-ı nəzərdən keçirin

---

**🎉 İnfoLine Translation System - Azərbaycan dilini dəstəkləyən müasir tərcümə sistemi!**