
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { ExportOptions } from '@/types/excel';
import { CategoryWithColumns } from '@/types/category';
import { School } from '@/types/school';
import { CategoryColumn, SchoolColumnData } from '@/types/core/report';
import { format } from 'date-fns';
import { toast } from 'sonner';

export const exportToExcel = (
  data: SchoolColumnData[], 
  columns: CategoryColumn[], 
  options: ExportOptions = {
    format: 'xlsx',
    includeHeaders: true,
    filename: 'export',
    includeMetadata: false
  }
): { success: boolean; message?: string } => {
  try {
    // Əgər məlumat yoxdursa, xəta göndəririk
    if (!data || data.length === 0) {
      return { success: false, message: 'No data to export' };
    }

    // Sütunları id-yə görə asanlıqla axtarmaq üçün map yaradırıq
    const columnsMap = columns.reduce((acc, col) => {
      acc[col.id] = col;
      return acc;
    }, {} as Record<string, CategoryColumn>);

    // Hər bir məktəb üçün Excel sətri
    const excelData = data.map(schoolData => {
      // Məktəb məlumatları
      const baseData: Record<string, any> = {
        'Məktəb ID': schoolData.schoolId,
        'Məktəb adı': schoolData.schoolName,
        'Region': schoolData.region || '',
        'Sektor': schoolData.sector || '',
        'Status': schoolData.status
      };

      // Sütun məlumatlarını əlavə edirik
      schoolData.columnData.forEach(colData => {
        const column = columnsMap[colData.columnId];
        if (column) {
          // Sütunun adını və dəyərini əlavə edirik
          baseData[column.name] = formatColumnValue(colData.value, column.type);
        }
      });

      // Rədd edilmə səbəbini əlavə edirik (əgər varsa)
      if (schoolData.status === 'Rədd edildi' && schoolData.rejectionReason) {
        baseData['Rədd edilmə səbəbi'] = schoolData.rejectionReason;
      }

      return baseData;
    });

    // Excel işçi kitabı və səhifəsi yaradırıq
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Məlumatlar');

    // Səhifə formatlaması (sütun enliyi və s.)
    const columnWidths: Record<string, number> = {};
    
    // Bütün sütun başlıqları üçün minimum eni təyin edirik
    Object.keys(excelData[0] || {}).forEach(key => {
      columnWidths[key] = Math.max(15, key.length * 1.2); // min 15 xarakter və ya başlıq uzunluğundan 20% böyük
    });
    
    // Hər bir dəyər üçün eni nəzərdən keçiririk
    excelData.forEach(row => {
      Object.entries(row).forEach(([key, value]) => {
        const valueStr = String(value || '');
        columnWidths[key] = Math.max(columnWidths[key] || 0, valueStr.length * 1.1);
      });
    });
    
    // Maksimum eni məhdudlaşdırırıq
    Object.keys(columnWidths).forEach(key => {
      columnWidths[key] = Math.min(columnWidths[key], 50); // max 50 xarakter
    });
    
    // Sütun enlərini təyin edirik
    worksheet['!cols'] = Object.keys(excelData[0] || {}).map(key => ({
      wch: columnWidths[key]
    }));

    // Excel'i faylsistemə yazırıq
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Faylı endiririk
    const filename = options.filename || `export-${new Date().toISOString().slice(0, 10)}.xlsx`;
    saveAs(fileData, filename);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Excel ixracı zamanı xəta baş verdi');
    return { success: false, message: String(error) };
  }
};

// Sütun tipinə görə dəyəri formatlamaq
const formatColumnValue = (value: any, type: string): any => {
  if (value === null || value === undefined) return '';
  
  switch (type) {
    case 'date':
      return value ? format(new Date(value), 'dd.MM.yyyy') : '';
    case 'boolean':
      return value === true ? 'Bəli' : 'Xeyr';
    case 'checkbox':
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      return value ? 'Seçilmiş' : '';
    default:
      return value;
  }
};

// Kateqoriyalar üçün Excel ixracı
export const exportCategoriesToExcel = (categories: any[]) => {
  try {
    if (!categories || categories.length === 0) {
      toast.error('İxrac ediləcək kateqoriya yoxdur');
      return;
    }
    
    // Excel sətirləri yaradılır
    const excelData = categories.map(cat => ({
      'ID': cat.id,
      'Ad': cat.name,
      'Təsvir': cat.description || '',
      'Təyinat': cat.assignment === 'all' ? 'Bütün məktəblər' : 'Yalnız sektorlar',
      'Son Tarix': cat.deadline ? format(new Date(cat.deadline), 'dd.MM.yyyy') : '',
      'Status': cat.status === 'active' ? 'Aktiv' : 'Deaktiv',
      'Prioritet': cat.priority || '',
      'Sütun Sayı': cat.column_count || 0,
      'Yaradılma Tarixi': cat.created_at ? format(new Date(cat.created_at), 'dd.MM.yyyy') : ''
    }));

    // Excel faylını yaradırıq
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kateqoriyalar');
    
    // Faylı endiririk
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(fileData, `Kateqoriyalar_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast.success('Kateqoriyalar Excel faylına ixrac edildi', {
      description: `${categories.length} kateqoriya ixrac edildi`
    });
  } catch (error) {
    console.error('Excel ixracı zamanı xəta:', error);
    toast.error('Excel ixracı zamanı xəta baş verdi');
  }
};

// Sütunlar üçün Excel ixracı
export const exportColumnsToExcel = (columns: any[], categories: any[] = []) => {
  try {
    if (!columns || columns.length === 0) {
      toast.error('İxrac ediləcək sütun yoxdur');
      return;
    }
    
    // Kateqoriyaları id-yə görə asanlıqla axtarmaq üçün map yaradırıq
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Excel sətirləri yaradılır
    const excelData = columns.map(col => ({
      'ID': col.id,
      'Kateqoriya': categoryMap[col.category_id] || col.category_id,
      'Ad': col.name,
      'Tip': getColumnTypeLabel(col.type),
      'Məcburidir': col.is_required ? 'Bəli' : 'Xeyr',
      'Köməkçi Mətn': col.help_text || '',
      'Placeholder': col.placeholder || '',
      'Sıra': col.order_index || 0,
      'Status': col.status === 'active' ? 'Aktiv' : 'Deaktiv',
      'Seçimlər': col.options ? (Array.isArray(col.options) ? col.options.map((o: any) => 
        typeof o === 'string' ? o : o.label).join(', ') : '') : '',
      'Yaradılma Tarixi': col.created_at ? format(new Date(col.created_at), 'dd.MM.yyyy') : ''
    }));

    // Excel faylını yaradırıq
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sütunlar');
    
    // Faylı endiririk
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const fileData = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    saveAs(fileData, `Sütunlar_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    
    toast.success('Sütunlar Excel faylına ixrac edildi', {
      description: `${columns.length} sütun ixrac edildi`
    });
  } catch (error) {
    console.error('Excel ixracı zamanı xəta:', error);
    toast.error('Excel ixracı zamanı xəta baş verdi');
  }
};

// Sütun tipinin etiketini almaq
const getColumnTypeLabel = (type: string): string => {
  const typeLabels: Record<string, string> = {
    'text': 'Mətn',
    'number': 'Rəqəm',
    'date': 'Tarix',
    'select': 'Siyahı seçimi',
    'checkbox': 'Çoxlu seçim',
    'radio': 'Tək seçim',
    'file': 'Fayl',
    'image': 'Şəkil',
    'textarea': 'Böyük mətn',
    'email': 'Email',
    'phone': 'Telefon',
    'boolean': 'Bəli/Xeyr'
  };
  
  return typeLabels[type] || type;
};
