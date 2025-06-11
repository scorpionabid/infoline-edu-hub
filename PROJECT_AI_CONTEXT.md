# İnfoLine Layihə Konteksti və AI Qaydaları

## 📋 **MÜTLƏQ OXUNACAQ - AI ÜÇÜN QAYDALAR**

### **🚨 YENİ FAYL YARATMAZDAN ƏVVƏL:**

1. **ƏVVƏLCƏ MÖVCUD STRUKTURA BAX**:
   ```bash
   # Bu komandları işlətmədən fayl yaratma:
   - list_directory()
   - search_files()
   - directory_tree()
   ```

2. **MÖVCUD FAYLLARI YOXLA**:
   - Test faylları: `src/__tests__/` qovluğunda
   - Service faylları: `src/services/` qovluğunda
   - Components: `src/components/` strukturunda
   - Hooks: `src/hooks/` qovluğunda

3. **TƏKRARÇıLıQ YARATMA**:
   - Yeni `/tests/` yaratma əgər `/__tests__/` varsa
   - Yeni service yaratma əgər mövcuddursa
   - Parallel structure yaratma

## 📁 **MÖVCUD FILE STRUKTUR**

### **Test Structure:**
```
src/
├── __tests__/           # ✅ MÖVCUD - Test faylları buradadır!
│   ├── components/
│   ├── hooks/
│   └── integration/
└── tests/               # ❌ YENİ YARADILDI - SİLİNMƏLİDİR!
```

### **Service Structure:**
```
src/
├── services/
│   ├── api/             # API calls
│   ├── dataEntry/       # ✅ YENİ YARADILDI
│   └── auth/            # Authentication
```

### **Component Structure:**
```
src/
├── components/
│   ├── ui/              # shadcn-ui components
│   ├── dataEntry/       # Data entry components
│   │   ├── core/        # Core components
│   │   ├── enhanced/    # Enhanced versions
│   │   └── forms/       # Form components
│   ├── auth/            # Auth components
│   └── common/          # Shared components
```

### **Hook Structure:**
```
src/
├── hooks/
│   ├── dataEntry/       # Data entry hooks
│   │   ├── common/      # Common utilities
│   │   └── specific/    # Specific hooks
│   ├── auth/            # Auth hooks
│   └── common/          # Shared hooks
```

## 🎯 **AI ÜÇÜN MƏCBURU QAYDALAR**

### **1. ƏVVƏL ARAŞDIR, SONRA YARAT**
```typescript
// ❌ BU ŞƏKİLDƏ ETMƏ:
write_file("src/tests/newTest.ts", content);

// ✅ BU ŞƏKİLDƏ ET:
1. search_files(pattern: "test")        // Mövcud test faylları tap
2. list_directory("src/__tests__")      // Mövcud test struktura bax
3. // YALNIZ SONRA yarada və ya mövcudu yenilə
```

### **2. NAMING CONVENTIONS**
- Test faylları: `*.test.ts` və ya `*.spec.ts`
- Component test: `ComponentName.test.tsx`
- Hook test: `useHookName.test.ts`
- Integration test: `integration/feature.test.ts`

### **3. MÖVCUD FAYL PATTERNLƏRİ**
```
# Test faylları:
src/__tests__/hooks/dataEntry/useAutoSave.test.ts
src/__tests__/components/dataEntry/AutoSaveIndicator.test.tsx
src/__tests__/integration/dataEntry/save-flow.test.ts

# Service faylları:
src/services/dataEntry/dataEntryService.ts
src/services/api/auth.ts
src/services/api/categories.ts

# Component faylları:
src/components/dataEntry/core/AutoSaveIndicator.tsx
src/components/ui/button.tsx
src/components/auth/LoginForm.tsx
```

## 🔧 **DÜZELTİLMƏSİ LAZIM OLAN PROBLEMLƏر**

### **❌ Təkrarlanan Qovluqlar:**
1. `src/tests/` → Silinməli, `src/__tests__/` istifadə et
2. Duplicate service faylları yoxla
3. Component duplicates yoxla

### **✅ Standart Pattern:**
- Tests: `src/__tests__/`
- Stories: `src/__stories__/` (əgər varsa)
- Docs: `docs/` və ya root-da
- Config: root-da və ya `config/`

## 🚨 **CRITICAL DOs & DON'Ts**

### **DO:**
- ✅ Mövcud struktura uymaq
- ✅ search_files() istifadə etmək
- ✅ directory_tree() ilə structure yoxlamaq
- ✅ Mövcud faylları extend etmək
- ✅ Standard naming conventions

### **DON'T:**
- ❌ Parallel structure yaratmaq
- ❌ Mövcud faylları duplicate etmək  
- ❌ Custom qovluq adları
- ❌ Struktura baxmadan yaratmaq
- ❌ Convention-ları ignore etmək

## 📊 **PROBLEM TRACKING**

### **Son Problemlər:**
1. `src/tests/` yaradıldı, `src/__tests__/` ignorlanıldı
2. Service structure yoxlanmadı
3. File duplication həll edilmədi

### **Həll Üsulları:**
1. **Bu faylı hər session başında oxu**
2. **Structure analysis et**
3. **Mövcud pattern-lərə uy**

## 🎯 **AI SESSION BAŞLAMA CHECKLISTT**

1. **Context Faylını Oxu**: Bu fayl (PROJECT_AI_CONTEXT.md)
2. **Directory Structure**: `directory_tree()` işlət
3. **Search Existing**: `search_files()` relevant pattern-lər üçün
4. **Check Duplicates**: Təkrarçılıq yoxla
5. **Follow Patterns**: Mövcud pattern-lərə uy

---

**Bu faylı hər yeni AI session-da MÜTLƏQ oxumaq lazımdır!**
