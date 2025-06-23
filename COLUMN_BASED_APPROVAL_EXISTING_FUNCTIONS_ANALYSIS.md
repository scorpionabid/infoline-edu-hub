# Column-Based Approval - Mövcud Funksiyaları İstifadə Edən Refactored Service

## Analiz Nəticəsi

Mövcud funksiyaları analiz etdikdən sonra aşağıdakı optimizasiyanı edə bilərik:

### ✅ İstifadə Edə Biləcəyimiz Mövcud Funksiyalar:

1. **`columns` cədvəli** - birbaşa istifadə
2. **`categories` cədvəli** - column count əlavə edə bilərik  
3. **`data_entries` cədvəli** - join edərək
4. **`schools`, `sectors`, `regions`** - birbaşa join
5. **`update_entries_status`** - individual approval üçün
6. **`log_status_change`** - tarixçə üçün
7. **`has_access_to_*`** funksiyalar - permission check üçün

### 🔧 Yalnız 2 Yeni Funksiya Lazımdır:

1. **`get_categories_with_column_counts_for_approval()`** - sadə COUNT query
2. **`bulk_approve_reject_column_entries()`** - mövcud funksiyaları loop edən

## Refactored Service Implementation

Mövcud funksiyaları istifadə edərək service-i yenidən yazırıq:

```typescript
class ColumnBasedApprovalService {
  
  // 1. Categories - Simple query with JOIN
  static async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        assignment,
        status,
        columns!inner(count)
      `)
      .eq('status', 'active');
    // Process count manually
  }

  // 2. Columns - Direct from existing table
  static async getColumnsByCategory(categoryId: string) {
    const { data, error } = await supabase
      .from('columns')
      .select('*')
      .eq('category_id', categoryId)
      .eq('status', 'active');
  }

  // 3. School Data - Complex JOIN query
  static async getSchoolDataByColumn(columnId: string, filter: ColumnBasedFilter) {
    let query = supabase
      .from('data_entries')
      .select(`
        *,
        schools!inner(id, name, sector_id, region_id),
        schools.sectors!inner(id, name),
        schools.regions!inner(id, name)
      `)
      .eq('column_id', columnId);

    if (filter.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }
    // Add other filters...
    
    return query;
  }

  // 4. Individual approval - Use existing function
  static async approveEntry(schoolId: string, columnId: string, comment?: string) {
    const { data, error } = await supabase.rpc('update_entries_status', {
      p_school_id: schoolId,
      p_category_id: null, // We'll get from column
      p_status: 'approved',
      p_user_id: currentUserId,
      p_reason: comment
    });
  }

  // 5. Bulk operations - Loop existing functions
  static async bulkApprove(schoolIds: string[], columnId: string, comment?: string) {
    const results = [];
    for (const schoolId of schoolIds) {
      try {
        await this.approveEntry(schoolId, columnId, comment);
        results.push({ schoolId, success: true });
      } catch (error) {
        results.push({ schoolId, success: false, error: error.message });
      }
    }
    return results;
  }
}
```

## Üstünlüklər:

1. **Yeni SQL yazmırıq** - mövcud infrastrukturu istifadə edirik
2. **Sürətli implementasiya** - dərhal test edə bilərik  
3. **Az risk** - mövcud sistem pozulmur
4. **Incremental** - əvvəl bu, sonra optimize edirik

## Əksiklər:

1. **Performance** - loop-based bulk operations yavaşdır
2. **Transactions** - bulk operations atomic deyil
3. **Complex queries** - multiple joins frontend-də

## Təklif:

1. **İlk versiya** - mövcud funksiyalarla
2. **Sonrakı optimize** - performance lazım olduqda SQL funksiyalar yaratırıq
