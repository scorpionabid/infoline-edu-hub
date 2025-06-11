# İnfoLine - AI Collaboration Standards

## 🎯 **Bu faylın məqsədi**
Bu fayl AI köməkçilərinin layihə strukturunu düzgün başa düşməsi və təkrarçılıq yaratmaması üçündür.

## 📋 **AI-yə TƏLİMAT**

### **HƏMŞƏ UNUTMA:**
1. **`PROJECT_AI_CONTEXT.md` faylını oxu** hər session-da
2. **Mövcud struktura bax** yeni fayl yaratmazdan əvvəl
3. **search_files() və directory_tree() işlət** əvvəlcə
4. **Convention-lara uy** - öz standartların yaratma

### **TEST FAYLLARI ÜÇÜN:**
- ✅ `src/__tests__/` istifadə et
- ❌ `src/tests/` yaratma
- Naming: `*.test.ts` və ya `*.spec.ts`

### **SERVICE FAYLLARI ÜÇÜN:**
- ✅ `src/services/` struktura uy
- ❌ Parallel service qovluqları yaratma
- Pattern: `src/services/feature/featureService.ts`

### **COMPONENT FAYLLARI ÜÇÜN:**
- ✅ `src/components/` struktura uy
- Subdirectory-lər: `ui/`, `dataEntry/`, `auth/`
- Pattern: `PascalCase.tsx`

## 🔧 **PROJECT CONVENTIONS**

### **File Naming:**
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCaseService.ts`
- Tests: `fileName.test.ts`
- Utils: `camelCase.ts`

### **Directory Structure:**
```
src/
├── __tests__/          # ✅ Test files - MÖVCUD
├── components/         # ✅ React components
├── hooks/              # ✅ Custom hooks
├── services/           # ✅ Service layer
├── types/              # ✅ TypeScript types
├── utils/              # ✅ Utility functions
├── context/            # ✅ React contexts
└── integrations/       # ✅ Third-party integrations
```

## 🚨 **PROBLEM PREVENTION**

### **Son Problemlər:**
1. `src/tests/` yaradıldı (düzgün: `src/__tests__/`)
2. Təkrarlanan service faylları
3. Mövcud struktura baxılmadı

### **Həll Strategiyası:**
1. Bu qaydaları hər prompt-da xatırla
2. Struktur analizi et əvvəlcə
3. Mövcud faylları extend et, yenisini yaratma

---

**DİQQƏT: Bu faylı AI-yə həmişə göstər, strukturu hər dəfə yoxla!**
