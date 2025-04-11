
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { School } from '@/types/supabase';
import * as XLSX from 'xlsx';

interface UseImportExportReturn {
  isImportDialogOpen: boolean;
  setIsImportDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleExportToExcel: (schools: School[]) => Promise<void>;
  handleImportSchools: (file: File) => Promise<void>;
}

type UseImportExportCallback = () => void;

export const useImportExport = (onComplete: UseImportExportCallback): UseImportExportReturn => {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Excel ixrac funksiyası
  const handleExportToExcel = async (schools: School[]): Promise<void> => {
    try {
      const exportData = schools.map(school => ({
        'Məktəb adı': school.name,
        'Direktor': school.principalName || '',
        'Ünvan': school.address || '',
        'Region ID': school.regionId,
        'Sektor ID': school.sectorId,
        'Telefon': school.phone || '',
        'Email': school.email || '',
        'Şagird sayı': school.studentCount || 0,
        'Müəllim sayı': school.teacherCount || 0,
        'Status': school.status || 'active',
        'Tip': school.type || '',
        'Tədris dili': school.language || '',
        'Admin email': school.adminEmail || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Məktəblər');
      XLSX.writeFile(workbook, 'Məktəblər.xlsx');
      
      toast.success('Məktəb məlumatları uğurla export edildi');
    } catch (error) {
      console.error('Excel export edərkən xəta:', error);
      toast.error('Excel export edərkən xəta baş verdi');
    }
  };

  // Excel idxal funksiyası - tiplərə uyğunlaşdırıldı
  const handleImportSchools = async (file: File): Promise<void> => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Excel məlumatlarını School strukturuna konvertasiya et
        const schoolsToImport = jsonData.map((row: any) => ({
          name: row['Məktəb adı'],
          principal_name: row['Direktor'],
          region_id: row['Region ID'],
          sector_id: row['Sektor ID'],
          address: row['Ünvan'],
          email: row['Email'],
          phone: row['Telefon'],
          student_count: parseInt(row['Şagird sayı'] || '0'),
          teacher_count: parseInt(row['Müəllim sayı'] || '0'),
          status: row['Status'] || 'active',
          type: row['Tip'],
          language: row['Tədris dili'],
          admin_email: row['Admin email']
        }));
        
        // Validasiya
        const invalidSchools = schoolsToImport.filter(
          (school) => !school.name || !school.region_id || !school.sector_id
        );
        
        if (invalidSchools.length > 0) {
          toast.error(`${invalidSchools.length} məktəb yüklənə bilmədi. Ad, Region ID və Sektor ID məcburidir.`);
          return;
        }
        
        // Məlumatları DB-yə əlavə et
        for (const school of schoolsToImport) {
          await supabase.from('schools').insert([school]);
        }
        
        toast.success(`${schoolsToImport.length} məktəb uğurla import edildi`);
        setIsImportDialogOpen(false);
        onComplete();
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Excel import edərkən xəta:', error);
      toast.error('Excel import edərkən xəta baş verdi');
    }
  };

  return {
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleExportToExcel,
    handleImportSchools
  };
};
