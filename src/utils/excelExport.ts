
import * as XLSX from 'xlsx';
import { SchoolColumnData } from '@/types/report';
import { CategoryWithColumns } from '@/types/column';

interface ExportOptions {
  includeHeaders?: boolean;
  customFileName?: string;
  sheetName?: string;
  includeTimestamp?: boolean;
  includeSchoolInfo?: boolean;
  format?: 'xlsx' | 'csv' | 'txt';
  filterColumns?: string[];
}

export function exportTableToExcel(
  data: SchoolColumnData[],
  category: CategoryWithColumns | undefined,
  options: ExportOptions = {}
) {
  if (!category || data.length === 0) {
    console.error('No data or category to export');
    return false;
  }

  // Default export parametrləri
  const {
    includeHeaders = true,
    customFileName,
    sheetName = category.name,
    includeTimestamp = true,
    includeSchoolInfo = true,
    format = 'xlsx',
    filterColumns
  } = options;

  try {
    // Excel faylının adını formalaşdıraq
    const timestamp = includeTimestamp ? `-${new Date().toISOString().split('T')[0]}` : '';
    const fileName = customFileName 
      ? `${customFileName}${timestamp}` 
      : `school-data-report-${category.name.replace(/\s+/g, '-').toLowerCase()}${timestamp}`;

    // Excel data strukturu yaradaq
    const excelData = data.map(school => {
      // Məktəb məlumatlarından yeni obyekt yaradaq
      const rowData: Record<string, any> = {};
      
      // Əgər məktəb məlumatları daxil edilməlidirsə
      if (includeSchoolInfo) {
        rowData['Məktəb adı'] = school.schoolName;
        rowData['Məktəb kodu'] = school.schoolCode || '';
        rowData['Region'] = school.region || '';
        rowData['Sektor'] = school.sector || '';
      }

      // Hər bir sütun üçün datanı əlavə edək (əgər filter varsa, yalnız seçilmiş sütunları daxil edək)
      category.columns.forEach(column => {
        // Əgər filter tətbiq edilməlidirsə və bu sütun filterdə yoxdursa, keçək
        if (filterColumns && !filterColumns.includes(column.id)) {
          return;
        }
        
        const columnData = school.columnData.find(cd => cd.columnId === column.id);
        
        // Dəyər tipini yoxlayaq və uyğun formata çevirək
        let value = columnData?.value;
        if (typeof value === 'boolean') {
          value = value ? 'Bəli' : 'Xeyr';
        } else if (value === null || value === undefined) {
          value = '-';
        } else if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else if (Array.isArray(value)) {
          value = value.join(', ');
        }
        
        rowData[column.name] = value;
      });

      return rowData;
    });

    // Excel worksheetini yaradaq
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Header stillərini konfiqurasiya edək
    if (includeHeaders && excelData.length > 0) {
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const address = XLSX.utils.encode_col(C) + '1';
        if (!worksheet[address]) continue;
        
        worksheet[address].s = {
          font: { bold: true, color: { rgb: '000000' } },
          fill: { fgColor: { rgb: 'E9E9E9' } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // Excel workbookunu yaradaq
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Sütun genişliklərini tənzimləyək
    const maxWidth = 50;
    const minWidth = 10;
    
    // Bütün məlumatlar əsasında optimal sütun genişliklərini hesablayaq
    const columnWidths: { wch: number }[] = [];
    
    if (excelData.length > 0) {
      const sampleRow = excelData[0];
      
      Object.keys(sampleRow).forEach((key, index) => {
        // Sütun başlığının və nümunə dəyərin uzunluğu əsasında genişlik hesablayaq
        const headerLength = key.length;
        
        // Nümunə dəyərin uzunluğunu hesablayaq (maksimum 10 sətir yoxlayaq)
        let maxDataLength = 0;
        for (let i = 0; i < Math.min(10, excelData.length); i++) {
          const val = excelData[i][key];
          const valLength = String(val).length;
          maxDataLength = Math.max(maxDataLength, valLength);
        }
        
        // Minimum və maksimum aralığında optimal genişlik hesablayaq
        const optimalWidth = Math.min(maxWidth, Math.max(minWidth, Math.max(headerLength, maxDataLength) + 2));
        columnWidths[index] = { wch: optimalWidth };
      });
    } else {
      // Default sütun genişlikləri
      columnWidths.push({ wch: 30 });  // Məktəb adı sütunu
      category.columns.forEach(() => columnWidths.push({ wch: 15 }));  // Digər sütunlar
    }
    
    worksheet['!cols'] = columnWidths;

    // Fayl formatına uyğun ixrac edək
    let fullFileName = '';
    
    switch (format) {
      case 'csv':
        fullFileName = `${fileName}.csv`;
        XLSX.writeFile(workbook, fullFileName, { bookType: 'csv' });
        break;
      case 'txt':
        fullFileName = `${fileName}.txt`;
        // TAB-delimited text
        XLSX.writeFile(workbook, fullFileName, { bookType: 'txt' });
        break;
      default:
        fullFileName = `${fileName}.xlsx`;
        XLSX.writeFile(workbook, fullFileName);
    }
    
    console.log(`Exported file: ${fullFileName}`);
    return true;
  } catch (error) {
    console.error('Excel export error:', error);
    return false;
  }
}

// Excel template-ni yaratmaq
export function createExcelTemplate(
  category: CategoryWithColumns,
  options: {
    includeInstructions?: boolean;
    includeValidation?: boolean;
    customFileName?: string;
  } = {}
) {
  if (!category) {
    console.error('No category provided for template');
    return false;
  }
  
  const {
    includeInstructions = true,
    includeValidation = true,
    customFileName
  } = options;
  
  try {
    // Template-in adını təyin et
    const fileName = customFileName 
      ? `${customFileName}-template.xlsx` 
      : `${category.name.replace(/\s+/g, '-').toLowerCase()}-template.xlsx`;
    
    // Boş worksheet yaradaq
    const worksheet = XLSX.utils.aoa_to_sheet([]);
    
    // Başlıqların şablonu
    const headers: string[] = ['Məktəb adı', 'Məktəb kodu'];
    
    // Təlimatlar üçün məlumatları hazırlayaq
    const instructions: any[][] = [];
    
    if (includeInstructions) {
      instructions.push(['InfoLine Excel İmport Şablonu']);
      instructions.push([`Kateqoriya: ${category.name}`]);
      instructions.push(['Təlimatlar:']);
      instructions.push(['1. Aşağıdakı sahələri doldurun və faylı saxlayın']);
      instructions.push(['2. Doldurulmuş faylı InfoLine portalına yükləyin']);
      instructions.push(['3. Məcburi sahələr tünd göstərilmişdir']);
      instructions.push(['4. Faylı redaktə edərkən başlıq sətirini dəyişdirməyin']);
      instructions.push(['']);
    }
    
    // Sütunların başlıqlarını əlavə edək
    category.columns.forEach(column => {
      headers.push(column.isRequired ? `${column.name} *` : column.name);
    });
    
    // Təlimatları və başlıqları əlavə edək
    const allRows = [...instructions, headers];
    
    // Boş məlumat şablonu əlavə edək (2 nümunə sətir)
    for (let i = 0; i < 2; i++) {
      const emptyRow: any[] = ['Məktəb adı nümunəsi', `SC${1000 + i}`];
      
      category.columns.forEach(column => {
        // Sütun tipinə görə nümunə dəyər əlavə edək
        switch(column.type) {
          case 'number':
            emptyRow.push(column.validationRules?.minValue || 0);
            break;
          case 'date':
            emptyRow.push(new Date().toLocaleDateString());
            break;
          case 'select':
            emptyRow.push(column.options?.[0] || '');
            break;
          case 'boolean':
            emptyRow.push('Bəli');
            break;
          default:
            emptyRow.push(`Nümunə ${column.name}`);
        }
      });
      
      allRows.push(emptyRow);
    }
    
    // Worksheet-ə bütün sətirləri əlavə edək
    XLSX.utils.sheet_add_aoa(worksheet, allRows);
    
    // Başlıq və təlimatlar üçün stili konfiqurasiya edək
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // Təlimatlar üçün stil
    if (includeInstructions) {
      for (let R = 0; R < instructions.length; R++) {
        for (let C = 0; C <= range.e.c; C++) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!worksheet[address]) continue;
          
          worksheet[address].s = {
            font: { italic: R > 1, bold: R <= 1, color: { rgb: '666666' } },
            alignment: { horizontal: 'left' }
          };
        }
      }
    }
    
    // Başlıqlar üçün stil
    const headerRow = includeInstructions ? instructions.length : 0;
    for (let C = 0; C <= range.e.c; C++) {
      const address = XLSX.utils.encode_cell({ r: headerRow, c: C });
      if (!worksheet[address]) continue;
      
      worksheet[address].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '4F81BD' } },
        alignment: { horizontal: 'center', vertical: 'center' }
      };
    }
    
    // Sütun genişliklərini tənzimləyək
    const columnWidths = [
      { wch: 30 },  // Məktəb adı
      { wch: 15 },  // Məktəb kodu
      ...category.columns.map(col => ({ wch: Math.max(15, col.name.length + 5) }))
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Excel workbookunu yaradaq və worksheet-i əlavə edək
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Entry');
    
    // Validasiya və məlumatlar üçün əlavə bir worksheet yaradaq
    if (includeValidation) {
      const helpWorksheet = XLSX.utils.aoa_to_sheet([
        ['Validasiya qaydaları və təlimatlar'],
        [''],
        ['Sütun adı', 'Tip', 'Məcburi', 'Validasiya qaydaları', 'Təlimat']
      ]);
      
      // Hər bir sütun üçün validasiya qaydalarını əlavə edək
      const validationRows: string[][] = category.columns.map(column => {
        const rules: string[] = [];
        
        if (column.validationRules) {
          if (column.type === 'number') {
            if (column.validationRules.minValue !== undefined) 
              rules.push(`Minimum: ${column.validationRules.minValue}`);
            if (column.validationRules.maxValue !== undefined) 
              rules.push(`Maksimum: ${column.validationRules.maxValue}`);
          } else if (column.type === 'text') {
            if (column.validationRules.minLength !== undefined) 
              rules.push(`Minimum uzunluq: ${column.validationRules.minLength}`);
            if (column.validationRules.maxLength !== undefined) 
              rules.push(`Maksimum uzunluq: ${column.validationRules.maxLength}`);
          } else if (column.type === 'date') {
            if (column.validationRules.minDate) 
              rules.push(`Minimum tarix: ${new Date(column.validationRules.minDate).toLocaleDateString()}`);
            if (column.validationRules.maxDate) 
              rules.push(`Maksimum tarix: ${new Date(column.validationRules.maxDate).toLocaleDateString()}`);
          }
        }
        
        if (column.type === 'select' && column.options) {
          rules.push(`Seçimlər: ${column.options.join(', ')}`);
        } else if (column.type === 'boolean') {
          rules.push('Dəyərlər: Bəli, Xeyr');
        }
        
        return [
          column.name,
          translateColumnType(column.type),
          column.isRequired ? 'Bəli' : 'Xeyr',
          rules.join('\n'),
          column.helpText || ''
        ];
      });
      
      // Validasiya qaydalarını worksheet-ə əlavə edək
      XLSX.utils.sheet_add_aoa(helpWorksheet, validationRows, { origin: 'A4' });
      
      // Stili konfiqurasiya edək
      const helpRange = XLSX.utils.decode_range(helpWorksheet['!ref'] || 'A1');
      
      // Başlıq stili
      for (let C = 0; C <= helpRange.e.c; C++) {
        const address = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!helpWorksheet[address]) continue;
        
        helpWorksheet[address].s = {
          font: { bold: true, size: 14, color: { rgb: '000000' } },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Cədvəl başlıqları stili
      for (let C = 0; C <= helpRange.e.c; C++) {
        const address = XLSX.utils.encode_cell({ r: 2, c: C });
        if (!helpWorksheet[address]) continue;
        
        helpWorksheet[address].s = {
          font: { bold: true, color: { rgb: 'FFFFFF' } },
          fill: { fgColor: { rgb: '4F81BD' } },
          alignment: { horizontal: 'center' }
        };
      }
      
      // Sütun genişliklərini tənzimləyək
      helpWorksheet['!cols'] = [
        { wch: 30 },  // Sütun adı
        { wch: 15 },  // Tip
        { wch: 15 },  // Məcburi
        { wch: 40 },  // Validasiya qaydaları
        { wch: 50 }   // Təlimat
      ];
      
      // Təlimatlar worksheetini workbook-a əlavə edək
      XLSX.utils.book_append_sheet(workbook, helpWorksheet, 'Təlimat');
    }
    
    // Faylı saxlayaq
    XLSX.writeFile(workbook, fileName);
    console.log(`Created template: ${fileName}`);
    return true;
  } catch (error) {
    console.error('Excel template creation error:', error);
    return false;
  }
}

// Excel template-nin məlumatlarını parse etmək
export function parseExcelTemplate(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // İlk worksheet-i seçək
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Məlumatları parse edək
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Köməkçi funksiya: Sütun tipini Azərbaycan dilinə tərcümə etmək
function translateColumnType(type: string): string {
  switch (type) {
    case 'text': return 'Mətn';
    case 'number': return 'Rəqəm';
    case 'date': return 'Tarix';
    case 'select': return 'Seçim';
    case 'boolean': return 'Bəli/Xeyr';
    case 'email': return 'E-poçt';
    case 'phone': return 'Telefon';
    default: return type;
  }
}
