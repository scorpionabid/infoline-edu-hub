# İnfoLine Auth Cleanup - Backup Plan

## 📅 Tarix: 2024 Dekabr

## 🎯 **Məqsəd**: Auth sisteminin 18 fayldan 8 fayla endirilməsi və duplikatların silinməsi

## 📊 **Mövcud Vəziyyət** (Cleanup Əvvəli)

### **Fayl Sayı:**
- Auth hooks: 13 fayl
- Context sistem: 2 fayl
- Types: 2 fayl (auth ilə əlaqəli)
- Routes: 1 fayl (nested protection problemi)
- **TOPLAM: 18 fayl**

### **Əsas Auth Faylları:**
```
src/hooks/auth/
├── useAuthStore.ts ✅ (əsas - saxla)
├── useSupabaseAuth.ts 🔄 (duplikat - sil)
├── usePermissions.ts ✅ (əsas - saxla)
├── useDataAccessControl.ts 🔄 (duplikat - sil)
├── permissionCheckers.ts 🔄 (köhnə - sil)
├── permissionUtils.ts 🔄 (köhnə - birləşdir)
├── permissionTypes.ts 🔄 (duplikat - sil)
├── authActions.ts 🔄 (köhnə - sil)
├── useAuthFetch.ts 🔄 (köhnə - sil)
├── userDataService.ts 🔄 (köhnə - sil)
├── types.ts 🔄 (duplikat - sil)
├── useStatusPermissions.ts 🔄 (status specific - yoxla)
├── useAvailableUsers.ts 🔄 (user specific - yoxla)
└── index.ts ✅ (yenilə)

src/context/auth/
├── AuthContext.tsx 🔄 (köhnə context - sil)
└── useRole.ts 🔄 (köhnə role hook - sil)

src/types/
├── auth.ts ✅ (mərkəzi - saxla və genişləndir)
└── [digər type faylları]

src/routes/
└── AppRoutes.tsx 🔄 (nested ProtectedRoute - düzəlt)
```

## 🎯 **Məqsədli Struktur** (Cleanup Sonrası)

### **Yeni Fayl Strukturu (8 fayl):**
```
src/types/
└── auth.ts ✅ (birləşdirilmiş types)

src/hooks/auth/
├── stores/
│   └── authStore.ts ✅ (əsas store)
├── permissions/
│   ├── usePermissions.ts ✅ (birləşdirilmiş permissions)
│   └── index.ts ✅ (permission exports)
├── components/
│   ├── LoginForm.tsx ✅ (yenilənmiş)
│   └── RequireRole.tsx ✅ (yenilənmiş)
└── index.ts ✅ (clean exports)

src/routes/
└── AppRoutes.tsx ✅ (təmiz route structure)
```

## 🔒 **Rollback Planı**

### **Emergency Rollback:**
1. Bu commit hash-ı saxla: `[GIT_COMMIT_HASH]`
2. Rollback komandası:
   ```bash
   cd /Users/home/Library/CloudStorage/OneDrive-BureauonICTforEducation,MinistryofEducation/infoline-ready/infoline-edu-hub
   git log --oneline -n 10
   git reset --hard [BACKUP_COMMIT_HASH]
   npm install
   npm run dev
   ```

### **Partial Rollback (mərhələ əsasında):**
- **Mərhələ 2 Rollback**: Types geri qaytarmaq
- **Mərhələ 3 Rollback**: Store dəyişikliklərini geri qaytarmaq
- **Mərhələ 6 Rollback**: Context sistemini geri qaytarmaq

## 📋 **Pre-Cleanup Checklist**

- [x] Auth fayllarının tam analizi
- [x] Dependency mapping
- [x] Backup planının hazırlanması
- [ ] Git commit (clean state)
- [ ] npm run build test
- [ ] npm run type-check test

## 🚨 **Critical Points**

1. **useAuthStore.ts** - Əsas fayldır, həyata keçirmə zamanı çox diqqətli olmaq
2. **AppRoutes.tsx** - Route protection ikiqat, diqqətlə düzəltmək
3. **Types** - Import path dəyişiklikləri bütün faylları təsir edəcək
4. **Permissions** - Role-based access təmin etmək üçün test etmək vacibdir

## 📈 **Success Metrics**

### **Target:**
- Fayl sayı: 18 → 8 fayl (-56%)
- Build size: 10-15% azalma
- Type errors: 0
- Functionality: 100% qorunmuş
- Performance: Sürət artımı

---
**Hazırlayan**: Auth Cleanup Script
**Tarix**: 2024 Dekabr
**Versiya**: 1.0-backup
