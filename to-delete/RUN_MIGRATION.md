# İnfoLine Notification System Migration

## TƏCİLİ: Database Migration İcra Et

Yaradılmış SQL faylını database-ə tətbiq etmək üçün aşağıdakı addımları izləyin:

### Metod 1: Supabase Dashboard

1. **Supabase Dashboard-a daxil olun**: https://supabase.com/dashboard
2. **Proyektinizi seçin**: `olbfnauhzpdskqnxtwav`
3. **SQL Editor-ə daxil olun**
4. **`supabase/migrations/20241231_notification_system_final.sql` faylının məzmununu kopyalayın**
5. **SQL Editor-ə yapışdırın və "Run" düyməsinə basın**

### Metod 2: Supabase CLI (Tövsiyə olunan)

```bash
# Proyekt qovluğuna daxil olun
cd /path/to/infoline-edu-hub

# Migration-u icra edin
supabase db push

# Və ya birbaşa SQL faylını icra edin
supabase db reset --linked
```

### Metod 3: Birbaşa SQL icra et

```bash
# SQL faylını birbaşa database-ə tətbiq et
psql -h db.olbfnauhzpdskqnxtwav.supabase.co -U postgres -d postgres -f supabase/migrations/20241231_notification_system_final.sql
```

## ✅ Migration-un Uğurlu Olduğunu Yoxlayın

Migration icra etdikdən sonra:

```sql
-- Bu sorğunu icra edib nəticəni yoxlayın
SELECT verify_notification_system();
```

Gözlənilən nəticə:
```json
{
  "schema_version": "20241231_notification_system_final",
  "tables_created": 4,
  "default_templates": 15,
  "migration_status": "SUCCESS"
}
```

## ⚠️ Əgər Xəta Olarsa

Əgər migration zamanı xəta olarsa:

1. **Xəta mesajını yoxlayın**
2. **Mövcud cədvəllərin vəziyyətini yoxlayın**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%notification%';
   ```
3. **RLS siyasətlərini yoxlayın**:
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename LIKE '%notification%';
   ```

## Növbəti Addım

Migration uğurla tamamlandıqdan sonra [Step 2: Email Template System](./docs/notification-implementation/02-email-template-system.md) addımına keçin.
