import { useCallback, useState } from 'react';
import { Column, SchoolColumnData, formatDataForExport } from '@/utils/reports/schoolColumnDataUtils';
import { toast } from '@/components/ui/use-toast';
import { toast as sonnerToast } from 'sonner';
import { saveAs } from 'file-saver'; // Yüklənmiş FileSaver kitabxanasını idxal edirik

export interface ExportOptions {
  exportType: 'visible' | 'all';
  includeFilters?: boolean;
  includeMetadata?: boolean;
}

export const useSchoolColumnExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  // Bu köməkçi funksiya faylları yükləmək üçündür - FileSaver kitabxanası vasitəsilə işləyir
  const downloadFile = useCallback((blob: Blob, filename: string) => {
    console.log('downloadFile çağırıldı:', { fileName: filename, blobType: blob.type, blobSize: blob.size });
    
    try {
      // FileSaver kitabxanası ilə faylı birbaşa yükləyirik
      console.log('FileSaver.js istifadə edilir');
      saveAs(blob, filename);
      console.log('SaveAs çağırıldı, fayl yüklənməlidir: ' + filename);
      
      return;
    } catch (error) {
      console.error('FileSaver ilə yükləmə xətası:', error);
      
      // FileSaver uğursuz olsa, ənənəvi üsulla cəhd et
      try {
        console.log('Ənənəvi HTML5 API ilə cəhd edilir...');
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Ənənəvi metodla yükləmə cəhd edildi');
      } catch (e) {
        console.error('Fayl yükləmə xətası:', e);
      }
    }
  }, []);

  const exportToPDF = useCallback(async (
    exportData: any[],
    selectedColumns: Column[],
    options: ExportOptions
  ) => {
    try {
      // Enhanced PDF generation with better formatting
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Məktəb-Sütun Məlumatları Hesabatı</title>
          <style>
            @page { 
              size: A4 landscape; 
              margin: 15mm; 
            }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              font-size: 10px;
              line-height: 1.4;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #4472C4;
              padding-bottom: 10px;
            }
            h1 { 
              color: #4472C4; 
              margin: 0;
              font-size: 18px;
            }
            .metadata { 
              margin-bottom: 15px; 
              background-color: #f8f9fa;
              padding: 10px;
              border-left: 4px solid #4472C4;
            }
            .metadata p {
              margin: 3px 0;
              font-size: 9px;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              font-size: 8px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 4px; 
              text-align: left; 
              word-wrap: break-word;
            }
            th { 
              background-color: #4472C4; 
              color: white;
              font-weight: bold;
              text-align: center;
            }
            tr:nth-child(even) {
              background-color: #f8f9fa;
            }
            .status-approved { color: #28a745; font-weight: bold; }
            .status-pending { color: #ffc107; font-weight: bold; }
            .status-rejected { color: #dc3545; font-weight: bold; }
            .footer {
              position: fixed;
              bottom: 10mm;
              left: 15mm;
              right: 15mm;
              text-align: center;
              font-size: 8px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>İnfoLine - Məktəb Sütun Məlumatları Hesabatı</h1>
          </div>
          
          ${options.includeMetadata ? `
            <div class="metadata">
              <p><strong>📅 İxrac tarixi:</strong> ${new Date().toLocaleString('az-AZ')}</p>
              <p><strong>🏫 Məktəb sayı:</strong> ${exportData.length}</p>
              <p><strong>📊 Sütun sayı:</strong> ${selectedColumns.length}</p>
              <p><strong>📋 Export növü:</strong> ${options.exportType === 'visible' ? 'Görünən nəticələr' : 'Bütün məlumatlar'}</p>
              <p><strong>🎯 Seçilmiş sütunlar:</strong> ${selectedColumns.map(col => col.name).join(', ')}</p>
            </div>
          ` : ''}
          
          <table>
            <thead>
              <tr>
                <th style="width: 20%;">Məktəb</th>
                <th style="width: 12%;">Region</th>
                <th style="width: 12%;">Sektor</th>
                ${selectedColumns.map(col => `<th style="width: ${Math.floor(56/selectedColumns.length)}%;">${col.name}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${exportData.map(row => `
                <tr>
                  <td><strong>${row['Məktəb'] || ''}</strong></td>
                  <td>${row['Region'] || ''}</td>
                  <td>${row['Sektor'] || ''}</td>
                  ${selectedColumns.map(col => {
                    const value = row[col.name] || 'Daxil edilməyib';
                    const status = row[`${col.name} (Status)`] || 'Boş';
                    const statusClass = status === 'Təsdiqlənmiş' ? 'status-approved' : 
                                      status === 'Gözləmədə' ? 'status-pending' : 
                                      'status-rejected';
                    return `<td><span class="${statusClass}">${value}</span></td>`;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            İnfoLine - Azərbaycan Respublikası Təhsil Nazirliyi | Səhifə: <span class="pageNumber"></span>
          </div>
        </body>
        </html>
      `;
      
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `məktəb-sütun-məlumatları-${timestamp}.html`;
      
      downloadFile(blob, filename);
      
      return filename;
    } catch (error) {
      console.error('PDF export error:', error);
      throw new Error('PDF ixracında xəta baş verdi');
    }
  }, [downloadFile]);

  const exportToExcel = useCallback(async (
    exportData: any[],
    selectedColumns: Column[],
    options: ExportOptions
  ) => {
    try {
      const XLSX = await import('xlsx');
      const wb = XLSX.utils.book_new();
      
      // 1. Main data sheet
      const ws = XLSX.utils.json_to_sheet(exportData);
      
      // 2. Enhanced header styling
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      
      // Header row styling
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddr = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!ws[cellAddr]) continue;
        
        ws[cellAddr].s = {
          font: { 
            bold: true, 
            color: { rgb: "FFFFFF" }, 
            sz: 12 
          },
          fill: { 
            fgColor: { rgb: "4472C4" } 
          },
          alignment: { 
            horizontal: 'center',
            vertical: 'center'
          },
          border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
          }
        };
      }
      
      // 3. Data rows styling (alternating colors)
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
          if (!ws[cellAddr]) continue;
          
          ws[cellAddr].s = {
            border: {
              top: { style: 'thin', color: { rgb: "CCCCCC" } },
              bottom: { style: 'thin', color: { rgb: "CCCCCC" } },
              left: { style: 'thin', color: { rgb: "CCCCCC" } },
              right: { style: 'thin', color: { rgb: "CCCCCC" } }
            },
            fill: { 
              fgColor: { rgb: row % 2 === 0 ? "F8F9FA" : "FFFFFF" } 
            },
            alignment: { 
              horizontal: 'left',
              vertical: 'center'
            }
          };
        }
      }
      
      // 4. Auto-fit column widths
      const maxWidths: number[] = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        let maxWidth = 10; // minimum width
        
        for (let row = range.s.r; row <= range.e.r; row++) {
          const cellAddr = XLSX.utils.encode_cell({ r: row, c: col });
          if (ws[cellAddr] && ws[cellAddr].v) {
            const cellLength = ws[cellAddr].v.toString().length;
            maxWidth = Math.max(maxWidth, cellLength);
          }
        }
        
        maxWidths[col] = Math.min(maxWidth + 2, 50); // max width 50
      }
      
      ws['!cols'] = maxWidths.map(w => ({ wch: w }));
      
      // 5. Freeze first row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };
      
      XLSX.utils.book_append_sheet(wb, ws, "Məktəb Məlumatları");
      
      // 6. Add metadata sheet if requested
      if (options.includeMetadata) {
        const metadataData = [
          ['İnfoLine Məktəb Məlumatları İxracı'],
          [''],
          ['Export Məlumatları', ''],
          ['Tarix', new Date().toLocaleString('az-AZ')],
          ['Məktəb sayı', exportData.length],
          ['Sütun sayı', selectedColumns.length],
          ['Export növü', options.exportType === 'visible' ? 'Görünən nəticələr' : 'Bütün məlumatlar'],
          [''],
          ['Seçilmiş Sütunlar', ''],
          ...selectedColumns.map(col => [col.name, col.category_name || 'N/A'])
        ];
        
        const metaWs = XLSX.utils.aoa_to_sheet(metadataData);
        
        // Style metadata sheet
        metaWs['A1'].s = {
          font: { bold: true, sz: 14, color: { rgb: "4472C4" } },
          alignment: { horizontal: 'center' }
        };
        
        metaWs['A3'].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "E7E6E6" } }
        };
        
        metaWs['A9'].s = {
          font: { bold: true, sz: 12 },
          fill: { fgColor: { rgb: "E7E6E6" } }
        };
        
        // Auto-fit columns
        metaWs['!cols'] = [{ wch: 30 }, { wch: 25 }];
        
        XLSX.utils.book_append_sheet(wb, metaWs, "Metadata");
      }
      
      // 7. Generate filename with timestamp
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `məktəb-sütun-məlumatları-${timestamp}.xlsx`;
      
      console.log('Excel ixrac üsuluyla XLSX.js üçün FileSaver.js istifadə edilir...');
      
      try {
        // Excel faylını binary formatda hazırlayırıq
        console.log('1. XLSX.write binary formatda çağırılır...');
        
        // Birbaşa blob formatda yaradılır
        const workbook = XLSX.write(wb, { 
          bookType: 'xlsx', 
          // Binary String format - FileSaver ilə yaxşı işləyir
          type: 'binary',
          cellStyles: true
        });
        
        // Binary string-i binary data-ya çeviririk
        const buf = new ArrayBuffer(workbook.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < workbook.length; i++) {
          view[i] = workbook.charCodeAt(i) & 0xFF;
        }
        
        console.log('2. Blob yaradılır...');
        // MIME tipi düzgün olmalıdır - Excel 2007+ üçün
        const blob = new Blob([buf], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        
        console.log('3. SaveAs çağırılır - birbaşa FileSaver.js istifadə edilir...');
        // FileSaver.js birbaşa çağırılır - öz funksiyamızı çağırmaq əvəzinə
        saveAs(blob, filename);
        
        console.log('4. Excel faylı yüklənmək üçün hazırdır!');
      } catch (exportError) {
        console.error('Excel export xətası:', exportError);
        sonnerToast.error('Excel ixracı zamanı xəta: ' + (exportError.message || 'Bilinməyən xəta'));
        throw exportError;
      }
      
      return filename;
      
    } catch (error) {
      console.error('Excel export error:', error);
      throw new Error('Excel ixracında xəta baş verdi');
    }
  }, []);

  const exportToCSV = useCallback(async (
    exportData: any[],
    selectedColumns: Column[],
    options: ExportOptions
  ) => {
    try {
      // Enhanced CSV with proper UTF-8 encoding
      let csvContent = '';
      
      // BOM for UTF-8 Excel compatibility
      const BOM = '\uFEFF';
      
      // Metadata header (if requested)
      if (options.includeMetadata) {
        csvContent += `"İnfoLine Məktəb Məlumatları İxracı"\n`;
        csvContent += `"Tarix","${new Date().toLocaleString('az-AZ')}"\n`;
        csvContent += `"Məktəb sayı","${exportData.length}"\n`;
        csvContent += `"Sütun sayı","${selectedColumns.length}"\n`;
        csvContent += `"Export növü","${options.exportType === 'visible' ? 'Görünən nəticələr' : 'Bütün məlumatlar'}"\n`;
        csvContent += `"Seçilmiş sütunlar","${selectedColumns.map(col => col.name).join('; ')}"\n`;
        csvContent += `\n`; // Empty line
      }
      
      // Headers
      const headers = Object.keys(exportData[0] || {});
      csvContent += headers.map(header => `"${header.replace(/"/g, '""')}"`).join(',') + '\n';
      
      // Data rows
      exportData.forEach(row => {
        const rowData = headers.map(header => {
          const value = row[header] || '';
          // Escape commas, quotes, and newlines
          const stringValue = typeof value === 'string' ? value : String(value);
          return `"${stringValue.replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, ' ')}"`;
        });
        csvContent += rowData.join(',') + '\n';
      });
      
      const blob = new Blob([BOM + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
      const filename = `məktəb-sütun-məlumatları-${timestamp}.csv`;
      
      downloadFile(blob, filename);
      
      return filename;
    } catch (error) {
      console.error('CSV export error:', error);
      throw new Error('CSV ixracında xəta baş verdi');
    }
  }, [downloadFile]);

  const handleExport = useCallback(async (
    format: 'excel' | 'csv' | 'pdf',
    allSchoolData: SchoolColumnData[],
    visibleSchoolData: SchoolColumnData[],
    selectedColumns: Column[],
    options: ExportOptions = { exportType: 'visible', includeMetadata: true }
  ) => {
    if (selectedColumns.length === 0) {
      // Destructive variant olduqda error kimi göndəririk
      sonnerToast.error("Xəta", {
        description: "Ən azı bir sütun seçin"
      });
      return;
    }

    const dataToExport = options.exportType === 'visible' ? visibleSchoolData : allSchoolData;
    
    if (dataToExport.length === 0) {
      sonnerToast.error("Xəta", {
        description: "Export etmək üçün məlumat yoxdur"
      });
      return;
    }

    setIsExporting(true);

    try {
      const exportData = formatDataForExport(dataToExport, selectedColumns);
      let filename: string;
      
      switch (format) {
        case 'excel':
          filename = await exportToExcel(exportData, selectedColumns, options);
          break;
        case 'csv':
          filename = await exportToCSV(exportData, selectedColumns, options);
          break;
        case 'pdf':
          filename = await exportToPDF(exportData, selectedColumns, options);
          break;
        default:
          throw new Error('Dəstəklənməyən format');
      }
      
      sonnerToast.success("🎉 Export uğurlu", {
        description: `${format.toUpperCase()} faylı "${filename}" uğurla yükləndi (${dataToExport.length} məktəb)`
      });
      
    } catch (error) {
      console.error('Export error:', error);
      sonnerToast.error("❌ Export xətası", {
        description: error instanceof Error ? error.message : "Export zamanı xəta baş verdi"
      });
    } finally {
      setIsExporting(false);
    }
  }, [exportToExcel, exportToCSV, exportToPDF]);

  return { 
    handleExport, 
    isExporting 
  };
};
