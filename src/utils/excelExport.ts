
import * as XLSX from 'xlsx';
import { SchoolColumnData } from '@/types/report';
import { CategoryWithColumns } from '@/types/column';

export function exportTableToExcel(
  data: SchoolColumnData[],
  category: CategoryWithColumns | undefined,
  fileName: string = 'school-data-report'
) {
  if (!category || data.length === 0) {
    console.error('No data or category to export');
    return false;
  }

  try {
    // Excel data strukturu yaradaq
    const excelData = data.map(school => {
      // Məktəb məlumatlarından yeni obyekt yaradaq
      const rowData: Record<string, any> = {
        'Məktəb adı': school.schoolName,
      };

      // Hər bir sütun üçün datanı əlavə edək
      category.columns.forEach(column => {
        const columnData = school.columnData.find(cd => cd.columnId === column.id);
        
        // Dəyər tipini yoxlayaq və uyğun formata çevirək
        let value = columnData?.value;
        if (typeof value === 'boolean') {
          value = value ? 'Bəli' : 'Xeyr';
        } else if (value === null || value === undefined) {
          value = '-';
        }
        
        rowData[column.name] = value;
      });

      return rowData;
    });

    // Excel worksheetini yaradaq
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Excel workbookunu yaradaq
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, category.name);

    // Sütun genişliklərini tənzimləyək
    const columnWidths = [
      { wch: 30 },  // Məktəb adı sütunu
      ...category.columns.map(() => ({ wch: 15 }))  // Digər sütunlar
    ];
    worksheet['!cols'] = columnWidths;

    // Excel faylını yükləyək
    XLSX.writeFile(workbook, `${fileName}-${new Date().toISOString().split('T')[0]}.xlsx`);
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}
