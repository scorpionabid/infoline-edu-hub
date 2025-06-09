# Columns Səhifəsi Səliqəyə Salma və Funksionallıq Təkmilləşdirmə Planı

## 📋 Məqsəd
Columns səhifəsinin UI/UX-ini təkmilləşdirmək, silinmiş sütunlar üçün arxiv sistemi yaratmaq və bərpa/tam silinmə funksionallığı əlavə etmək.

## 🎯 Əsas Məqsədlər

### 1. UI Təmizləmə və Sadələşdirmə
- [ ] Artıq filtirləri silmək (yalnız axtarış saxlamaq)
- [ ] `columnsPageTitle` və `columnsPageDescription` gizlətmək
- [ ] Daha minimal və təmiz interfeys yaratmaq
- [ ] Layout və spacing-i yaxşılaşdırmaq

### 2. Tab Sistem Yaratmaq
- [ ] **"Aktiv Sütunlar"** tabı (status = 'active')
- [ ] **"Arxiv"** tabı (status = 'deleted') 
- [ ] Tab sayına görə badge göstərmək
- [ ] Tab keçid animasiyaları

### 3. Silinmiş Sütunlar üçün Funksionallıq
- [ ] Bərpa funksionallığı (status 'deleted' → 'active')
- [ ] Tam silinmə funksionallığı (hard delete)
- [ ] Toplu əməliyyatlar (batch operations)
- [ ] Confirmation dialog-ları

### 4. Yaxşılaşdırılmış Komponentlər
- [ ] Status badge-ləri və göstəricilər
- [ ] Loading states və error handling
- [ ] Accessibility təkmilləşdirmələri

## 📁 Fayllar və Komponentlər

### Dəyişdirilən Fayllar:
```
📄 src/pages/Columns.tsx                    - Əsas səhifə komponenti
📄 src/components/columns/ColumnList.tsx    - Sütunlar siyahısı
📄 src/components/columns/ArchivedColumnList.tsx    - YENİ: Arxiv siyahısı
📄 src/components/columns/ColumnTabs.tsx    - YENİ: Tab komponenti
📄 src/components/columns/RestoreColumnDialog.tsx   - YENİ: Bərpa dialoqu
📄 src/components/columns/PermanentDeleteDialog.tsx - YENİ: Tam silinmə dialoqu
📄 src/hooks/columns/useColumnMutations.ts  - Bərpa və tam silinmə hook-ları
📄 src/types/column.ts                      - Type definitions yenilənməsi
```

## 🚀 İcra Addımları

### Addım 1: UI Təmizləmə
**Müddət: 30 dəqiqə**

1.1. **Filtr çubuğunu sadələşdirmək**
```typescript
// Columns.tsx-də yalnız axtarış saxlamaq
<div className="mb-4">
  <div className="relative max-w-sm">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Sütunlarda axtar..."
      className="pl-8"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  </div>
</div>
```

1.2. **Page header-ni sadələşdirmək**
```typescript
// PageHeader title və description-u gizlətmək
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-2xl font-bold">Sütunlar</h1>
    <p className="text-muted-foreground">Sistem sütunlarını idarə edin</p>
  </div>
  {/* Add column button */}
</div>
```

### Addım 2: Tab Sistemi
**Müddət: 45 dəqiqə**

2.1. **ColumnTabs komponenti yaratmaq**
```typescript
// src/components/columns/ColumnTabs.tsx
interface ColumnTabsProps {
  activeTab: 'active' | 'archived';
  onTabChange: (tab: 'active' | 'archived') => void;
  activeCount: number;
  archivedCount: number;
}
```

2.2. **Tab state idarəetməsi**
```typescript
// Columns.tsx-də
const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
const activeColumns = columns.filter(c => c.status === 'active');
const archivedColumns = columns.filter(c => c.status === 'deleted');
```

### Addım 3: Arxiv Funksionallığı
**Müddət: 60 dəqiqə**

3.1. **ArchivedColumnList komponenti**
```typescript
// src/components/columns/ArchivedColumnList.tsx
interface ArchivedColumnListProps {
  columns: Column[];
  onRestoreColumn: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  canManageColumns: boolean;
}
```

3.2. **Bərpa və tam silinmə hook-ları**
```typescript
// useColumnMutations.ts-ə əlavə etmək
const restoreColumn = useMutation({
  mutationFn: async (columnId: string) => {
    return await supabase
      .from('columns')
      .update({ status: 'active' })
      .eq('id', columnId);
  }
});

const permanentDeleteColumn = useMutation({
  mutationFn: async (columnId: string) => {
    // İlk öncə data_entries və sector_data_entries silinməli
    // Sonra column silinməli
  }
});
```

### Addım 4: Dialog Komponentləri
**Müddət: 30 dəqiqə**

4.1. **RestoreColumnDialog**
```typescript
interface RestoreColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  columnName: string;
  isSubmitting: boolean;
}
```

4.2. **PermanentDeleteDialog**
```typescript
interface PermanentDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  column: {
    id: string;
    name: string;
    dataEntriesCount?: number;
  };
  isSubmitting: boolean;
}
```

### Addım 5: Toplu Əməliyyatlar (Opsional)
**Müddət: 45 dəqiqə**

5.1. **Seçim sistemi**
```typescript
const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
```

5.2. **Toplu əməliyyat düymələri**
```typescript
// Arxiv tabında
{selectedColumns.length > 0 && (
  <div className="flex gap-2 mb-4">
    <Button onClick={handleBulkRestore}>
      Seçilmişləri bərpa et ({selectedColumns.length})
    </Button>
    <Button variant="destructive" onClick={handleBulkDelete}>
      Seçilmişləri tamamilə sil ({selectedColumns.length})
    </Button>
  </div>
)}
```

## 🎨 UI/UX Təkmilləşdirmələri

### Rəng Sxemi
```css
/* Aktiv sütunlar */
.column-active {
  border-left: 3px solid #10b981; /* green-500 */
}

/* Arxivləşmiş sütunlar */
.column-archived {
  border-left: 3px solid #f59e0b; /* amber-500 */
  background: #fef3c7; /* amber-50 */
}

/* Tam silinmək üçün */
.column-pending-deletion {
  border-left: 3px solid #ef4444; /* red-500 */
  background: #fee2e2; /* red-50 */
}
```

### Badge-lər
```typescript
// Status badge-ləri
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return <Badge variant="success">Aktiv</Badge>;
    case 'deleted':
      return <Badge variant="secondary">Arxivdə</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};
```

## ⚡ Performans Təkmilləşdirmələri

### 1. Lazy Loading
```typescript
// Arxiv tabını yalnız açıldıqda yükləmək
const ArchivedColumnList = lazy(() => import('./ArchivedColumnList'));
```

### 2. Memoization
```typescript
// Filtirlənmiş sütunları memoize etmək
const filteredActiveColumns = useMemo(() => {
  return activeColumns.filter(column => 
    column.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [activeColumns, searchQuery]);
```

### 3. Debounced Search
```typescript
// Axtarış sorğularını debounce etmək
const debouncedSearchQuery = useDebounce(searchQuery, 300);
```

## 🧪 Test Senariləri

### Funksiional Testlər
1. **Tab keçidi** - Aktiv ↔ Arxiv
2. **Axtarış** - Həm aktiv həm arxiv sütunlarda
3. **Bərpa əməliyyatı** - Arxivdən aktiv-ə
4. **Tam silinmə** - Arxivdən tamamilə silmə
5. **Toplu əməliyyatlar** - Çoxlu seçim və əməliyyat

### UI Testləri  
1. **Loading states** - Tab keçidi zamanı
2. **Empty states** - Boş arxiv və ya aktiv siyahı
3. **Error handling** - Xəta hallarında mesaj
4. **Responsive design** - Mobil və desktop görünüş

## 📊 Uğur Meyarları

### Funksiional Meyarlar
- ✅ Aktiv və arxiv sütunları ayrı tab-larda göstərilir
- ✅ Bərpa funksionallığı işləyir
- ✅ Tam silinmə funksionallığı işləyir  
- ✅ Axtarış hər iki tabda işləyir
- ✅ UI təmiz və intuitivdir

### Performans Meyarları
- ✅ Tab keçidi < 300ms
- ✅ Axtarış cavab vaxtı < 200ms
- ✅ Səhifə yüklənmə vaxtı < 1s
- ✅ Responsive və mobil uyğun

## 🚨 Riskləər və Həllər

### Risk 1: Database Constraints
**Problem**: Foreign key constraints sütun silinməsini maneə ola bilər
**Həll**: Əvvəlcə bağlı məlumatları yoxlamaq və xəbərdarlıq vermək

### Risk 2: State Management
**Problem**: Tab keçidi zamanı state itkisi
**Həll**: URL query parameters istifadə etmək

### Risk 3: Performans
**Problem**: Çoxlu sütunda axtarış yavaşlığı  
**Həll**: Debounced search və pagination

## 📋 Addım-addım İcra Sırası

### Faza 1: Təmizləmə (30 dəq)
1. Filter çubuğunu sadələşdirmək
2. Page header-ni yenilənmək
3. Layout spacing-i düzəltmək

### Faza 2: Tab Sistemi (45 dəq)  
1. ColumnTabs komponenti yaratmaq
2. Tab state logic əlavə etmək
3. Active/Archived məntiq

### Faza 3: Arxiv Funksionallığı (60 dəq)
1. ArchivedColumnList komponenti
2. Bərpa hook və logic
3. Tam silinmə hook və logic

### Faza 4: Dialog-lar (30 dəq)
1. RestoreColumnDialog
2. PermanentDeleteDialog  
3. Confirmation məntiqləri

### Faza 5: Final Testlər (15 dəq)
1. Bütün funksionallığı test etmək
2. UI polish və düzəlişlər

**Ümumi Müddət: ~3 saat**

---

Bu plan razılaşdırıldıqdan sonra addım-addım icra edəcəyik. Hər addım tamamlandıqdan sonra test edib növbəti addıma keçəcəyik.