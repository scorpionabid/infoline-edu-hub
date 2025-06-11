# AI Prompt Template - İnfoLine Layihəsi

## 🎯 **HƏDƏF**
AI-nin hər dəfə yeni fayl yaratmaq əvəzinə mövcud struktura uymasını təmin etmək.

## 📝 **AI-YƏ GÖNDƏRƏCƏYƏM PROMPT TEMPLATE**

```
Bu layihədə iş görməzdən əvvəl MÜTLƏQ:

1. PROJECT_AI_CONTEXT.md faylını oxu
2. directory_tree() ilə struktura bax  
3. search_files() ilə mövcud faylları tap
4. Təkrarçılıq yaratma, mövcud faylları extend et

MƏCBURU QAYDA: Yeni fayl/qovluq yaratmazdan əvvəl həmişə mövcud struktura bax!

İndi bu qaydaları nəzərə alaraq [KONKRET TAPŞIRIQ] həyata keçir.
```

## 🔧 **KONKRET EXAMPLE PROMPT**

### **Test yaradarkən:**
```
Bu layihədə test fayl əlavə etməzdən əvvəl:

1. PROJECT_AI_CONTEXT.md oxu
2. src/__tests__ qovluğunun strukturuna bax
3. Mövcud test pattern-lərini analiz et
4. YALNIZ mövcud __tests__ qovluğuna əlavə et

İndi useAutoSave hook-u üçün test fayl yarat.
```

### **Service yaradarkən:**
```
Bu layihədə service əlavə etməzdən əvvəl:

1. PROJECT_AI_CONTEXT.md oxu  
2. src/services qovluğunun strukturuna bax
3. Mövcud service pattern-lərini yoxla
4. Mövcud service-i extend et və ya uyğun qovluğa əlavə et

İndi authentication service təkmilləşdir.
```

## 🎯 **BAŞQA AI ALƏTLƏR ÜÇÜN**

### **Windsurf/Cursor üçün:**
`.cursorrules` faylı yarat:
```
# İnfoLine Project Rules
- Always read PROJECT_AI_CONTEXT.md before creating files
- Use existing src/__tests__/ for tests, not src/tests/
- Follow existing directory structure patterns
- Extend existing files instead of creating duplicates
```

### **Copilot üçün:**
Comment-lərdə qaydaları yaz:
```typescript
// PROJECT RULE: Use src/__tests__/ for tests
// PROJECT RULE: Extend existing services in src/services/
// PROJECT RULE: Follow existing patterns, don't create new ones
```

## 🔄 **WORKFLOW**

### **AI ilə işləyərkən həmişə:**

1. **Context verilməsi:**
   ```
   Bu layihənin struktur qaydalarına uy:
   - PROJECT_AI_CONTEXT.md oxu
   - Mövcud struktura bax  
   - Təkrarçılıq yaratma
   ```

2. **Specific task:**
   ```
   [Konkret tapşırığı ver]
   ```

3. **Validation:**
   ```
   Əmin ol ki, yeni fayl yaratmadın, mövcud struktura uydun.
   ```

## 📊 **TRACKİNG**

### **Problem Counter:**
- ❌ `src/tests/` yaradıldı (düzgün: `src/__tests__/`)
- ❌ Duplicate service yaradılma riski

### **Success Metrics:**
- ✅ Mövcud qovluq istifadəsi
- ✅ Pattern-lərə uygunluq
- ✅ Təkrarçılığın qarşısının alınması

---

**Bu template-i hər AI session-da istifadə et!**
