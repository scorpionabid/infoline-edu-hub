import { Badge } from "@/components/ui/badge";

export interface School {
  id: string;
  name: string;
  region_name: string;
  sector_name: string;
  completion_rate: number;
  student_count: number;
  teacher_count: number;
}

export interface Column {
  id: string;
  name: string;
  type: string;
  category_id: string;
  category_name: string;
  is_required: boolean;
  order_index: number;
}

export interface SchoolColumnData {
  school_id: string;
  school_name: string;
  region_name: string;
  sector_name: string;
  columns: {
    [columnId: string]: {
      value: string | null;
      status: string;
      created_at: string;
      updated_at: string;
    }
  };
}

export interface ColumnSort {
  columnId: string;
  order: 'asc' | 'desc' | null;
}

/**
 * Status badgeini qaytarır
 */
export const getStatusBadge = (status: string) => {
  const statusConfig = {
    'approved': { variant: 'default' as const, label: 'Təsdiqlənmiş', className: 'bg-green-100 text-green-800' },
    'pending': { variant: 'secondary' as const, label: 'Gözləmədə', className: 'bg-yellow-100 text-yellow-800' },
    'rejected': { variant: 'destructive' as const, label: 'Rədd edilmiş', className: 'bg-red-100 text-red-800' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  
  return {
    variant: config.variant,
    label: config.label,
    className: config.className
  };
};

/**
 * Məktəb məlumatlarını sütuna görə sıralayır
 */
export const sortSchoolColumnData = (
  data: SchoolColumnData[], 
  columnSort: ColumnSort
): SchoolColumnData[] => {
  if (!columnSort.order || !columnSort.columnId) {
    return data;
  }

  return [...data].sort((a, b) => {
    const aValue = a.columns[columnSort.columnId]?.value || '';
    const bValue = b.columns[columnSort.columnId]?.value || '';
    
    // String comparison
    const comparison = aValue.toString().localeCompare(bValue.toString());
    
    return columnSort.order === 'asc' ? comparison : -comparison;
  });
};

/**
 * Məktəb-sütun məlumatlarını export üçün format edir
 */
export const formatDataForExport = (
  schoolColumnData: SchoolColumnData[],
  selectedColumns: Column[]
) => {
  return schoolColumnData.map(schoolData => {
    const row: any = {
      'Məktəb': schoolData.school_name,
      'Region': schoolData.region_name,
      'Sektor': schoolData.sector_name
    };
    
    selectedColumns.forEach(col => {
      const columnData = schoolData.columns[col.id];
      row[col.name] = columnData?.value || 'Daxil edilməyib';
      
      // Status üçün ayrı sütun əlavə edək 
      if (columnData) {
        const statusLabel = columnData.status === 'approved' ? 'Təsdiqlənmiş' :
                          columnData.status === 'rejected' ? 'Rədd edilmiş' : 'Gözləmədə';
        row[`${col.name} (Status)`] = statusLabel;
      } else {
        row[`${col.name} (Status)`] = 'Boş';
      }
    });
    
    return row;
  });
};

/**
 * Cədvəl üçün məlumat transformasiyası
 */
export const transformSchoolsData = (data: any[]): School[] => {
  return (data || []).map(school => ({
    id: school.id,
    name: school.name,
    region_name: school.regions?.name || 'N/A',
    sector_name: school.sectors?.name || 'N/A',
    completion_rate: school.completion_rate || 0,
    student_count: school.student_count || 0,
    teacher_count: school.teacher_count || 0,
  }));
};

/**
 * Sütunları transformasiya edir
 */
export const transformColumnsData = (data: any[]): Column[] => {
  return (data || []).map(col => ({
    id: col.id,
    name: col.name,
    type: col.type,
    category_id: col.category_id,
    category_name: col.categories?.name || 'N/A',
    is_required: col.is_required,
    order_index: col.order_index || 0,
  }));
};

/**
 * Məktəb seçimi statistikası
 */
export const getSelectionStats = (
  totalSchools: number,
  selectedSchools: number,
  totalColumns: number,
  selectedColumns: number,
  dataCount: number,
  currentPage: number,
  pageSize: number
) => {
  const stats = [`${totalSchools} məktəb tapaldı`];
  
  if (selectedSchools > 0) {
    stats.push(`${selectedSchools} məktəb seçilib`);
  }
  
  if (selectedColumns > 0) {
    stats.push(`${selectedColumns} sütun seçilib`);
  }
  
  if (dataCount > 0) {
    const startIndex = (currentPage - 1) * pageSize + 1;
    const endIndex = Math.min(currentPage * pageSize, dataCount);
    stats.push(`${dataCount} məktəb cədvəldə`);
    
    if (dataCount > pageSize) {
      const totalPages = Math.ceil(dataCount / pageSize);
      stats.push(`Görünən: ${startIndex}-${endIndex} (Səhifə ${currentPage}/${totalPages})`);
    }
  }
  
  return stats.join(' | ');
};
