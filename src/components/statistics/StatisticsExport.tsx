
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileText, Table } from 'lucide-react';
import { StatisticsData } from '@/services/statisticsService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface StatisticsExportProps {
  data: StatisticsData;
  userRole?: string;
}

export const StatisticsExport: React.FC<StatisticsExportProps> = ({ data, userRole }) => {
  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();
    
    // Ümumi statistika
    const overviewData = [
      ['Statistika', 'Dəyər'],
      ['Toplam məktəblər', data.totalSchools],
      ['Toplam istifadəçilər', data.totalUsers],
      ['Toplam regionlar', data.totalRegions],
      ['Toplam sektorlar', data.totalSectors],
      ['Tamamlanma dərəcəsi', `${data.completionRate}%`],
      ['Təsdiq dərəcəsi', `${data.approvalRate}%`]
    ];
    
    const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(workbook, overviewSheet, 'Ümumi');

    // Form statusları
    const statusData = [
      ['Status', 'Say'],
      ['Təsdiqləndi', data.formsByStatus.approved],
      ['Gözləyir', data.formsByStatus.pending],
      ['Rədd edildi', data.formsByStatus.rejected],
      ['Qaralama', data.formsByStatus.draft],
      ['Toplam', data.formsByStatus.total]
    ];
    
    const statusSheet = XLSX.utils.aoa_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Form Statusları');

    // Məktəb performansı
    if (data.schoolPerformance.length > 0) {
      const schoolData = [
        ['Məktəb adı', 'Tamamlanma dərəcəsi', 'Toplam formlar', 'Tamamlanmış formlar']
      ];
      
      data.schoolPerformance.forEach(school => {
        schoolData.push([
          school.name,
          `${school.completionRate}%`,
          school.totalForms,
          school.completedForms
        ]);
      });
      
      const schoolSheet = XLSX.utils.aoa_to_sheet(schoolData);
      XLSX.utils.book_append_sheet(workbook, schoolSheet, 'Məktəb Performansı');
    }

    // Sektor performansı
    if (data.sectorPerformance.length > 0) {
      const sectorData = [
        ['Sektor adı', 'Məktəb sayı', 'Ortalama tamamlanma']
      ];
      
      data.sectorPerformance.forEach(sector => {
        sectorData.push([
          sector.name,
          sector.schoolCount,
          `${sector.averageCompletion}%`
        ]);
      });
      
      const sectorSheet = XLSX.utils.aoa_to_sheet(sectorData);
      XLSX.utils.book_append_sheet(workbook, sectorSheet, 'Sektor Performansı');
    }

    // Vaxt seriya məlumatları
    if (data.timeSeriesData.length > 0) {
      const timeData = [
        ['Tarix', 'Təqdimatlar', 'Təsdiqlər']
      ];
      
      data.timeSeriesData.forEach(item => {
        timeData.push([
          new Date(item.date).toLocaleDateString('az-AZ'),
          item.submissions,
          item.approvals
        ]);
      });
      
      const timeSheet = XLSX.utils.aoa_to_sheet(timeData);
      XLSX.utils.book_append_sheet(workbook, timeSheet, 'Günlük Aktivlik');
    }

    // Faylı yadda saxla
    const fileName = `statistika_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToCSV = () => {
    const csvData = [
      ['Statistika Hesabatı'],
      ['Tarix', new Date().toLocaleDateString('az-AZ')],
      [''],
      ['Ümumi məlumatlar'],
      ['Toplam məktəblər', data.totalSchools],
      ['Toplam istifadəçilər', data.totalUsers],
      ['Tamamlanma dərəcəsi', `${data.completionRate}%`],
      ['Təsdiq dərəcəsi', `${data.approvalRate}%`],
      [''],
      ['Form statusları'],
      ['Təsdiqləndi', data.formsByStatus.approved],
      ['Gözləyir', data.formsByStatus.pending],
      ['Rədd edildi', data.formsByStatus.rejected],
      ['Qaralama', data.formsByStatus.draft]
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const fileName = `statistika_${new Date().toISOString().split('T')[0]}.csv`;
    saveAs(blob, fileName);
  };

  const generatePDFReport = () => {
    // PDF generasiyası üçün müvəqqəti həll
    alert('PDF export funksiyası tezliklə əlavə ediləcək');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={exportToExcel}
          className="w-full"
          variant="outline"
        >
          <Table className="h-4 w-4 mr-2" />
          Excel kimi ixrac et
        </Button>
        
        <Button
          onClick={exportToCSV}
          className="w-full"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          CSV kimi ixrac et
        </Button>
        
        <Button
          onClick={generatePDFReport}
          className="w-full"
          variant="outline"
        >
          <FileText className="h-4 w-4 mr-2" />
          PDF hesabat
        </Button>
      </CardContent>
    </Card>
  );
};

export default StatisticsExport;
