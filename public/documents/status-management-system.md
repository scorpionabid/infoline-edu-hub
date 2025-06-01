# Status Management System: İnfoLine Məlumat Təsdiq Sistemi

## 1. Giriş və Ümumi Baxış

İnfoLine Status Management Sistemi, məktəb məlumatlarının daxiletməsindən təsdiqinə qədər olan bütün iş axınını idarə edir. Bu sistem **PRD tələblərinə uyğun** olaraq yaradılıb və məlumatların təhlükəsizliyini, tamlığını və düzgünlüyünü təmin edir.

### 1.1. Məqsəd

- Məktəb məlumatlarının tam və strukturlu təsdiq prosesi
- Rol əsaslı status dəyişiklikləri
- Tam audit trail və nəzarət
- Təsdiqlənmiş məlumatların qorunması

### 1.2. Status Workflow

```
DRAFT ──────► PENDING ──────► APPROVED
  │              │              │
  │              ▼              │
  │          REJECTED ──────────┘
  │              │
  └──────────────┘
```

## 2. Status Növləri və Təsviri

### 2.1. Status Tipləri

| Status | Azərbaycan | İngilis | Təsvir | Kim edə bilər |
|--------|------------|---------|--------|---------------|
| **DRAFT** | Qaralama | Draft | İlkin məlumat hazırlığı | SchoolAdmin |
| **PENDING** | Gözləmədə | Pending | Təsdiq üçün göndərilmiş | SchoolAdmin → Admin |
| **APPROVED** | Təsdiqlənmiş | Approved | Rəsmi qəbul edilmiş | SectorAdmin/RegionAdmin |
| **REJECTED** | Rədd edilmiş | Rejected | Rədd edilmiş, düzəlişə ehtiyac | Admin → SchoolAdmin |

### 2.2. Status Xüsusiyyətləri

#### **DRAFT (Qaralama)**
- **Məqsəd**: İlkin məlumat hazırlığı və redaktə
- **Əməliyyatlar**: Edit, Save, Submit
- **Məhdudiyyətlər**: Yalnız məktəb admini
- **Validasiya**: Yoxdur
- **Auto-save**: 30 saniyədə bir

#### **PENDING (Gözləmədə)**
- **Məqsəd**: Üst səviyyə admin tərəfindən baxış və qiymətləndirmə
- **Əməliyyatlar**: Approve, Reject
- **Məhdudiyyətlər**: Redaktə edilə bilməz
- **Validasiya**: Bütün məcburi sahələr doldurulmuş olmalı
- **Bildirişlər**: Təsdiq edəcək adminlərə

#### **APPROVED (Təsdiqlənmiş)**
- **Məqsəd**: Rəsmi məlumat kimi qəbul edilmiş
- **Əməliyyatlar**: Yalnız view (baxış)
- **Məhdudiyyətlər**: Heç kim redaktə edə bilməz (immutable)
- **Finallaşma**: Hesabatlarda istifadə üçün hazır
- **Archive**: Tarixi qeyd olaraq saxlanılır

#### **REJECTED (Rədd edilmiş)**
- **Məqsəd**: Düzəliş tələb edən məlumat
- **Əməliyyatlar**: Reset to Draft, Edit
- **Səbəb**: Rədd səbəbi məcburi
- **Yenidən**: SchoolAdmin tərəfindən düzəliş

## 3. İş Axını Qaydaları

### 3.1. Status Transition Qaydaları

#### **Draft → Pending**
- **Kim**: SchoolAdmin
- **Şərt**: Bütün məcburi sahələr doldurulmalı
- **Validasiya**: Automatic validation əvvəlcədən
- **Nəticə**: Təsdiq gözləyir

#### **Pending → Approved**
- **Kim**: SectorAdmin, RegionAdmin, SuperAdmin
- **Şərt**: İcazə yoxlaması keçməli
- **Təsdiq**: İxtiyari şərh əlavə edilə bilər
- **Nəticə**: Artıq dəyişdirilə bilməz

#### **Pending → Rejected**
- **Kim**: SectorAdmin, RegionAdmin, SuperAdmin
- **Şərt**: Rədd səbəbi **məcburi**
- **Səbəb**: Minimum 10 simvol
- **Nəticə**: SchoolAdmin-ə bildiriş

#### **Rejected → Draft**
- **Kim**: SchoolAdmin
- **Şərt**: Öz məktəbinin məlumatı
- **Reset**: Bütün validasiya yenilənir
- **Düzəliş**: Sərbəst redaktə imkanı

### 3.2. Qadağan Edilmiş Transitions

❌ **APPROVED → hər hansı digər status**
❌ **DRAFT → APPROVED** (birbaşa)
❌ **REJECTED → APPROVED** (birbaşa)

## 4. Texniki İmplementasiya

### 4.1. Database Strukturu

#### **status_transition_log** tablosu
```sql
CREATE TABLE status_transition_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_entry_id VARCHAR(255) NOT NULL,     -- schoolId-categoryId
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comment TEXT,
  metadata JSONB
);
```

#### **data_entries** tablosuna əlavə
```sql
-- Status sütunu əlavə edildi
ALTER TABLE data_entries 
ADD COLUMN status TEXT DEFAULT 'draft' 
CHECK (status IN ('draft', 'pending', 'approved', 'rejected'));
```

### 4.2. Trigger Validation

```sql
CREATE OR REPLACE FUNCTION validate_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Təsdiqlənmiş məlumatları qoru
  IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
    RAISE EXCEPTION 'Cannot modify approved entries';
  END IF;
  
  -- Rol əsaslı keçid yoxlaması
  -- (DetailLi kod trigger-də mövcuddur)
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3. StatusTransitionService

#### **Əsas metodlar:**
```typescript
class StatusTransitionService {
  // Status keçidinin mümkünlüyünü yoxlayır
  static async canTransition(
    currentStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    context: TransitionContext
  ): Promise<TransitionResult>
  
  // Status keçidini icra edir
  static async executeTransition(
    currentStatus: DataEntryStatus,
    newStatus: DataEntryStatus,
    context: TransitionContext
  ): Promise<ServiceResponse>
  
  // Mövcud status-u əldə edir
  static async getCurrentStatus(
    schoolId: string,
    categoryId: string
  ): Promise<DataEntryStatus | null>
}
```

### 4.4. useStatusPermissions Hook

```typescript
export const useStatusPermissions = (
  entryStatus: DataEntryStatus | undefined,
  categoryId: string,
  schoolId: string
): StatusPermissions => {
  // Status-a əsaslı icazələri qaytarır:
  // - canEdit, canSubmit, canApprove, canReject
  // - readOnly, allowedActions
  // - alerts və statusInfo
}
```

## 5. UI Komponentləri

### 5.1. Status Display Components

#### **StatusBadge**
```typescript
<StatusBadge 
  status="pending" 
  size="md" 
  className="custom-class" 
/>
```

#### **Status Alert**
```typescript
{dataManager.statusPermissions.alerts.message && (
  <Alert variant={alertVariant}>
    <StatusIcon />
    <AlertDescription>
      {dataManager.statusPermissions.alerts.message}
    </AlertDescription>
  </Alert>
)}
```

### 5.2. Action Buttons

#### **Status-Aware Actions**
```typescript
// Edit - yalnız draft və rejected-də
{statusPermissions.canEdit && (
  <Button onClick={handleSave}>
    <Save /> Save Draft
  </Button>
)}

// Submit - yalnız draft-dan
{statusPermissions.canSubmit && (
  <Button onClick={handleSubmit}>
    <Send /> Submit for Approval
  </Button>
)}

// Approve/Reject - yalnız pending-də
{statusPermissions.canApprove && (
  <Button onClick={handleApprove}>
    <CheckCircle /> Approve
  </Button>
)}
```

### 5.3. Approval/Rejection Dialogs

#### **Approval Dialog**
```typescript
<Dialog open={showApprovalDialog}>
  <DialogContent>
    <DialogTitle>Approve Data</DialogTitle>
    <Textarea 
      placeholder="Optional approval comment"
      value={approvalComment}
      onChange={setApprovalComment}
    />
    <DialogFooter>
      <Button onClick={handleApprovalConfirm}>
        <CheckCircle /> Approve
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### **Rejection Dialog**
```typescript
<Dialog open={showRejectionDialog}>
  <DialogContent>
    <DialogTitle>Reject Data</DialogTitle>
    <Textarea 
      placeholder="Rejection reason (required)"
      value={rejectionReason}
      onChange={setRejectionReason}
      required
    />
    <DialogFooter>
      <Button 
        onClick={handleRejectionConfirm}
        disabled={!rejectionReason.trim()}
      >
        <AlertCircle /> Reject
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## 6. Security və Permissions

### 6.1. Rol əsaslı Status Əməliyyatları

| Rol | Draft | Pending | Approved | Rejected |
|-----|-------|---------|----------|----------|
| **SchoolAdmin** | ✅ Edit, Submit | ❌ | ❌ | ✅ Edit, Reset |
| **SectorAdmin** | ✅ View | ✅ Approve, Reject | ✅ View | ✅ View |
| **RegionAdmin** | ✅ View | ✅ Approve, Reject | ✅ View | ✅ View |
| **SuperAdmin** | ✅ All | ✅ All | ✅ View | ✅ All |

### 6.2. Database Level Protection

#### **RLS Policies Enhancement**
```sql
-- Enhanced data_entries policy
CREATE POLICY "enhanced_data_entries_policy" ON data_entries
  FOR ALL TO authenticated 
  USING (
    -- Approved entries - read only for school admins
    (status = 'approved' AND is_schooladmin() AND school_id = get_user_school_id()) OR
    
    -- Non-approved entries - normal rules apply
    (COALESCE(status, 'draft') != 'approved' AND 
     (is_superadmin() OR 
      (is_regionadmin() AND EXISTS(...)) OR
      (is_sectoradmin() AND EXISTS(...)) OR
      (is_schooladmin() AND school_id = get_user_school_id())))
  );
```

### 6.3. Audit Trail və Logging

#### **Status Transition Log**
- Hər status dəyişikliyi qeydə alınır
- Kim, nə vaxt, hansı səbəblə dəyişdirib
- Metadata: school_id, category_id, user_role
- Comment: Optional approval/rejection comments

#### **Log Sorğuları**
```sql
-- Məlumat entry-nin tarixçəsi
SELECT * FROM status_history_view 
WHERE data_entry_id = 'school123-category456'
ORDER BY changed_at DESC;

-- Son 24 saatda statusu dəyişən məlumatlar
SELECT * FROM status_history_view 
WHERE changed_at > NOW() - INTERVAL '24 hours';
```

## 7. Bildiriş Sistemi

### 7.1. Avtomatik Bildirişlər

#### **Status dəyişiklikləri üçün:**
- **Draft → Pending**: Sector/Region adminlərinə
- **Pending → Approved**: SchoolAdmin-ə müsbət bildiriş
- **Pending → Rejected**: SchoolAdmin-ə səbəb ilə

#### **Bildiriş Məzmunu:**
```typescript
// Pending bildirişi
{
  title: "Təsdiq üçün göndərildi",
  message: "Məktəb X-in Y kateqoriyası təsdiq gözləyir",
  type: "status_change",
  priority: "medium"
}

// Approval bildirişi
{
  title: "Məlumatlar təsdiqləndi",
  message: "Y kateqoriyasındakı məlumatlarınız təsdiqləndi",
  type: "status_change", 
  priority: "normal"
}
```

### 7.2. E-mail Bildirişləri (Gələcək)

- Kritik status dəyişikliklər üçün e-mail
- Haftalıq pending entries xülasəsi
- Deadline yaxınlaşanda xatırlatma

## 8. Performance və Optimizasiya

### 8.1. Indexing Strategiyası

```sql
-- Status transition log performansı üçün
CREATE INDEX idx_status_transition_log_entry_id 
  ON status_transition_log(data_entry_id);
  
CREATE INDEX idx_status_transition_log_changed_at 
  ON status_transition_log(changed_at DESC);

-- Data entries status filtri üçün  
CREATE INDEX idx_data_entries_status 
  ON data_entries(status);
```

### 8.2. Caching Strategiyası

```typescript
// Status permissions cache
const statusPermissions = useMemo(() => {
  return calculateStatusPermissions(entryStatus, userRole, schoolId);
}, [entryStatus, userRole, schoolId]);

// Status transition rules cache
const cachedTransitionRules = useMemo(() => {
  return STATUS_TRANSITIONS.filter(t => t.from === currentStatus);
}, [currentStatus]);
```

## 9. Test Scenarios

### 9.1. Unit Tests

```typescript
describe('StatusTransitionService', () => {
  test('should allow draft to pending for school admin', () => {
    const result = StatusTransitionService.canTransition(
      DataEntryStatus.DRAFT,
      DataEntryStatus.PENDING,
      'schooladmin',
      'user-id',
      { schoolId: 'school-1' }
    );
    expect(result.allowed).toBe(true);
  });
  
  test('should prevent approved modification', () => {
    const result = StatusTransitionService.canTransition(
      DataEntryStatus.APPROVED,
      DataEntryStatus.DRAFT,
      'superadmin',
      'user-id', 
      { schoolId: 'school-1' }
    );
    expect(result.allowed).toBe(false);
  });
});
```

### 9.2. Integration Tests

```typescript
describe('Complete Status Workflow', () => {
  test('draft → pending → approved workflow', async () => {
    // 1. SchoolAdmin yaradır draft
    const draftEntry = await createEntry('draft');
    
    // 2. SchoolAdmin submit edir
    const pendingEntry = await submitForApproval(draftEntry.id);
    expect(pendingEntry.status).toBe('pending');
    
    // 3. SectorAdmin təsdiq edir
    const approvedEntry = await approveEntry(pendingEntry.id);
    expect(approvedEntry.status).toBe('approved');
    
    // 4. Approved entry dəyişdirilə bilməz
    await expect(updateEntry(approvedEntry.id))
      .rejects.toThrow('Cannot modify approved entries');
  });
});
```

### 9.3. End-to-End Tests

```typescript
describe('Status Management E2E', () => {
  test('complete user workflow through statuses', async () => {
    // SchoolAdmin login
    await loginAs('schooladmin');
    
    // Create and save draft
    await createDataEntry('draft');
    expect(await getStatusBadge()).toContain('Draft');
    
    // Submit for approval
    await clickSubmitButton();
    expect(await getStatusBadge()).toContain('Pending');
    
    // SectorAdmin approves
    await loginAs('sectoradmin'); 
    await clickApproveButton();
    expect(await getStatusBadge()).toContain('Approved');
  });
});
```

## 10. Monitoring və Analytics

### 10.1. Status Metrics

```sql
-- Status distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM data_entries 
GROUP BY status;

-- Average approval time
SELECT 
  AVG(approved_at - created_at) as avg_approval_time
FROM data_entries 
WHERE status = 'approved';

-- Rejection rates
SELECT 
  changed_by_name,
  COUNT(*) FILTER (WHERE new_status = 'rejected') as rejections,
  COUNT(*) FILTER (WHERE new_status = 'approved') as approvals,
  ROUND(
    COUNT(*) FILTER (WHERE new_status = 'rejected') * 100.0 / 
    NULLIF(COUNT(*), 0), 2
  ) as rejection_rate
FROM status_history_view 
WHERE new_status IN ('approved', 'rejected')
GROUP BY changed_by_name;
```

### 10.2. Dashboard Metrics

- **Real-time status counts**: Draft, Pending, Approved, Rejected
- **Approval timeline**: Average time by status
- **User activity**: Who approves/rejects most  
- **School performance**: Completion rates by status

## 11. Troubleshooting və Support

### 11.1. Ümumi Problemlər

#### **Status stuck in pending**
```sql
-- Pending entries investigation
SELECT 
  stl.data_entry_id,
  stl.changed_at,
  stl.changed_by,
  p.full_name,
  p.email
FROM status_transition_log stl
JOIN profiles p ON stl.changed_by = p.id  
WHERE stl.new_status = 'pending'
  AND stl.changed_at < NOW() - INTERVAL '7 days';
```

#### **Permission denied errors**
```typescript
// Debug permission issues
console.log('Debug Status Permissions:', {
  entryStatus: dataManager.entryStatus,
  userRole: user.role,
  schoolId: schoolId,
  statusPermissions: dataManager.statusPermissions,
  canEdit: statusPermissions.canEdit,
  canSubmit: statusPermissions.canSubmit
});
```

### 11.2. Manual Status Fixes (Admin Only)

```sql
-- EMERGENCY: Manual status reset (SuperAdmin only)
UPDATE data_entries 
SET status = 'draft',
    updated_at = NOW()
WHERE school_id = ? AND category_id = ?
  AND status = 'pending'
  AND created_at < NOW() - INTERVAL '30 days';

-- Log manual intervention
INSERT INTO status_transition_log (
  data_entry_id, old_status, new_status, 
  changed_by, comment, metadata
) VALUES (
  ?, 'pending', 'draft',
  auth.uid(), 'Manual reset - emergency intervention',
  '{"type": "manual_reset", "reason": "stuck_pending"}'
);
```

## 12. Gələcək Təkmilləşdirmələr

### 12.1. Planned Features

- **Batch Status Operations**: Çoxlu məlumatların eyni vaxtda təsdiqi
- **Conditional Approvals**: Müəyyən şərtlər daxilində avtomatik təsdiq
- **Status History API**: External systems üçün status tracking
- **Advanced Notifications**: Slack/Teams integration
- **Status Templates**: Different workflows for different categories

### 12.2. Advanced Workflow

```
DRAFT → REVIEW → PENDING → APPROVED
   │       │        │         │
   │       ▼        ▼         │  
   │   RETURNED → REJECTED ────┘
   │       │        │
   └───────┴────────┘
```

### 12.3. Machine Learning Integration

- **Auto-approval prediction**: ML model for low-risk entries
- **Anomaly detection**: Unusual data patterns
- **Quality scoring**: Automatic quality assessment

---

Bu Status Management sistemi, İnfoLine platformasında məlumat təsdiq prosesinin tam avtomatlaşdırılması və effektiv idarə edilməsini təmin edir. Sistem təhlükəsizlik, performans və istifadəçi təcrübəsini nəzərə alaraq hazırlanıb və PRD tələblərinə tam uyğundur.
