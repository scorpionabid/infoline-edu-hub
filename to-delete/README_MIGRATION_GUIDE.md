# Database Migration Guide - Status İdarəetməsi Sistemi

## 📋 **Migration Faylları**

Bu directory-də 3 migration faylı var:

1. **`20250601_status_management_system.sql`** - Əsas migration
2. **`20250601_status_management_test.sql`** - Test migration  
3. **`20250601_status_management_rollback.sql`** - Rollback migration

---

## 🚀 **Migration İcra Addımları**

### **Metod 1: Supabase CLI (Tövsiyyə edilir)**

```bash
# 1. Layihə directory-sinə gedin
cd /path/to/infoline-edu-hub

# 2. Supabase CLI yoxlayın
supabase status

# 3. Migration-u icra edin
supabase db push

# Və ya spesifik migration:
supabase migration up --include-all
```

### **Metod 2: Supabase Dashboard**

1. **Supabase Dashboard** açın: https://supabase.com/dashboard
2. **SQL Editor** tab-ına gedin  
3. **`20250601_status_management_system.sql`** faylının məzmununu kopyalayın
4. SQL Editor-də yapışdırın və **RUN** düyməsini basın
5. Uğurlu olduqdan sonra test migration-u da icra edin

### **Metod 3: psql (Advanced)**

```bash
# 1. Database connection
psql "postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"

# 2. Migration icra
\i /path/to/20250601_status_management_system.sql

# 3. Test migration
\i /path/to/20250601_status_management_test.sql
```

---

## ✅ **Migration Verification**

Migration icra etdikdən sonra bu testləri aparın:

### **1. Sistem Validasiyası**
```sql
-- Migration-un uğurlu olub-olmadığını yoxlayın
SELECT * FROM test_status_management_system();
```

**Expected Output:**
```
test_name                  | result | message
---------------------------|--------|------------------
Status Transition Log Table| true   | Table exists
Status Validation Trigger  | true   | Trigger exists  
RLS Policies               | true   | Policies active
Status Constraint          | true   | Constraint active
Utility Functions          | true   | Functions available
Notification System        | true   | Notifications enabled
```

### **2. Test Ssenariləri**
```sql
-- Test ssenarilərinə baxın  
SELECT * FROM create_status_test_data();
```

### **3. Performance Test**
```sql
-- Performance yoxlayın
SELECT * FROM test_status_performance();
```

---

## 🧪 **Manual Testing**

Migration-dan sonra bu manual testləri aparın:

### **Test 1: Status Transition (School Admin)**
```sql
-- 1. Test user-ə school admin rolu verin
-- 2. Draft data yaradın
INSERT INTO data_entries (school_id, category_id, column_id, value, status) 
VALUES ('school-id', 'category-id', 'column-id', 'test-value', 'draft');

-- 3. Pending-ə çevirməyə çalışın  
UPDATE data_entries SET status = 'pending' 
WHERE school_id = 'school-id' AND category_id = 'category-id';
-- ✅ Bu uğurlu olmalıdır
```

### **Test 2: Unauthorized Transition**
```sql
-- School admin user-i ilə pending-i approved-ə çevirməyə çalışın
UPDATE data_entries SET status = 'approved' 
WHERE school_id = 'school-id' AND category_id = 'category-id';
-- ❌ Bu xəta verməlidir: "Status transition not allowed"
```

### **Test 3: Approved Data Protection**
```sql
-- 1. Sector admin user-i ilə data-nı approve edin
-- 2. Approved data-nı dəyişdirməyə çalışın
UPDATE data_entries SET value = 'modified-value' 
WHERE status = 'approved';
-- ❌ Bu xəta verməlidir: "Cannot modify approved entries"
```

---

## 📊 **Migration Nəticələri**

Migration uğurlu olduqda bu features aktiv olacaq:

### **✅ Aktivləşən Features:**

1. **Status Transition Validation**
   - DRAFT → PENDING (School Admin only)
   - PENDING → APPROVED/REJECTED (Sector/Region Admin only)
   - REJECTED → DRAFT (School Admin only)
   - APPROVED = Immutable (heç kim dəyişə bilməz)

2. **Comprehensive Audit Trail**
   - Bütün status dəyişiklikləri `status_transition_log` table-da qeyd edilir
   - Kim, nə vaxt, nəyi dəyişdirib - hamısı log-lanır

3. **Enhanced RLS Policies**
   - Role-based data access
   - Status-aware permissions
   - Secure data isolation

4. **Advanced Notifications**
   - Status dəyişikliklərində avtomatik bildirişlər
   - Müvafiq user-lərə targeted notifications

5. **Data Integrity Protection**
   - Approved data immutable
   - Status constraint validation
   - Permission-based modifications

### **🔧 Yeni Utility Functions:**

```sql
-- Current status əldə etmək
SELECT get_entry_status('school-id', 'category-id');

-- Status history görmək
SELECT * FROM get_status_history('school-id', 'category-id');

-- Permission yoxlamaq
SELECT check_data_entry_permission('school-id', 'pending', 'write');
```

---

## 🔄 **Rollback (Əgər Lazım Olarsa)**

Əgər migration-da problem olarsa:

```sql
-- Rollback migration icra edin
\i /path/to/20250601_status_management_rollback.sql
```

**⚠️ Diqqət:** Rollback əvvəl audit data-nı backup edəcək, amma status protection silinəcək.

---

## 🐛 **Troubleshooting**

### **Yaygın Problemlər:**

1. **"permission denied for function" xətası**
   ```sql
   -- Solution: Admin user ilə migration icra edin
   ```

2. **"relation already exists" xətası**
   ```sql
   -- Solution: Migration əvvəlcədən icra olunub, rollback edin
   ```

3. **RLS policy konfliktləri**
   ```sql
   -- Solution: Mövcud policy-ləri silmək lazım ola bilər
   DROP POLICY IF EXISTS "existing_policy_name" ON data_entries;
   ```

4. **Trigger konfliktləri**
   ```sql
   -- Solution: Mövcud trigger-ləri yoxlayın
   SELECT * FROM information_schema.triggers WHERE table_name = 'data_entries';
   ```

---

## 📞 **Support**

Migration problemləri üçün:

1. **Log-ları yoxlayın:** Migration error message-larına diqqət edin
2. **Test funksiyaları istifadə edin:** `test_status_management_system()`
3. **Step-by-step test edin:** Hər test ssenariusunu ayrıca icra edin
4. **Rollback ready:** Problem olarsa rollback migration hazırdır

---

## 🎯 **Növbəti Addımlar**

Migration uğurlu olduqdan sonra:

1. **Frontend test edin:** Status-based UI-ın işlədiyini yoxlayın
2. **User roles yoxlayın:** Müxtəlif rollarla test edin  
3. **Performance monitor edin:** Böyük data ilə test edin
4. **Backup planı hazırlayın:** Regular audit data backup

Migration uğurlu olsun! 🚀
