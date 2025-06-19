# İnfoLine Approval System - Detallı İmplementasiya Planı v2.0 (Hissə 1/4)

## 📋 Executive Summary

Bu plan, İnfoLine təhsil məlumat sistemində mövcud komponentlər üzərində minimal refactoring ilə comprehensive approval workflow tətbiq edir. Mövcud kod bazasının 70%-i artıq approval functionality-ni dəstəkləyir və yalnız enhancement və integration tələb olunur.

## 🔍 Mövcud Sistemi Dəqiq Analizi

### ✅ Mövcud və İşləyən Komponentlər

#### 1. Database Schema - **95% Hazır**
```sql
-- Mövcud və tam functional
data_entries {
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  approved_by: uuid
  approved_at: timestamp
  rejected_by: uuid  
  rejection_reason: text
  approval_comment: text
  proxy_* fields: Admin proxy submissions
}

audit_logs {
  -- Tam audit trail mövcud
}

status_transition_log {
  -- StatusHistoryService tərəfindən idarə olunur
}
```

#### 2. Status Management - **90% Hazır**
**Fayl**: `src/services/statusTransitionService.ts`
- ✅ Complete status workflow engine
- ✅ Permission validation
- ✅ Audit logging
- ✅ Notification system
- ⚠️ Enhancement needed: Real-time updates

#### 3. Data Entry Components - **80% Hazır**

**School Admin Data Entry**:
- ✅ `SchoolAdminDataEntry.tsx` - Form management
- ✅ `useDataEntryManager.ts` - State management
- ✅ Status display və transitions
- ⚠️ Enhancement needed: Approval submission workflow

**Sector Admin Proxy Entry**:
- ✅ `SectorDataEntry.tsx` - Proxy data entry
- ✅ Bulk operations interface
- ⚠️ Enhancement needed: Auto-approval integration

#### 4. Basic Approval Interface - **40% Hazır**
**Fayl**: `src/components/approval/ApprovalManager.tsx`
- ✅ Basic approval UI structure
- ✅ Mock data integration
- ❌ Real data integration missing
- ❌ Advanced filtering missing
- ❌ Bulk operations missing

### ❌ Yoxdur və Yaradılmalıdır

1. **Enhanced Approval Service** - Real data integration
2. **Approval Details Modal** - Detailed review interface
3. **Bulk Approval Component** - Multi-item operations
4. **Advanced Filtering** - Search və filter functionality
5. **Real-time Updates** - WebSocket integration

## 🎯 Detallı İmplementasiya Planı

### Phase 1: Database Enhancement (1 gün)

#### 1.1 Approval Utility Functions
**Fayl**: `supabase/functions/approval-operations/index.ts`

```sql
-- Bulk approval function
CREATE OR REPLACE FUNCTION bulk_approve_entries(
  entry_ids UUID[],
  admin_id UUID,
  comment TEXT DEFAULT NULL
) RETURNS TABLE(
  success_count INTEGER,
  error_count INTEGER,
  errors JSONB
) AS $$
DECLARE
  entry_id UUID;
  success_count INTEGER := 0;
  error_count INTEGER := 0;
  errors JSONB := '[]'::JSONB;
BEGIN
  FOREACH entry_id IN ARRAY entry_ids LOOP
    BEGIN
      -- Validate permission and update
      UPDATE data_entries 
      SET 
        status = 'approved',
        approved_by = admin_id,
        approved_at = NOW(),
        approval_comment = comment
      WHERE id = entry_id
        AND status = 'pending'
        AND EXISTS (
          SELECT 1 FROM validate_approval_permission(entry_id, admin_id)
        );
      
      IF FOUND THEN
        success_count := success_count + 1;
      ELSE
        error_count := error_count + 1;
        errors := errors || jsonb_build_object('entry_id', entry_id, 'error', 'Permission denied or invalid status');
      END IF;
      
    EXCEPTION WHEN OTHERS THEN
      error_count := error_count + 1;
      errors := errors || jsonb_build_object('entry_id', entry_id, 'error', SQLERRM);
    END;
  END LOOP;
  
  RETURN QUERY SELECT success_count, error_count, errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enhanced get_approval_items function
CREATE OR REPLACE FUNCTION get_approval_items(
  admin_user_id UUID,
  status_filter TEXT DEFAULT 'pending',
  region_filter UUID DEFAULT NULL,
  sector_filter UUID DEFAULT NULL,
  category_filter UUID DEFAULT NULL,
  search_term TEXT DEFAULT NULL,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
) RETURNS TABLE(
  entry_id TEXT,
  school_id UUID,
  school_name TEXT,
  category_id UUID,
  category_name TEXT,
  status TEXT,
  submitted_by UUID,
  submitted_at TIMESTAMP,
  completion_rate INTEGER,
  can_approve BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    CONCAT(s.id::TEXT, '-', c.id::TEXT) as entry_id,
    s.id as school_id,
    s.name as school_name,
    c.id as category_id,
    c.name as category_name,
    COALESCE(de.status, 'draft') as status,
    de.created_by as submitted_by,
    de.created_at as submitted_at,
    COALESCE(s.completion_rate, 0) as completion_rate,
    (
      -- Check if admin can approve this school
      SELECT EXISTS(
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = admin_user_id
          AND (
            ur.role = 'superadmin' OR
            (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
            (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id)
          )
      )
    ) as can_approve
  FROM schools s
  CROSS JOIN categories c
  LEFT JOIN data_entries de ON de.school_id = s.id AND de.category_id = c.id
  WHERE 
    -- Admin permission filter
    EXISTS(
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id = admin_user_id
        AND (
          ur.role = 'superadmin' OR
          (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
          (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id)
        )
    )
    -- Status filter
    AND (status_filter IS NULL OR COALESCE(de.status, 'draft') = status_filter)
    -- Region filter
    AND (region_filter IS NULL OR s.region_id = region_filter)
    -- Sector filter  
    AND (sector_filter IS NULL OR s.sector_id = sector_filter)
    -- Category filter
    AND (category_filter IS NULL OR c.id = category_filter)
    -- Search filter
    AND (
      search_term IS NULL OR 
      s.name ILIKE '%' || search_term || '%' OR
      c.name ILIKE '%' || search_term || '%'
    )
    -- Only active categories
    AND c.status = 'active'
    -- Only active schools
    AND s.status = 'active'
  ORDER BY de.created_at DESC NULLS LAST
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permission validation function
CREATE OR REPLACE FUNCTION validate_approval_permission(
  school_id_param UUID,
  admin_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 
    FROM user_roles ur
    JOIN schools s ON s.id = school_id_param
    WHERE ur.user_id = admin_id
      AND (
        ur.role = 'superadmin' OR
        (ur.role = 'regionadmin' AND ur.region_id = s.region_id) OR
        (ur.role = 'sectoradmin' AND ur.sector_id = s.sector_id)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Mövcud vs Yeni Komponentsiya Müqayisəsi

| Komponent | Mövcud Status | Tələb Olunan Enhancement | Prioritet |
|-----------|---------------|--------------------------|-----------|
| **Database Functions** | ❌ Yoxdur | Bulk operations, filtering | HIGH |
| **Approval Service** | ❌ Yoxdur | Complete service layer | HIGH |
| **Approval Manager** | ⚠️ Basic | Real data, filtering, bulk ops | HIGH |
| **Filters Component** | ❌ Yoxdur | Advanced search/filter | MEDIUM |
| **Details Modal** | ❌ Yoxdur | Detailed review interface | MEDIUM |
| **Bulk Dialog** | ❌ Yoxdur | Multi-item operations | MEDIUM |
| **Real-time Updates** | ❌ Yoxdur | WebSocket integration | LOW |

## 🔧 Key Integration Points

### Mövcud Status Transition Service Integration
**Fayl**: `src/services/statusTransitionService.ts` - **90% hazır**

Bu service artıq aşağıdakı funksionallığı təmin edir:
- ✅ Status validation və transitions
- ✅ Permission checking
- ✅ Audit logging
- ✅ Notification sending

**Tələb olunan enhancement**:
- Real-time subscription integration
- Bulk operations support

### Mövcud Data Entry Manager Integration
**Fayl**: `src/hooks/dataEntry/useDataEntryManager.ts` - **80% hazır**

Bu hook artıq aşağıdakı funksionallığı təmin edir:
- ✅ Form state management
- ✅ Auto-save functionality
- ✅ Status tracking
- ✅ Data validation

**Tələb olunan enhancement**:
- Approval submission workflow
- Status-based UI updates
- Rejection feedback handling

---

**Növbəti Hissələr:**
- **Hissə 2**: Enhanced Services və Hooks
- **Hissə 3**: React Components
- **Hissə 4**: Integration və Testing Plan

**[ESTIMATE: Bu hissə database və mövcud system analizini əhatə edir, ~3000 token]**